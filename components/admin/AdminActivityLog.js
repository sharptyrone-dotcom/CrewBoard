import T from '../shared/theme';
import Icons from '../shared/Icons';
import Avatar from '../shared/Avatar';
import { ACTIVITY_ACTIONS } from '@/lib/activity';

const AdminActivityLog = ({ activity, activityLoading, crew, isDesktop }) => {
  // Relative time formatter local to this component to avoid another
  // shared util file. Mirrors the one in lib/notifications.js.
  const relTime = (iso) => {
    if (!iso) return '';
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';
    const mins = Math.round((Date.now() - then) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    const weeks = Math.round(days / 7);
    if (weeks < 5) return `${weeks}w ago`;
    const months = Math.round(days / 30);
    return `${months}mo ago`;
  };

  const crewById = Object.fromEntries(crew.map(c => [c.id, c]));

  // Collapses an activity row into {verb, detail, icon, color} so the
  // render loop stays tidy. Falls back to the metadata title when the
  // referenced notice/document no longer exists client-side.
  const describe = (row) => {
    const title = row.metadata?.title || '';
    switch (row.action) {
      case ACTIVITY_ACTIONS.NOTICE_POSTED:
        return {
          verb: 'posted notice',
          detail: title || 'a notice',
          icon: Icons.pin,
          color: row.metadata?.priority === 'critical' ? T.critical : T.accent,
        };
      case ACTIVITY_ACTIONS.NOTICE_ACKNOWLEDGED:
        return {
          verb: 'acknowledged',
          detail: title || 'a notice',
          icon: Icons.checkCircle,
          color: T.success,
        };
      case ACTIVITY_ACTIONS.NOTICE_DELETED:
        return {
          verb: 'deleted notice',
          detail: title || 'a notice',
          icon: Icons.trash,
          color: T.critical,
        };
      case ACTIVITY_ACTIONS.DOCUMENT_POSTED:
        return {
          verb: 'uploaded document',
          detail: row.metadata?.version ? `${title} (v${row.metadata.version})` : (title || 'a document'),
          icon: Icons.file,
          color: T.accent,
        };
      case ACTIVITY_ACTIONS.DOCUMENT_REPLACED:
        return {
          verb: 'replaced document',
          detail: row.metadata?.version ? `${title} (now v${row.metadata.version})` : (title || 'a document'),
          icon: Icons.file,
          color: T.accent,
        };
      case ACTIVITY_ACTIONS.DOCUMENT_DELETED:
        return {
          verb: 'deleted document',
          detail: title || 'a document',
          icon: Icons.trash,
          color: T.critical,
        };
      case ACTIVITY_ACTIONS.DOCUMENT_ACKNOWLEDGED:
        return {
          verb: 'signed off',
          detail: row.metadata?.version ? `${title} (v${row.metadata.version})` : (title || 'a document'),
          icon: Icons.file,
          color: T.gold,
        };
      default:
        return { verb: row.action, detail: '', icon: Icons.bell, color: T.textMuted };
    }
  };

  // Group by date (Today, Yesterday, or an absolute date) for a cleaner
  // scanning experience on longer lists.
  const groups = [];
  let lastLabel = null;
  activity.forEach(row => {
    const d = new Date(row.createdAt);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const rowDay = new Date(d); rowDay.setHours(0, 0, 0, 0);
    let label;
    if (rowDay.getTime() === today.getTime()) label = 'Today';
    else if (rowDay.getTime() === yesterday.getTime()) label = 'Yesterday';
    else label = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    if (label !== lastLabel) {
      groups.push({ label, rows: [] });
      lastLabel = label;
    }
    groups[groups.length - 1].rows.push(row);
  });

  return (
    <div style={{ padding: isDesktop ? '28px 36px' : 20 }}>
      <h2 style={{ fontSize: isDesktop ? 26 : 20, fontWeight: 800, color: T.text, margin: '0 0 4px' }}>Activity Log</h2>
      <p style={{ fontSize: 12, color: T.textMuted, margin: '0 0 20px' }}>Every notice posted and every acknowledgement across the vessel.</p>

      {activityLoading && <div style={{ color: T.textMuted, fontSize: 13, padding: '20px 0', textAlign: 'center' }}>Loading activity…</div>}
      {!activityLoading && activity.length === 0 && (
        <div style={{ color: T.textMuted, fontSize: 13, padding: '40px 20px', textAlign: 'center', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14 }}>
          No activity recorded yet.
        </div>
      )}

      {groups.map(group => (
        <div key={group.label} style={{ marginBottom: 22 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>{group.label}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {group.rows.map(row => {
              const actor = crewById[row.crewMemberId];
              const name = actor?.name || 'Unknown crew';
              const initials = actor?.avatar || '?';
              const { verb, detail, icon, color } = describe(row);
              return (
                <div key={row.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, boxShadow: T.shadow }}>
                  <Avatar initials={initials} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: T.text, lineHeight: 1.4 }}>
                      <span style={{ fontWeight: 700 }}>{name}</span>
                      <span style={{ color: T.textMuted }}> {verb} </span>
                      <span style={{ fontWeight: 600 }}>{detail}</span>
                    </div>
                    <div style={{ fontSize: 11, color: T.textDim, marginTop: 3 }}>{relTime(row.createdAt)}</div>
                  </div>
                  <div style={{ color, marginTop: 2, flexShrink: 0 }}>{icon}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminActivityLog;
