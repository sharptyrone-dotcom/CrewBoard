import { supabase } from './supabase';
import { CURRENT_USER_ID, CURRENT_VESSEL_ID } from './constants';

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
function rowToNotification(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body || '',
    time: relativeTime(row.created_at),
    read: row.is_read === true,
    ref: row.reference_id,
    refType: row.reference_type,
    createdAt: row.created_at,
  };
}

// Fetches notifications for the current vessel that are either broadcast
// (target_crew_id IS NULL) or targeted at the current user. Ordered newest
// first so the panel shows the most recent items at the top.
export async function fetchNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('vessel_id', CURRENT_VESSEL_ID)
    .or(`target_crew_id.is.null,target_crew_id.eq.${CURRENT_USER_ID}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[notifications] fetch failed', error);
    throw error;
  }
  return (data || []).map(rowToNotification);
}

// Flips `is_read` to true. Because the dev schema stores read-state on the
// notification row itself, marking a broadcast notification read affects
// everyone — fine while we're single-user, but something to revisit when
// auth lands (probably via a `notification_reads` join table).
export async function markNotificationRead(notificationId) {
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
