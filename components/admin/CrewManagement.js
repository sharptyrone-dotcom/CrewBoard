import { useState } from 'react';
import T from '../shared/theme';
import Icons from '../shared/Icons';
import StatCard from '../shared/StatCard';
import ComplianceBar from '../shared/ComplianceBar';
import Avatar from '../shared/Avatar';
import BackButton from '../shared/BackButton';
import ComplianceHeatmap from './ComplianceHeatmap';
import BulkActionBar from '../shared/BulkActionBar';

const CrewManagement = ({ liveCrew, selectedCrewMember, setSelectedCrewMember, notices, docs, trainingModules = [], isDesktop, handleBulkCrewAction, categoryOptions }) => {
  const [view, setView] = useState('roster');
  const [selectedIds, setSelectedIds] = useState(new Set());
  if (selectedCrewMember) {
    const cm = liveCrew.find(c => c.id === selectedCrewMember.id) || selectedCrewMember;
    const noticeCol = (
      <div>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>Notice Status</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {notices.map(n => {
            const hasRead = n.readBy.includes(cm.id);
            const hasAcked = n.acknowledgedBy.includes(cm.id);
            const status = hasAcked ? 'Acknowledged' : hasRead ? 'Read' : 'Not read';
            const color = hasAcked ? T.success : hasRead ? T.accent : T.critical;
            return (
              <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, boxShadow: T.shadow }}>
                <span style={{ fontSize: 13, color: T.text, flex: 1 }}>{n.title}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color, flexShrink: 0, marginLeft: 8 }}>{status}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
    const docCol = (
      <div>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>Document Acknowledgements</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {docs.filter(d => d.required).map(d => {
            const hasAcked = d.acknowledgedBy.includes(cm.id);
            return (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, boxShadow: T.shadow }}>
                <span style={{ fontSize: 13, color: T.text, flex: 1 }}>{d.title}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: hasAcked ? T.success : T.critical, flexShrink: 0, marginLeft: 8 }}>{hasAcked ? 'Acknowledged' : 'Pending'}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
    return (
      <div style={{ padding: isDesktop ? '28px 36px' : 20 }}>
        <BackButton onClick={() => setSelectedCrewMember(null)} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <Avatar initials={cm.avatar} online={cm.online} size={56} />
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: 0 }}>{cm.name}</h2>
            <p style={{ fontSize: 13, color: T.textMuted, margin: '2px 0 0' }}>{cm.role} — {cm.dept}</p>
          </div>
        </div>
        {/* Desktop: notice + doc columns side by side. Mobile: stacked. */}
        {isDesktop ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
            {noticeCol}
            {docCol}
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>{noticeCol}</div>
            {docCol}
          </>
        )}
      </div>
    );
  }

  // Crew roster
  const requiredDocs = docs.filter(d => d.required);

  const toggleSelected = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };
  const clearSelection = () => setSelectedIds(new Set());
  const runBulk = async (action) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (handleBulkCrewAction) await handleBulkCrewAction(action, ids);
    clearSelection();
  };

  return (
    <div style={{ padding: isDesktop ? '28px 36px' : 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <h2 style={{ fontSize: isDesktop ? 26 : 20, fontWeight: 800, color: T.text, margin: 0 }}>Crew Management</h2>
        <div style={{ display: 'flex', background: T.bg, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden', padding: 2 }}>
          {[
            { id: 'roster', label: 'Roster' },
            { id: 'heatmap', label: 'Heatmap' },
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              style={{
                padding: '6px 14px', fontSize: 11, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: 0.8,
                border: 'none', cursor: 'pointer',
                background: view === v.id ? T.accent : 'transparent',
                color: view === v.id ? '#fff' : T.textMuted,
                transition: 'all 0.2s', borderRadius: 8,
              }}
            >{v.label}</button>
          ))}
        </div>
      </div>
      <BulkActionBar
        count={selectedIds.size}
        label={`crew selected`}
        onClear={clearSelection}
        actions={[
          { label: 'Send Reminder', onClick: () => runBulk('remind'), icon: Icons.bell },
          { label: 'Export', onClick: () => runBulk('export') },
        ]}
      />
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, maxWidth: isDesktop ? 320 : undefined }}>
        <StatCard label="On Board" value={liveCrew.length} icon={Icons.crew} />
        <StatCard label="Online" value={liveCrew.filter(c => c.online).length} color={T.success} icon={Icons.checkCircle} />
      </div>
      {view === 'heatmap' && (
        <ComplianceHeatmap
          liveCrew={liveCrew}
          notices={notices}
          docs={docs}
          trainingModules={trainingModules}
          setSelectedCrewMember={setSelectedCrewMember}
          isDesktop={isDesktop}
          categoryOptions={categoryOptions}
        />
      )}
      {view === 'roster' && (
      <>

      {/* Desktop: table. Mobile: cards. */}
      {isDesktop ? (
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: T.shadow }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}`, background: T.bg }}>
                <th style={{ padding: '12px 16px', width: 40 }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.size === liveCrew.length && liveCrew.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(new Set(liveCrew.map(c => c.id)));
                      else clearSelection();
                    }}
                    style={{ width: 16, height: 16, accentColor: T.accent, cursor: 'pointer' }}
                    aria-label="Select all"
                  />
                </th>
                {['Name', 'Role', 'Department', 'Status', 'Compliance'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liveCrew.map(cm => {
                const read = notices.filter(n => n.readBy.includes(cm.id)).length;
                const acked = docs.filter(d => d.required && d.acknowledgedBy.includes(cm.id)).length;
                const total = notices.length + requiredDocs.length;
                const score = total > 0 ? Math.round(((read + acked) / total) * 100) : 0;
                return (
                  <tr key={cm.id} style={{ borderBottom: `1px solid ${T.border}`, transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = T.bg}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(cm.id)}
                        onChange={() => toggleSelected(cm.id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: 16, height: 16, accentColor: T.accent, cursor: 'pointer' }}
                        aria-label={`Select ${cm.name}`}
                      />
                    </td>
                    <td style={{ padding: '14px 16px', cursor: 'pointer' }} onClick={() => setSelectedCrewMember(cm)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar initials={cm.avatar} online={cm.online} size={32} />
                        <span style={{ fontWeight: 700, color: T.text }}>{cm.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: T.textMuted }}>{cm.role}</td>
                    <td style={{ padding: '14px 16px', color: T.textMuted }}>{cm.dept}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: cm.online ? T.success : T.textDim, background: cm.online ? T.successTint : T.bg, padding: '3px 8px', borderRadius: 6 }}>
                        {cm.online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1 }}><ComplianceBar value={score} /></div>
                        <span style={{ fontWeight: 800, color: score > 70 ? T.success : score > 40 ? T.gold : T.critical, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, minWidth: 36, textAlign: 'right' }}>{score}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        liveCrew.map(cm => (
          <div key={cm.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="checkbox"
              checked={selectedIds.has(cm.id)}
              onChange={() => toggleSelected(cm.id)}
              onClick={(e) => e.stopPropagation()}
              style={{ width: 18, height: 18, accentColor: T.accent, cursor: 'pointer', flexShrink: 0 }}
              aria-label={`Select ${cm.name}`}
            />
            <button onClick={() => setSelectedCrewMember(cm)} className="cb-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, width: '100%', cursor: 'pointer', textAlign: 'left', marginBottom: 10, boxShadow: T.shadow }}>
              <Avatar initials={cm.avatar} online={cm.online} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{cm.name}</div>
                <div style={{ fontSize: 12, color: T.textMuted }}>{cm.role} — {cm.dept}</div>
              </div>
              <span style={{ color: T.textDim, fontSize: 18 }}>&rsaquo;</span>
            </button>
          </div>
        ))
      )}
      </>
      )}
    </div>
  );
};

export default CrewManagement;
