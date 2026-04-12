import T from './theme';

export default function ComplianceBar({ value }) {
  return (
    <div style={{ height: 6, background: T.border, borderRadius: 3, overflow: 'hidden', width: '100%' }}>
      <div style={{ height: '100%', width: `${value}%`, background: value > 80 ? T.success : value > 50 ? T.gold : T.critical, borderRadius: 3, transition: 'width 0.6s ease' }} />
    </div>
  );
}
