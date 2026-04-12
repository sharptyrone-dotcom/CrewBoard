import T from '../shared/theme';
import Icons from '../shared/Icons';
import StatCard from '../shared/StatCard';
import ComplianceBar from '../shared/ComplianceBar';
import Avatar from '../shared/Avatar';
import BackButton from '../shared/BackButton';

const CrewManagement = ({ liveCrew, selectedCrewMember, setSelectedCrewMember, notices, docs, isDesktop }) => {
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
  return (
    <div style={{ padding: isDesktop ? '28px 36px' : 20 }}>
      <h2 style={{ fontSize: isDesktop ? 26 : 20, fontWeight: 800, color: T.text, margin: '0 0 16px' }}>Crew Management</h2>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, maxWidth: isDesktop ? 320 : undefined }}>
        <StatCard label="On Board" value={liveCrew.length} icon={Icons.crew} />
        <StatCard label="Online" value={liveCrew.filter(c => c.online).length} color={T.success} icon={Icons.checkCircle} />
      </div>
      {/* Desktop: table. Mobile: cards. */}
      {isDesktop ? (
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: T.shadow }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}`, background: T.bg }}>
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
                  <tr key={cm.id} onClick={() => setSelectedCrewMember(cm)} style={{ borderBottom: `1px solid ${T.border}`, cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = T.bg}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar initials={cm.avatar} online={cm.online} size={32} />
                        <span style={{ fontWeight: 700, color: T.text }}>{cm.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: T.textMuted }}>{cm.role}</td>
                    <td style={{ padding: '14px 16px', color: T.textMuted }}>{cm.dept}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: cm.online ? T.success : T.textDim, background: cm.online ? T.successTint : '#f1f5f9', padding: '3px 8px', borderRadius: 6 }}>
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
          <button key={cm.id} onClick={() => setSelectedCrewMember(cm)} className="cb-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, width: '100%', cursor: 'pointer', textAlign: 'left', marginBottom: 10, boxShadow: T.shadow }}>
            <Avatar initials={cm.avatar} online={cm.online} size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{cm.name}</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>{cm.role} — {cm.dept}</div>
            </div>
            <span style={{ color: T.textDim, fontSize: 18 }}>&rsaquo;</span>
          </button>
        ))
      )}
    </div>
  );
};

export default CrewManagement;
