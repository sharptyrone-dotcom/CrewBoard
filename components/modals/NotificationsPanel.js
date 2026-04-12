import T from '../shared/theme';
import Icons from '../shared/Icons';

const NotificationsPanel = ({ notifications, setShowNotifications, handleNotificationClick }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 100 }} onClick={() => setShowNotifications(false)}>
    <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 0, right: 0, width: '100%', maxWidth: 380, height: '100%', background: T.bgModal, borderLeft: `1px solid ${T.border}`, overflow: 'auto', padding: 24, boxShadow: '-20px 0 40px rgba(15,23,42,0.15)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: 0 }}>Notifications</h2>
        <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer' }}>{Icons.x}</button>
      </div>
      {notifications.map(n => (
        <button key={n.id} onClick={() => handleNotificationClick(n)} className="cb-card" style={{ display: 'flex', gap: 14, padding: '16px 18px', background: n.read ? T.bgCard : T.accentTint, border: `1px solid ${n.read ? T.border : T.accent}`, borderRadius: 14, width: '100%', cursor: 'pointer', textAlign: 'left', marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: n.type === 'notice' ? `${T.accent}20` : n.type === 'document' ? `${T.gold}20` : `${T.critical}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: n.type === 'notice' ? T.accent : n.type === 'document' ? T.gold : T.critical }}>
            {n.type === 'notice' ? Icons.notices : n.type === 'document' ? Icons.file : Icons.bell}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 2 }}>{n.title}</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 4 }}>{n.body}</div>
            <div style={{ fontSize: 11, color: T.textDim }}>{n.time}</div>
          </div>
          {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.accent, flexShrink: 0, marginTop: 6 }} />}
        </button>
      ))}
    </div>
  </div>
);

export default NotificationsPanel;
