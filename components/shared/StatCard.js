import T from './theme';

export default function StatCard({ label, value, color = T.accent, icon }) {
  return (
    <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: '20px 18px', flex: 1, minWidth: 0, boxShadow: T.shadow }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        <span style={{ fontSize: 26, fontWeight: 800, color: T.text, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.02em' }}>{value}</span>
      </div>
      <div style={{ fontSize: 12, color: T.textMuted, fontWeight: 500, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}
