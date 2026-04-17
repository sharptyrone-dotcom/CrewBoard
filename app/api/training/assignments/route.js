import { supabaseAdmin as supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authCheck';
import { apiLimiter } from '@/lib/rateLimit';
import { handleApiError } from '@/lib/apiError';

// ---------------------------------------------------------------------------
// GET /api/training/assignments
//
// Returns all training assignments for the current crew member, enriched
// with module info (title, description, question count) and their best
// quiz score. Ordered by deadline (soonest first), then assigned_at.
//
// Query params:
//   status — optional filter: assigned | in_progress | completed | overdue
// ---------------------------------------------------------------------------

export async function GET(request) {
  try {
    const limited = apiLimiter(request);
    if (limited) return limited;

    const auth = await requireAuth();
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const crewMemberId = auth.crewMember.id;
    const statusFilter = searchParams.get('status');

    // Build query — joins module info and quiz attempts.
    let query = supabase
      .from('training_assignments')
      .select(
        '*, training_modules!inner(id, title, description, pass_mark, time_limit_minutes, is_published, quiz_questions(id)), quiz_attempts(score, passed, completed_at)',
      )
      .eq('crew_member_id', crewMemberId)
      .eq('training_modules.is_published', true);

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    // Order by deadline first (nulls last), then newest assignments.
    query = query.order('deadline', { ascending: true, nullsFirst: false })
                 .order('assigned_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    // Check for overdue assignments and update them in the background.
    const today = new Date().toISOString().slice(0, 10);
    const overdueIds = [];

    const assignments = (data || []).map((a) => {
      const m = a.training_modules;
      const attempts = a.quiz_attempts || [];
      const bestAttempt = attempts.length
        ? attempts.reduce((best, cur) => (cur.score > best.score ? cur : best), attempts[0])
        : null;

      // Flag overdue if deadline has passed and not yet completed.
      let status = a.status;
      if (
        a.deadline &&
        a.deadline < today &&
        status !== 'completed'
      ) {
        status = 'overdue';
        if (a.status !== 'overdue') overdueIds.push(a.id);
      }

      return {
        id: a.id,
        moduleId: m.id,
        moduleTitle: m.title,
        moduleDescription: m.description,
        passMark: m.pass_mark,
        timeLimitMinutes: m.time_limit_minutes,
        questionCount: (m.quiz_questions || []).length,
        status,
        deadline: a.deadline,
        assignedAt: a.assigned_at,
        startedAt: a.started_at,
        completedAt: a.completed_at,
        totalAttempts: attempts.length,
        bestScore: bestAttempt?.score ?? null,
        passed: bestAttempt?.passed ?? false,
      };
    });

    // Batch-update any newly overdue assignments.
    if (overdueIds.length > 0) {
      supabase
        .from('training_assignments')
        .update({ status: 'overdue' })
        .in('id', overdueIds)
        .then(({ error: updateErr }) => {
          if (updateErr) console.error('[assignments] overdue update failed', updateErr);
        });
    }

    return NextResponse.json({ assignments });
  } catch (err) {
    return handleApiError(err, 'training/assignments');
  }
}
