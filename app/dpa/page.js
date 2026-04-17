import Link from 'next/link';

export const metadata = {
  title: 'Data Processing Agreement',
  description:
    'A DPA is available on request for Fleet customers. Contact hello@crewnotice.com.',
};

const S = {
  page: { background: '#ffffff', color: '#0f172a', minHeight: '100vh', fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif" },
  wrap: { maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' },
  back: { display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 32 },
  h1: { fontSize: 32, fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.02em' },
  date: { fontSize: 13, color: '#64748b', marginBottom: 32 },
  p: { fontSize: 15, lineHeight: 1.7, color: '#334155', margin: '0 0 16px' },
  link: { color: '#3b82f6', fontWeight: 600, textDecoration: 'none' },
};

export default function DpaPage() {
  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <Link href="/" style={S.back}>&larr; Home</Link>
        <h1 style={S.h1}>Data Processing Agreement</h1>
        <p style={S.date}>Last updated: April 2026</p>

        <p style={S.p}>
          A Data Processing Agreement (DPA) is available on request for Fleet customers. The DPA
          covers the processing of personal data under UK GDPR and EU GDPR, including details of
          sub-processors, data retention, and security measures.
        </p>

        <p style={S.p}>
          To request a copy of the DPA, please contact us at{' '}
          <a href="mailto:hello@crewnotice.com" style={S.link}>hello@crewnotice.com</a>.
        </p>

        <p style={S.p}>
          For details on how we handle personal data, see our{' '}
          <Link href="/privacy" style={S.link}>Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
