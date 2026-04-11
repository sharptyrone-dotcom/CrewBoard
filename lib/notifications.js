import { supabase } from './supabase';
import { CURRENT_VESSEL_ID } from './constants';

// Formats a Supabase `created_at` timestamp as the short relative strings the
// existing NotificationsPanel renders ("1h ago", "Yesterday", "2 days ago").
// Kept intentionally simple — swap for a full i18n lib if/when we need one.
function relativeTime(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = Date.now() - then;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}

// Maps a Supabase `notifications` row into the shape the existing
// NotificationsPanel expects: { id, type, title, body, time, read, ref }.
//
// The second argument is a Set of notification ids the current user has
// marked as read via the per-user `notification_reads` table. The final
// `read` boolean merges two sources of truth:
//   • Targeted notifications (target_crew_id != null) use `is_read` on the
//     row — only one user can ever read a targeted row, so the flag is
//     per-user by construction.
//   • Broadcast notifications (target_crew_id == null) use the per-user
//     notification_reads join table. `is_read` is ignored for broadcasts
//     because it was a legacy vessel-wide boolean that affected everyone.
//
// Exported so the realtime hook can reuse the exact same mapping when it
// receives raw INSERT payloads from Supabase. Realtime callers that don't
// have a read-id set can pass an empty Set — freshly-inserted notifications
// are always unread anyway.
export function rowToNotification(row, userReadIds = null) {
  const targeted = row.target_crew_id != null;
  const inUserReadSet = userReadIds instanceof Set && userReadIds.has(row.id);
  const read = (targeted && row.is_read === true) || inUserReadSet;
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body || '',
    time: relativeTime(row.created_at),
    read,
    ref: row.reference_id,
    refType: row.reference_type,
    createdAt: row.created_at,
    // Preserved on the UI shape so markNotificationRead can route to the
    // right storage (notification_reads for broadcasts, notifications.is_read
    // for targeted) without a second roundtrip.
    targetCrewId: row.target_crew_id || null,
  };
}

// Fetches notifications for the current vessel that are either broadcast
// (target_crew_id IS NULL) or targeted at the given user. Ordered newest
// first so the panel shows the most recent items at the top.
//
// After the primary query we also fetch the current user's notification_reads
// rows and merge them into the result so broadcasts that this user has
// already marked read show up with `read: true`. Targeted notifications
// continue to use `is_read` on the row itself.
export async function fetchNotifications(currentUserId) {
  const query = supabase
    .from('notifications')
    .select('*')
    .eq('vessel_id', CURRENT_VESSEL_ID)
    .order('created_at', { ascending: false });

  if (currentUserId) {
    query.or(`target_crew_id.is.null,target_crew_id.eq.${currentUserId}`);
  } else {
    query.is('target_crew_id', null);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[notifications] fetch failed', error);
    throw error;
  }

  // Load this user's per-user read receipts. Scoped to the notification ids
  // we just fetched so we don't pull the whole table. An empty Set is the
  // correct fallback when we don't have a user id (anon callers) — nothing
  // can be "read" without a user to attribute it to.
  const rows = data || [];
  let userReadIds = new Set();
  if (currentUserId && rows.length > 0) {
    const notificationIds = rows.map(r => r.id);
    const { data: reads, error: readsError } = await supabase
      .from('notification_reads')
      .select('notification_id')
      .eq('crew_member_id', currentUserId)
      .in('notification_id', notificationIds);

    if (readsError) {
      // Non-fatal — fall back to "nothing is read" rather than bricking the
      // panel. The user can always mark them again; they just lose one
      // fetch's worth of per-user state.
      console.error('[notifications] reads fetch failed', readsError);
    } else {
      userReadIds = new Set((reads || []).map(r => r.notification_id));
    }
  }

  return rows.map(r => rowToNotification(r, userReadIds));
}

// Marks a single notification as read for the given user. The path depends
// on whether the notification is targeted or broadcast:
//
//   • Broadcast (target_crew_id IS NULL): insert a row into notification_reads
//     keyed on (notification_id, crew_member_id). The RLS policy added in
//     migration 010 only allows the user to insert reads for themselves.
//     The unique constraint on (notification_id, crew_member_id) silently
//     collapses double-clicks into a single row via on-conflict.
//   • Targeted (target_crew_id IS NOT NULL): keep the legacy behaviour of
//     flipping `is_read = true` on the notification row. It's safe because
//     the row is owned by exactly one user — there's no cross-user leakage.
//
// If we aren't passed enough info to decide (no userId), we fall back to
// the targeted-style update so older callers don't break — but every live
// caller in components/CrewBoard.js passes the full signature.
export async function markNotificationRead(notificationId, userId, { targetCrewId } = {}) {
  if (!notificationId) return;

  // If we already know the target (from the UI shape), skip the roundtrip.
  // Otherwise ask the server which kind of notification this is before
  // deciding where to store the read.
  let resolvedTargetCrewId = targetCrewId;
  if (resolvedTargetCrewId === undefined) {
    const { data, error } = await supabase
      .from('notifications')
      .select('target_crew_id')
      .eq('id', notificationId)
      .maybeSingle();
    if (error) {
      console.error('[notifications] lookup for markRead failed', error);
      throw error;
    }
    resolvedTargetCrewId = data?.target_crew_id ?? null;
  }

  const isBroadcast = resolvedTargetCrewId == null;

  if (isBroadcast) {
    if (!userId) {
      // No user — we can't attribute the read to anyone. Swallow instead
      // of throwing so the optimistic UI update doesn't get reverted.
      console.warn('[notifications] markRead called on broadcast without userId');
      return;
    }
    const { error } = await supabase
      .from('notification_reads')
      .upsert(
        { notification_id: notificationId, crew_member_id: userId },
        { onConflict: 'notification_id,crew_member_id' },
      );
    if (error) {
      console.error('[notifications] broadcast markRead failed', error);
      throw error;
    }
    return;
  }

  // Targeted notification — legacy path.
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('[notifications] markRead failed', error);
    throw error;
  }
}

// Inserts a broadcast notification (target_crew_id = NULL) so every crew
// member sees it in their bell panel. Used by handlePostNotice to announce
// newly-created notices. Returns the inserted row in the UI shape.
export async function createBroadcastNotification({ type, title, body, referenceType, referenceId }) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      vessel_id: CURRENT_VESSEL_ID,
      target_crew_id: null,
      type,
      title,
      body,
      reference_type: referenceType,
      reference_id: referenceId,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[notifications] create failed', error);
    throw error;
  }
  return rowToNotification(data);
}
