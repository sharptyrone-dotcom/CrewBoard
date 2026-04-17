import { supabaseAdmin as supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/authCheck';
import { apiLimiter, writeLimiter } from '@/lib/rateLimit';
import { handleApiError } from '@/lib/apiError';

// ---------------------------------------------------------------------------
// /api/training/modules
//
// GET  — List training modules.
//        Admin: all modules for the vessel with assignment stats.
//        Crew:  only modules they are assigned to, with their personal status.
//
// POST — Create a new module (admin only).
// ---------------------------------------------------------------------------

// ── GET ─────────────────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const limited = apiLimiter(request);
    if (limited) return limited;

    const auth = await requireAuth();
    if (auth.response) return auth.response;

    const crewMemberId = auth.crewMember.id;
    const vesselId = auth.crewMember.vessel_id;
    const isAdmin = auth.crewMember.is_admin;

    // ── Admin: all modules + aggregate stats ──
    if (isAdmin) {
      const { data: modules, error: modErr } = await supabase
        .from('training_modules')
        .select('*, quiz_questions(id), training_assignments(id, status, crew_member_id)')
        .eq('vessel_id', vesselId)
        .order('created_at', { ascending: false });

      if (modErr) throw modErr;

      const result = (modules || []).map((m) => {
        const assignments = m.training_assignments || [];
        const completed = assignments.filter((a) => a.status === 'completed');
        return {
          id: m.id,
          title: m.title,
          description: m.description,
          isPublished: m.is_published,
          passMark: m.pass_mark,
          timeLimitMinutes: m.time_limit_minutes,
          randomiseQuestions: m.randomise_questions,
          questionCount: (m.quiz_questions || []).length,
          createdAt: m.created_at,
          updatedAt: m.updated_at,
          stats: {
            totalAssigned: assignments.length,
            completed: completed.length,
            inProgress: assignments.filter((a) => a.status === 'in_progress').length,
            overdue: assignments.filter((a) => a.status === 'overdue').length,
            completionRate:
              assignments.length > 0
                ? Math.round((completed.length / assignments.length) * 100)
                : 0,
          },
        };
      });

      return NextResponse.json({ modules: result });
    }

    // ── Crew: only assigned modules ──
    const { data: assignments, error: assignErr } = await supabase
      .from('training_assignments')
      .select('*, training_modules!inner(*, quiz_questions(id))')
      .eq('crew_member_id', crewMemberId)
      .eq('training_modules.vessel_id', vesselId)
      .eq('training_modules.is_published', true)
      .order('assigned_at', { ascending: false });

    if (assignErr) throw assignErr;

    const result = (assignments || []).map((a) => {
      const m = a.training_modules;
      return {
        id: m.id,
        title: m.title,
        description: m.description,
        passMark: m.pass_mark,
        timeLimitMinutes: m.time_limit_minutes,
        questionCount: (m.quiz_questions || []).length,
        assignmentId: a.id,
        status: a.status,
        deadline: a.deadline,
        assignedAt: a.assigned_at,
        startedAt: a.started_at,
        completedAt: a.completed_at,
      };
    });

    return NextResponse.json({ modules: result });
  } catch (err) {
    return handleApiError(err, 'training/modules/GET');
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
      title,
      description,
      content,
      attachments,
      pass_mark,
      time_limit_minutes,
      randomise_questions,
      is_published,
      questions,
    } = body;

    const crew_member_id = auth.crewMember.id;
    const vessel_id = auth.crewMember.vessel_id;

    if (!title) {
      return NextResponse.json(
        { error: 'Missing required field: title' },
        { status: 400 },
      );
    }

    // 1. Insert the module.
    const { data: mod, error: modErr } = await supabase
      .from('training_modules')
      .insert({
        vessel_id,
        created_by: crew_member_id,
        title,
        description: description || '',
        content: content || [],
        attachments: attachments || [],
        pass_mark: pass_mark ?? 80,
        time_limit_minutes: time_limit_minutes || null,
        randomise_questions: randomise_questions ?? false,
        is_published: is_published ?? false,
      })
      .select('*')
      .single();

    if (modErr) throw modErr;

    // 2. Insert quiz questions if provided.
    let insertedQuestions = [];
    if (Array.isArray(questions) && questions.length > 0) {
      const questionRows = questions.map((q, idx) => ({
        module_id: mod.id,
        question_text: q.question_text,
        question_type: q.question_type || 'multiple_choice',
        options: q.options || [],
        explanation: q.explanation || null,
        sort_order: q.sort_order ?? idx,
      }));

      const { data: qData, error: qErr } = await supabase
        .from('quiz_questions')
        .insert(questionRows)
        .select('*');

      if (qErr) throw qErr;
      insertedQuestions = qData || [];
    }

    return NextResponse.json(
      {
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
          questionCount: insertedQuestions.length,
          createdAt: mod.created_at,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    return handleApiError(err, 'training/modules/POST');
  }
}
