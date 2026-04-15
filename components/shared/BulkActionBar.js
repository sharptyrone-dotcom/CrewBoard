import T from './theme';
import Icons from './Icons';

// Floating action bar shown when one or more items are selected for bulk ops.
// Actions is an array of { label, icon?, onClick, destructive? }.
const BulkActionBar = ({ count, onClear, actions = [], label = 'selected' }) => {
  if (!count) return null;
  return (
    <div style={{
      position: 'sticky',
      top: 8,
      zIndex: 40,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 14px',
      background: T.text,
      color: '#fff',
      borderRadius: 12,
      boxShadow: T.shadowLg,
      marginBottom: 12,
      flexWrap: 'wrap',
    }}>
      <button
        onClick={onClear}
        aria-label="Clear selection"
        style={{
          width: 30, height: 30, borderRadius: 8, border: 'none',
          background: 'rgba(255,255,255,0.14)', color: '#fff',
          cursor: 'pointer', display: 'grid', placeItems: 'center',
        }}
      >
        {Icons.x}
      </button>
      <div style={{ fontSize: 13, fontWeight: 700, flex: 1, minWidth: 120 }}>
        {count} {label}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {actions.map((a, i) => (
          <button
            key={i}
            onClick={a.onClick}
            disabled={a.disabled}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: 'none',
              background: a.destructive ? T.critical : 'rgba(255,255,255,0.14)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              cursor: a.disabled ? 'default' : 'pointer',
              opacity: a.disabled ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {a.icon}
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BulkActionBar;
