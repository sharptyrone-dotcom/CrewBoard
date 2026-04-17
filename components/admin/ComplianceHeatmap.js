import T, { CATEGORIES } from '../shared/theme';
import Avatar from '../shared/Avatar';

// Renders a grid: rows = crew, columns = notice categories (+ docs +
// training). Cells colour-coded by percentage compliance. Clicking a cell
// opens that crew member's detail view.
const ComplianceHeatmap = ({ liveCrew = [], notices = [], docs = [], trainingModules = [], setSelectedCrewMember, isDesktop, categoryOptions }) => {
  // Exclude the 'All' meta-category and build columns — use dynamic categories if provided
  const noticeCats = categoryOptions
    ? categoryOptions.filter(c => c !== 'All')
    : CATEGORIES.filter(c => c !== 'All');
  const columns = [
    ...noticeCats.map(c => ({ key: `notice-${c}`, label: c, type: 'notice', value: c })),
    { key: 'docs', label: 'Docs', type: 'docs' },
    { key: 'training', label: 'Training', type: 'training' },
  ];

  const scoreFor = (cm, col) => {
    if (col.type === 'notice') {
      const relevant = notices.filter(n => n.category === col.value);
      if (relevant.length === 0) return null;
      const read = relevant.filter(n => (n.readBy || []).includes(cm.id)).length;
      return Math.round((read / relevant.length) * 100);
    }
    if (col.type === 'docs') {
      const required = docs.filter(d => d.required);
      if (required.length === 0) return null;
      const acked = required.filter(d => (d.acknowledgedBy || []).includes(cm.id)).length;
      return Math.round((acked / required.length) * 100);
    }
    if (col.type === 'training') {
      // Only count modules this crew member is actually assigned to. If
      // they have no assignments, return null so the cell shows "—"
      // rather than a misleading 0% or 100%.
      const assigned = trainingModules.filter(m => (m.assignedCrewIds || []).includes(cm.id));
      if (assigned.length === 0) return null;
      const completed = assigned.filter(m => (m.completedCrewIds || []).includes(cm.id)).length;
      return Math.round((completed / assigned.length) * 100);
    }
    return null;
  };

  const cellColor = (score) => {
    if (score === null) return { bg: T.bg, fg: T.textDim };
    if (score >= 80) return { bg: '#d1fae5', fg: '#065f46' };
    if (score >= 50) return { bg: '#fef3c7', fg: '#92400e' };
    return { bg: '#fee2e2', fg: '#991b1b' };
  };

  return (
    <div style={{
      background: T.bgCard,
      border: `1px solid ${T.border}`,
      borderRadius: 16,
      padding: 16,
      boxShadow: T.shadow,
      overflowX: 'auto',
    }}>
      <div style={{ minWidth: 640 }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 4, fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>Crew</th>
              {columns.map(col => (
                <th key={col.key} style={{ padding: '6px 4px', fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {liveCrew.map(cm => (
              <tr key={cm.id}>
                <td style={{ padding: '4px 8px' }}>
                  <button
                    onClick={() => setSelectedCrewMember && setSelectedCrewMember(cm)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      border: 'none', background: 'transparent', cursor: 'pointer', padding: 4,
                      color: T.text, fontSize: 12, fontWeight: 700,
                    }}
                  >
                    <Avatar initials={cm.avatar} online={cm.online} size={24} />
                    <span style={{ whiteSpace: 'nowrap' }}>{cm.name}</span>
                  </button>
                </td>
                {columns.map(col => {
                  const score = scoreFor(cm, col);
                  const { bg, fg } = cellColor(score);
                  return (
                    <td key={col.key} style={{ padding: 0 }}>
                      <button
                        onClick={() => setSelectedCrewMember && setSelectedCrewMember(cm)}
                        title={`${cm.name} — ${col.label}: ${score === null ? 'N/A' : score + '%'}`}
                        style={{
                          width: '100%', height: 36,
                          background: bg, color: fg,
                          border: 'none', borderRadius: 6,
                          fontSize: 11, fontWeight: 800,
                          fontFamily: "'JetBrains Mono', monospace",
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {score === null ? '—' : `${score}`}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 11, color: T.textMuted, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: '#d1fae5', border: '1px solid #a7f3d0' }} />
          ≥ 80%
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: '#fef3c7', border: '1px solid #fde68a' }} />
          50–79%
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: '#fee2e2', border: '1px solid #fecaca' }} />
          &lt; 50%
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: T.bg, border: `1px solid ${T.border}` }} />
          No data
        </div>
      </div>
    </div>
  );
};

export default ComplianceHeatmap;
