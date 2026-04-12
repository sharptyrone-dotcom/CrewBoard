import { CURRENT_VESSEL_ID } from './constants';

// Calls the send-reminder API route to deliver notifications via
// email and push to the specified crew members. The in-app
// notification is handled separately by the caller (via
// createTargetedNotification in the Supabase client).
//
// Returns { email: { sent, failed }, push: { sent, failed } }.
// Never throws — callers can fire-and-forget since email/push are
// supplementary to the in-app notification.
export async function sendReminderChannels({
  crewMemberIds,
  title,
  body,
  refType,
  refId,
}) {
  if (!crewMemberIds?.length) return { email: { sent: 0 }, push: { sent: 0 } };

  try {
    const res = await fetch('/api/notifications/send-reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        crewMemberIds,
        vesselId: CURRENT_VESSEL_ID,
        title,
        body,
        refType: refType || null,
        refId: refId || null,
      }),
    });

    if (!res.ok) {
      console.error('[send-reminder] API error', res.status, await res.text());
      return { email: { sent: 0, failed: crewMemberIds.length }, push: { sent: 0, failed: crewMemberIds.length } };
    }

    return await res.json();
  } catch (err) {
    console.error('[send-reminder] Network error', err);
    return { email: { sent: 0, failed: crewMemberIds.length }, push: { sent: 0, failed: crewMemberIds.length } };
  }
}
