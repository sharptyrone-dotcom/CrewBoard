import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// /api/events
//
// GET  — List events for a vessel.
//        Returns upcoming and active events by default. Admins get read stats.
//        Crew get their own read status + department briefing preview.
//
// POST — Create a new event (admin only).
//        Body: { crew_member_id, vessel_id, event_type, title, description,
//                start_date, end_date, status, attachments,
//                restricted_fields, notification_schedule, briefings[] }
//
// Query params (GET):
//   crew_member_id — UUID of the calling user (required)
//   vessel_id      — UUID of the vessel (required)
//   role           — 'admin' for admin view
//   status         — filter by status (default: upcoming,active)
//   include_past   — 'true' to include completed/cancelled
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';
const supabase = createClient(supabaseUrl, supabaseKey);

// ── GET ─────────────────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const crewMemberId = searchParams.get('crew_member_id');
    const vesselId = searchParams.get('vessel_id');
    const isAdmin = searchParams.get('role') === 'admin';
    const statusFilter = searchParams.get('status');
    const includePast = searchParams.get('include_past') === 'true';

    if (!crewMemberId || !vesselId) {
      return NextResponse.json(
        { error: 'Missing required params: crew_member_id, vessel_id' },
        { status: 400 },
      );
    }

    // Build the query.
    let query = supabase
      .from('events')
      .select('*, event_briefings(*), event_reads(crew_member_id), event_updates(id)')
      .eq('vessel_id', vesselId)
      .order('start_date', { ascending: true });

    // Filter by status.
    if (statusFilter) {
      query = query.eq('status', statusFilter);
    } else if (!includePast) {
      query = query.in('status', ['upcoming', 'active']);
    }

    const { data: events, error } = await query;
    if (error) throw error;

    // Get total crew count for read stats (admin).
    let totalCrew = 0;
    if (isAdmin) {
      const { count } = await supabase
        .from('crew_members')
        .select('id', { count: 'exact', head: true })
        .eq('vessel_id', vesselId)
        .eq('is_active', true);
      totalCrew = count || 0;
    }

    // Get caller's department for briefing preview.
    const { data: caller } = await supabase
      .from('crew_members')
      .select('department')
      .eq('id', crewMemberId)
      .maybeSingle();

    const callerDept = caller?.department || '';

    const result = (events || []).map((e) => {
      const reads = e.event_reads || [];
      const briefings = (e.event_briefings || []).sort(
        (a, b) => a.sort_order - b.sort_order,
      );
      const updateCount = (e.event_updates || []).length;

      // Find the caller's department briefing for preview.
      const myBriefing = briefings.find(
        (b) => b.department.toLowerCase() === callerDept.toLowerCase(),
      );

      const base = {
        id: e.id,
        eventType: e.event_type,
        title: e.title,
        description: e.description,
        startDate: e.start_date,
        endDate: e.end_date,
        status: e.status,
        attachments: e.attachments,
        notificationSchedule: e.notification_schedule,
        createdAt: e.created_at,
        updatedAt: e.updated_at,
        updateCount,
        briefingDepartments: briefings.map((b) => b.department),
        myBriefingPreview: myBriefing
          ? myBriefing.content.substring(0, 120) + (myBriefing.content.length > 120 ? '...' : '')
          : null,
        isRead: reads.some((r) => r.crew_member_id === crewMemberId),
      };

      if (isAdmin) {
        base.readCount = reads.length;
        base.totalCrew = totalCrew;
        base.restrictedFields = e.restricted_fields;
        base.createdBy = e.created_by;
      }

      return base;
    });

    return NextResponse.json({ events: result });
  } catch (err) {
    console.error('[events] GET failed', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── POST ────────────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      crew_member_id,
      vessel_id,
      event_type,
      title,
      description,
      start_date,
      end_date,
      status,
      attachments,
      restricted_fields,
      notification_schedule,
      briefings,
    } = body;

    if (!crew_member_id || !vessel_id || !title || !start_date) {
      return NextResponse.json(
        { error: 'Missing required fields: crew_member_id, vessel_id, title, start_date' },
        { status: 400 },
      );
    }

    // 1. Insert the event.
    const { data: event, error: eventErr } = await supabase
      .from('events')
      .insert({
        vessel_id,
        created_by: crew_member_id,
        event_type: event_type || 'custom',
        title,
        description: description || '',
        start_date,
        end_date: end_date || null,
        status: status || 'upcoming',
        attachments: attachments || [],
        restricted_fields: restricted_fields || null,
        notification_schedule: notification_schedule || [
          { days_before: 7, sent: false },
          { days_before: 3, sent: false },
          { days_before: 1, sent: false },
        ],
      })
      .select('*')
      .single();

    if (eventErr) throw eventErr;

    // 2. Insert briefings if provided.
    let insertedBriefings = [];
    if (Array.isArray(briefings) && briefings.length > 0) {
      const briefingRows = briefings
        .filter((b) => b.department && b.content?.trim())
        .map((b, idx) => ({
          event_id: event.id,
          department: b.department,
          content: b.content,
          attachments: b.attachments || [],
          sort_order: b.sort_order ?? idx,
        }));

      if (briefingRows.length > 0) {
        const { data: bData, error: bErr } = await supabase
          .from('event_briefings')
          .insert(briefingRows)
          .select('*');

        if (bErr) throw bErr;
        insertedBriefings = bData || [];
      }
    }

    return NextResponse.json(
      {
        event: {
          id: event.id,
          eventType: event.event_type,
          title: event.title,
          description: event.description,
          startDate: event.start_date,
          endDate: event.end_date,
          status: event.status,
          attachments: event.attachments,
          restrictedFields: event.restricted_fields,
          notificationSchedule: event.notification_schedule,
          createdAt: event.created_at,
          briefingCount: insertedBriefings.length,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('[events] POST failed', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
