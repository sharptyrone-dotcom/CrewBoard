import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
applyPlugin(jsPDF);

// ─── Theme constants (match CrewNotice UI) ────────────────────────────
const BRAND = { navy: [30, 58, 95], accent: [59, 130, 246], white: [255, 255, 255], slate: [71, 85, 105], lightSlate: [226, 232, 240], bg: [248, 250, 252], success: [34, 197, 94], critical: [239, 68, 68], gold: [245, 158, 11] };
const PAGE_MARGIN = 20;

// ─── Helpers ─────────────────────────────────────────────────────────
function pct(n, d) { return d > 0 ? Math.round((n / d) * 100) : 0; }
function fmtDate(iso) { if (!iso) return '—'; return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
function fmtDateTime(iso) { if (!iso) return '—'; return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function filterByDate(items, dateKey, from, to) {
  return items.filter(item => {
    const d = item[dateKey];
    if (!d) return true; // include items without dates
    const t = new Date(d).getTime();
    if (from && t < new Date(from).getTime()) return false;
    if (to && t > new Date(to).setHours(23, 59, 59, 999)) return false;
    return true;
  });
}

// ─── Cover Page ──────────────────────────────────────────────────────
function addCoverPage(doc, vesselName, dateRange) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // Navy header block
  doc.setFillColor(...BRAND.navy);
  doc.rect(0, 0, w, 100, 'F');
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text('CrewNotice', PAGE_MARGIN, 50);
  doc.setFontSize(14);
  doc.text('Compliance Report', PAGE_MARGIN, 68);

  // Vessel + date info
  doc.setTextColor(...BRAND.navy);
  doc.setFontSize(22);
  doc.text(vesselName, PAGE_MARGIN, 135);

  doc.setFontSize(12);
  doc.setTextColor(...BRAND.slate);
  const from = dateRange?.from ? fmtDate(dateRange.from) : 'All time';
  const to = dateRange?.to ? fmtDate(dateRange.to) : 'Present';
  doc.text(`Report Period: ${from} — ${to}`, PAGE_MARGIN, 155);
  doc.text(`Generated: ${fmtDateTime(new Date().toISOString())}`, PAGE_MARGIN, 170);

  // Decorative line
  doc.setDrawColor(...BRAND.accent);
  doc.setLineWidth(2);
  doc.line(PAGE_MARGIN, 120, w - PAGE_MARGIN, 120);

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(160, 170, 180);
  doc.text('This document is confidential and for internal use only.', PAGE_MARGIN, h - 20);
}

// ─── Section Header ─────────────────────────────────────────────────
function addSectionHeader(doc, title, y) {
  if (y > doc.internal.pageSize.getHeight() - 60) {
    doc.addPage();
    y = PAGE_MARGIN + 10;
  }
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.navy);
  doc.text(title, PAGE_MARGIN, y);
  doc.setDrawColor(...BRAND.accent);
  doc.setLineWidth(0.5);
  doc.line(PAGE_MARGIN, y + 3, doc.internal.pageSize.getWidth() - PAGE_MARGIN, y + 3);
  return y + 14;
}

// ─── Table Helpers ───────────────────────────────────────────────────
const tableTheme = {
  headStyles: { fillColor: BRAND.navy, textColor: BRAND.white, fontStyle: 'bold', fontSize: 9 },
  bodyStyles: { fontSize: 9, textColor: BRAND.slate },
  alternateRowStyles: { fillColor: BRAND.bg },
  margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
  tableLineColor: BRAND.lightSlate,
  tableLineWidth: 0.25,
};

// A training assignment is in-range if either its assigned_at OR
// completed_at falls inside the selected window. Spec calls this
// "created or completed within the selected date range".
function filterTrainingByRange(items, from, to) {
  if (!from && !to) return items;
  const fromT = from ? new Date(from).getTime() : null;
  const toT = to ? new Date(to).setHours(23, 59, 59, 999) : null;
  const inRange = (iso) => {
    if (!iso) return false;
    const t = new Date(iso).getTime();
    if (fromT !== null && t < fromT) return false;
    if (toT !== null && t > toT) return false;
    return true;
  };
  return items.filter(t => inRange(t.assignedAt) || inRange(t.completedAt));
}

