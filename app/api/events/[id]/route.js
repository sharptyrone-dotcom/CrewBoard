import { supabaseAdmin as supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/authCheck';
import { apiLimiter, writeLimiter } from '@/lib/rateLimit';
import { handleApiError } from '@/lib/apiError';

// ---------------------------------------------------------------------------
// /api/events/[id]
//
// GET    — Full event detail with briefings, updates, and read receipts.
// PUT    — Update event (admin only). Partial update — only sent fields change.
// DELETE — Delete event (admin only). Hard delete for upcoming, soft archive
//          for completed.
// ---------------------------------------------------------------------------

// ── GET ─────────────────────────────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const limited = apiLimiter(request);
    if (limited) return limited;

    const auth = await requireAuth();
    if (auth.response) return auth.response;

    const eventId = params.id;
    const crewMemberId = auth.crewMember.id;
    const isAdmin = auth.crewMember.is_admin;

    // Fetch event with all related data.
    const { data: event, error: eventErr } = await supabase
      .from('events')
      .select(
        '*, event_briefings(*), event_updates(*, crew_members!event_updates_created_by_fkey(full_name, role)), event_reads(crew_member_id, read_at, crew_members!event_reads_crew_member_id_fkey(full_name, department, role))',
      )
      .eq('id', eventId)
      .maybeSingle();

    if (eventErr) throw eventErr;
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Get caller info for department filtering.
    const { data: caller } = await supabase
      .from('crew_members')
      .select('department, role')
      .eq('id', crewMemberId)
      .maybeSingle();

    const callerDept = caller?.department || '';
    const callerRole = caller?.role || '';

    // Sort briefings by sort_order, put caller's department first for crew.
    const briefings = (event.event_briefings || []).sort((a, b) => {
      if (!isAdmin) {
        const aIsMine = a.department.toLowerCase() === callerDept.toLowerCase();
        const bIsMine = b.department.toLowerCase() === callerDept.toLowerCase();
        if (aIsMine && !bIsMine) return -1;
        if (!aIsMine && bIsMine) return 1;
      }
      return a.sort_order - b.sort_order;
    });

    // Sort updates newest first.
    const updates = (event.event_updates || [])
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((u) => ({
        id: u.id,
        content: u.content,
        createdAt: u.created_at,
        createdBy: u.crew_members?.full_name || 'Unknown',
        createdByRole: u.crew_members?.role || '',
      }));

    // Read receipts.
    const reads = (event.event_reads || []).map((r) => ({
      crewMemberId: r.crew_member_id,
      readAt: r.read_at,
      crewName: r.crew_members?.full_name || 'Unknown',
      department: r.crew_members?.department || '',
      role: r.crew_members?.role || '',
    }));

    // Handle restricted fields — only show to allowed roles.
    let description = event.description;
    let restrictedVisible = {};
    if (event.restricted_fields && !isAdmin) {
      const rf = event.restricted_fields;
      // restricted_fields shape: { fieldName: { value, roles: ['Captain', 'Chief Stewardess'] } }
      Object.entries(rf).forEach(([key, config]) => {
        if (config.roles && config.roles.includes(callerRole)) {
          restrictedVisible[key] = config.value;
        }
      });
    } else if (event.restricted_fields && isAdmin) {
      restrictedVisible = event.restricted_fields;
    }

    const result = {
      id: event.id,
      eventType: event.event_type,
      title: event.title,
      description,
      startDate: event.start_date,
      endDate: event.end_date,
      status: event.status,
      attachments: event.attachments,
      notificationSchedule: event.notification_schedule,
      restrictedFields: restrictedVisible,
      createdBy: event.created_by,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
      briefings: briefings.map((b) => ({
        id: b.id,
        department: b.department,
        content: b.content,
        attachments: b.attachments,
        sortOrder: b.sort_order,
        isMyDepartment: b.department.toLowerCase() === callerDept.toLowerCase(),
      })),
      updates,
      isRead: reads.some((r) => r.crewMemberId === crewMemberId),
    };

    if (isAdmin) {
      result.reads = reads;
      result.readCount = reads.length;

      // Total active crew for the vessel.
      const { count } = await supabase
        .from('crew_members')
        .select('id', { count: 'exact', head: true })
        .eq('vessel_id', event.vessel_id)
        .eq('is_active', true);
      result.totalCrew = count || 0;
    }

    return NextResponse.json({ event: result });
  } catch (err) {
    return handleApiError(err, 'events/[id]/GET');
  }
}

// ── PUT ─────────────────────────────────────────────────────────────────────
export async function PUT(request, { params }) {
  try {
    const limited = writeLimiter(request);
    if (limited) return limited;

    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const eventId = params.id;
    const body = await request.json();
    const { briefings, ...updates } = body;

    // Build update payload — only include fields that were sent.
    const updatePayload = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) updatePayload.title = updates.title;
    if (updates.description !== undefined) updatePayload.description = updates.description;
    if (updates.event_type !== undefined) updatePayload.event_type = updates.event_type;
    if (updates.start_date !== undefined) updatePayload.start_date = updates.start_date;
    if (updates.end_date !== undefined) updatePayload.end_date = updates.end_date;
    if (updates.status !== undefined) updatePayload.status = updates.status;
    if (updates.attachments !== undefined) updatePayload.attachments = updates.attachments;
    if (updates.restricted_fields !== undefined) updatePayload.restricted_fields = updates.restricted_fields;
    if (updates.notification_schedule !== undefined) updatePayload.notification_schedule = updates.notification_schedule;

    const { data: event, error: eventErr } = await supabase
      .from('events')
      .update(updatePayload)
      .eq('id', eventId)
      .select('*')
      .single();

    if (eventErr) throw eventErr;

    // Replace briefings if provided.
    if (Array.isArray(briefings)) {
      await supabase.from('event_briefings').delete().eq('event_id', eventId);

      if (briefings.length > 0) {
        const rows = briefings
          .filter((b) => b.department && b.content?.trim())
          .map((b, idx) => ({
            event_id: eventId,
            department: b.department,
            content: b.content,
            attachments: b.attachments || [],
            sort_order: b.sort_order ?? idx,
          }));

        if (rows.length > 0) {
          const { error: bErr } = await supabase
            .from('event_briefings')
            .insert(rows);
          if (bErr) throw bErr;
        }
      }
    }

    return NextResponse.json({
      event: {
        id: event.id,
        eventType: event.event_type,
        title: event.title,
        status: event.status,
        updatedAt: event.updated_at,
      },
    });
  } catch (err) {
    return handleApiError(err, 'events/[id]/PUT');
  }
}

// ── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    const limited = writeLimiter(request);
    if (limited) return limited;

    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const eventId = params.id;

    // Check current status — archive completed events, delete upcoming.
    const { data: existing } = await supabase
      .from('events')
      .select('id, status, title')
      .eq('id', eventId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (existing.status === 'completed' || existing.status === 'active') {
      // Soft archive — mark as cancelled.
      const { error } = await supabase
        .from('events')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', eventId);
      if (error) throw error;

      return NextResponse.json({
        archived: true,
        event: { id: existing.id, title: existing.title },
      });
    }

    // Hard delete upcoming/cancelled events.
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) throw error;

    return NextResponse.json({
      deleted: true,
      event: { id: existing.id, title: existing.title },
    });
  } catch (err) {
    return handleApiError(err, 'events/[id]/DELETE');
  }
}
