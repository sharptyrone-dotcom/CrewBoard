import { supabase } from './supabase';
import { CURRENT_VESSEL_ID } from './constants';

// Maps a Supabase `notices` row (plus joined `notice_reads`) into the shape
// the existing CrewBoard UI expects: { id, title, body, category, priority,
// dept, pinned, createdAt, readBy, acknowledgedBy }.
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

export async function createNotice({ title, body, category, priority, dept, pinned, requireAck, createdBy }) {
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
    })
    .select('*, notice_reads(crew_member_id, acknowledged_at)')
    .single();

  if (error) {
    console.error('[notices] create failed', error);
    throw error;
  }
  return rowToNotice(data);
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
