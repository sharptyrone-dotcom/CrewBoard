import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
applyPlugin(jsPDF);

// ─── Theme constants (match CrewBoard UI) ────────────────────────────
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
  doc.text('CrewBoard', PAGE_MARGIN, 50);
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

// =====================================================================
// generateComplianceReport
// =====================================================================
export function generateComplianceReport({ vesselName = 'M/Y Serenity', crew = [], notices = [], docs = [], activity = [], dateRange = {} } = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Filter data by date range
  const filteredNotices = filterByDate(notices, 'createdAt', dateRange.from, dateRange.to);
  const filteredDocs = filterByDate(docs, 'updatedAt', dateRange.from, dateRange.to);
  const filteredActivity = filterByDate(activity, 'createdAt', dateRange.from, dateRange.to);
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
  y = addSectionHeader(doc, '3. Document Compliance', (doc.lastAutoTable?.finalY || y) + 16);
  const requiredDocs = filteredDocs.filter(d => d.required);
  if (requiredDocs.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.slate);
    doc.text('No required documents in the selected period.', PAGE_MARGIN, y);
    y += 10;
  } else {
    doc.autoTable({
      startY: y,
      head: [['Document Title', 'Type', 'Version', 'Updated', 'Ack.', 'Ack. %', 'Status']],
      body: requiredDocs.map(d => {
        const ackCount = d.acknowledgedBy?.length || 0;
        const p = pct(ackCount, totalCrew);
        return [
          d.title,
          d.type || '—',
          d.version || '—',
          fmtDate(d.updatedAt),
          `${ackCount}/${totalCrew}`,
          `${p}%`,
          p === 100 ? 'Complete' : p > 50 ? 'In Progress' : 'Outstanding',
        ];
      }),
      ...tableTheme,
      columnStyles: { 0: { cellWidth: 50 }, 5: { halign: 'right' } },
      didParseCell: (data) => {
        if (data.column.index === 6 && data.section === 'body') {
          const val = data.cell.raw;
          if (val === 'Complete') data.cell.styles.textColor = BRAND.success;
          else if (val === 'Outstanding') data.cell.styles.textColor = BRAND.critical;
          else data.cell.styles.textColor = BRAND.gold;
        }
      },
    });
  }

  // ── Training Compliance (placeholder) ──────────────────────────────
  y = addSectionHeader(doc, '4. Training Compliance', (doc.lastAutoTable?.finalY || y) + 16);
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.slate);
  doc.text('No training modules configured. Training compliance tracking', PAGE_MARGIN, y);
  doc.text('will appear here once training modules are added to the system.', PAGE_MARGIN, y + 6);
  y += 18;

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
    const docsAcked = requiredDocs.filter(d => d.acknowledgedBy?.includes(member.id)).length;
    const totalItems = filteredNotices.length + requiredDocs.length;
    const overall = pct(noticesRead + docsAcked, totalItems);

    doc.autoTable({
      startY: y,
      head: [['Metric', 'Value', 'Percentage']],
      body: [
        ['Notices Read', `${noticesRead}/${filteredNotices.length}`, `${pct(noticesRead, filteredNotices.length)}%`],
        ['Notices Acknowledged', `${noticesAcked}/${filteredNotices.length}`, `${pct(noticesAcked, filteredNotices.length)}%`],
        ['Documents Acknowledged', `${docsAcked}/${requiredDocs.length}`, `${pct(docsAcked, requiredDocs.length)}%`],
        ['Overall Compliance', '', `${overall}%`],
      ],
      ...tableTheme,
      headStyles: { ...tableTheme.headStyles, fillColor: [100, 116, 139] },
      columnStyles: { 2: { halign: 'right' } },
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN + 40 },
      didParseCell: (data) => {
        if (data.row.index === 3 && data.section === 'body') {
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
        crewById[a.crewMemberId] || 'System',
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
export function generateCSVExport(type, { crew = [], notices = [], docs = [], activity = [], dateRange = {} } = {}) {
  const filteredNotices = filterByDate(notices, 'createdAt', dateRange.from, dateRange.to);
  const filteredDocs = filterByDate(docs, 'updatedAt', dateRange.from, dateRange.to);
  const filteredActivity = filterByDate(activity, 'createdAt', dateRange.from, dateRange.to);
  const crewById = Object.fromEntries(crew.map(c => [c.id, c.name]));

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
      const headers = ['Document Title', 'Type', 'Version', 'Required', 'Crew Name', 'Acknowledged'];
      const rows = [];
      for (const d of filteredDocs) {
        for (const c of crew) {
          rows.push([
            d.title,
            d.type || '',
            d.version || '',
            d.required ? 'Yes' : 'No',
            c.name,
            d.acknowledgedBy?.includes(c.id) ? 'Yes' : 'No',
          ]);
        }
      }
      return toCSV(headers, rows);
    }

    case 'training_records': {
      const headers = ['Module Title', 'Crew Name', 'Status', 'Score', 'Completed At'];
      // No training modules in the system yet — return headers only.
      return toCSV(headers, []);
    }

    case 'activity_log': {
      const headers = ['Timestamp', 'Crew Name', 'Action', 'Target Type', 'Details'];
      const rows = filteredActivity.map(a => [
        a.createdAt || '',
        crewById[a.crewMemberId] || 'System',
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
