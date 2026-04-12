import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// /api/training/modules/[id]
//
// GET    — Full module detail.
//          Admin: module content + all assignments with crew names + stats.
//          Crew:  module content + their assignment status + best quiz score.
//
// PUT    — Update module (admin only). Replaces content, settings, and
//          questions. If the module is published and content changed, sends
//          notifications to assigned crew.
//
// DELETE — Soft delete (admin only). Unpublishes and marks the module so it
//          disappears from crew views while keeping data intact.
//
// Query params (GET / DELETE):
//   crew_member_id — UUID of the calling user (required)
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';
const supabase = createClient(supabaseUrl, supabaseKey);

// ── GET ─────────────────────────────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const moduleId = params.id;
    const { searchParams } = new URL(request.url);
    const crewMemberId = searchParams.get('crew_member_id');

    if (!crewMemberId) {
      return NextResponse.json(
        { error: 'Missing required param: crew_member_id' },
        { status: 400 },
      );
    }

    // Fetch caller info.
    const { data: caller } = await supabase
      .from('crew_members')
      .select('id, is_admin, vessel_id')
      .eq('id', crewMemberId)
      .maybeSingle();

    if (!caller) {
      return NextResponse.json({ error: 'Crew member not found' }, { status: 404 });
    }

    // Fetch the module with questions.
    const { data: mod, error: modErr } = await supabase
      .from('training_modules')
      .select('*, quiz_questions(*)')
      .eq('id', moduleId)
      .maybeSingle();

    if (modErr) throw modErr;
    if (!mod) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const questions = (mod.quiz_questions || []).sort(
      (a, b) => a.sort_order - b.sort_order,
    );

    // ── Admin response ──
    if (caller.is_admin) {
      // All assignments with crew names and their best quiz scores.
      const { data: assignments } = await supabase
        .from('training_assignments')
        .select('*, crew_members!training_assignments_crew_member_id_fkey(full_name, department, role), quiz_attempts(score, passed, completed_at)')
        .eq('module_id', moduleId)
        .order('assigned_at', { ascending: false });

      const mappedAssignments = (assignments || []).map((a) => {
        const attempts = a.quiz_attempts || [];
        const bestAttempt = attempts.length
          ? attempts.reduce((best, cur) => (cur.score > best.score ? cur : best), attempts[0])
          : null;
        return {
          id: a.id,
          crewMemberId: a.crew_member_id,
          crewName: a.crew_members?.full_name || 'Unknown',
          department: a.crew_members?.department || '',
          role: a.crew_members?.role || '',
          status: a.status,
          deadline: a.deadline,
          assignedAt: a.assigned_at,
          startedAt: a.started_at,
          completedAt: a.completed_at,
          attempts: attempts.length,
          bestScore: bestAttempt?.score ?? null,
          passed: bestAttempt?.passed ?? false,
        };
      });

      const completed = mappedAssignments.filter((a) => a.status === 'completed');

      return NextResponse.json({
        module: {
          id: mod.id,
          title: mod.title,
          description: mod.description,
          content: mod.content,
          attachments: mod.attachments,
          isPublished: mod.is_published,
          passMark: mod.pass_mark,
          timeLimitMinutes: mod.time_limit_minutes,
          randomiseQuestions: mod.randomise_questions,
          createdBy: mod.created_by,
          createdAt: mod.created_at,
          updatedAt: mod.updated_at,
          questions,
          assignments: mappedAssignments,
          stats: {
            totalAssigned: mappedAssignments.length,
            completed: completed.length,
            inProgress: mappedAssignments.filter((a) => a.status === 'in_progress').length,
            overdue: mappedAssignments.filter((a) => a.status === 'overdue').length,
            averageScore:
              completed.length > 0
                ? Math.round(
                    completed.reduce((sum, a) => sum + (a.bestScore || 0), 0) /
                      completed.length,
                  )
                : null,
            passRate:
              completed.length > 0
                ? Math.round(
                    (completed.filter((a) => a.passed).length / completed.length) * 100,
                  )
                : null,
          },
        },
      });
    }

    // ── Crew response ──
    // Only allow crew to view published modules they're assigned to.
    if (!mod.is_published) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const { data: assignment } = await supabase
      .from('training_assignments')
      .select('*')
      .eq('module_id', moduleId)
      .eq('crew_member_id', crewMemberId)
      .maybeSingle();

    if (!assignment) {
      return NextResponse.json({ error: 'Not assigned to this module' }, { status: 403 });
    }

    // Fetch best attempt.
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('score, passed, completed_at')
      .eq('assignment_id', assignment.id)
      .eq('crew_member_id', crewMemberId)
      .order('score', { ascending: false })
      .limit(5);

    const bestAttempt = attempts?.[0] || null;

    return NextResponse.json({
      module: {
        id: mod.id,
        title: mod.title,
        description: mod.description,
        content: mod.content,
        attachments: mod.attachments,
        passMark: mod.pass_mark,
        timeLimitMinutes: mod.time_limit_minutes,
        questionCount: questions.length,
        createdAt: mod.created_at,
        assignment: {
          id: assignment.id,
          status: assignment.status,
          deadline: assignment.deadline,
          assignedAt: assignment.assigned_at,
          startedAt: assignment.started_at,
          completedAt: assignment.completed_at,
        },
        bestScore: bestAttempt?.score ?? null,
        passed: bestAttempt?.passed ?? false,
        totalAttempts: (attempts || []).length,
      },
    });
  } catch (err) {
    console.error('[training/modules/[id]] GET failed', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── PUT ─────────────────────────────────────────────────────────────────────
export async function PUT(request, { params }) {
  try {
    const moduleId = params.id;
    const body = await request.json();
    const { crew_member_id, questions, ...updates } = body;

    if (!crew_member_id) {
      return NextResponse.json(
        { error: 'Missing required field: crew_member_id' },
        { status: 400 },
      );
    }

    // Verify admin.
    const { data: caller } = await supabase
      .from('crew_members')
      .select('id, is_admin, vessel_id')
      .eq('id', crew_member_id)
      .maybeSingle();

    if (!caller?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch the current module to detect content changes.
    const { data: existing } = await supabase
      .from('training_modules')
      .select('is_published, content, title')
      .eq('id', moduleId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // Build update payload — only include fields that were sent.
    const updatePayload = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) updatePayload.title = updates.title;
    if (updates.description !== undefined) updatePayload.description = updates.description;
    if (updates.content !== undefined) updatePayload.content = updates.content;
    if (updates.attachments !== undefined) updatePayload.attachments = updates.attachments;
    if (updates.pass_mark !== undefined) updatePayload.pass_mark = updates.pass_mark;
    if (updates.time_limit_minutes !== undefined) updatePayload.time_limit_minutes = updates.time_limit_minutes;
    if (updates.randomise_questions !== undefined) updatePayload.randomise_questions = updates.randomise_questions;
    if (updates.is_published !== undefined) updatePayload.is_published = updates.is_published;

    const { data: mod, error: modErr } = await supabase
      .from('training_modules')
      .update(updatePayload)
      .eq('id', moduleId)
      .select('*')
      .single();

    if (modErr) throw modErr;

    // Replace questions if a new set was provided.
    let updatedQuestions = [];
    if (Array.isArray(questions)) {
      // Delete existing questions, then bulk-insert the new set.
      await supabase.from('quiz_questions').delete().eq('module_id', moduleId);

      if (questions.length > 0) {
        const rows = questions.map((q, idx) => ({
          module_id: moduleId,
          question_text: q.question_text,
          question_type: q.question_type || 'multiple_choice',
          options: q.options || [],
          explanation: q.explanation || null,
          sort_order: q.sort_order ?? idx,
        }));

        const { data: qData, error: qErr } = await supabase
          .from('quiz_questions')
          .insert(rows)
          .select('*');

        if (qErr) throw qErr;
        updatedQuestions = qData || [];
      }
    }

    // If the module is published and content or questions changed, notify
    // assigned crew so they know to review the updated material.
    const contentChanged =
      updates.content !== undefined &&
      JSON.stringify(updates.content) !== JSON.stringify(existing.content);
    const questionsChanged = Array.isArray(questions);
    const shouldNotify =
      existing.is_published && (contentChanged || questionsChanged);

    let notifiedCount = 0;
    if (shouldNotify) {
      const { data: assignments } = await supabase
        .from('training_assignments')
        .select('crew_member_id')
        .eq('module_id', moduleId);

      const crewIds = [...new Set((assignments || []).map((a) => a.crew_member_id))];

      if (crewIds.length > 0) {
        const notifications = crewIds.map((id) => ({
          vessel_id: caller.vessel_id,
          target_crew_id: id,
          type: 'system',
          title: 'Training Module Updated',
          body: `"${mod.title}" has been updated. Please review the changes.`,
          reference_type: 'training_module',
          reference_id: moduleId,
        }));

        const { error: notifErr } = await supabase
          .from('notifications')
          .insert(notifications);

        if (notifErr) {
          console.error('[training/modules/[id]] notification insert failed', notifErr);
        } else {
          notifiedCount = crewIds.length;
        }
      }
    }

    return NextResponse.json({
      module: {
        id: mod.id,
        title: mod.title,
        description: mod.description,
        isPublished: mod.is_published,
        passMark: mod.pass_mark,
        timeLimitMinutes: mod.time_limit_minutes,
        randomiseQuestions: mod.randomise_questions,
        content: mod.content,
        attachments: mod.attachments,
        questionCount: updatedQuestions.length || undefined,
        updatedAt: mod.updated_at,
      },
      notifiedCount,
    });
  } catch (err) {
    console.error('[training/modules/[id]] PUT failed', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    const moduleId = params.id;
    const { searchParams } = new URL(request.url);
    const crewMemberId = searchParams.get('crew_member_id');

    if (!crewMemberId) {
      return NextResponse.json(
        { error: 'Missing required param: crew_member_id' },
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

    // Soft delete: unpublish and mark the updated_at so the admin can see
    // when it was "deleted". The module and its questions/assignments remain
    // in the database for historical records but are hidden from crew.
    const { data: mod, error } = await supabase
      .from('training_modules')
      .update({
        is_published: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', moduleId)
      .select('id, title')
      .single();

    if (error) throw error;
    if (!mod) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    return NextResponse.json({
      deleted: true,
      module: { id: mod.id, title: mod.title },
    });
  } catch (err) {
    console.error('[training/modules/[id]] DELETE failed', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
