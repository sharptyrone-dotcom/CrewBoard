import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// /api/training/modules/[id]/quiz
//
// GET  — Retrieve quiz questions for a module.
//        • If randomise_questions is true, shuffles the question order.
//        • Strips `is_correct` from option objects so crew can't cheat by
//          inspecting the response.
//        • Also marks the assignment as in_progress on first access.
//
// POST — Submit a quiz attempt.
//        Body: { crew_member_id, answers: [{ question_id, selected_option_id }] }
//        • Scores every answer server-side against the stored correct options.
//        • Creates a quiz_attempts record with the score and pass/fail.
//        • Updates the assignment status to 'completed' if the crew member
//          passes (score >= module pass_mark).
//        • Returns results with correct answers and explanations so the crew
//          member can review.
//
// Query params (GET):
//   crew_member_id — UUID of the crew member taking the quiz
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Fisher-Yates shuffle (non-mutating).
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

    // Verify the crew member is assigned to this module.
    const { data: assignment } = await supabase
      .from('training_assignments')
      .select('id, status')
      .eq('module_id', moduleId)
      .eq('crew_member_id', crewMemberId)
      .maybeSingle();

    if (!assignment) {
      return NextResponse.json(
        { error: 'Not assigned to this module' },
        { status: 403 },
      );
    }

    // Fetch module settings + questions.
    const [modRes, questionsRes] = await Promise.all([
      supabase
        .from('training_modules')
        .select('randomise_questions, time_limit_minutes, pass_mark, title')
        .eq('id', moduleId)
        .single(),
      supabase
        .from('quiz_questions')
        .select('id, question_text, question_type, options, sort_order')
        .eq('module_id', moduleId)
        .order('sort_order', { ascending: true }),
    ]);

    if (modRes.error) throw modRes.error;
    if (questionsRes.error) throw questionsRes.error;

    const mod = modRes.data;
    let questions = questionsRes.data || [];

    // Shuffle if the module has randomise_questions enabled.
    if (mod.randomise_questions) {
      questions = shuffle(questions);
    }

    // Strip is_correct from each option so crew can't peek at answers.
    const safeQuestions = questions.map((q) => ({
      id: q.id,
      questionText: q.question_text,
      questionType: q.question_type,
      options: (q.options || []).map((opt) => ({
        id: opt.id,
        text: opt.text,
      })),
    }));

    // Mark assignment as in_progress if it's still in 'assigned' state.
    if (assignment.status === 'assigned') {
      await supabase
        .from('training_assignments')
        .update({ status: 'in_progress', started_at: new Date().toISOString() })
        .eq('id', assignment.id);
    }

    return NextResponse.json({
      quiz: {
        moduleId,
        title: mod.title,
        passMark: mod.pass_mark,
        timeLimitMinutes: mod.time_limit_minutes,
        totalQuestions: safeQuestions.length,
        questions: safeQuestions,
      },
    });
  } catch (err) {
    console.error('[training/quiz] GET failed', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── POST ────────────────────────────────────────────────────────────────────
export async function POST(request, { params }) {
  try {
    const moduleId = params.id;
    const body = await request.json();
    const { crew_member_id, answers } = body;

    if (!crew_member_id || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Missing required fields: crew_member_id, answers[]' },
        { status: 400 },
      );
    }

    // Verify assignment exists.
    const { data: assignment } = await supabase
      .from('training_assignments')
      .select('id, status')
      .eq('module_id', moduleId)
      .eq('crew_member_id', crew_member_id)
      .maybeSingle();

    if (!assignment) {
      return NextResponse.json(
        { error: 'Not assigned to this module' },
        { status: 403 },
      );
    }

    // Fetch module pass_mark + all questions with correct answers.
    const [modRes, questionsRes] = await Promise.all([
      supabase
        .from('training_modules')
        .select('pass_mark, title, vessel_id')
        .eq('id', moduleId)
        .single(),
      supabase
        .from('quiz_questions')
        .select('id, question_text, question_type, options, explanation')
        .eq('module_id', moduleId),
    ]);

    if (modRes.error) throw modRes.error;
    if (questionsRes.error) throw questionsRes.error;

    const mod = modRes.data;
    const questions = questionsRes.data || [];
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    // ── Score each answer ──
    let correct = 0;
    const gradedAnswers = answers.map((ans) => {
      const question = questionMap.get(ans.question_id);
      if (!question) {
        return {
          questionId: ans.question_id,
          selectedOptionId: ans.selected_option_id,
          isCorrect: false,
          correctOptionId: null,
          explanation: null,
          error: 'Question not found',
        };
      }

      const options = question.options || [];
      const correctOption = options.find((o) => o.is_correct === true);
      const isCorrect =
        correctOption != null && ans.selected_option_id === correctOption.id;

      if (isCorrect) correct++;

      return {
        questionId: ans.question_id,
        questionText: question.question_text,
        selectedOptionId: ans.selected_option_id,
        isCorrect,
        correctOptionId: correctOption?.id || null,
        explanation: question.explanation || null,
      };
    });

    const totalQuestions = questions.length;
    const score =
      totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
    const passed = score >= (mod.pass_mark || 80);

    // ── Create quiz_attempt record ──
    const { data: attempt, error: attemptErr } = await supabase
      .from('quiz_attempts')
      .insert({
        assignment_id: assignment.id,
        crew_member_id: crew_member_id,
        score,
        passed,
        answers: gradedAnswers.map((a) => ({
          question_id: a.questionId,
          selected_option_id: a.selectedOptionId,
          is_correct: a.isCorrect,
        })),
        completed_at: new Date().toISOString(),
      })
      .select('id, score, passed, completed_at')
      .single();

    if (attemptErr) throw attemptErr;

    // ── Update assignment status if passed ──
    if (passed && assignment.status !== 'completed') {
      await supabase
        .from('training_assignments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', assignment.id);
    } else if (!passed && assignment.status === 'assigned') {
      // At least mark as in_progress if they attempted.
      await supabase
        .from('training_assignments')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .eq('id', assignment.id);
    }

    return NextResponse.json({
      result: {
        attemptId: attempt.id,
        score,
        passed,
        passMark: mod.pass_mark,
        correctCount: correct,
        totalQuestions,
        completedAt: attempt.completed_at,
        answers: gradedAnswers,
      },
    });
  } catch (err) {
    console.error('[training/quiz] POST failed', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
