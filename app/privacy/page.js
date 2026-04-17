import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy',
  description:
    'How Sharp Digital Solutions Ltd handles personal data in CrewNotice. UK GDPR compliant.',
};

const S = {
  page: { background: '#ffffff', color: '#0f172a', minHeight: '100vh', fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif" },
  wrap: { maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' },
  back: { display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 32 },
  h1: { fontSize: 32, fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.02em' },
  updated: { fontSize: 13, color: '#94a3b8', margin: '0 0 40px' },
  h2: { fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '40px 0 12px', paddingBottom: 8, borderBottom: '1px solid #e2e8f0' },
  p: { fontSize: 14, lineHeight: 1.75, color: '#475569', margin: '0 0 14px' },
  ul: { fontSize: 14, lineHeight: 1.75, color: '#475569', margin: '0 0 14px', paddingLeft: 20 },
  li: { marginBottom: 6 },
  strong: { color: '#0f172a', fontWeight: 600 },
  table: { width: '100%', borderCollapse: 'collapse', margin: '12px 0 20px', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 14px', background: '#f1f5f9', color: '#334155', fontWeight: 700, borderBottom: '1px solid #e2e8f0' },
  td: { padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569' },
  footer: { marginTop: 48, paddingTop: 24, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 20, fontSize: 13, flexWrap: 'wrap' },
  footerLink: { color: '#94a3b8', textDecoration: 'none' },
};

export default function PrivacyPolicyPage() {
  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <Link href="/" style={S.back}>&larr; Back to CrewNotice</Link>

        <h1 style={S.h1}>Privacy Policy</h1>
        <p style={S.updated}>Last updated: 13 April 2026</p>

        {/* ── 1 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>1. Who we are</h2>
        <p style={S.p}>
          CrewNotice is an operational compliance platform for superyacht crew, provided
          by <strong style={S.strong}>Sharp Digital Solutions Ltd</strong>, a company registered
          in England and Wales.
        </p>
        <p style={S.p}>
          <strong style={S.strong}>Registered address:</strong> 71-75 Shelton Street,
          Covent Garden, London, WC2H 9JQ
        </p>
        <p style={S.p}>
          Sharp Digital Solutions Ltd is the <strong style={S.strong}>data controller</strong> for
          personal data processed through CrewNotice. Where a vessel operator administers
          their own workspace, they may also act as a data controller for their crew&rsquo;s
          data, and Sharp Digital Solutions Ltd acts as a <strong style={S.strong}>data
          processor</strong> on their behalf.
        </p>

        {/* ── 2 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>2. What data we collect</h2>
        <table style={S.table}>
          <thead>
            <tr><th style={S.th}>Category</th><th style={S.th}>Data</th><th style={S.th}>Purpose</th></tr>
          </thead>
          <tbody>
            <tr><td style={S.td}>Account</td><td style={S.td}>Name, email address, role, department</td><td style={S.td}>Authentication and vessel crew management</td></tr>
            <tr><td style={S.td}>Activity</td><td style={S.td}>Activity logs, read receipts, document acknowledgements, training records</td><td style={S.td}>Operational compliance tracking</td></tr>
            <tr><td style={S.td}>Usage</td><td style={S.td}>Login timestamps, feature access logs</td><td style={S.td}>Audit trail and security</td></tr>
            <tr><td style={S.td}>Device</td><td style={S.td}>Push subscription endpoint (if opted in)</td><td style={S.td}>Delivering push notifications</td></tr>
          </tbody>
        </table>
        <p style={S.p}>
          We do <strong style={S.strong}>not</strong> collect location data, financial information,
          biometric data, or any special-category personal data.
        </p>

        {/* ── 3 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>3. How we use your data</h2>
        <ul style={S.ul}>
          <li style={S.li}>Operational compliance tracking (notice reads, document acknowledgements, training completion)</li>
          <li style={S.li}>Crew communications and notifications</li>
          <li style={S.li}>Training delivery and progress tracking</li>
          <li style={S.li}>Generating compliance reports for vessel management</li>
          <li style={S.li}>Maintaining audit trails required under ISM Code and MLC 2006</li>
        </ul>

        {/* ── 4 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>4. Legal basis for processing</h2>
        <p style={S.p}>
          We process your data under <strong style={S.strong}>legitimate interests</strong> (vessel
          safety and regulatory compliance) and <strong style={S.strong}>contractual necessity</strong> (your
          employment agreement with the vessel operator). For push notifications and email
          reminders, we rely on your <strong style={S.strong}>consent</strong>, which you can withdraw at
          any time by disabling notifications in your device settings.
        </p>

        {/* ── 5 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>5. Data retention</h2>
        <p style={S.p}>
          Personal data is retained for the duration of the vessel&rsquo;s subscription
          plus 12 months. After this period, data is securely deleted unless a longer
          retention period is required by applicable maritime regulations.
        </p>

        {/* ── 6 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>6. Data processors</h2>
        <p style={S.p}>Your data is processed by the following sub-processors:</p>
        <ul style={S.ul}>
          <li style={S.li}><strong style={S.strong}>Supabase</strong> &mdash; database and authentication</li>
          <li style={S.li}><strong style={S.strong}>Vercel</strong> &mdash; application hosting</li>
        </ul>
        <p style={S.p}>
          All data is stored within the European Economic Area. No personal data is transferred
          outside the EEA.
        </p>

        {/* ── 7 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>7. Your rights</h2>
        <p style={S.p}>
          As a crew member, you have the right to:
        </p>
        <ul style={S.ul}>
          <li style={S.li}><strong style={S.strong}>Access</strong> &mdash; request a copy of all personal data we hold about you</li>
          <li style={S.li}><strong style={S.strong}>Correction</strong> &mdash; correct any inaccurate personal data</li>
          <li style={S.li}><strong style={S.strong}>Deletion</strong> &mdash; request deletion of your data upon request to your vessel administrator</li>
          <li style={S.li}><strong style={S.strong}>Portability</strong> &mdash; receive your data in a structured, machine-readable format</li>
          <li style={S.li}><strong style={S.strong}>Objection</strong> &mdash; object to processing based on legitimate interests</li>
          <li style={S.li}><strong style={S.strong}>Withdraw consent</strong> &mdash; for consent-based processing (e.g. push notifications)</li>
        </ul>
        <p style={S.p}>
          To exercise any of these rights, contact your vessel administrator in the first
          instance, or contact us at the address below.
        </p>

        {/* ── 8 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>8. GDPR compliance</h2>
        <p style={S.p}>
          Sharp Digital Solutions Ltd is a UK-registered company and is fully compliant
          with the UK General Data Protection Regulation (UK GDPR) and the Data Protection
          Act 2018 when processing crew data. We implement appropriate technical and
          organisational measures to protect personal data, including encryption in transit
          (TLS 1.3), encryption at rest (AES-256), row-level security policies on all
          database tables, and role-based access controls.
        </p>

        {/* ── 9 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>9. Contact</h2>
        <p style={S.p}>
          For privacy enquiries, contact your vessel administrator in the first instance.
          For questions about CrewNotice&rsquo;s data processing practices:
        </p>
        <p style={S.p}>
          <strong style={S.strong}>Sharp Digital Solutions Ltd</strong><br />
          71-75 Shelton Street, Covent Garden, London, WC2H 9JQ<br />
          Email: <strong style={S.strong}>privacy@crewnotice.app</strong>
        </p>

        {/* Footer nav */}
        <div style={S.footer}>
          <Link href="/terms" style={S.footerLink}>Terms of Service</Link>
          <Link href="/cookies" style={S.footerLink}>Cookie Policy</Link>
          <Link href="/" style={S.footerLink}>Home</Link>
        </div>
      </div>
    </div>
  );
}
