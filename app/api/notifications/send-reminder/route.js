import { supabaseAdmin as supabaseServer } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// POST /api/notifications/send-reminder
//
// Sends reminder notifications via email and/or push to a list of crew
// member IDs. When `createNotification: true` is passed in the body, also
// creates in-app targeted notifications via the service-role client.
//
// Body: {
//   crewMemberIds: string[],     — UUIDs of crew to notify
//   vesselId: string,            — vessel UUID (to look up push subs)
//   title: string,               — notification title
//   body: string,                — notification body / detail
//   refType?: string,            — 'notice' | 'document' (for deep-link)
//   refId?: string,              — UUID of notice/document
// }
//
// Response: { email: { sent, failed }, push: { sent, failed } }
// ---------------------------------------------------------------------------

// supabaseServer is the service-role admin client imported from lib/supabase.

// ── Email via Resend ─────────────────────────────────────────────────
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_FROM = process.env.RESEND_FROM || 'CrewNotice <onboarding@resend.dev>';

async function sendEmail({ to, subject, html }) {
  if (!RESEND_API_KEY) return { success: false, error: 'RESEND_API_KEY not configured' };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: RESEND_FROM, to, subject, html }),
    });
    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: err };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function buildEmailHtml({ title, body, refType, refId }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crewnotice.app';
  const deepLink = refType && refId
    ? `${appUrl}/app#${refType}/${refId}`
    : `${appUrl}/app`;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
        <tr>
          <td style="background:#1e3a5f;padding:24px 32px">
            <span style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.5px">&#9875; CrewNotice</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">
            <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#1e293b">${escapeHtml(title)}</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6">${escapeHtml(body)}</p>
            <a href="${deepLink}" style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:700">Open in CrewNotice</a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #e2e8f0">
            <p style="margin:0;font-size:12px;color:#94a3b8">This is an automated reminder from CrewNotice. If you believe you received this in error, please contact your vessel administrator.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Push via Web Push ────────────────────────────────────────────────
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@crewnotice.app';

let webpush = null;
async function getWebPush() {
  if (webpush) return webpush;
  try {
    webpush = await import('web-push');
    if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    }
    return webpush;
  } catch {
    return null;
  }
}

async function sendPushNotification(subscription, payload) {
  const wp = await getWebPush();
  if (!wp || !VAPID_PRIVATE_KEY) return { success: false, error: 'Web Push not configured' };
  try {
    await wp.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload)
    );
    return { success: true };
  } catch (err) {
    // 404 or 410 means the subscription expired — clean it up.
    if (err.statusCode === 404 || err.statusCode === 410) {
      await supabaseServer
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint)
        .catch(() => {});
    }
    return { success: false, error: err.message, statusCode: err.statusCode };
  }
}

// ── Preference filtering (server-side) ───────────────────────────────
// Maps notification metadata to the preference column.  Returns null
// for types that should always be delivered (e.g. critical notices).
function getPreferenceColumn({ refType, priority, notificationType }) {
  if (refType === 'notice') {
    if (priority === 'critical') return null;
    if (priority === 'important') return 'important_notices';
    return 'routine_notices';
  }
  if (refType === 'document') return 'document_updates';
  if (refType === 'training_module') return 'training_assignments';
  if (notificationType === 'training_reminder') return 'training_reminders';
  if (refType === 'event') return 'event_briefings';
  if (notificationType === 'event_update') return 'event_updates';
  return 'admin_reminders';
}

async function filterIdsByPreference(crewMemberIds, vesselId, preferenceColumn) {
  if (!preferenceColumn) return crewMemberIds; // always send
  try {
    const { data } = await supabaseServer
      .from('notification_preferences')
      .select('crew_member_id, ' + preferenceColumn)
      .eq('vessel_id', vesselId)
      .in('crew_member_id', crewMemberIds);
    if (!data || data.length === 0) return crewMemberIds; // no prefs = all defaults (true)
    const mutedIds = new Set(data.filter(r => r[preferenceColumn] === false).map(r => r.crew_member_id));
    return crewMemberIds.filter(id => !mutedIds.has(id));
  } catch (err) {
    console.error('[send-reminder] preference check failed (sending to all)', err);
    return crewMemberIds;
  }
}

// ── Main handler ─────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const { crewMemberIds, vesselId, title, body, refType, refId, createNotification, priority, notificationType } = await request.json();

    if (!crewMemberIds?.length || !vesselId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 0. Filter by notification preferences
    const prefCol = getPreferenceColumn({ refType, priority, notificationType });
    const eligibleIds = await filterIdsByPreference(crewMemberIds, vesselId, prefCol);

    // 1. Look up crew emails (only for eligible recipients)
    const { data: crewRows } = await supabaseServer
      .from('crew_members')
      .select('id, email, full_name')
      .in('id', eligibleIds.length > 0 ? eligibleIds : ['00000000-0000-0000-0000-000000000000']);

    // 2. Look up push subscriptions (only for eligible recipients)
    const { data: pushSubs } = await supabaseServer
      .from('push_subscriptions')
      .select('crew_member_id, endpoint, p256dh, auth')
      .eq('vessel_id', vesselId)
      .in('crew_member_id', eligibleIds.length > 0 ? eligibleIds : ['00000000-0000-0000-0000-000000000000']);

    const emailResults = { sent: 0, failed: 0, skipped: 0 };
    const pushResults = { sent: 0, failed: 0, skipped: 0 };

    // 3. Send emails
    if (RESEND_API_KEY && crewRows?.length) {
      const html = buildEmailHtml({ title, body, refType, refId });
      const emailPromises = crewRows
        .filter(c => c.email)
        .map(async (crew) => {
          const result = await sendEmail({
            to: crew.email,
            subject: `[CrewNotice] ${title}`,
            html,
          });
          if (result.success) emailResults.sent++;
          else emailResults.failed++;
        });
      await Promise.allSettled(emailPromises);
    } else {
      emailResults.skipped = crewMemberIds.length;
    }

    // 4. Send push notifications
    if (VAPID_PRIVATE_KEY && pushSubs?.length) {
      const payload = {
        title,
        body,
        icon: '/icons/icon-192x192.png',
        data: { refType, refId },
      };
      const pushPromises = pushSubs.map(async (sub) => {
        const result = await sendPushNotification(sub, payload);
        if (result.success) pushResults.sent++;
        else pushResults.failed++;
      });
      await Promise.allSettled(pushPromises);
    } else {
      pushResults.skipped = crewMemberIds.length;
    }

    // 5. Optionally create in-app notifications server-side.
    //    Callers that still create notifications client-side should omit this
    //    flag to avoid duplicates.
    if (createNotification) {
      try {
        const notifRows = eligibleIds.map((cid) => ({
          vessel_id: vesselId,
          target_crew_id: cid,
          type: 'system',
          title,
          body: body || null,
          reference_type: refType || null,
          reference_id: refId || null,
        }));
        await supabaseServer.from('notifications').insert(notifRows);
      } catch (notifErr) {
        console.error('[send-reminder] in-app notification insert failed (non-fatal)', notifErr);
      }
    }

    return NextResponse.json({
      email: emailResults,
      push: pushResults,
      total: crewMemberIds.length,
    });
  } catch (err) {
    console.error('[send-reminder] Unhandled error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
