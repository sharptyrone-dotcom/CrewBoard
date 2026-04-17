import { supabaseAdmin as supabaseServer } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authCheck';
import { writeLimiter } from '@/lib/rateLimit';
import { handleApiError } from '@/lib/apiError';
import { sendCrewNotification } from '@/lib/notificationSender';

// ---------------------------------------------------------------------------
// POST /api/notifications/send-reminder
//
// Sends reminder notifications via email and/or push to a list of crew
// member IDs. When `createNotification: true` is passed in the body, also
// creates in-app targeted notifications via the service-role client.
//
// Body: {
//   crewMemberIds: string[],     — UUIDs of crew to notify
//   title: string,               — notification title
//   body: string,                — notification body / detail
//   refType?: string,            — 'notice' | 'document' (for deep-link)
//   refId?: string,              — UUID of notice/document
// }
//
// Response: { email: { sent, failed }, push: { sent, failed } }
//
// Note: vesselId is derived from the authenticated caller — the caller can
// only send reminders to crew on their own vessel. Delivery logic itself
// lives in lib/notificationSender.js so server-side callers can reuse it
// without making an internal HTTP call that would drop cookie auth.
// ---------------------------------------------------------------------------

export async function POST(request) {
  try {
    const limited = writeLimiter(request);
    if (limited) return limited;

    const auth = await requireAuth();
    if (auth.response) return auth.response;

    const {
      crewMemberIds,
      title,
      body,
      refType,
      refId,
      createNotification,
      priority,
      notificationType,
    } = await request.json();

    // vesselId is always derived from the authenticated caller — prevents
    // cross-vessel abuse where an attacker passes a different vesselId.
    const vesselId = auth.crewMember.vessel_id;

    if (!crewMemberIds?.length || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify all target crew members belong to the caller's vessel.
    const { data: verifiedCrew } = await supabaseServer
      .from('crew_members')
      .select('id')
      .eq('vessel_id', vesselId)
      .in('id', crewMemberIds);

    const verifiedIds = (verifiedCrew || []).map(c => c.id);

    if (verifiedIds.length === 0) {
      return NextResponse.json({ error: 'No valid recipients on your vessel' }, { status: 400 });
    }

    const result = await sendCrewNotification({
      vesselId,
      crewMemberIds: verifiedIds,
      title,
      body,
      refType,
      refId,
      priority,
      notificationType,
      createNotification: !!createNotification,
    });

    return NextResponse.json(result);
  } catch (err) {
    return handleApiError(err, 'send-reminder');
  }
}
