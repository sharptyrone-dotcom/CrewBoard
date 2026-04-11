import { supabase } from './supabase';
import { CURRENT_VESSEL_ID } from './constants';

// Action identifiers stored in activity_log.action. Plain strings rather
// than an enum so we can add new event types without a schema migration.
export const ACTIVITY_ACTIONS = {
  NOTICE_POSTED: 'notice_posted',
  NOTICE_ACKNOWLEDGED: 'notice_acknowledged',
  NOTICE_DELETED: 'notice_deleted',
  DOCUMENT_POSTED: 'document_posted',
  DOCUMENT_ACKNOWLEDGED: 'document_acknowledged',
};

function rowToActivity(row) {
  return {
    id: row.id,
    crewMemberId: row.crew_member_id,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    metadata: row.metadata || null,
    createdAt: row.created_at,
  };
}

// Fetches the most recent activity for the current vessel, newest first.
// Default limit keeps the payload bounded — the admin screen only needs
// the last ~100 events to be useful.
export async function fetchActivity({ limit = 100 } = {}) {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('vessel_id', CURRENT_VESSEL_ID)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[activity] fetch failed', error);
    throw error;
  }
  return (data || []).map(rowToActivity);
}

// Inserts an audit row. Failures are logged but never thrown — a missed
// log write should never block the user-facing operation that triggered it.
// `metadata` is an optional jsonb blob for storing denormalised fields
// (e.g. the notice title) so the UI can still render sensibly if the
// referenced row gets deleted later.
export async function logActivity({ crewMemberId, action, targetType, targetId, metadata }) {
  if (!crewMemberId || !action) return;
  const { error } = await supabase
    .from('activity_log')
    .insert({
      vessel_id: CURRENT_VESSEL_ID,
      crew_member_id: crewMemberId,
      action,
      target_type: targetType || null,
      target_id: targetId || null,
      metadata: metadata || null,
    });

  if (error) {
    console.error('[activity] logActivity failed (non-fatal)', error);
  }
}
