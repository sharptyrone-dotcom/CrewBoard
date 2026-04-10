import { supabase } from './supabase';

// Thin wrappers around supabase.auth so the rest of the app doesn't need to
// know the exact SDK shape. Every function here returns plain data (or
// throws) — no SDK objects leak through.

export async function signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: (email || '').trim(),
    password,
  });
  if (error) {
    console.error('[auth] signIn failed', error);
    throw error;
  }
  return data.session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('[auth] signOut failed', error);
    throw error;
  }
}

// Returns the current session synchronously from the Supabase client's
// localStorage cache (null if not signed in). Used for the initial paint
// so we don't flash the login screen on every refresh.
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('[auth] getSession failed', error);
    return null;
  }
  return data.session;
}

// Subscribes to auth state changes. Returns an unsubscribe function so
// callers can clean up in useEffect. The callback receives the new
// session (or null on sign-out).
export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => {
    data?.subscription?.unsubscribe?.();
  };
}

// Looks up the crew_members row for the currently-signed-in user. The
// strict RLS policies expect auth.uid() to match crew_members.id, so
// we query by id rather than email. Returns the CrewBoard-shaped object
// (name/role/dept/avatar/online), mirroring what fetchCrew() returns.
export async function fetchCurrentCrewMember(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('crew_members')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[auth] fetchCurrentCrewMember failed', error);
    throw error;
  }
  if (!data) return null;

  const initials = data.avatar_initials
    || (data.full_name || '').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();

  return {
    id: data.id,
    name: data.full_name,
    role: data.role,
    dept: data.department,
    avatar: initials,
    email: data.email,
    vesselId: data.vessel_id,
    isAdmin: data.is_admin,
    isHod: data.is_hod,
  };
}
