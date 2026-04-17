import { supabaseAdmin } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Server-side notification dispatcher.
//
// Delivers reminder emails (via Resend) + web push (via web-push) to a list
// of crew members, optionally also inserting targeted in-app notifications.
//
// This module is the single source of truth for the delivery logic. Both
// the /api/notifications/send-reminder HTTP route and any server-side
// caller (e.g. the training-assign route) funnel through here so we don't
// end up doing internal fetch() calls that silently drop cookie auth.
//
// SECURITY: callers are responsible for ensuring `crewMemberIds` all
// belong to `vesselId`. The HTTP route does this via a verification
// query against crew_members; server callers that already know the IDs
// came from a vessel-scoped query can skip that step.
// ---------------------------------------------------------------------------

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

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
      await supabaseAdmin
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint)
        .catch(() => {});
    }
    return { success: false, error: err.message, statusCode: err.statusCode };
  }
}

// ---------------------------------------------------------------------------
// sendCrewNotification
//
// Dispatches email + push (and optionally in-app) to `crewMemberIds`.
//
// Notifications are NOT opt-out. Every crew member in `crewMemberIds`
// receives the notification — the caller is responsible for scoping the
// recipients correctly (e.g. by department targeting). Compliance
// tracking on CrewNotice depends on guaranteed delivery, so we never
// filter this list against any preference table.
//
// Params:
//   vesselId          — vessel scope for push-subscription lookup
//   crewMemberIds     — array of crew UUIDs; caller must have vessel-verified
//   title, body       — notification content
//   refType, refId    — deep-link target ('notice' | 'document' | 'training_module' | 'event' | ...)
//   priority          — 'critical' | 'important' | 'routine' (notices only, informational)
//   notificationType  — optional metadata (retained for call-site clarity)
//   createNotification — also insert targeted in-app notifications
//                        (default false — most callers create these themselves)
//
// Returns: { email: {sent,failed,skipped}, push: {sent,failed,skipped}, total }.
// Never throws — delivery failures are captured in the counters so callers
// can fire-and-forget.
// ---------------------------------------------------------------------------
export async function sendCrewNotification({
  vesselId,
  crewMemberIds,
  title,
  body,
  refType = null,
  refId = null,
  // eslint-disable-next-line no-unused-vars
  priority,
  // eslint-disable-next-line no-unused-vars
  notificationType,
  createNotification = false,
}) {
  const result = {
    email: { sent: 0, failed: 0, skipped: 0 },
    push: { sent: 0, failed: 0, skipped: 0 },
    total: 0,
  };

  if (!vesselId || !Array.isArray(crewMemberIds) || crewMemberIds.length === 0 || !title) {
    return result;
  }

  result.total = crewMemberIds.length;
  const eligibleIds = crewMemberIds;

  // Look up crew emails + push subscriptions in parallel.
  const [crewRes, pushRes] = await Promise.all([
    supabaseAdmin
      .from('crew_members')
      .select('id, email, full_name')
      .in('id', eligibleIds),
    supabaseAdmin
      .from('push_subscriptions')
      .select('crew_member_id, endpoint, p256dh, auth')
      .eq('vessel_id', vesselId)
      .in('crew_member_id', eligibleIds),
  ]);

  const crewRows = crewRes.data || [];
  const pushSubs = pushRes.data || [];

  // Send emails.
  if (RESEND_API_KEY && crewRows.length) {
    const html = buildEmailHtml({ title, body, refType, refId });
    const emailPromises = crewRows
      .filter(c => c.email)
      .map(async (crew) => {
        const r = await sendEmail({
          to: crew.email,
          subject: `[CrewNotice] ${title}`,
          html,
        });
        if (r.success) result.email.sent++;
        else result.email.failed++;
      });
    await Promise.allSettled(emailPromises);
  } else {
    result.email.skipped = crewMemberIds.length;
  }

  // Send push.
  if (VAPID_PRIVATE_KEY && pushSubs.length) {
    const payload = {
      title,
      body,
      icon: '/icons/icon-192x192.png',
      data: { refType, refId },
    };
    const pushPromises = pushSubs.map(async (sub) => {
      const r = await sendPushNotification(sub, payload);
      if (r.success) result.push.sent++;
      else result.push.failed++;
    });
    await Promise.allSettled(pushPromises);
  } else {
    result.push.skipped = crewMemberIds.length;
  }

  // Optionally create in-app notifications server-side.
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
      await supabaseAdmin.from('notifications').insert(notifRows);
    } catch (notifErr) {
      console.error('[sendCrewNotification] in-app notification insert failed (non-fatal)', notifErr);
    }
  }

  return result;
}
