import { supabaseAdmin as supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// POST /api/training/modules/[id]/assign
//
// Assigns a training module to one or more crew members (admin only).
// Creates training_assignment rows and in-app notifications for each
// assignee. Supports three targeting modes:
//
//   { crew_member_ids: ['uuid', ...'] }          — specific crew
//   { crew_member_ids: 'all' }                   — entire vessel
//   { crew_member_ids: 'department:Deck' }       — everyone in a department
//
// Body: {
//   crew_member_id   — UUID of the admin performing the assignment
//   crew_member_ids  — target specifier (array | 'all' | 'department:X')
//   deadline         — ISO date string or null
// }
// ---------------------------------------------------------------------------

export async function POST(request, { params }) {
  try {
    const moduleId = params.id;
    const body = await request.json();
    const { crew_member_id, crew_member_ids, deadline, vessel_id } = body;

    if (!crew_member_id || !crew_member_ids) {
      return NextResponse.json(
        { error: 'Missing required fields: crew_member_id, crew_member_ids' },
        { status: 400 },
      );
    }

    // Get caller vessel scope for crew lookups.
    const { data: caller } = await supabase
      .from('crew_members')
      .select('id, vessel_id')
      .eq('id', crew_member_id)
      .maybeSingle();

    // Verify module exists.
    const { data: mod } = await supabase
      .from('training_modules')
      .select('id, title, vessel_id')
      .eq('id', moduleId)
      .maybeSingle();

    if (!mod) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const vesselId = vessel_id || caller?.vessel_id || mod.vessel_id;

    // ── Resolve target crew list ──
    let targetIds = [];

    if (Array.isArray(crew_member_ids)) {
      targetIds = crew_member_ids;
    } else if (crew_member_ids === 'all') {
      const { data: allCrew } = await supabase
        .from('crew_members')
        .select('id')
        .eq('vessel_id', vesselId)
        .eq('is_active', true);
      targetIds = (allCrew || []).map((c) => c.id);
    } else if (
      typeof crew_member_ids === 'string' &&
      crew_member_ids.startsWith('department:')
    ) {
      const dept = crew_member_ids.replace('department:', '');
      const { data: deptCrew } = await supabase
        .from('crew_members')
        .select('id')
        .eq('vessel_id', vesselId)
        .eq('department', dept)
        .eq('is_active', true);
      targetIds = (deptCrew || []).map((c) => c.id);
    } else {
      return NextResponse.json(
        { error: 'crew_member_ids must be an array, "all", or "department:<name>"' },
        { status: 400 },
      );
    }

    // Remove the admin from the target list (don't assign to self).
    targetIds = targetIds.filter((id) => id !== crew_member_id);

    if (targetIds.length === 0) {
      return NextResponse.json(
        { error: 'No crew members to assign' },
        { status: 400 },
      );
    }

    // ── Check for existing assignments to avoid duplicates ──
    const { data: existing } = await supabase
      .from('training_assignments')
      .select('crew_member_id')
      .eq('module_id', moduleId)
      .in('crew_member_id', targetIds);

    const existingSet = new Set((existing || []).map((e) => e.crew_member_id));
    const newIds = targetIds.filter((id) => !existingSet.has(id));

    // ── Create assignments ──
    let created = 0;
    let skipped = existingSet.size;

    if (newIds.length > 0) {
      const rows = newIds.map((id) => ({
        module_id: moduleId,
        crew_member_id: id,
        assigned_by: crew_member_id,
        deadline: deadline || null,
        status: 'assigned',
      }));

      const { data: inserted, error: insertErr } = await supabase
        .from('training_assignments')
        .insert(rows)
        .select('id');

      if (insertErr) throw insertErr;
      created = (inserted || []).length;

      // ── Create in-app notifications ──
      const notifications = newIds.map((id) => ({
        vessel_id: vesselId,
        target_crew_id: id,
        type: 'system',
        title: 'New Training Assignment',
        body: `You have been assigned "${mod.title}".${deadline ? ` Deadline: ${deadline}.` : ''}`,
        reference_type: 'training_module',
        reference_id: moduleId,
      }));

      const { error: notifErr } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifErr) {
        // Non-fatal — the assignments were created, notifications just failed.
        console.error('[training/assign] notification insert failed', notifErr);
      }

      // Fire-and-forget push/email via the send-reminder endpoint.
      try {
        const origin = new URL(request.url).origin;
        fetch(`${origin}/api/notifications/send-reminder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            crewMemberIds: newIds,
            vesselId: vesselId,
            title: 'New Training Assignment',
            body: `You have been assigned "${mod.title}".${deadline ? ` Deadline: ${deadline}.` : ''}`,
            refType: 'training_module',
            refId: moduleId,
          }),
        }).catch(() => {}); // swallow — best-effort
      } catch {
        // Ignore send-reminder errors.
      }
    }

    return NextResponse.json({
      assigned: created,
      skipped,
      total: targetIds.length,
      moduleId,
    });
  } catch (err) {
    console.error('[training/assign] POST failed', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
