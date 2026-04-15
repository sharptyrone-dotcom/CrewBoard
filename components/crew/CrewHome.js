import T, { PRIORITIES } from '../shared/theme';
import Icons, { Icon } from '../shared/Icons';
import StatCard from '../shared/StatCard';
import OnboardingChecklist from './OnboardingChecklist';

export default function CrewHome({ currentUser, unreadNotices, pendingAcks, pendingDocAcks, notices, docs, trainingModules = [], quickAccessIds, setSelectedNotice, setSelectedDoc, setTab }) {
  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Welcome, {currentUser.name.split(' ')[0]}</h1>
        <p style={{ fontSize: 13, color: T.textMuted, margin: '4px 0 0' }}>M/Y Serenity — {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>
      <OnboardingChecklist
        currentUser={currentUser}
        notices={notices}
        docs={docs}
        trainingModules={trainingModules}
        setTab={setTab}
        setSelectedNotice={setSelectedNotice}
        setSelectedDoc={setSelectedDoc}
      />
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <StatCard label="Unread Notices" value={unreadNotices} icon={Icons.notices} />
        <StatCard label="Pending Ack." value={pendingAcks + pendingDocAcks} color={T.critical} icon={Icons.alert} />
      </div>
      <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 10px' }}>Requires Your Attention</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {notices.filter(n => n.priority === 'critical' && !n.acknowledgedBy.includes(currentUser.id)).map(n => (
          <button key={n.id} onClick={() => { setSelectedNotice(n); setTab('notices'); }} className="cb-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', background: T.criticalTint, border: `1px solid ${T.critical}40`, borderRadius: 16, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
            <div style={{ width: 4, height: 40, borderRadius: 2, background: T.critical, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 3 }}>{n.title}</div>
              <div style={{ fontSize: 12, color: T.critical, fontWeight: 600 }}>Acknowledgement required</div>
            </div>
          </button>
        ))}
        {docs.filter(d => d.required && !d.acknowledgedBy.includes(currentUser.id)).map(d => (
          <button key={d.id} onClick={() => { setSelectedDoc(d); setTab('docs'); }} className="cb-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', background: T.goldTint, border: `1px solid ${T.gold}40`, borderRadius: 16, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
            <div style={{ width: 4, height: 40, borderRadius: 2, background: T.gold, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 3 }}>{d.title}</div>
              <div style={{ fontSize: 12, color: '#b45309', fontWeight: 600 }}>Document acknowledgement pending — v{d.version}</div>
            </div>
          </button>
        ))}
      </div>
      {/* Quick Access docs on crew home */}
      {quickAccessIds.length > 0 && (() => {
        const favDocs = quickAccessIds.map(id => docs.find(d => d.id === id)).filter(Boolean);
        if (favDocs.length === 0) return null;
        return (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ color: '#f59e0b' }}>{Icons.starFilled}</span>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, margin: 0 }}>Quick Access</h3>
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, marginBottom: 24, WebkitOverflowScrolling: 'touch' }}>
              {favDocs.map(d => (
                <button key={d.id} onClick={() => { setSelectedDoc(d); setTab('docs'); }} className="cb-card" style={{
                  minWidth: 130, padding: '14px 16px', background: T.bgCard, border: `1px solid ${T.gold}30`,
                  borderRadius: 14, cursor: 'pointer', textAlign: 'left', flexShrink: 0, boxShadow: T.shadow,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: T.accentTint, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accentDark }}><Icon d={<><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" /><polyline points="13 2 13 9 20 9" /></>} size={14} /></div>
                    <span style={{ color: '#f59e0b' }}><Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" size={12} fill="#f59e0b" /></span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text, lineHeight: 1.3, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{d.title}</div>
                  <div style={{ fontSize: 10, color: T.textMuted }}>v{d.version}</div>
                </button>
              ))}
            </div>
          </>
        );
      })()}
      <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 10px' }}>Recent Notices</h3>
      {notices.slice(0, 3).map(n => (
        <button key={n.id} onClick={() => { setSelectedNotice(n); setTab('notices'); }} className="cb-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, cursor: 'pointer', textAlign: 'left', width: '100%', marginBottom: 8, boxShadow: T.shadow }}>
          <div style={{ width: 3, height: 28, borderRadius: 2, background: PRIORITIES[n.priority], flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</div>
            <div style={{ fontSize: 11, color: T.textMuted }}>{n.category}</div>
          </div>
          {!n.readBy.includes(currentUser.id) && <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.accent, flexShrink: 0 }} />}
        </button>
      ))}
    </div>
  );
}
