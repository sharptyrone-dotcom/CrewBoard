import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// GET /api/admin/reports?type=...&date_from=...&date_to=...&vessel_id=...
//
// Generates compliance reports (PDF or CSV) from live Supabase data.
// The heavy lifting is done by lib/reportGenerator.js; this route
// fetches the data and returns the file with the correct headers.
//
// Query params:
//   type       — compliance_pdf | notice_csv | document_csv | training_csv | activity_csv
//   date_from  — ISO date string (optional, inclusive)
//   date_to    — ISO date string (optional, inclusive)
//   vessel_id  — UUID of the vessel to report on
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServer = createClient(supabaseUrl, supabaseKey);

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

async function fetchReportData(vesselId) {
  const [crewRes, noticeRes, docRes, activityRes] = await Promise.all([
    supabaseServer.from('crew_members').select('*').eq('vessel_id', vesselId),
    supabaseServer.from('notices').select('*, notice_reads(crew_member_id, acknowledged_at)').eq('vessel_id', vesselId).order('created_at', { ascending: false }),
    supabaseServer.from('documents').select('*, document_acknowledgements(crew_member_id)').eq('vessel_id', vesselId).order('updated_at', { ascending: false }),
    supabaseServer.from('activity_log').select('*').eq('vessel_id', vesselId).order('created_at', { ascending: false }).limit(200),
  ]);

  return {
    crew: (crewRes.data || []).map(mapCrew),
    notices: (noticeRes.data || []).map(mapNotice),
    docs: (docRes.data || []).map(mapDoc),
    activity: (activityRes.data || []).map(mapActivity),
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const dateFrom = searchParams.get('date_from') || undefined;
    const dateTo = searchParams.get('date_to') || undefined;
    const vesselId = searchParams.get('vessel_id');

    if (!type || !vesselId) {
      return NextResponse.json({ error: 'Missing required params: type, vessel_id' }, { status: 400 });
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
    console.error('[reports] generation failed', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
