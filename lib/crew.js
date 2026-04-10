import { supabase } from './supabase';
import { CURRENT_VESSEL_ID } from './constants';

// Maps a Supabase `crew_members` row to the shape the existing CrewBoard UI
// expects: { id, name, role, dept, avatar, online }.
//
// NOTE: `online` is hardcoded to `true` for now. Once the app starts writing
// `last_seen_at` (e.g. on each page load) this should derive from whether the
// timestamp is within the last few minutes.
function rowToCrew(row) {
  return {
    id: row.id,
    name: row.full_name,
    role: row.role,
    dept: row.department,
    avatar: row.avatar_initials || (row.full_name || '').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase(),
    online: row.is_active === true,
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
