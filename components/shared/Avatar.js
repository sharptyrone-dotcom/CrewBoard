import T from './theme';

export default function Avatar({ initials, online, size = 36 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg, ${T.navy}, ${T.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 700, color: '#fff', flexShrink: 0, boxShadow: '0 4px 10px rgba(59,130,246,0.25)' }}>
      {initials}
      {online !== undefined && (
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: online ? T.success : T.textDim, border: `2px solid #fff` }} />
      )}
    </div>
  );
}
