import T from '../shared/theme';
import Icons from '../shared/Icons';
import StatCard from '../shared/StatCard';
import ComplianceBar from '../shared/ComplianceBar';
import Avatar from '../shared/Avatar';

const AdminDashboard = ({ notices, docs, liveCrew, isDesktop, setSelectedCrewMember, setShowNewNotice, setShowNewDoc, setShowExportReport, dashReminderState, setDashReminderState, dashReminderSentCount, setDashReminderSentCount, handleSendDashboardReminder }) => {
  const criticalUnacked = notices.filter(n => n.priority === 'critical').reduce((sum, n) => sum + (liveCrew.length - n.acknowledgedBy.length), 0);
  const docsUnacked = docs.filter(d => d.required).reduce((sum, d) => sum + (liveCrew.length - d.acknowledgedBy.length), 0);
  const overallCompliance = Math.round(
    liveCrew.reduce((sum, cm) => {
      const read = notices.filter(n => n.readBy.includes(cm.id)).length;
      const acked = docs.filter(d => d.required && d.acknowledgedBy.includes(cm.id)).length;
      const total = notices.length + docs.filter(d => d.required).length;
      return sum + (total > 0 ? ((read + acked) / total) * 100 : 0);
    }, 0) / (liveCrew.length || 1)
  );

  const requiredDocs = docs.filter(d => d.required);

  // Per-crew compliance rows, computed once and shared between the
  // mobile card list and the desktop table.
  const crewRows = liveCrew.map(cm => {
    const read = notices.filter(n => n.readBy.includes(cm.id)).length;
    const acked = docs.filter(d => d.required && d.acknowledgedBy.includes(cm.id)).length;
    const total = notices.length + requiredDocs.length;
    const score = total > 0 ? Math.round(((read + acked) / total) * 100) : 0;
    return { cm, read, acked, total, score };
  });

  return (
    <div style={{ padding: isDesktop ? '28px 36px' : 20 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: isDesktop ? 26 : 22, fontWeight: 800, color: T.text, margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: T.textMuted, margin: '4px 0 0' }}>M/Y Serenity — {liveCrew.length} crew on board</p>
      </div>
      {/* Stat cards: 2x2 mobile, 4-column desktop */}
      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : '1fr 1fr', gap: isDesktop ? 16 : 10, marginBottom: isDesktop ? 24 : 20 }}>
        <StatCard label="Active Notices" value={notices.length} icon={Icons.notices} />
        <StatCard label="Crew Online" value={liveCrew.filter(c => c.online).length} color={T.success} icon={Icons.crew} />
        <StatCard label="Critical Unack." value={criticalUnacked} color={T.critical} icon={Icons.alert} />
        <StatCard label="Doc. Pending Ack." value={docsUnacked} color={T.gold} icon={Icons.docs} />
      </div>
      {/* Compliance + Quick Actions: stacked mobile, side-by-side desktop */}
      <div style={{ display: isDesktop ? 'grid' : 'block', gridTemplateColumns: isDesktop ? '1fr 1fr' : undefined, gap: isDesktop ? 20 : undefined, marginBottom: isDesktop ? 28 : 20 }}>
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20, marginBottom: isDesktop ? 0 : 20, boxShadow: T.shadow }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Overall Compliance</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: overallCompliance > 70 ? T.success : T.gold, fontFamily: "'JetBrains Mono', monospace" }}>{overallCompliance}%</span>
          </div>
          <ComplianceBar value={overallCompliance} />
          <p style={{ fontSize: 11, color: T.textMuted, margin: '8px 0 0' }}>Based on notice reads and document acknowledgements across all crew</p>
        </div>
        <div>
          <div style={{ marginBottom: 12 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Quick Actions</h3>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              ['New Notice', () => setShowNewNotice(true)],
              ['Upload Doc', () => setShowNewDoc(true)],
              [dashReminderState === 'sending' ? 'Sending...' :
               dashReminderState === 'sent' ? `Sent to ${dashReminderSentCount} crew` :
               dashReminderState === 'empty' ? 'All crew compliant!' :
               dashReminderState === 'error' ? 'Failed — try again' :
               'Send Reminder',
               async () => {
                 if (dashReminderState !== 'idle') return;
                 setDashReminderState('sending');
                 try {
                   const { targeted, sent } = await handleSendDashboardReminder();
                   if (targeted === 0) {
                     setDashReminderState('empty');
                   } else if (sent === 0) {
                     setDashReminderState('error');
                   } else {
                     setDashReminderSentCount(sent);
                     setDashReminderState('sent');
                   }
                 } catch (err) {
                   console.error('[dashboard] reminder failed', err);
                   setDashReminderState('error');
                 }
                 setTimeout(() => { setDashReminderState('idle'); setDashReminderSentCount(0); }, 3000);
               }],
              ['Invite Crew', () => { window.location.href = '/admin/invites'; }],
              ['Export Report', () => setShowExportReport(true)],
            ].map(([label, fn]) => {
              const isReminder = label.startsWith('Send') || label.startsWith('Sent') || label === 'Sending...' || label.startsWith('All crew') || label.startsWith('Failed');
              const reminderDone = isReminder && (dashReminderState === 'sent' || dashReminderState === 'empty');
              const reminderError = isReminder && dashReminderState === 'error';
              return (
                <button key={isReminder ? 'reminder' : label} onClick={fn} className="cb-btn-secondary" style={{
                  flex: '1 1 140px', padding: '14px 10px', borderRadius: 12,
                  border: `1px solid ${reminderError ? T.critical : reminderDone ? T.success : T.border}`,
                  background: reminderError ? T.criticalTint : reminderDone ? '#f0fdf4' : T.bgCard,
                  color: reminderError ? T.critical : reminderDone ? T.success : T.accentDark,
                  fontSize: 12, fontWeight: 700,
                  cursor: (isReminder && dashReminderState !== 'idle') ? 'default' : 'pointer',
                  opacity: (isReminder && dashReminderState === 'sending') ? 0.7 : 1,
                  boxShadow: T.shadow, transition: 'all 0.2s',
                }}>{label}</button>
              );
            })}
          </div>
        </div>
      </div>
      <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>Crew Compliance</h3>
      {/* Desktop: proper table. Mobile: stacked cards. */}
      {isDesktop ? (
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: T.shadow }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}`, background: T.bg }}>
                {['Name', 'Role', 'Department', 'Notices Read', 'Docs Ack.', 'Compliance'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {crewRows.map(({ cm, read, acked, score }) => (
                <tr key={cm.id} onClick={() => setSelectedCrewMember(cm)} className="cb-table-row" style={{ borderBottom: `1px solid ${T.border}`, cursor: 'pointer', transition: 'background 0.15s' }}
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
                  <td style={{ padding: '14px 16px', color: T.accent, fontWeight: 600 }}>{read}/{notices.length}</td>
                  <td style={{ padding: '14px 16px', color: T.gold, fontWeight: 600 }}>{acked}/{requiredDocs.length}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1 }}><ComplianceBar value={score} /></div>
                      <span style={{ fontWeight: 800, color: score > 70 ? T.success : score > 40 ? T.gold : T.critical, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, minWidth: 36, textAlign: 'right' }}>{score}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        crewRows.map(({ cm, score }) => (
          <button key={cm.id} onClick={() => setSelectedCrewMember(cm)} className="cb-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, width: '100%', cursor: 'pointer', textAlign: 'left', marginBottom: 8, boxShadow: T.shadow }}>
            <Avatar initials={cm.avatar} online={cm.online} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{cm.name}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: score > 70 ? T.success : score > 40 ? T.gold : T.critical, fontFamily: "'JetBrains Mono', monospace" }}>{score}%</span>
              </div>
              <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 6 }}>{cm.role} — {cm.dept}</div>
              <ComplianceBar value={score} />
            </div>
          </button>
        ))
      )}
    </div>
  );
};

export default AdminDashboard;
