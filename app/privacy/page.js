import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — CrewNotice',
  description: 'How CrewNotice collects, uses, and protects your personal data.',
};

const S = {
  page: { background: '#0f172a', color: '#e2e8f0', minHeight: '100vh', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  wrap: { maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' },
  back: { display: 'inline-flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 32 },
  h1: { fontSize: 32, fontWeight: 800, color: '#f8fafc', margin: '0 0 8px', letterSpacing: '-0.02em' },
  updated: { fontSize: 13, color: '#64748b', margin: '0 0 40px' },
  h2: { fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: '40px 0 12px', paddingBottom: 8, borderBottom: '1px solid #1e293b' },
  h3: { fontSize: 15, fontWeight: 700, color: '#cbd5e1', margin: '24px 0 8px' },
  p: { fontSize: 14, lineHeight: 1.75, color: '#94a3b8', margin: '0 0 14px' },
  ul: { fontSize: 14, lineHeight: 1.75, color: '#94a3b8', margin: '0 0 14px', paddingLeft: 20 },
  li: { marginBottom: 6 },
  strong: { color: '#cbd5e1', fontWeight: 600 },
  table: { width: '100%', borderCollapse: 'collapse', margin: '12px 0 20px', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 14px', background: '#1e293b', color: '#cbd5e1', fontWeight: 700, borderBottom: '1px solid #334155' },
  td: { padding: '10px 14px', borderBottom: '1px solid #1e293b', color: '#94a3b8' },
  footer: { marginTop: 48, paddingTop: 24, borderTop: '1px solid #1e293b', display: 'flex', gap: 20, fontSize: 13, flexWrap: 'wrap' },
  footerLink: { color: '#64748b', textDecoration: 'none' },
};

export default function PrivacyPolicyPage() {
  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <Link href="/" style={S.back}>&larr; Back to CrewNotice</Link>

        <h1 style={S.h1}>Privacy Policy</h1>
        <p style={S.updated}>Last updated: 12 April 2026</p>

        {/* ── 1 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>1. Who we are</h2>
        <p style={S.p}>
          CrewNotice is an operational compliance platform for superyacht crew.
          The <strong style={S.strong}>data controller</strong> for your personal data is
          the vessel operator (your employer) who administers your vessel&rsquo;s CrewNotice
          workspace. Sharp Digital Solutions Ltd acts as a <strong style={S.strong}>data processor</strong> on
          their behalf.
        </p>

        {/* ── 2 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>2. What data we collect</h2>
        <table style={S.table}>
          <thead>
            <tr><th style={S.th}>Category</th><th style={S.th}>Data</th><th style={S.th}>Purpose</th></tr>
          </thead>
          <tbody>
            <tr><td style={S.td}>Account</td><td style={S.td}>Full name, email address, role, department</td><td style={S.td}>Authentication and vessel crew management</td></tr>
            <tr><td style={S.td}>Activity</td><td style={S.td}>Notice read receipts, document acknowledgements, training quiz scores</td><td style={S.td}>ISM/MLC compliance verification</td></tr>
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
          <li style={S.li}>Providing the CrewNotice service to your vessel</li>
          <li style={S.li}>Tracking operational compliance (notice reads, document acknowledgements, training completion)</li>
          <li style={S.li}>Generating compliance reports for vessel management</li>
          <li style={S.li}>Sending notifications (in-app, email, and push) about operational matters</li>
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
        <table style={S.table}>
          <thead>
            <tr><th style={S.th}>Data type</th><th style={S.th}>Retention period</th></tr>
          </thead>
          <tbody>
            <tr><td style={S.td}>Account data</td><td style={S.td}>Duration of employment + 12 months</td></tr>
            <tr><td style={S.td}>Compliance records (read receipts, quiz scores)</td><td style={S.td}>5 years (per ISM Code record-keeping requirements)</td></tr>
            <tr><td style={S.td}>Activity logs</td><td style={S.td}>12 months rolling</td></tr>
            <tr><td style={S.td}>Push subscriptions</td><td style={S.td}>Until revoked or device changes</td></tr>
          </tbody>
        </table>

        {/* ── 6 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>6. Where your data is stored</h2>
        <p style={S.p}>Your data is processed by the following sub-processors:</p>
        <ul style={S.ul}>
          <li style={S.li}><strong style={S.strong}>Supabase</strong> (database and authentication) &mdash; hosted on AWS eu-west-2 (London)</li>
          <li style={S.li}><strong style={S.strong}>Vercel</strong> (application hosting) &mdash; lhr1 region (London)</li>
          <li style={S.li}><strong style={S.strong}>Resend</strong> (transactional email) &mdash; EU infrastructure</li>
        </ul>
        <p style={S.p}>
          All data is stored within the European Economic Area. No personal data is transferred
          outside the EEA.
        </p>

        {/* ── 7 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>7. Your rights</h2>
        <p style={S.p}>Under the GDPR, you have the right to:</p>
        <ul style={S.ul}>
          <li style={S.li}><strong style={S.strong}>Access</strong> &mdash; request a copy of all personal data we hold about you</li>
          <li style={S.li}><strong style={S.strong}>Rectification</strong> &mdash; correct any inaccurate personal data</li>
          <li style={S.li}><strong style={S.strong}>Erasure</strong> &mdash; request deletion of your data (subject to legal retention obligations)</li>
          <li style={S.li}><strong style={S.strong}>Portability</strong> &mdash; receive your data in a structured, machine-readable format</li>
          <li style={S.li}><strong style={S.strong}>Objection</strong> &mdash; object to processing based on legitimate interests</li>
          <li style={S.li}><strong style={S.strong}>Withdraw consent</strong> &mdash; for consent-based processing (e.g. push notifications)</li>
        </ul>
        <p style={S.p}>
          To exercise any of these rights, contact your vessel&rsquo;s designated data controller
          (typically the vessel operator or captain) or email us at the address below.
        </p>

        {/* ── 8 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>8. Security</h2>
        <p style={S.p}>
          We protect your data with encryption in transit (TLS 1.3), encryption at rest
          (AES-256), row-level security policies on all database tables, and role-based
          access controls. The service role key used for server-side operations is never
          exposed to browser code.
        </p>

        {/* ── 9 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>9. Contact</h2>
        <p style={S.p}>
          For privacy enquiries, contact your vessel operator in the first instance.
          For questions about CrewNotice&rsquo;s data processing practices, email{' '}
          <strong style={S.strong}>privacy@crewnotice.app</strong>.
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
