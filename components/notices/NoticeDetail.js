import T from '../shared/theme';
import Icons from '../shared/Icons';
import { PriorityBadge, CategoryBadge } from '../shared/Badge';
import BackButton from '../shared/BackButton';
import { ValidityPill, PollResultsBar } from '../shared/utils';

export default function NoticeDetail({ notice, currentUser, onBack, onAcknowledge, onMarkRead, onPollVote }) {
  const isRead = notice.readBy.includes(currentUser.id);
  const isAcked = notice.acknowledgedBy.includes(currentUser.id);
  const needsAck = notice.priority === 'critical';
  const hasPoll = notice.pollOptions && notice.pollOptions.length >= 2;
  const myVote = hasPoll ? (notice.pollVotes || []).find(v => v.crewMemberId === currentUser.id) : null;
  const totalVotes = hasPoll ? (notice.pollVotes || []).length : 0;

  return (
    <div style={{ padding: 20 }}>
      <BackButton onClick={onBack} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <PriorityBadge priority={notice.priority} />
        <CategoryBadge category={notice.category} />
        <ValidityPill validUntil={notice.validUntil} />
        {notice.pinned && <span style={{ fontSize: 10, color: T.gold, display: 'flex', alignItems: 'center', gap: 4 }}>{Icons.pin} Pinned</span>}
        {hasPoll && <span style={{ fontSize: 10, fontWeight: 700, color: '#7c3aed', background: 'var(--poll-tint)', padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>{Icons.poll} Poll</span>}
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 8px', lineHeight: 1.3 }}>{notice.title}</h2>
      <p style={{ fontSize: 12, color: T.textMuted, margin: '0 0 20px' }}>
        {new Date(notice.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
      <div style={{ fontSize: 15, color: T.text, lineHeight: 1.7, marginBottom: hasPoll ? 20 : 30, opacity: 0.9 }}>{notice.body}</div>

      {/* Poll voting / results */}
      {hasPoll && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            {Icons.poll} {myVote ? 'Poll Results' : 'Cast Your Vote'}
            {totalVotes > 0 && <span style={{ fontSize: 12, fontWeight: 500, color: T.textMuted }}>({totalVotes} vote{totalVotes !== 1 ? 's' : ''})</span>}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {myVote ? (
              notice.pollOptions.map(opt => {
                const voteCount = (notice.pollVotes || []).filter(v => v.optionId === opt.id).length;
                const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                return <PollResultsBar key={opt.id} option={opt} voteCount={voteCount} totalVotes={totalVotes} isSelected={myVote.optionId === opt.id} percentage={pct} />;
              })
            ) : (
              notice.pollOptions.map(opt => (
                <button key={opt.id} onClick={() => onPollVote(notice.id, opt.id)} className="cb-card" style={{
                  width: '100%', padding: '14px 16px', borderRadius: 12, border: `2px solid ${T.border}`,
                  background: T.bgCard, cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: 500,
                  color: T.text, transition: 'all 0.15s',
                }}>
                  {opt.text}
                </button>
              ))
            )}
          </div>
          {myVote && (
            <button onClick={() => onPollVote(notice.id, myVote.optionId === notice.pollOptions[0].id ? notice.pollOptions[1].id : notice.pollOptions[0].id)} style={{
              background: 'none', border: 'none', color: T.textMuted, fontSize: 12, cursor: 'pointer',
              marginTop: 8, padding: 4, textDecoration: 'underline',
            }}>
              Change my vote
            </button>
          )}
        </div>
      )}

      {!isRead && !needsAck && !hasPoll && (
        <button onClick={() => onMarkRead(notice.id)} className="cb-btn-primary" style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: T.accent, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Mark as Read
        </button>
      )}
      {needsAck && !isAcked && (
        <button onClick={() => onAcknowledge(notice.id)} style={{ width: '100%', padding: 16, borderRadius: 12, border: `2px solid ${T.critical}`, background: T.criticalTint, color: T.critical, fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}>
          I have read and understood
        </button>
      )}
      {(isRead || isAcked) && !hasPoll && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: 16, color: T.success, fontWeight: 600, fontSize: 14 }}>
          {Icons.checkCircle} {isAcked ? 'Acknowledged' : 'Read'}
        </div>
      )}
    </div>
  );
}
