import { supabaseAdmin as supabaseServer } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authCheck';
import { apiLimiter } from '@/lib/rateLimit';
import { handleApiError } from '@/lib/apiError';

// ---------------------------------------------------------------------------
// GET /api/admin/reports?type=...&date_from=...&date_to=...
//
// Generates compliance reports (PDF or CSV) from live Supabase data.
// The heavy lifting is done by lib/reportGenerator.js; this route
// fetches the data and returns the file with the correct headers.
//
// Query params:
//   type       — compliance_pdf | notice_csv | document_csv | training_csv | activity_csv
//   date_from  — ISO date string (optional, inclusive)
//   date_to    — ISO date string (optional, inclusive)
// ---------------------------------------------------------------------------

// Map DB rows to the UI shapes that reportGenerator expects.
function mapNotice(row) {
  const reads = Array.isArray(row.notice_reads) ? row.notice_reads : [];
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    priority: row.priority,
    createdAt: row.created_at,
    readBy: reads.map(r => r.crew_member_id),
    acknowledgedBy: reads.filter(r => r.acknowledged_at).map(r => r.crew_member_id),
  };
}
function mapDoc(row) {
  const acks = Array.isArray(row.document_acknowledgements) ? row.document_acknowledgements : [];
  return {
    id: row.id,
    title: row.title,
    type: row.doc_type,
    version: row.version,
    updatedAt: row.updated_at?.slice(0, 10) || '',
    required: row.is_required,
    acknowledgedBy: acks.map(a => a.crew_member_id),
  };
}
function mapCrew(row) {
  const initials = (row.full_name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return {
    id: row.id,
    name: row.full_name,
    role: row.role,
    dept: row.department,
    email: row.email,
    avatar: row.avatar_initials || initials,
    isAdmin: row.is_admin,
    isHod: row.is_hod,
  };
}
function mapActivity(row) {
  return {
    id: row.id,
    crewMemberId: row.crew_member_id,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    metadata: row.metadata || null,
    createdAt: row.created_at,
  };
}

// Map a training_assignment row (with joined module + attempts) into the
// flat shape the report generator consumes. Status is recomputed here so
// a stale DB value doesn't mask a missed deadline.
function mapTrainingAssignment(row) {
  const attempts = Array.isArray(row.quiz_attempts) ? row.quiz_attempts : [];
  // Best score wins (latest tie-breaker). Passed if any attempt passed.
  let bestScore = null;
  let passed = false;
  let latestCompleted = null;
  for (const a of attempts) {
    if (typeof a.score === 'number' && (bestScore === null || a.score > bestScore)) {
      bestScore = a.score;
    }
    if (a.passed) passed = true;
    if (a.completed_at && (!latestCompleted || a.completed_at > latestCompleted)) {
      latestCompleted = a.completed_at;
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const isCompleted = row.status === 'completed';
  const isOverdue = !isCompleted && row.deadline && row.deadline < today;

  let status;
  if (isCompleted) status = 'Completed';
  else if (isOverdue) status = 'Overdue';
  else if (row.status === 'in_progress') status = 'In Progress';
  else status = 'Not Started';

  return {
    id: row.id,
    moduleId: row.module_id,
    moduleTitle: row.training_modules?.title || '—',
    passMark: row.training_modules?.pass_mark ?? 80,
    crewMemberId: row.crew_member_id,
    status,
    rawStatus: row.status,
    score: bestScore,
    passed: attempts.length > 0 ? passed : null,
    attempts: attempts.length,
    assignedAt: row.assigned_at,
    startedAt: row.started_at,
    completedAt: row.completed_at || latestCompleted,
    deadline: row.deadline,
  };
}

async function fetchReportData(vesselId) {
  const [crewRes, noticeRes, docRes, activityRes, moduleRes] = await Promise.all([
    supabaseServer.from('crew_members').select('*').eq('vessel_id', vesselId),
    supabaseServer.from('notices').select('*, notice_reads(crew_member_id, acknowledged_at)').eq('vessel_id', vesselId).order('created_at', { ascending: false }),
    supabaseServer.from('documents').select('*, document_acknowledgements(crew_member_id)').eq('vessel_id', vesselId).order('updated_at', { ascending: false }),
    supabaseServer.from('activity_log').select('*').eq('vessel_id', vesselId).order('created_at', { ascending: false }).limit(200),
    supabaseServer.from('training_modules').select('id, title, pass_mark').eq('vessel_id', vesselId),
  ]);

  // Fetch training assignments + quiz attempts in a second step so we
  // can scope strictly to the vessel's modules (nested-join filtering
  // on joined-table columns is not supported via PostgREST).
  const moduleIds = (moduleRes.data || []).map(m => m.id);
  let assignmentRows = [];
  if (moduleIds.length > 0) {
    const { data } = await supabaseServer
      .from('training_assignments')
      .select('*, training_modules(id, title, pass_mark), quiz_attempts(score, passed, completed_at)')
      .in('module_id', moduleIds)
      .order('assigned_at', { ascending: false });
    assignmentRows = data || [];
  }

  return {
    crew: (crewRes.data || []).map(mapCrew),
    notices: (noticeRes.data || []).map(mapNotice),
    docs: (docRes.data || []).map(mapDoc),
    activity: (activityRes.data || []).map(mapActivity),
    training: assignmentRows.map(mapTrainingAssignment),
    trainingModules: moduleRes.data || [],
  };
}

export async function GET(request) {
  try {
    const limited = apiLimiter(request);
    if (limited) return limited;

    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const dateFrom = searchParams.get('date_from') || undefined;
    const dateTo = searchParams.get('date_to') || undefined;
    const vesselId = auth.crewMember.vessel_id;

    if (!type) {
      return NextResponse.json({ error: 'Missing required param: type' }, { status: 400 });
    }

    const data = await fetchReportData(vesselId);
    const dateRange = { from: dateFrom, to: dateTo };

    // Dynamic import so jspdf doesn't break in edge runtime
    const { generateComplianceReport, generateCSVExport } = await import('@/lib/reportGenerator');

    const csvTypeMap = {
      notice_csv: 'notice_read_receipts',
      document_csv: 'document_acknowledgements',
      training_csv: 'training_records',
      activity_csv: 'activity_log',
    };

    if (type === 'compliance_pdf') {
      const doc = generateComplianceReport({
        vesselName: 'M/Y Serenity',
        crew: data.crew,
        notices: data.notices,
        docs: data.docs,
        activity: data.activity,
        training: data.training,
        dateRange,
      });
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      return new Response(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="compliance-report-${new Date().toISOString().slice(0, 10)}.pdf"`,
        },
      });
    }

    if (csvTypeMap[type]) {
      const csv = generateCSVExport(csvTypeMap[type], { ...data, dateRange });
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${csvTypeMap[type]}-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: `Unknown report type: ${type}` }, { status: 400 });
  } catch (err) {
    return handleApiError(err, 'admin/reports');
  }
}
