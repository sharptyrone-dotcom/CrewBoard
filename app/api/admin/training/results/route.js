import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// GET /api/admin/training/results
//
// Admin-only overview of training results across the vessel. Returns
// per-module stats and per-crew breakdowns with optional filters.
//
// Query params:
//   crew_member_id — UUID of the calling admin (required for auth check)
//   vessel_id      — UUID of the vessel (required)
//   module_id      — optional: filter to a single module
//   department     — optional: filter crew by department
//   crew_filter    — optional: filter to a specific crew member UUID
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const crewMemberId = searchParams.get('crew_member_id');
    const vesselId = searchParams.get('vessel_id');
    const moduleFilter = searchParams.get('module_id');
    const deptFilter = searchParams.get('department');
    const crewFilter = searchParams.get('crew_filter');

    if (!crewMemberId || !vesselId) {
      return NextResponse.json(
        { error: 'Missing required params: crew_member_id, vessel_id' },
        { status: 400 },
      );
    }

    // Verify admin.
    const { data: caller } = await supabase
      .from('crew_members')
      .select('id, is_admin')
      .eq('id', crewMemberId)
      .maybeSingle();

    if (!caller?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // ── Parallel data fetches ──
    const [modulesRes, assignmentsRes, crewRes] = await Promise.all([
      // All modules for this vessel.
      supabase
        .from('training_modules')
        .select('id, title, pass_mark, is_published, created_at')
        .eq('vessel_id', vesselId)
        .order('created_at', { ascending: false }),
      // All assignments with attempts + crew info.
      supabase
        .from('training_assignments')
        .select(
          '*, crew_members!training_assignments_crew_member_id_fkey(id, full_name, department, role), training_modules!inner(id, vessel_id, pass_mark), quiz_attempts(id, score, passed, completed_at)',
        )
        .eq('training_modules.vessel_id', vesselId),
      // Crew roster for department filtering and reference.
      supabase
        .from('crew_members')
        .select('id, full_name, department, role')
        .eq('vessel_id', vesselId)
        .eq('is_active', true),
    ]);

    if (modulesRes.error) throw modulesRes.error;
    if (assignmentsRes.error) throw assignmentsRes.error;
    if (crewRes.error) throw crewRes.error;

    let assignments = assignmentsRes.data || [];

    // ── Apply filters ──
    if (moduleFilter) {
      assignments = assignments.filter(
        (a) => a.module_id === moduleFilter,
      );
    }
    if (deptFilter) {
      assignments = assignments.filter(
        (a) => a.crew_members?.department === deptFilter,
      );
    }
    if (crewFilter) {
      assignments = assignments.filter(
        (a) => a.crew_member_id === crewFilter,
      );
    }

    // ── Build per-module stats ──
    const moduleMap = new Map(
      (modulesRes.data || []).map((m) => [m.id, m]),
    );

    const byModule = new Map();
    for (const a of assignments) {
      if (!byModule.has(a.module_id)) byModule.set(a.module_id, []);
      byModule.get(a.module_id).push(a);
    }

    const moduleStats = [];
    for (const [modId, modAssignments] of byModule) {
      const mod = moduleMap.get(modId);
      if (!mod) continue;

      const total = modAssignments.length;
      const completed = modAssignments.filter((a) => a.status === 'completed');
      const inProgress = modAssignments.filter((a) => a.status === 'in_progress');
      const overdue = modAssignments.filter((a) => a.status === 'overdue');
      const notStarted = modAssignments.filter((a) => a.status === 'assigned');

      // Collect all attempts across assignments.
      const allAttempts = modAssignments.flatMap((a) => a.quiz_attempts || []);
      const completedAttempts = allAttempts.filter((att) => att.completed_at);
      const passedAttempts = completedAttempts.filter((att) => att.passed);
      const scores = completedAttempts.map((att) => att.score);

      moduleStats.push({
        moduleId: modId,
        title: mod.title,
        isPublished: mod.is_published,
        passMark: mod.pass_mark,
        totalAssigned: total,
        completed: completed.length,
        inProgress: inProgress.length,
        overdue: overdue.length,
        notStarted: notStarted.length,
        completionRate:
          total > 0 ? Math.round((completed.length / total) * 100) : 0,
        totalAttempts: completedAttempts.length,
        passRate:
          completedAttempts.length > 0
            ? Math.round((passedAttempts.length / completedAttempts.length) * 100)
            : null,
        averageScore:
          scores.length > 0
            ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
            : null,
        highestScore: scores.length > 0 ? Math.max(...scores) : null,
        lowestScore: scores.length > 0 ? Math.min(...scores) : null,
      });
    }

    // ── Build per-crew breakdown ──
    const byCrew = new Map();
    for (const a of assignments) {
      const cid = a.crew_member_id;
      if (!byCrew.has(cid)) byCrew.set(cid, []);
      byCrew.get(cid).push(a);
    }

    const crewStats = [];
    for (const [cid, crewAssignments] of byCrew) {
      const info = crewAssignments[0]?.crew_members || {};
      const total = crewAssignments.length;
      const completed = crewAssignments.filter((a) => a.status === 'completed').length;
      const overdue = crewAssignments.filter((a) => a.status === 'overdue').length;

      const allAttempts = crewAssignments.flatMap((a) => a.quiz_attempts || []);
      const attemptScores = allAttempts
        .filter((att) => att.completed_at)
        .map((att) => att.score);

      crewStats.push({
        crewMemberId: cid,
        name: info.full_name || 'Unknown',
        department: info.department || '',
        role: info.role || '',
        totalAssigned: total,
        completed,
        overdue,
        completionRate:
          total > 0 ? Math.round((completed / total) * 100) : 0,
        averageScore:
          attemptScores.length > 0
            ? Math.round(
                attemptScores.reduce((s, v) => s + v, 0) / attemptScores.length,
              )
            : null,
        totalAttempts: allAttempts.length,
      });
    }

    // ── Vessel-wide summary ──
    const totalAssignments = assignments.length;
    const totalCompleted = assignments.filter((a) => a.status === 'completed').length;
    const totalOverdue = assignments.filter((a) => a.status === 'overdue').length;
    const allScores = assignments
      .flatMap((a) => a.quiz_attempts || [])
      .filter((att) => att.completed_at)
      .map((att) => att.score);

    // Get unique departments from crew roster.
    const departments = [
      ...new Set((crewRes.data || []).map((c) => c.department).filter(Boolean)),
    ].sort();

    return NextResponse.json({
      summary: {
        totalModules: (modulesRes.data || []).length,
        publishedModules: (modulesRes.data || []).filter((m) => m.is_published).length,
        totalAssignments,
        completed: totalCompleted,
        overdue: totalOverdue,
        completionRate:
          totalAssignments > 0
            ? Math.round((totalCompleted / totalAssignments) * 100)
            : 0,
        averageScore:
          allScores.length > 0
            ? Math.round(allScores.reduce((s, v) => s + v, 0) / allScores.length)
            : null,
        totalCrewWithAssignments: byCrew.size,
      },
      modules: moduleStats,
      crew: crewStats.sort((a, b) => a.name.localeCompare(b.name)),
      departments,
    });
  } catch (err) {
    console.error('[admin/training/results] GET failed', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
