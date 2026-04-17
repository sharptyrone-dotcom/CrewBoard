import { supabaseAdmin as supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/authCheck';
import { apiLimiter, writeLimiter } from '@/lib/rateLimit';
import { handleApiError } from '@/lib/apiError';

// ---------------------------------------------------------------------------
// /api/events/[id]/briefings
//
// GET  — List briefings for an event, ordered by sort_order.
// POST — Add a department briefing to an event (admin only).
//        Body: { department, content, attachments }
// ---------------------------------------------------------------------------

// ── GET ─────────────────────────────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const limited = apiLimiter(request);
    if (limited) return limited;

    const auth = await requireAuth();
    if (auth.response) return auth.response;

    const eventId = params.id;

    const { data: briefings, error } = await supabase
      .from('event_briefings')
      .select('*')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    const result = (briefings || []).map((b) => ({
      id: b.id,
      eventId: b.event_id,
      department: b.department,
      content: b.content,
      attachments: b.attachments,
      sortOrder: b.sort_order,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    }));

    return NextResponse.json({ briefings: result });
  } catch (err) {
    return handleApiError(err, 'events/briefings/GET');
  }
}

// ── POST ────────────────────────────────────────────────────────────────────
export async function POST(request, { params }) {
  try {
    const limited = writeLimiter(request);
    if (limited) return limited;

    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const eventId = params.id;
    const body = await request.json();
    const { department, content, attachments } = body;

    if (!department || !content?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields: department, content' },
        { status: 400 },
      );
    }

    // Verify the event exists.
    const { data: event } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .maybeSingle();

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Get the next sort_order.
    const { data: existing } = await supabase
      .from('event_briefings')
      .select('sort_order')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder = existing?.[0] ? existing[0].sort_order + 1 : 0;

    const { data: briefing, error } = await supabase
      .from('event_briefings')
      .insert({
        event_id: eventId,
        department,
        content: content.trim(),
        attachments: attachments || [],
        sort_order: nextOrder,
      })
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        briefing: {
          id: briefing.id,
          eventId: briefing.event_id,
          department: briefing.department,
          content: briefing.content,
          attachments: briefing.attachments,
          sortOrder: briefing.sort_order,
          createdAt: briefing.created_at,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    return handleApiError(err, 'events/briefings/POST');
  }
}
