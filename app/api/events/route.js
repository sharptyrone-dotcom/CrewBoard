import { supabaseAdmin as supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/authCheck';
import { apiLimiter, writeLimiter } from '@/lib/rateLimit';
import { handleApiError } from '@/lib/apiError';

// ---------------------------------------------------------------------------
// /api/events
//
// GET  — List events for a vessel.
//        Returns upcoming and active events by default. Admins get read stats.
//        Crew get their own read status + department briefing preview.
//
// POST — Create a new event (admin only).
//        Body: { event_type, title, description, start_date, end_date, status,
//                attachments, restricted_fields, notification_schedule, briefings[] }
//
// Query params (GET):
//   status         — filter by status (default: upcoming,active)
//   include_past   — 'true' to include completed/cancelled
// ---------------------------------------------------------------------------

// ── GET ─────────────────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const limited = apiLimiter(request);
    if (limited) return limited;

    const auth = await requireAuth();
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const crewMemberId = auth.crewMember.id;
    const vesselId = auth.crewMember.vessel_id;
    const isAdmin = auth.crewMember.is_admin;
    const statusFilter = searchParams.get('status');
    const includePast = searchParams.get('include_past') === 'true';

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
    return handleApiError(err, 'events/GET');
  }
}

// ── POST ────────────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const limited = writeLimiter(request);
    if (limited) return limited;

    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const body = await request.json();
    const {
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

    const crew_member_id = auth.crewMember.id;
    const vessel_id = auth.crewMember.vessel_id;

    if (!title || !start_date) {
      return NextResponse.json(
        { error: 'Missing required fields: title, start_date' },
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

    // 3. Notify every other active crew member on this vessel. Notifications
    // are not opt-out on CrewNotice — compliance tracking needs every
    // crew member to see every relevant event.
    try {
      const { data: crewRows } = await supabase
        .from('crew_members')
        .select('id')
        .eq('vessel_id', vessel_id)
        .eq('is_active', true)
        .neq('id', crew_member_id);

      if (crewRows && crewRows.length > 0) {
        const dateFmt = new Date(start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        const notifRows = crewRows.map((c) => ({
          vessel_id,
          target_crew_id: c.id,
          type: 'system',
          title: 'New Event',
          body: `"${title}" — ${dateFmt}`,
          reference_type: 'event',
          reference_id: event.id,
        }));
        await supabase.from('notifications').insert(notifRows);
      }
    } catch (notifErr) {
      // Non-fatal — the event was already created successfully.
      console.error('[events] notification insert failed (non-fatal)', notifErr);
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
    return handleApiError(err, 'events/POST');
  }
}
