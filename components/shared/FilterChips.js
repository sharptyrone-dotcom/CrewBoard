import T from './theme';

export default function FilterChips({ options, selected, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)} style={{ padding: '8px 16px', borderRadius: 20, border: `1px solid ${selected === opt ? T.accent : T.border}`, background: selected === opt ? T.accentTint : T.bgCard, color: selected === opt ? T.accentDark : T.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
          {opt}
        </button>
      ))}
    </div>
  );
}
