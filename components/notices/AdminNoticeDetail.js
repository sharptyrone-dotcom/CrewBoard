import { useState } from 'react';
import T from '../shared/theme';
import Icons from '../shared/Icons';
import { PriorityBadge, CategoryBadge } from '../shared/Badge';
import Avatar from '../shared/Avatar';
import StatCard from '../shared/StatCard';
import BackButton from '../shared/BackButton';
import { ValidityPill } from '../shared/utils';

export default function AdminNoticeDetail({ notice, onBack, crew, onDelete, onSendReminder, activity = [], isDesktop }) {
  const [reminderState, setReminderState] = useState('idle');
  const [autoRemind, setAutoRemind] = useState(() => {
    if (typeof window === 'undefined') return false;
    try { return JSON.parse(localStorage.getItem(`auto-remind-${notice.id}`) || 'false'); } catch { return false; }
  });

  // Pull reminder history entries from the activity log for this notice.
  const reminderHistory = (activity || [])
    .filter(a => (a.action === 'reminder_sent' || a.action_type === 'reminder_sent') && (a.targetId === notice.id || a.target_id === notice.id))
    .slice(0, 10);

  const toggleAutoRemind = (checked) => {
    setAutoRemind(checked);
    try { localStorage.setItem(`auto-remind-${notice.id}`, JSON.stringify(checked)); } catch {}
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const delta = now - d;
    const m = Math.floor(delta / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return d.toLocaleDateString();
  };

  const totalCrew = crew.length;
  const nonReaderCount = crew.filter(cm => !notice.readBy.includes(cm.id)).length;
  const hasPoll = notice.pollOptions && notice.pollOptions.length >= 2;
  const totalVotes = hasPoll ? (notice.pollVotes || []).length : 0;

  const handleReminder = async () => {
    if (reminderState !== 'idle' || !onSendReminder) return;
    setReminderState('sending');
    try {
      await onSendReminder(notice);
      setReminderState('sent');
    } catch (err) {
      console.error('[AdminNoticeDetail] reminder failed', err);
      setReminderState('error');
      setTimeout(() => setReminderState('idle'), 3000);
    }
  };

  return (
    <div style={{ padding: isDesktop ? '28px 36px' : 20 }}>
      <BackButton onClick={onBack} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <PriorityBadge priority={notice.priority} />
        <CategoryBadge category={notice.category} />
        <ValidityPill validUntil={notice.validUntil} />
        {hasPoll && <span style={{ fontSize: 10, fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>{Icons.poll} Poll</span>}
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: '0 0 20px' }}>{notice.title}</h2>

      {hasPoll && (
        <div style={{ marginBottom: 24, padding: 20, background: '#f8f7ff', borderRadius: 16, border: '1px solid #e9e5ff' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#5b21b6', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            {Icons.poll} Poll Results
            <span style={{ fontSize: 12, fontWeight: 500, color: T.textMuted }}>({totalVotes}/{totalCrew} voted)</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notice.pollOptions.map(opt => {
              const voters = (notice.pollVotes || []).filter(v => v.optionId === opt.id);
              const voteCount = voters.length;
              const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              const isWinning = voteCount > 0 && voteCount === Math.max(...notice.pollOptions.map(o => (notice.pollVotes || []).filter(v => v.optionId === o.id).length));
              return (
                <div key={opt.id}>
                  <div style={{
                    position: 'relative', padding: '12px 16px', borderRadius: 10, overflow: 'hidden',
                    border: `2px solid ${isWinning ? '#7c3aed' : T.border}`, background: T.bgCard,
                  }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: `${pct}%`, background: isWinning ? '#ede9fe' : '#f1f5f9',
                      transition: 'width 0.4s ease-out', borderRadius: 8,
                    }} />
                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: isWinning ? 700 : 500, color: T.text }}>{opt.text}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: isWinning ? '#7c3aed' : T.textMuted }}>
                        {pct}% <span style={{ fontWeight: 400, fontSize: 11 }}>({voteCount})</span>
                      </span>
                    </div>
                  </div>
                  {voters.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6, paddingLeft: 8 }}>
                      {voters.map(v => {
                        const cm = crew.find(c => c.id === v.crewMemberId);
                        return cm ? (
                          <span key={v.crewMemberId} style={{ fontSize: 11, color: T.textMuted, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 6, padding: '2px 8px' }}>
                            {cm.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {totalVotes < totalCrew && (
            <div style={{ marginTop: 12, fontSize: 12, color: T.textMuted }}>
              <span style={{ fontWeight: 600 }}>Haven&apos;t voted:</span>{' '}
              {crew.filter(cm => !(notice.pollVotes || []).some(v => v.crewMemberId === cm.id)).map(cm => cm.name).join(', ')}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 24, maxWidth: isDesktop ? 400 : undefined }}>
        <StatCard label="Read" value={`${notice.readBy.length}/${totalCrew}`} color={T.accent} icon={Icons.eye} />
        <StatCard label="Acknowledged" value={`${notice.acknowledgedBy.length}/${totalCrew}`} color={notice.priority === 'critical' ? T.critical : T.success} icon={Icons.checkCircle} />
      </div>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>Crew Status</h3>
      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr', gap: 6 }}>
        {crew.map(cm => {
          const hasRead = notice.readBy.includes(cm.id);
          const hasAcked = notice.acknowledgedBy.includes(cm.id);
          const status = hasAcked ? 'Acknowledged' : hasRead ? 'Read' : 'Not read';
          const statusColor = hasAcked ? T.success : hasRead ? T.accent : T.critical;
          return (
            <div key={cm.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: T.bgCard, borderRadius: 12, border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
              <Avatar initials={cm.avatar} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{cm.name}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{cm.role}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: statusColor }}>{status}</span>
            </div>
          );
        })}
      </div>
      {/* Smart Reminders panel */}
      <div style={{ marginTop: 24, padding: 16, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, boxShadow: T.shadow }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>Smart Reminders</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: T.textMuted, fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={autoRemind}
              onChange={(e) => toggleAutoRemind(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: T.accent, cursor: 'pointer' }}
            />
            Auto-remind non-readers after 24h
          </label>
        </div>
        {autoRemind && (
          <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 10, padding: '8px 12px', background: T.accentTint, borderRadius: 8 }}>
            Escalation schedule: 24h → 48h → 72h. After 72h, this notice will appear in &quot;Needs Attention&quot;.
          </div>
        )}
        {reminderHistory.length > 0 ? (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Reminder History</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {reminderHistory.map((a, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, padding: '6px 10px', background: T.bg, borderRadius: 6 }}>
                  <span style={{ color: T.text }}>
                    Reminder sent{a.metadata?.recipientCount ? ` to ${a.metadata.recipientCount} crew` : ''}
                  </span>
                  <span style={{ color: T.textMuted, fontSize: 11 }}>{formatTime(a.createdAt || a.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: T.textMuted }}>No reminders sent yet.</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 16, maxWidth: isDesktop ? 500 : undefined }}>
        {nonReaderCount > 0 && (
          <button
            onClick={handleReminder}
            disabled={reminderState !== 'idle'}
            style={{
              flex: 1, padding: 14, borderRadius: 12,
              border: `1px solid ${reminderState === 'sent' ? T.success : reminderState === 'error' ? T.critical : T.gold}`,
              background: reminderState === 'sent' ? '#f0fdf4' : reminderState === 'error' ? T.criticalTint : T.goldTint,
              color: reminderState === 'sent' ? T.success : reminderState === 'error' ? T.critical : '#b45309',
              fontSize: 14, fontWeight: 700,
              cursor: reminderState === 'idle' ? 'pointer' : 'default',
              opacity: reminderState === 'sending' ? 0.7 : 1,
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {reminderState === 'sending' ? 'Sending...' :
             reminderState === 'sent' ? `${Icons.checkCircle} Sent to ${nonReaderCount} crew` :
             reminderState === 'error' ? 'Failed \u2014 try again' :
             `Send Reminder to ${nonReaderCount} Non-Reader${nonReaderCount > 1 ? 's' : ''}`}
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} style={{ flex: 1, padding: 14, borderRadius: 12, border: `1px solid ${T.critical}`, background: T.criticalTint, color: T.critical, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}>
            {Icons.trash} Delete Notice
          </button>
        )}
      </div>
    </div>
  );
}
