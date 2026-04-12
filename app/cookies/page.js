import Link from 'next/link';

export const metadata = {
  title: 'Cookie Policy — CrewBoard',
  description: 'How CrewBoard uses cookies and local storage.',
};

const S = {
  page: { background: '#0f172a', color: '#e2e8f0', minHeight: '100vh', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  wrap: { maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' },
  back: { display: 'inline-flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 32 },
  h1: { fontSize: 32, fontWeight: 800, color: '#f8fafc', margin: '0 0 8px', letterSpacing: '-0.02em' },
  updated: { fontSize: 13, color: '#64748b', margin: '0 0 40px' },
  h2: { fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: '40px 0 12px', paddingBottom: 8, borderBottom: '1px solid #1e293b' },
  p: { fontSize: 14, lineHeight: 1.75, color: '#94a3b8', margin: '0 0 14px' },
  strong: { color: '#cbd5e1', fontWeight: 600 },
  table: { width: '100%', borderCollapse: 'collapse', margin: '12px 0 20px', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 14px', background: '#1e293b', color: '#cbd5e1', fontWeight: 700, borderBottom: '1px solid #334155' },
  td: { padding: '10px 14px', borderBottom: '1px solid #1e293b', color: '#94a3b8' },
  footer: { marginTop: 48, paddingTop: 24, borderTop: '1px solid #1e293b', display: 'flex', gap: 20, fontSize: 13, flexWrap: 'wrap' },
  footerLink: { color: '#64748b', textDecoration: 'none' },
};

export default function CookiePolicyPage() {
  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <Link href="/" style={S.back}>&larr; Back to CrewBoard</Link>

        <h1 style={S.h1}>Cookie Policy</h1>
        <p style={S.updated}>Last updated: 12 April 2026</p>

        {/* ── 1 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>1. What are cookies?</h2>
        <p style={S.p}>
          Cookies are small text files stored on your device by your web browser.
          CrewBoard is a Progressive Web App (PWA) designed primarily for use on vessel
          networks, and uses a minimal number of cookies and local storage entries
          to function.
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
        <h2 style={S.h2}>3. Local storage</h2>
        <p style={S.p}>
          In addition to cookies, CrewBoard uses browser local storage for:
        </p>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Key</th>
              <th style={S.th}>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={S.td}>Supabase auth tokens</td>
              <td style={S.td}>Persists your login session across browser restarts</td>
            </tr>
            <tr>
              <td style={S.td}>Service worker cache</td>
              <td style={S.td}>Stores app assets and documents for offline access</td>
            </tr>
          </tbody>
        </table>

        {/* ── 4 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>4. Third-party cookies</h2>
        <p style={S.p}>
          CrewBoard does <strong style={S.strong}>not</strong> use any third-party analytics,
          advertising, or tracking cookies. We do not use Google Analytics, Facebook Pixel,
          or any similar services. No data is shared with advertising networks.
        </p>

        {/* ── 5 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>5. Managing cookies</h2>
        <p style={S.p}>
          You can clear cookies at any time through your browser settings. Note that
          clearing the Supabase auth cookie will sign you out and you will need to log
          in again. Since CrewBoard only uses essential cookies required for the service
          to function, disabling them may prevent you from using the platform.
        </p>

        {/* ── 6 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>6. Contact</h2>
        <p style={S.p}>
          If you have questions about our use of cookies, contact us
          at <strong style={S.strong}>privacy@crewboard.app</strong>.
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
