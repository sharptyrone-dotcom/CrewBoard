import { supabase } from './supabase';
import { CURRENT_VESSEL_ID } from './constants';

// Maps a Supabase `notices` row (plus joined `notice_reads`) into the shape
// the existing CrewBoard UI expects: { id, title, body, category, priority,
// dept, pinned, validUntil, createdAt, readBy, acknowledgedBy }.
//
// `validUntil` comes from the `expires_at` column on notices (added in the
// initial schema but only wired into the UI once admins could set it).
// It's a raw ISO timestamp string or null — callers decide how to format
// it and whether the notice is expired based on new Date(validUntil).
//
// Exported so the realtime hook can reuse the exact same mapping when it
// receives raw INSERT/UPDATE payloads from Supabase — keeps the UI shape
// consistent regardless of which code path the row came through.
export function rowToNotice(row) {
  const reads = Array.isArray(row.notice_reads) ? row.notice_reads : [];
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category: row.category,
    priority: row.priority,
    dept: row.department_target,
    pinned: row.is_pinned,
    requireAck: row.requires_acknowledgement,
    validUntil: row.expires_at || null,
    createdAt: row.created_at,
    readBy: reads.map(r => r.crew_member_id),
    acknowledgedBy: reads
      .filter(r => r.acknowledged_at !== null)
      .map(r => r.crew_member_id),
  };
}

export async function fetchNotices() {
  const { data, error } = await supabase
    .from('notices')
    .select('*, notice_reads(crew_member_id, acknowledged_at)')
    .eq('vessel_id', CURRENT_VESSEL_ID)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[notices] fetch failed', error);
    throw error;
  }
  return (data || []).map(rowToNotice);
}

// `validUntil` is an optional ISO string (or null / empty) coming from a
// datetime-local input in the NewNoticeModal. We pass it through to
// notices.expires_at as-is — Postgres happily accepts ISO strings for
// timestamptz. Null/empty stays NULL so the notice never auto-expires.
export async function createNotice({ title, body, category, priority, dept, pinned, requireAck, validUntil, createdBy }) {
  const { data, error } = await supabase
    .from('notices')
    .insert({
      vessel_id: CURRENT_VESSEL_ID,
      created_by: createdBy,
      title,
      body,
      category,
      priority,
      department_target: dept,
      is_pinned: pinned,
      requires_acknowledgement: requireAck,
      expires_at: validUntil || null,
    })
    .select('*, notice_reads(crew_member_id, acknowledged_at)')
    .single();

  if (error) {
    console.error('[notices] create failed', error);
    throw error;
  }
  return rowToNotice(data);
}

// Admin-only delete — the `notices_delete_admin` RLS policy (migration 011)
// checks is_current_crew_admin() on the server side, so a non-admin caller
// will get a PostgREST permission error rather than actually dropping the
// row. The ON DELETE CASCADE on notice_reads.notice_id takes care of any
// read/ack receipts attached to the notice.
export async function deleteNotice({ noticeId }) {
  const { error } = await supabase
    .from('notices')
    .delete()
    .eq('id', noticeId);

  if (error) {
    console.error('[notices] delete failed', error);
    throw error;
  }
}

export async function markNoticeRead({ noticeId, crewMemberId }) {
  const { error } = await supabase
    .from('notice_reads')
    .upsert(
      { notice_id: noticeId, crew_member_id: crewMemberId },
      { onConflict: 'notice_id,crew_member_id', ignoreDuplicates: true }
    );

  if (error) {
    console.error('[notices] markRead failed', error);
    throw error;
  }
}

export async function acknowledgeNotice({ noticeId, crewMemberId }) {
  const { error } = await supabase
    .from('notice_reads')
    .upsert(
      {
        notice_id: noticeId,
        crew_member_id: crewMemberId,
        acknowledged_at: new Date().toISOString(),
      },
      { onConflict: 'notice_id,crew_member_id' }
    );

  if (error) {
    console.error('[notices] acknowledge failed', error);
    throw error;
  }
}
