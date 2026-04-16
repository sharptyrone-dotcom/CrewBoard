import T, { PRIORITIES } from '../shared/theme';
import Icons, { Icon } from '../shared/Icons';
import { PriorityBadge, CategoryBadge } from '../shared/Badge';
import { ValidityPill } from '../shared/utils';

export default function NoticeCard({ notice, currentUser, role, onClick, isPinned, crewCount, isDesktop }) {
  const isRead = notice.readBy.includes(currentUser.id);
  const isAdminDesktop = role === 'admin' && isDesktop;
  const hasPoll = notice.pollOptions && notice.pollOptions.length >= 2;
  return (
    <button onClick={onClick} className="cb-card" style={{ display: 'flex', gap: isAdminDesktop ? 18 : 14, padding: isAdminDesktop ? '16px 22px' : '18px 20px', background: T.bgCard, border: `1px solid ${isPinned ? T.gold : T.border}`, borderRadius: isAdminDesktop ? 12 : 16, cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: T.shadow, alignItems: isAdminDesktop ? 'center' : 'stretch' }}>
      <div style={{ width: 4, borderRadius: 2, background: PRIORITIES[notice.priority], flexShrink: 0, alignSelf: 'stretch' }} />
      {isAdminDesktop ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, minWidth: 120 }}>
            <PriorityBadge priority={notice.priority} />
            <CategoryBadge category={notice.category} />
            {hasPoll && <span style={{ fontSize: 9, fontWeight: 700, color: '#7c3aed', background: 'var(--poll-tint)', padding: '2px 6px', borderRadius: 4 }}>{Icons.poll}</span>}
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            {isPinned && <span style={{ color: T.gold, display: 'flex', flexShrink: 0 }}><Icon d={<><line x1="12" y1="17" x2="12" y2="22" /><path d="M5 17h14v-1.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V6h1V2H8v4h1v4.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24z" /></>} size={14} /></span>}
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{notice.title}</span>
            <ValidityPill validUntil={notice.validUntil} />
          </div>
          <div style={{ fontSize: 12, color: T.textMuted, flexShrink: 0, minWidth: 70, textAlign: 'right' }}>{new Date(notice.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, flexShrink: 0, minWidth: 150, justifyContent: 'flex-end' }}>
            <span style={{ color: T.accent, fontWeight: 600 }}>{notice.readBy.length}/{crewCount} read</span>
            <span style={{ color: T.success, fontWeight: 600 }}>{notice.acknowledgedBy.length} ack</span>
          </div>
        </>
      ) : (
        <>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
              <PriorityBadge priority={notice.priority} />
              <CategoryBadge category={notice.category} />
              <ValidityPill validUntil={notice.validUntil} />
              {hasPoll && <span style={{ fontSize: 9, fontWeight: 700, color: '#7c3aed', background: 'var(--poll-tint)', padding: '2px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3 }}>{Icons.poll} Poll</span>}
              {isPinned && <span style={{ color: T.gold, display: 'flex' }}><Icon d={<><line x1="12" y1="17" x2="12" y2="22" /><path d="M5 17h14v-1.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V6h1V2H8v4h1v4.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24z" /></>} size={14} /></span>}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4, lineHeight: 1.3 }}>{notice.title}</div>
            <div style={{ fontSize: 12, color: T.textMuted }}>{new Date(notice.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
            {role === 'admin' && (
              <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11 }}>
                <span style={{ color: T.accent }}>{notice.readBy.length}/{crewCount} read</span>
                <span style={{ color: T.success }}>{notice.acknowledgedBy.length} acknowledged</span>
              </div>
            )}
          </div>
          {role === 'crew' && !isRead && <div style={{ width: 10, height: 10, borderRadius: '50%', background: T.accent, flexShrink: 0, marginTop: 4 }} />}
        </>
      )}
    </button>
  );
}
