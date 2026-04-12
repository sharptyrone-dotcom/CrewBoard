import T from '../shared/theme';
import Icons from '../shared/Icons';

const ExportReportModal = ({ exportType, setExportType, exportDateFrom, setExportDateFrom, exportDateTo, setExportDateTo, exporting, handleExport, setShowExportReport, isDesktop }) => {
  const reportTypes = [
    { value: 'compliance_pdf', label: 'Full Compliance Report (PDF)', desc: 'Crew roster, notice & document compliance, individual summaries, activity log' },
    { value: 'notice_csv', label: 'Notice Read Receipts (CSV)', desc: 'All notices with read/acknowledged status per crew member' },
    { value: 'document_csv', label: 'Document Acknowledgements (CSV)', desc: 'All documents with acknowledgement status per crew member' },
    { value: 'training_csv', label: 'Training Records (CSV)', desc: 'Training module completion and scores' },
    { value: 'activity_csv', label: 'Activity Log (CSV)', desc: 'Timestamped log of all crew actions' },
  ];
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: isDesktop ? 'center' : 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: T.bgModal, borderRadius: isDesktop ? 20 : '24px 24px 0 0', width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto', padding: 28, boxShadow: isDesktop ? '0 20px 60px rgba(15,23,42,0.2)' : '0 -20px 40px rgba(15,23,42,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: 0 }}>Export Report</h2>
          <button onClick={() => setShowExportReport(false)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer' }}>{Icons.x}</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Report type selector */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 8 }}>Report Type</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {reportTypes.map(rt => (
                <label key={rt.value} onClick={() => setExportType(rt.value)} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
                  borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                  border: `1.5px solid ${exportType === rt.value ? T.accent : T.border}`,
                  background: exportType === rt.value ? T.accentTint : T.bgCard,
                }}>
                  <input type="radio" name="reportType" value={rt.value} checked={exportType === rt.value} onChange={() => setExportType(rt.value)} style={{ accentColor: T.accent, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{rt.label}</div>
                    <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{rt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          {/* Date range picker */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>From (optional)</label>
              <input
                type="date"
                value={exportDateFrom}
                onChange={e => setExportDateFrom(e.target.value)}
                style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>To (optional)</label>
              <input
                type="date"
                value={exportDateTo}
                onChange={e => setExportDateTo(e.target.value)}
                style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>
          </div>
          <div style={{ fontSize: 11, color: T.textDim, marginTop: -8 }}>Leave blank to include all data.</div>
          {/* Generate button */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="cb-btn-primary"
            style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: exporting ? T.border : T.accent, color: exporting ? T.textDim : '#fff', fontSize: 15, fontWeight: 700, cursor: exporting ? 'default' : 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {exporting ? 'Generating...' : `Generate ${exportType.endsWith('pdf') ? 'PDF' : 'CSV'}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportReportModal;
