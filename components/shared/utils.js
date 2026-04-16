import T from './theme';
import Icons from './Icons';

// Returns metadata about a notice's expiry state so callers can render a
// consistent "Valid until" / "Expired" pill without re-doing the date math.
// null => no expiry set; active => not yet expired; expired => past the date.
export function getValidityInfo(validUntil) {
  if (!validUntil) return null;
  const expiry = new Date(validUntil);
  if (Number.isNaN(expiry.getTime())) return null;
  const expired = expiry.getTime() <= Date.now();
  const label = expiry.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return { expired, label, expiry };
}

// Small pill-shaped validity indicator shared by NoticeCard / NoticeDetail /
// AdminNoticeDetail. Returns null when there's no validUntil so the caller
// can drop it in unconditionally.
export function ValidityPill({ validUntil, size = 'sm' }) {
  const info = getValidityInfo(validUntil);
  if (!info) return null;
  const { expired, label } = info;
  const fontSize = size === 'lg' ? 12 : 10;
  const padding = size === 'lg' ? '5px 10px' : '3px 8px';
  return (
    <span style={{
      fontSize,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      color: expired ? T.critical : T.textMuted,
      background: expired ? T.criticalTint : T.bg,
      padding,
      borderRadius: 6,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
    }}>
      {expired ? 'Expired' : `Valid until ${label}`}
    </span>
  );
}

// ─── Poll Results Bar ───────────────────────────────────────────────
export function PollResultsBar({ option, voteCount, totalVotes, isSelected, percentage }) {
  return (
    <div style={{
      position: 'relative', padding: '14px 16px', borderRadius: 12, overflow: 'hidden',
      border: `2px solid ${isSelected ? T.accent : T.border}`,
      background: T.bgCard, transition: 'border-color 0.2s',
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: `${percentage}%`, background: isSelected ? T.accentGlow : T.bg,
        transition: 'width 0.4s ease-out', borderRadius: 10,
      }} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: isSelected ? 700 : 500, color: T.text, display: 'flex', alignItems: 'center', gap: 8 }}>
          {isSelected && <span style={{ color: T.accent }}>{Icons.checkCircle}</span>}
          {option.text}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? T.accent : T.textMuted }}>
          {percentage}%
          <span style={{ fontWeight: 400, fontSize: 11, marginLeft: 4 }}>({voteCount})</span>
        </span>
      </div>
    </div>
  );
}
