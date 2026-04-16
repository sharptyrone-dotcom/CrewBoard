import { supabase } from './supabase';
import { CURRENT_VESSEL_ID } from './constants';

// ---------------------------------------------------------------------------
// Notification preference checking helpers
//
// Used both client-side (to fetch/display user prefs) and before creating
// notifications (to filter out crew who have muted a given notification type).
// ---------------------------------------------------------------------------

// Maps notification context to the preference column name.
// Returns null for types that should always be delivered (e.g. critical).
export function getPreferenceKey({ type, priority, refType }) {
  // Notice reminders — route by priority
  if (type === 'notice' || refType === 'notice') {
    if (priority === 'critical') return null; // always send
    if (priority === 'important') return 'important_notices';
    return 'routine_notices';
  }
  // Documents
  if (type === 'document' || refType === 'document') return 'document_updates';
  // Training
  if (refType === 'training_module' || type === 'training_assignment') return 'training_assignments';
  if (type === 'training_reminder') return 'training_reminders';
  // Events
  if (type === 'event' || refType === 'event') return 'event_briefings';
  if (type === 'event_update') return 'event_updates';
  // Admin reminders (compliance reminders, bulk reminders)
  if (type === 'reminder') return 'admin_reminders';
  // Unknown — deliver by default
  return null;
}

// Fetches notification preferences for multiple crew members at once.
// Returns a Map<crewMemberId, preferences>.
// Crew members without a preferences row get all-true defaults.
export async function fetchBulkPreferences(crewMemberIds) {
  const prefsMap = new Map();
  if (!crewMemberIds || crewMemberIds.length === 0) return prefsMap;

  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('vessel_id', CURRENT_VESSEL_ID)
      .in('crew_member_id', crewMemberIds);

    if (error) {
      console.error('[notification-preferences] bulk fetch failed', error);
      // Return empty map — treat as all-true defaults
      return prefsMap;
    }

    for (const row of (data || [])) {
      prefsMap.set(row.crew_member_id, row);
    }
  } catch (err) {
    console.error('[notification-preferences] bulk fetch error', err);
  }

  return prefsMap;
}

// Filters a list of crew member IDs to only those who have the given
// preference enabled. Returns the filtered array.
//
// If preferenceKey is null (e.g. critical notices), returns all IDs unchanged.
export async function filterByPreference(crewMemberIds, preferenceKey) {
  if (!preferenceKey) return crewMemberIds; // null = always send
  if (!crewMemberIds || crewMemberIds.length === 0) return [];

  const prefsMap = await fetchBulkPreferences(crewMemberIds);

  return crewMemberIds.filter(id => {
    const prefs = prefsMap.get(id);
    // No prefs row → default to true (send)
    if (!prefs) return true;
    return prefs[preferenceKey] !== false;
  });
}

// Client-side hook helper: fetches and saves preferences for the current user.
export async function fetchMyPreferences(crewMemberId) {
  try {
    const res = await fetch(
      `/api/notifications/preferences?crew_member_id=${crewMemberId}&vessel_id=${CURRENT_VESSEL_ID}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.preferences;
  } catch (err) {
    console.error('[notification-preferences] fetchMy failed', err);
    return null;
  }
}

export async function saveMyPreferences(crewMemberId, preferences) {
  try {
    const res = await fetch('/api/notifications/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        crew_member_id: crewMemberId,
        vessel_id: CURRENT_VESSEL_ID,
        preferences,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.preferences;
  } catch (err) {
    console.error('[notification-preferences] save failed', err);
    throw err;
  }
}
