import T, { PRIORITIES } from './theme';

export function PriorityBadge({ priority }) {
  const bg = priority === 'critical' ? T.criticalTint : priority === 'important' ? T.goldTint : T.bg;
  return (
    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: PRIORITIES[priority], background: bg, padding: '4px 9px', borderRadius: 6 }}>
      {priority}
    </span>
  );
}

export function CategoryBadge({ category }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.8, color: T.accentDark, background: T.accentGlow, padding: '4px 9px', borderRadius: 6 }}>
      {category}
    </span>
  );
}
