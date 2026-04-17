import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service',
  description:
    'Terms and conditions for using CrewNotice. Subscription terms and governing law.',
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
  footer: { marginTop: 48, paddingTop: 24, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 20, fontSize: 13, flexWrap: 'wrap' },
  footerLink: { color: '#94a3b8', textDecoration: 'none' },
};

export default function TermsPage() {
  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <Link href="/" style={S.back}>&larr; Back to CrewNotice</Link>

        <h1 style={S.h1}>Terms of Service</h1>
        <p style={S.updated}>Last updated: 13 April 2026</p>

        <p style={S.p}>
          These Terms of Service govern your use of CrewNotice, a product
          of <strong style={S.strong}>Sharp Digital Solutions Ltd</strong>, registered
          at 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ.
        </p>

        {/* ── 1 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>1. Service description</h2>
        <p style={S.p}>
          CrewNotice is a web-based operational compliance platform designed for superyacht
          crew. It provides notice boards, document management, training modules with
          quizzes, event coordination, and compliance reporting. The service is delivered
          as a Progressive Web App (PWA) accessible via modern web browsers.
        </p>

        {/* ── 2 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>2. User accounts</h2>
        <p style={S.p}>
          By creating an account or accessing CrewNotice through a vessel invitation, you
          agree to be bound by these Terms of Service. If you do not agree, do not use the
          service. As a user, you agree to:
        </p>
        <ul style={S.ul}>
          <li style={S.li}>Provide accurate personal information during registration</li>
          <li style={S.li}>Keep your login credentials secure and not share them with others</li>
          <li style={S.li}>Promptly read and acknowledge safety-critical notices and required documents</li>
          <li style={S.li}>Complete assigned training modules within the specified deadlines</li>
          <li style={S.li}>Use the platform only for its intended operational purpose</li>
          <li style={S.li}>Report any security concerns or unauthorised access to your vessel administrator</li>
        </ul>

        {/* ── 3 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>3. Vessel administrator responsibilities</h2>
        <p style={S.p}>
          The vessel operator (admin) is responsible for:
        </p>
        <ul style={S.ul}>
          <li style={S.li}>Managing crew invitations and access to the vessel workspace</li>
          <li style={S.li}>Ensuring the accuracy and timeliness of safety notices and operational documents</li>
          <li style={S.li}>Maintaining compliance with applicable maritime regulations (ISM Code, MLC 2006, flag state requirements)</li>
          <li style={S.li}>Deactivating accounts for crew members who leave the vessel</li>
          <li style={S.li}>Acting as the data controller for personal data processed through CrewNotice</li>
        </ul>

        {/* ── 4 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>4. Acceptable use</h2>
        <p style={S.p}>You must not:</p>
        <ul style={S.ul}>
          <li style={S.li}>Use CrewNotice for any purpose unrelated to vessel operations</li>
          <li style={S.li}>Attempt to access data belonging to other vessels or crew members outside your assignment</li>
          <li style={S.li}>Upload malicious files, offensive content, or content that violates any law</li>
          <li style={S.li}>Attempt to circumvent security controls, row-level policies, or access restrictions</li>
          <li style={S.li}>Use automated tools to scrape or extract data from the platform</li>
          <li style={S.li}>Share confidential vessel operational information outside CrewNotice</li>
        </ul>

        {/* ── 5 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>5. Data accuracy disclaimer</h2>
        <p style={S.p}>
          CrewNotice is a tool that facilitates the distribution of operational information.
          The accuracy of notices, documents, training materials, and event details is the
          sole responsibility of the vessel operator and content authors. Sharp Digital
          Solutions Ltd does not independently verify the correctness, completeness, or
          regulatory compliance of any content uploaded to the platform.
        </p>

        {/* ── 6 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>6. Intellectual property</h2>
        <p style={S.p}>
          The CrewNotice platform, including its design, code, and branding, is the
          intellectual property of Sharp Digital Solutions Ltd. Content uploaded by vessel operators
          and crew members remains the property of the respective owners. By uploading
          content, you grant CrewNotice a limited licence to store and display it within
          the platform for its intended purpose.
        </p>

        {/* ── 7 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>7. Subscription and billing</h2>
        <p style={S.p}>
          Access to CrewNotice is provided on a subscription basis to vessel operators.
          Subscription fees, payment terms, and plan details are agreed between Sharp
          Digital Solutions Ltd and the vessel operator. Individual crew members are not
          billed directly. Failure to maintain an active subscription may result in
          restricted access to the platform.
        </p>

        {/* ── 8 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>8. Cancellation</h2>
        <p style={S.p}>
          Vessel operators may cancel their subscription at any time. Upon cancellation,
          access to the platform will continue until the end of the current billing period.
          Data will be retained for 12 months following cancellation, after which it will
          be securely deleted unless a longer retention period is required by law.
          Individual crew accounts may be deactivated by the vessel administrator at any time.
        </p>

        {/* ── 9 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>9. Limitation of liability</h2>
        <p style={S.p}>
          To the fullest extent permitted by law, Sharp Digital Solutions Ltd shall not be liable for
          any indirect, incidental, consequential, or punitive damages arising from your
          use of the service. This includes, but is not limited to, loss of data,
          regulatory penalties, or operational disruptions. Our total liability shall not
          exceed the fees paid by your vessel operator in the twelve months preceding the
          claim.
        </p>
        <p style={S.p}>
          CrewNotice is <strong style={S.strong}>not a substitute</strong> for proper maritime
          safety management systems, qualified personnel, or professional legal and
          regulatory advice.
        </p>

        {/* ── 10 ─────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>10. Governing law</h2>
        <p style={S.p}>
          These terms are governed by the laws of England and Wales. Any disputes shall
          be subject to the exclusive jurisdiction of the courts of England and Wales.
        </p>

        {/* ── 11 ─────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>11. Changes to these terms</h2>
        <p style={S.p}>
          We may update these terms from time to time. Material changes will be communicated
          via an in-app notification. Continued use of the service after changes constitutes
          acceptance of the revised terms.
        </p>

        {/* ── 12 ─────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>12. Contact details</h2>
        <p style={S.p}>
          <strong style={S.strong}>Sharp Digital Solutions Ltd</strong><br />
          71-75 Shelton Street, Covent Garden, London, WC2H 9JQ<br />
          Email: <strong style={S.strong}>hello@crewnotice.app</strong>
        </p>

        {/* Footer nav */}
        <div style={S.footer}>
          <Link href="/privacy" style={S.footerLink}>Privacy Policy</Link>
          <Link href="/cookies" style={S.footerLink}>Cookie Policy</Link>
          <Link href="/" style={S.footerLink}>Home</Link>
        </div>
      </div>
    </div>
  );
}
