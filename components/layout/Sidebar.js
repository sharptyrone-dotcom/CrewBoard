import T from '../shared/theme';
import Icons, { Icon } from '../shared/Icons';
import Avatar from '../shared/Avatar';

const Sidebar = ({ tabs, tab, setTab, resetNav, currentUser }) => (
  <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 240, background: '#fff', borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', zIndex: 60 }}>
    {/* Sidebar header / logo */}
    <div style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${T.accent} 0%, ${T.accentDark} 100%)`, display: 'grid', placeItems: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(59,130,246,0.35)' }}>
        <Icon d={<><circle cx="12" cy="5" r="3" /><line x1="12" y1="22" x2="12" y2="8" /><path d="M5 12H2a10 10 0 0020 0h-3" /></>} size={18} strokeWidth={2.5} />
      </div>
      <span style={{ fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: -0.3 }}>CrewBoard</span>
    </div>
    {/* Nav items */}
    <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {tabs.map(t => {
        const active = tab === t.id;
        return (
          <button key={t.id} onClick={() => { setTab(t.id); resetNav(); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, border: 'none', background: active ? T.accentTint : 'transparent', color: active ? T.accent : T.textMuted, cursor: 'pointer', fontSize: 14, fontWeight: active ? 700 : 500, transition: 'all 0.15s', width: '100%', textAlign: 'left' }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.bg; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
          >
            {t.icon}
            <span>{t.label}</span>
            {t.badge > 0 && <span style={{ marginLeft: 'auto', minWidth: 20, height: 20, borderRadius: 10, background: T.critical, fontSize: 11, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>{t.badge}</span>}
          </button>
        );
      })}
    </nav>
    {/* Sidebar footer: user info */}
    <div style={{ padding: '14px 16px', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
      <Avatar initials={currentUser.avatar} online size={32} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.name}</div>
        <div style={{ fontSize: 11, color: T.textMuted }}>{currentUser.role}</div>
      </div>
    </div>
  </div>
);

export default Sidebar;
