import T from './theme';
import Icons from './Icons';

export default function BackButton({ onClick, label = 'Back' }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: T.accent, fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '8px 0', marginBottom: 8 }}>
      {Icons.arrowLeft} {label}
    </button>
  );
}
