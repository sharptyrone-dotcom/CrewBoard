import { supabaseAdmin as supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authCheck';
import { apiLimiter, writeLimiter } from '@/lib/rateLimit';
import { handleApiError } from '@/lib/apiError';

// ---------------------------------------------------------------------------
// /api/events/[id]/updates
//
// GET  — List live updates for an event, newest first.
// POST — Post a real-time update (e.g. "ETA changed to 1400").
//        Body: { content }
// ---------------------------------------------------------------------------

// ── GET ─────────────────────────────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const limited = apiLimiter(request);
    if (limited) return limited;

    const auth = await requireAuth();
    if (auth.response) return auth.response;

    const eventId = params.id;

    const { data: updates, error } = await supabase
      .from('event_updates')
      .select('*, crew_members!event_updates_created_by_fkey(full_name, role)')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const result = (updates || []).map((u) => ({
      id: u.id,
      eventId: u.event_id,
      content: u.content,
      createdAt: u.created_at,
      createdBy: u.crew_members?.full_name || 'Unknown',
      createdByRole: u.crew_members?.role || '',
    }));

    return NextResponse.json({ updates: result });
  } catch (err) {
    return handleApiError(err, 'events/updates/GET');
  }
}

// ── POST ────────────────────────────────────────────────────────────────────
export async function POST(request, { params }) {
  try {
    const limited = writeLimiter(request);
    if (limited) return limited;

    const auth = await requireAuth();
    if (auth.response) return auth.response;

    const eventId = params.id;
    const body = await request.json();
    const { content } = body;
    const crew_member_id = auth.crewMember.id;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Missing required field: content' },
        { status: 400 },
      );
    }

    // Verify event exists.
    const { data: event } = await supabase
      .from('events')
      .select('id, title, vessel_id')
      .eq('id', eventId)
      .maybeSingle();

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Insert the update.
    const { data: update, error } = await supabase
      .from('event_updates')
      .insert({
        event_id: eventId,
        created_by: crew_member_id,
        content: content.trim(),
      })
      .select('*, crew_members!event_updates_created_by_fkey(full_name, role)')
      .single();

    if (error) throw error;

    // Notify all OTHER crew members on this vessel about the live update.
    try {
      const { data: crewRows } = await supabase
        .from('crew_members')
        .select('id')
        .eq('vessel_id', event.vessel_id)
        .eq('is_active', true)
        .neq('id', crew_member_id);

      if (crewRows && crewRows.length > 0) {
        const notifRows = crewRows.map((c) => ({
          vessel_id: event.vessel_id,
          target_crew_id: c.id,
          type: 'system',
          title: 'Event Update',
          body: `${event.title}: ${content.trim()}`,
          reference_type: 'event',
          reference_id: eventId,
        }));
        await supabase.from('notifications').insert(notifRows);
      }
    } catch (notifErr) {
      // Non-fatal — the update was already posted successfully.
      console.error('[events/updates] notification insert failed (non-fatal)', notifErr);
    }

    return NextResponse.json(
      {
        update: {
          id: update.id,
          eventId: update.event_id,
          content: update.content,
          createdAt: update.created_at,
          createdBy: update.crew_members?.full_name || 'Unknown',
          createdByRole: update.crew_members?.role || '',
        },
      },
      { status: 201 },
    );
  } catch (err) {
    return handleApiError(err, 'events/updates/POST');
  }
}
