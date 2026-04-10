import { supabase } from './supabase';
import { CURRENT_VESSEL_ID } from './constants';

// Any crew member whose last_seen_at is within this window is treated as
// "online" in the UI. Five minutes keeps short connection blips from kicking
// someone offline while still being responsive when a user closes the tab.
const ONLINE_WINDOW_MS = 5 * 60 * 1000;

// Maps a Supabase `crew_members` row to the shape the existing CrewBoard UI
// expects: { id, name, role, dept, avatar, online }.
//
// `online` is derived from whether `last_seen_at` falls inside the
// ONLINE_WINDOW_MS window. The app touches last_seen_at on page load and on
// an interval (see CrewBoard.js), so an active tab keeps the indicator green.
function rowToCrew(row) {
  const lastSeenMs = row.last_seen_at ? new Date(row.last_seen_at).getTime() : 0;
  const isOnline = lastSeenMs > 0 && (Date.now() - lastSeenMs) < ONLINE_WINDOW_MS;
  return {
    id: row.id,
    name: row.full_name,
    role: row.role,
    dept: row.department,
    avatar: row.avatar_initials || (row.full_name || '').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase(),
    online: isOnline,
    lastSeenAt: row.last_seen_at,
    email: row.email,
    isAdmin: row.is_admin,
    isHod: row.is_hod,
  };
}

export async function fetchCrew() {
  const { data, error } = await supabase
    .from('crew_members')
    .select('*')
    .eq('vessel_id', CURRENT_VESSEL_ID)
    .eq('is_active', true)
    .order('full_name', { ascending: true });

  if (error) {
    console.error('[crew] fetch failed', error);
    throw error;
  }
  return (data || []).map(rowToCrew);
}

// Writes `now()` to the current user's last_seen_at so their online indicator
// stays green. Failures are swallowed (logged only) — a missed heartbeat
// should never crash the page or prevent rendering.
export async function touchLastSeen(crewMemberId) {
  if (!crewMemberId) return;
  const { error } = await supabase
    .from('crew_members')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', crewMemberId);

  if (error) {
    console.error('[crew] touchLastSeen failed', error);
  }
}