// =====================================================================
// generateComplianceReport
// =====================================================================
export function generateComplianceReport({ vesselName = 'M/Y Serenity', crew = [], notices = [], docs = [], activity = [], training = [], dateRange = {} } = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Filter data by date range
  const filteredNotices = filterByDate(notices, 'createdAt', dateRange.from, dateRange.to);
  const filteredDocs = filterByDate(docs, 'updatedAt', dateRange.from, dateRange.to);
  const filteredActivity = filterByDate(activity, 'createdAt', dateRange.from, dateRange.to);
  const filteredTraining = filterTrainingByRange(training, dateRange.from, dateRange.to);
  const totalCrew = crew.length;

  // ── Cover Page ─────────────────────────────────────────────────────
  addCoverPage(doc, vesselName, dateRange);

  // ── Crew Roster ────────────────────────────────────────────────────
  doc.addPage();
  let y = addSectionHeader(doc, '1. Crew Roster', PAGE_MARGIN + 10);
  doc.autoTable({
    startY: y,
    head: [['Name', 'Role', 'Department', 'Email', 'Status']],
    body: crew.map(c => [
      c.name,
      c.role,
      c.dept || '—',
      c.email || '—',
      c.isAdmin ? 'Admin' : c.isHod ? 'HOD' : 'Crew',
    ]),
    ...tableTheme,
  });

  // ── Notice Compliance ──────────────────────────────────────────────
  y = addSectionHeader(doc, '2. Notice Compliance', (doc.lastAutoTable?.finalY || y) + 16);
  if (filteredNotices.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.slate);
    doc.text('No notices in the selected period.', PAGE_MARGIN, y);
    y += 10;
  } else {
    doc.autoTable({
      startY: y,
      head: [['Notice Title', 'Priority', 'Category', 'Date', 'Read', 'Read %', 'Ack.', 'Ack. %']],
      body: filteredNotices.map(n => [
        n.title,
        n.priority?.charAt(0).toUpperCase() + n.priority?.slice(1),
        n.category || '—',
        fmtDate(n.createdAt),
        `${n.readBy?.length || 0}/${totalCrew}`,
        `${pct(n.readBy?.length || 0, totalCrew)}%`,
        `${n.acknowledgedBy?.length || 0}/${totalCrew}`,
        `${pct(n.acknowledgedBy?.length || 0, totalCrew)}%`,
      ]),
      ...tableTheme,
      columnStyles: { 0: { cellWidth: 50 }, 5: { halign: 'right' }, 7: { halign: 'right' } },
    });
  }

  // ── Document Compliance ────────────────────────────────────────────
  // Two tables here: every document gets a "reads" row (even non-required
  // docs benefit from showing engagement), then required docs additionally
  // get the acknowledgement table because ack is a stricter signal.
  y = addSectionHeader(doc, '3. Document Compliance', (doc.lastAutoTable?.finalY || y) + 16);
  const requiredDocs = filteredDocs.filter(d => d.required);
  // Helper: union of readBy + acknowledgedBy — an acknowledged doc
  // always counts as read for compliance purposes.
  const seenSet = (d) => new Set([...(d.readBy || []), ...(d.acknowledgedBy || [])]);

  if (filteredDocs.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.slate);
    doc.text('No documents in the selected period.', PAGE_MARGIN, y);
    y += 10;
  } else {
    // Reads table — every doc
    doc.autoTable({
      startY: y,
      head: [['Document Title', 'Type', 'Version', 'Required', 'Read', 'Read %']],
      body: filteredDocs.map(d => {
        const readCount = seenSet(d).size;
        const p = pct(readCount, totalCrew);
        return [
          d.title,
          d.type || '—',
          d.version || '—',
          d.required ? 'Yes' : 'No',
          `${readCount}/${totalCrew}`,
          `${p}%`,
        ];
      }),
      ...tableTheme,
      columnStyles: { 0: { cellWidth: 55 }, 5: { halign: 'right' } },
    });
    y = (doc.lastAutoTable?.finalY || y) + 10;
  }

  if (requiredDocs.length > 0) {
    doc.autoTable({
      startY: y,
      head: [['Required Document', 'Version', 'Updated', 'Ack.', 'Ack. %', 'Status']],
      body: requiredDocs.map(d => {
        const ackCount = d.acknowledgedBy?.length || 0;
        const p = pct(ackCount, totalCrew);
        return [
          d.title,
          d.version || '—',
          fmtDate(d.updatedAt),
          `${ackCount}/${totalCrew}`,
          `${p}%`,
          p === 100 ? 'Complete' : p > 50 ? 'In Progress' : 'Outstanding',
        ];
      }),
      ...tableTheme,
      columnStyles: { 0: { cellWidth: 55 }, 4: { halign: 'right' } },
      didParseCell: (data) => {
        if (data.column.index === 5 && data.section === 'body') {
          const val = data.cell.raw;
          if (val === 'Complete') data.cell.styles.textColor = BRAND.success;
          else if (val === 'Outstanding') data.cell.styles.textColor = BRAND.critical;
          else data.cell.styles.textColor = BRAND.gold;
        }
      },
    });
  }

  // ── Training Completion Records ────────────────────────────────────
  y = addSectionHeader(doc, '4. Training Completion Records', (doc.lastAutoTable?.finalY || y) + 16);

  if (filteredTraining.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.slate);
    doc.text('No training assignments in the selected period.', PAGE_MARGIN, y);
    y += 10;
  } else {
    // Summary tallies
    const totalAssigned = filteredTraining.length;
    const completed = filteredTraining.filter(t => t.status === 'Completed').length;
    const passed = filteredTraining.filter(t => t.passed === true).length;
    const failed = filteredTraining.filter(t => t.passed === false).length;
    const inProgress = filteredTraining.filter(t => t.status === 'In Progress').length;
    const notStarted = filteredTraining.filter(t => t.status === 'Not Started').length;
    const overdue = filteredTraining.filter(t => t.status === 'Overdue').length;

    doc.autoTable({
      startY: y,
      head: [['Metric', 'Value']],
      body: [
        ['Total modules assigned', `${totalAssigned}`],
        ['Completed', `${completed} (${pct(completed, totalAssigned)}%)`],
        ['Passed', `${passed}`],
        ['Failed', `${failed}`],
        ['In Progress', `${inProgress}`],
        ['Not Started', `${notStarted}`],
        ['Overdue', `${overdue}`],
      ],
      ...tableTheme,
      headStyles: { ...tableTheme.headStyles, fillColor: [100, 116, 139] },
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN + 80 },
      didParseCell: (data) => {
        if (data.section !== 'body' || data.column.index !== 0) return;
        const row = data.row.index;
        if (row === 1) data.cell.styles.textColor = BRAND.success;      // Completed
        else if (row === 2) data.cell.styles.textColor = BRAND.success; // Passed
        else if (row === 3) data.cell.styles.textColor = BRAND.critical; // Failed
        else if (row === 6) data.cell.styles.textColor = BRAND.critical; // Overdue
      },
    });

    y = (doc.lastAutoTable?.finalY || y) + 10;

    // Detail table — one row per assignment.
    const crewById = Object.fromEntries(crew.map(c => [c.id, c]));
    doc.autoTable({
      startY: y,
      head: [['Module', 'Assigned To', 'Dept', 'Status', 'Score', 'Pass/Fail', 'Completed', 'Deadline']],
      body: filteredTraining.map(t => {
        const member = crewById[t.crewMemberId];
        return [
          t.moduleTitle,
          member?.name || '—',
          member?.dept || '—',
          t.status,
          t.score === null || t.score === undefined ? '—' : `${t.score}%`,
          t.passed === true ? 'Pass' : t.passed === false ? 'Fail' : '—',
          fmtDate(t.completedAt),
          fmtDate(t.deadline),
        ];
      }),
      ...tableTheme,
      columnStyles: {
        0: { cellWidth: 40 },
        4: { halign: 'right' },
      },
      didParseCell: (data) => {
        if (data.section !== 'body') return;
        // Colour status (col 3)
        if (data.column.index === 3) {
          const v = data.cell.raw;
          if (v === 'Completed') data.cell.styles.textColor = BRAND.success;
          else if (v === 'Overdue') data.cell.styles.textColor = BRAND.critical;
          else if (v === 'In Progress') data.cell.styles.textColor = BRAND.gold;
          else data.cell.styles.textColor = BRAND.slate;
        }
        // Colour pass/fail (col 5)
        if (data.column.index === 5) {
          const v = data.cell.raw;
          if (v === 'Pass') data.cell.styles.textColor = BRAND.success;
          else if (v === 'Fail') data.cell.styles.textColor = BRAND.critical;
        }
      },
    });
    y = (doc.lastAutoTable?.finalY || y) + 10;
  }

  // ── Individual Crew Summaries ──────────────────────────────────────
  doc.addPage();
  y = addSectionHeader(doc, '5. Individual Crew Summaries', PAGE_MARGIN + 10);

  for (const member of crew) {
    if (y > doc.internal.pageSize.getHeight() - 70) {
      doc.addPage();
      y = PAGE_MARGIN + 10;
    }

    // Crew member header
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.navy);
    doc.text(`${member.name}`, PAGE_MARGIN, y);
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.slate);
    doc.text(`${member.role} — ${member.dept || 'N/A'}`, PAGE_MARGIN, y + 5);
    y += 12;

    // Compliance stats
    const noticesRead = filteredNotices.filter(n => n.readBy?.includes(member.id)).length;
    const noticesAcked = filteredNotices.filter(n => n.acknowledgedBy?.includes(member.id)).length;
    // Document read = has either read_receipt OR acknowledged (ack implies read).
    const docsRead = filteredDocs.filter(d =>
      d.readBy?.includes(member.id) || d.acknowledgedBy?.includes(member.id)
    ).length;
    const docsAcked = requiredDocs.filter(d => d.acknowledgedBy?.includes(member.id)).length;
    const memberTraining = filteredTraining.filter(t => t.crewMemberId === member.id);
    const trainingTotal = memberTraining.length;
    const trainingCompleted = memberTraining.filter(t => t.status === 'Completed').length;
    const trainingOverdue = memberTraining.filter(t => t.status === 'Overdue').length;
    // Overall = weighted: reads + acks + notice reads + completed training
    // divided by the total obligations in the period. Reads count as
    // "partial" toward required docs — for non-required docs a read IS
    // full compliance because there's nothing further to do.
    const optionalDocs = filteredDocs.length - requiredDocs.length;
    const optionalDocsRead = (filteredDocs.length - requiredDocs.length) > 0
      ? filteredDocs.filter(d => !d.required && (d.readBy?.includes(member.id) || d.acknowledgedBy?.includes(member.id))).length
      : 0;
    // Required-doc partial credit: 0.5 for read, 1.0 for acked
    const requiredDocsReadOnly = requiredDocs.filter(d =>
      (d.readBy?.includes(member.id) || d.acknowledgedBy?.includes(member.id)) &&
      !d.acknowledgedBy?.includes(member.id)
    ).length;
    const earnedForRequired = docsAcked + (requiredDocsReadOnly * 0.5);
    const totalItems = filteredNotices.length + requiredDocs.length + optionalDocs + trainingTotal;
    const earned = noticesRead + earnedForRequired + optionalDocsRead + trainingCompleted;
    const overall = totalItems > 0 ? Math.round((earned / totalItems) * 100) : 0;

    doc.autoTable({
      startY: y,
      head: [['Metric', 'Value', 'Percentage']],
      body: [
        ['Notices Read', `${noticesRead}/${filteredNotices.length}`, `${pct(noticesRead, filteredNotices.length)}%`],
        ['Notices Acknowledged', `${noticesAcked}/${filteredNotices.length}`, `${pct(noticesAcked, filteredNotices.length)}%`],
        ['Documents Read', `${docsRead}/${filteredDocs.length}`, `${pct(docsRead, filteredDocs.length)}%`],
        ['Required Docs Acknowledged', `${docsAcked}/${requiredDocs.length}`, `${pct(docsAcked, requiredDocs.length)}%`],
        ['Training Completed', `${trainingCompleted}/${trainingTotal}`, `${pct(trainingCompleted, trainingTotal)}%`],
        ['Training Overdue', `${trainingOverdue}`, ''],
        ['Overall Compliance', '', `${overall}%`],
      ],
      ...tableTheme,
      headStyles: { ...tableTheme.headStyles, fillColor: [100, 116, 139] },
      columnStyles: { 2: { halign: 'right' } },
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN + 40 },
      didParseCell: (data) => {
        if (data.section !== 'body') return;
        // Highlight overdue count in red if > 0 (row index 5 now)
        if (data.row.index === 5 && data.column.index === 1) {
          if (parseInt(data.cell.raw) > 0) {
            data.cell.styles.textColor = BRAND.critical;
            data.cell.styles.fontStyle = 'bold';
          }
        }
        // Overall Compliance — bold + colour-code (row index 6 now)
        if (data.row.index === 6) {
          data.cell.styles.fontStyle = 'bold';
          const v = parseInt(data.cell.raw);
          if (!isNaN(v)) {
            data.cell.styles.textColor = v >= 80 ? BRAND.success : v >= 50 ? BRAND.gold : BRAND.critical;
          }
        }
      },
    });
    y = (doc.lastAutoTable?.finalY || y) + 12;
  }

  // ── Activity Log Summary ───────────────────────────────────────────
  doc.addPage();
  y = addSectionHeader(doc, '6. Activity Log Summary', PAGE_MARGIN + 10);

  const crewById = Object.fromEntries(crew.map(c => [c.id, c.name]));
  const recentActivity = filteredActivity.slice(0, 50);

  if (recentActivity.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.slate);
    doc.text('No activity recorded in the selected period.', PAGE_MARGIN, y);
  } else {
    doc.autoTable({
      startY: y,
      head: [['Date/Time', 'Crew Member', 'Action', 'Details']],
      body: recentActivity.map(a => [
        fmtDateTime(a.createdAt),
        crewById[a.crewMemberId]?.name || 'System',
        (a.action || '').replace(/_/g, ' '),
        a.metadata?.title || a.targetType || '—',
      ]),
      ...tableTheme,
      columnStyles: { 0: { cellWidth: 35 }, 3: { cellWidth: 50 } },
    });
  }

  // ── Page Numbers ───────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 2; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(160, 170, 180);
    doc.text(
      `${vesselName} — Compliance Report — Page ${i - 1} of ${pageCount - 1}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc;
}

// =====================================================================
// generateCSVExport
// =====================================================================
export function generateCSVExport(type, { crew = [], notices = [], docs = [], activity = [], training = [], dateRange = {} } = {}) {
  const filteredNotices = filterByDate(notices, 'createdAt', dateRange.from, dateRange.to);
  const filteredDocs = filterByDate(docs, 'updatedAt', dateRange.from, dateRange.to);
  const filteredActivity = filterByDate(activity, 'createdAt', dateRange.from, dateRange.to);
  const filteredTraining = filterTrainingByRange(training, dateRange.from, dateRange.to);
  const crewById = Object.fromEntries(crew.map(c => [c.id, c]));

  const escCSV = (v) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const toCSV = (headers, rows) => [headers.map(escCSV).join(','), ...rows.map(r => r.map(escCSV).join(','))].join('\n');

  switch (type) {
    case 'notice_read_receipts': {
      const headers = ['Notice Title', 'Priority', 'Category', 'Crew Name', 'Read', 'Acknowledged'];
      const rows = [];
      for (const n of filteredNotices) {
        for (const c of crew) {
          rows.push([
            n.title,
            n.priority,
            n.category || '',
            c.name,
            n.readBy?.includes(c.id) ? 'Yes' : 'No',
            n.acknowledgedBy?.includes(c.id) ? 'Yes' : 'No',
          ]);
        }
      }
      return toCSV(headers, rows);
    }

    case 'document_acknowledgements': {
      // Include both Read and Acknowledged columns so the admin can see
      // engagement progression in a single export (read → acked).
      const headers = ['Document Title', 'Type', 'Version', 'Required', 'Crew Name', 'Read', 'Acknowledged'];
      const rows = [];
      for (const d of filteredDocs) {
        for (const c of crew) {
          const isRead = d.readBy?.includes(c.id) || d.acknowledgedBy?.includes(c.id);
          rows.push([
            d.title,
            d.type || '',
            d.version || '',
            d.required ? 'Yes' : 'No',
            c.name,
            isRead ? 'Yes' : 'No',
            d.acknowledgedBy?.includes(c.id) ? 'Yes' : 'No',
          ]);
        }
      }
      return toCSV(headers, rows);
    }

    case 'document_reads': {
      // Dedicated reads-only export. Useful when the admin only wants
      // raw read tracking without the ack column (e.g. for non-required
      // docs where ack is not expected).
      const headers = ['Document Title', 'Type', 'Version', 'Required', 'Crew Name', 'Read'];
      const rows = [];
      for (const d of filteredDocs) {
        for (const c of crew) {
          const isRead = d.readBy?.includes(c.id) || d.acknowledgedBy?.includes(c.id);
          rows.push([
            d.title,
            d.type || '',
            d.version || '',
            d.required ? 'Yes' : 'No',
            c.name,
            isRead ? 'Yes' : 'No',
          ]);
        }
      }
      return toCSV(headers, rows);
    }

    case 'training_records': {
      const headers = [
        'Module Title', 'Crew Member', 'Department', 'Role',
        'Status', 'Score', 'Pass/Fail', 'Completed Date', 'Deadline', 'Attempts',
      ];
      const rows = filteredTraining.map(t => {
        const c = crewById[t.crewMemberId];
        return [
          t.moduleTitle,
          c?.name || '',
          c?.dept || '',
          c?.role || '',
          t.status,
          t.score === null || t.score === undefined ? '' : `${t.score}%`,
          t.passed === true ? 'Pass' : t.passed === false ? 'Fail' : '',
          t.completedAt ? t.completedAt.slice(0, 10) : '',
          t.deadline || '',
          t.attempts,
        ];
      });
      return toCSV(headers, rows);
    }

    case 'activity_log': {
      const headers = ['Timestamp', 'Crew Name', 'Action', 'Target Type', 'Details'];
      const rows = filteredActivity.map(a => [
        a.createdAt || '',
        crewById[a.crewMemberId]?.name || 'System',
        (a.action || '').replace(/_/g, ' '),
        a.targetType || '',
        a.metadata?.title || '',
      ]);
      return toCSV(headers, rows);
    }

    default:
      return '';
  }
}

// ─── Download helpers (browser only) ─────────────────────────────────
export function downloadPDF(doc, filename = 'report.pdf') {
  doc.save(filename);
}

export function downloadCSV(csvString, filename = 'export.csv') {
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
