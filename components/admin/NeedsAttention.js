import T from '../shared/theme';
import Icons from '../shared/Icons';

// Computes priority items needing admin attention and renders them as a
// compact, dismissible section at the top of the dashboard.
const NeedsAttention = ({ notices = [], docs = [], trainingModules = [], events = [], liveCrew = [], setTab, setAdminNoticeView, setSelectedDoc, setTrainingView, setSelectedModule, setAdminEventView, handleLoadEventDetail }) => {
  const crewCount = liveCrew.length || 1;
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  const items = [];

  // 1. Critical notices unacked for > 24h
  notices.forEach(n => {
    if (n.priority !== 'critical') return;
    const created = new Date(n.createdAt).getTime();
    if (isNaN(created) || (now - created) < DAY) return;
    const ackCount = (n.acknowledgedBy || []).length;
    if (ackCount >= crewCount) return;
    items.push({
      key: `notice-${n.id}`,
      severity: 'critical',
      icon: Icons.alert,
      title: n.title,
      detail: `Critical notice — ${ackCount}/${crewCount} acknowledged, ${Math.floor((now - created) / DAY)}d old`,
      action: () => setAdminNoticeView && setAdminNoticeView(n),
    });
  });

  // 2. Required docs with <50% ack rate
  docs.forEach(d => {
    if (!d.required) return;
    const ackCount = (d.acknowledgedBy || []).length;
    const pct = (ackCount / crewCount) * 100;
    if (pct >= 50) return;
    items.push({
      key: `doc-${d.id}`,
      severity: 'warning',
      icon: Icons.docs,
      title: d.title,
      detail: `Required doc — only ${Math.round(pct)}% acknowledged (${ackCount}/${crewCount})`,
      action: () => { setTab && setTab('docs'); setSelectedDoc && setSelectedDoc(d); },
    });
  });

  // 3. Training modules with overdue assignments
  trainingModules.forEach(m => {
    if (!m.dueDate) return;
    const due = new Date(m.dueDate).getTime();
    if (isNaN(due) || due > now) return;
    const completed = (m.completedBy || m.completed_by || []).length;
    if (completed >= crewCount) return;
    items.push({
      key: `train-${m.id}`,
      severity: 'warning',
      icon: Icons.training || Icons.award,
      title: m.title,
      detail: `Training overdue — ${completed}/${crewCount} completed`,
      action: () => {
        setTab && setTab('training');
        setTrainingView && setTrainingView('adminResults');
        setSelectedModule && setSelectedModule(m);
      },
    });
  });

  // 4. Events <48h away with low read rate
  events.forEach(e => {
    const start = new Date(e.startTime || e.start_time || e.startAt || e.start_at).getTime();
    if (isNaN(start)) return;
    const delta = start - now;
    if (delta <= 0 || delta > 2 * DAY) return;
    const readCount = (e.readBy || e.read_by || []).length;
    const pct = (readCount / crewCount) * 100;
    if (pct >= 70) return;
    items.push({
      key: `event-${e.id}`,
      severity: 'warning',
      icon: Icons.calendar,
      title: e.title,
      detail: `Event in ${Math.round(delta / (60 * 60 * 1000))}h — only ${Math.round(pct)}% have read it`,
      action: () => {
        setTab && setTab('events');
        if (handleLoadEventDetail) handleLoadEventDetail(e, true);
        else if (setAdminEventView) setAdminEventView(e);
      },
    });
  });

  if (items.length === 0) {
    return (
      <div style={{
        background: T.successTint,
        border: `1px solid ${T.success}33`,
        borderLeft: `4px solid ${T.success}`,
        borderRadius: 14,
        padding: '14px 18px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{ color: T.success, display: 'flex' }}>{Icons.checkCircle}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>All clear</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>No items need your attention right now.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: T.bgCard,
      border: `1px solid ${T.critical}33`,
      borderLeft: `4px solid ${T.critical}`,
      borderRadius: 14,
      padding: '16px 18px 8px',
      marginBottom: 20,
      boxShadow: T.shadow,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ color: T.critical, display: 'flex' }}>{Icons.alert}</div>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: T.text, margin: 0, letterSpacing: -0.2 }}>Needs Attention</h3>
        <span style={{
          background: T.critical,
          color: '#fff',
          fontSize: 11,
          fontWeight: 800,
          padding: '2px 8px',
          borderRadius: 999,
          minWidth: 22,
          textAlign: 'center',
        }}>{items.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.slice(0, 6).map(item => {
          const color = item.severity === 'critical' ? T.critical : T.gold;
          return (
            <button
              key={item.key}
              onClick={item.action}
              className="cb-btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 10,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                marginBottom: 6,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = T.bg}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: item.severity === 'critical' ? T.criticalTint : T.goldTint,
                color, display: 'grid', placeItems: 'center',
              }}>{item.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{item.detail}</div>
              </div>
              <div style={{ color: T.textDim, flexShrink: 0 }}>{Icons.arrowRight || '›'}</div>
            </button>
          );
        })}
        {items.length > 6 && (
          <div style={{ fontSize: 11, color: T.textMuted, padding: '8px 12px' }}>
            +{items.length - 6} more items need attention
          </div>
        )}
      </div>
    </div>
  );
};

export default NeedsAttention;
