import { supabaseAdmin as supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// /api/notifications/preferences
//
// GET  — Return the current user's notification preferences.
//        Creates a default row if none exists yet.
//        Query params: crew_member_id, vessel_id
//
// PUT  — Update notification preferences.
//        Body: { crew_member_id, vessel_id, preferences: { ... } }
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
    const { searchParams } = new URL(request.url);
    const crewMemberId = searchParams.get('crew_member_id');
    const vesselId = searchParams.get('vessel_id');

    if (!crewMemberId || !vesselId) {
      return NextResponse.json({ error: 'crew_member_id and vessel_id are required' }, { status: 400 });
    }

    // Try to fetch existing row
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('crew_member_id', crewMemberId)
      .eq('vessel_id', vesselId)
      .maybeSingle();

    if (error) {
      console.error('[notification-preferences] GET fetch failed', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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
      console.error('[notification-preferences] GET insert failed', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ preferences: rowToPreferences(inserted) });
  } catch (err) {
    console.error('[notification-preferences] GET unhandled', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── PUT ──────────────────────────────────────────────────────────────
export async function PUT(request) {
  try {
    const { crew_member_id, vessel_id, preferences } = await request.json();

    if (!crew_member_id || !vessel_id || !preferences) {
      return NextResponse.json({ error: 'crew_member_id, vessel_id, and preferences are required' }, { status: 400 });
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

        if (upsertError) {
          console.error('[notification-preferences] PUT upsert failed', upsertError);
          return NextResponse.json({ error: upsertError.message }, { status: 500 });
        }
        return NextResponse.json({ preferences: rowToPreferences(upserted) });
      }

      console.error('[notification-preferences] PUT update failed', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ preferences: rowToPreferences(data) });
  } catch (err) {
    console.error('[notification-preferences] PUT unhandled', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
