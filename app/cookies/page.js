import Link from 'next/link';

export const metadata = {
  title: 'Cookie Policy',
  description:
    'CrewNotice uses essential cookies only. No tracking or advertising cookies.',
};

const S = {
  page: { background: '#ffffff', color: '#0f172a', minHeight: '100vh', fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif" },
  wrap: { maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' },
  back: { display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 32 },
  h1: { fontSize: 32, fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.02em' },
  updated: { fontSize: 13, color: '#94a3b8', margin: '0 0 40px' },
  h2: { fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '40px 0 12px', paddingBottom: 8, borderBottom: '1px solid #e2e8f0' },
  p: { fontSize: 14, lineHeight: 1.75, color: '#475569', margin: '0 0 14px' },
  strong: { color: '#0f172a', fontWeight: 600 },
  table: { width: '100%', borderCollapse: 'collapse', margin: '12px 0 20px', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 14px', background: '#f1f5f9', color: '#334155', fontWeight: 700, borderBottom: '1px solid #e2e8f0' },
  td: { padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569' },
  footer: { marginTop: 48, paddingTop: 24, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 20, fontSize: 13, flexWrap: 'wrap' },
  footerLink: { color: '#94a3b8', textDecoration: 'none' },
};

export default function CookiePolicyPage() {
  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <Link href="/" style={S.back}>&larr; Back to CrewNotice</Link>

        <h1 style={S.h1}>Cookie Policy</h1>
        <p style={S.updated}>Last updated: 13 April 2026</p>

        <p style={S.p}>
          This cookie policy explains how <strong style={S.strong}>Sharp Digital Solutions
          Ltd</strong> uses cookies on CrewNotice.
        </p>

        {/* ── 1 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>1. Essential cookies only</h2>
        <p style={S.p}>
          CrewNotice uses <strong style={S.strong}>essential cookies only</strong>. These
          are strictly necessary for the platform to function and cannot be disabled.
          We do not use any advertising, marketing, or third-party tracking cookies.
        </p>

        {/* ── 2 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>2. Cookies we use</h2>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Name</th>
              <th style={S.th}>Type</th>
              <th style={S.th}>Purpose</th>
              <th style={S.th}>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={S.td}><code>sb-*-auth-token</code></td>
              <td style={S.td}>Essential</td>
              <td style={S.td}>Supabase authentication session. Keeps you logged in.</td>
              <td style={S.td}>Session / 7 days</td>
            </tr>
            <tr>
              <td style={S.td}><code>cb_consent</code></td>
              <td style={S.td}>Essential</td>
              <td style={S.td}>Records that you have acknowledged this cookie notice.</td>
              <td style={S.td}>365 days</td>
            </tr>
          </tbody>
        </table>

        {/* ── 3 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>3. Managing cookies</h2>
        <p style={S.p}>
          You can clear cookies at any time through your browser settings. Note that
          clearing the Supabase auth cookie will sign you out and you will need to log
          in again. Since CrewNotice only uses essential cookies required for the service
          to function, disabling them may prevent you from using the platform.
        </p>

        {/* ── 4 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>4. Contact</h2>
        <p style={S.p}>
          If you have questions about our use of cookies, contact us:
        </p>
        <p style={S.p}>
          <strong style={S.strong}>Sharp Digital Solutions Ltd</strong><br />
          71-75 Shelton Street, Covent Garden, London, WC2H 9JQ<br />
          Email: <strong style={S.strong}>privacy@crewnotice.app</strong>
        </p>

        {/* Footer nav */}
        <div style={S.footer}>
          <Link href="/privacy" style={S.footerLink}>Privacy Policy</Link>
          <Link href="/terms" style={S.footerLink}>Terms of Service</Link>
          <Link href="/" style={S.footerLink}>Home</Link>
        </div>
      </div>
    </div>
  );
}
