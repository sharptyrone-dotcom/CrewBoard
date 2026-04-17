import { supabaseAdmin as supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authCheck';
import { writeLimiter } from '@/lib/rateLimit';
import { handleApiError } from '@/lib/apiError';

// ---------------------------------------------------------------------------
// POST /api/events/[id]/read
//
// Mark an event as read by the current crew member. Uses upsert to handle
// duplicate calls gracefully (the unique constraint on event_id + crew_member_id
// prevents double-inserts).
// ---------------------------------------------------------------------------

export async function POST(request, { params }) {
  try {
    const limited = writeLimiter(request);
    if (limited) return limited;

    const auth = await requireAuth();
    if (auth.response) return auth.response;

    const eventId = params.id;
    const crew_member_id = auth.crewMember.id;

    // Verify event exists.
    const { data: event } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .maybeSingle();

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Upsert — on conflict do nothing (already read).
    const { data: read, error } = await supabase
      .from('event_reads')
      .upsert(
        {
          event_id: eventId,
          crew_member_id,
          read_at: new Date().toISOString(),
        },
        { onConflict: 'event_id,crew_member_id', ignoreDuplicates: true },
      )
      .select('id, read_at')
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      read: true,
      readAt: read?.read_at || new Date().toISOString(),
    });
  } catch (err) {
    return handleApiError(err, 'events/read');
  }
}
