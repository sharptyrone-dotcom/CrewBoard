import { supabaseAdmin as supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authCheck';
import { apiLimiter, writeLimiter } from '@/lib/rateLimit';
import { handleApiError } from '@/lib/apiError';

// ---------------------------------------------------------------------------
// /api/notifications/preferences
//
// GET  — Return the current user's notification preferences.
//        Creates a default row if none exists yet.
// PUT  — Update notification preferences.
//        Body: { preferences: { ... } }
//        critical_notices is always forced to true.
// ---------------------------------------------------------------------------

const PREFERENCE_COLUMNS = [
  'critical_notices',
  'important_notices',
  'routine_notices',
  'document_updates',
  'training_assignments',
  'training_reminders',
  'event_briefings',
  'event_updates',
  'admin_reminders',
];

const DEFAULT_PREFERENCES = Object.fromEntries(
  PREFERENCE_COLUMNS.map(c => [c, true])
);

function rowToPreferences(row) {
  const prefs = {};
  for (const col of PREFERENCE_COLUMNS) {
    prefs[col] = row[col] ?? true;
  }
  return prefs;
}

// ── GET ──────────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const limited = apiLimiter(request);
    if (limited) return limited;

    const auth = await requireAuth();
    if (auth.response) return auth.response;

    const crewMemberId = auth.crewMember.id;
    const vesselId = auth.crewMember.vessel_id;

    // Try to fetch existing row
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('crew_member_id', crewMemberId)
      .eq('vessel_id', vesselId)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      return NextResponse.json({ preferences: rowToPreferences(data) });
    }

    // No row exists — create one with all defaults (all true)
    const { data: inserted, error: insertError } = await supabase
      .from('notification_preferences')
      .insert({
        crew_member_id: crewMemberId,
        vessel_id: vesselId,
        ...DEFAULT_PREFERENCES,
      })
      .select('*')
      .single();

    if (insertError) {
      // Race condition: another request created it. Fetch it.
      if (insertError.code === '23505') {
        const { data: existing } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('crew_member_id', crewMemberId)
          .eq('vessel_id', vesselId)
          .single();
        return NextResponse.json({ preferences: existing ? rowToPreferences(existing) : DEFAULT_PREFERENCES });
      }
      throw insertError;
    }

    return NextResponse.json({ preferences: rowToPreferences(inserted) });
  } catch (err) {
    return handleApiError(err, 'notifications/preferences/GET');
  }
}

// ── PUT ──────────────────────────────────────────────────────────────
export async function PUT(request) {
  try {
    const limited = writeLimiter(request);
    if (limited) return limited;

    const auth = await requireAuth();
    if (auth.response) return auth.response;

    const { preferences } = await request.json();
    const crew_member_id = auth.crewMember.id;
    const vessel_id = auth.crewMember.vessel_id;

    if (!preferences) {
      return NextResponse.json({ error: 'preferences is required' }, { status: 400 });
    }

    // Build the update payload — only allow known columns, force critical on
    const updateData = { updated_at: new Date().toISOString() };
    for (const col of PREFERENCE_COLUMNS) {
      if (col in preferences) {
        // Critical notices cannot be muted
        if (col === 'critical_notices') {
          updateData[col] = true;
        } else {
          updateData[col] = Boolean(preferences[col]);
        }
      }
    }

    const { data, error } = await supabase
      .from('notification_preferences')
      .update(updateData)
      .eq('crew_member_id', crew_member_id)
      .eq('vessel_id', vessel_id)
      .select('*')
      .single();

    if (error) {
      // If no row exists yet, upsert it
      if (error.code === 'PGRST116') {
        const { data: upserted, error: upsertError } = await supabase
          .from('notification_preferences')
          .upsert({
            crew_member_id,
            vessel_id,
            ...DEFAULT_PREFERENCES,
            ...updateData,
            critical_notices: true,
          }, { onConflict: 'crew_member_id,vessel_id' })
          .select('*')
          .single();

        if (upsertError) throw upsertError;
        return NextResponse.json({ preferences: rowToPreferences(upserted) });
      }

      throw error;
    }

    return NextResponse.json({ preferences: rowToPreferences(data) });
  } catch (err) {
    return handleApiError(err, 'notifications/preferences/PUT');
  }
}
