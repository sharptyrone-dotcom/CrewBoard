import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — CrewNotice',
  description: 'Terms and conditions for using the CrewNotice platform.',
};

const S = {
  page: { background: '#0f172a', color: '#e2e8f0', minHeight: '100vh', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  wrap: { maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' },
  back: { display: 'inline-flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 32 },
  h1: { fontSize: 32, fontWeight: 800, color: '#f8fafc', margin: '0 0 8px', letterSpacing: '-0.02em' },
  updated: { fontSize: 13, color: '#64748b', margin: '0 0 40px' },
  h2: { fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: '40px 0 12px', paddingBottom: 8, borderBottom: '1px solid #1e293b' },
  p: { fontSize: 14, lineHeight: 1.75, color: '#94a3b8', margin: '0 0 14px' },
  ul: { fontSize: 14, lineHeight: 1.75, color: '#94a3b8', margin: '0 0 14px', paddingLeft: 20 },
  li: { marginBottom: 6 },
  strong: { color: '#cbd5e1', fontWeight: 600 },
  footer: { marginTop: 48, paddingTop: 24, borderTop: '1px solid #1e293b', display: 'flex', gap: 20, fontSize: 13, flexWrap: 'wrap' },
  footerLink: { color: '#64748b', textDecoration: 'none' },
};

export default function TermsPage() {
  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <Link href="/" style={S.back}>&larr; Back to CrewNotice</Link>

        <h1 style={S.h1}>Terms of Service</h1>
        <p style={S.updated}>Last updated: 12 April 2026</p>

        {/* ── 1 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>1. Service description</h2>
        <p style={S.p}>
          CrewNotice is a web-based operational compliance platform designed for superyacht
          crew. It provides notice boards, document management, training modules with
          quizzes, event coordination, and compliance reporting. The service is delivered
          as a Progressive Web App (PWA) accessible via modern web browsers.
        </p>

        {/* ── 2 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>2. Acceptance of terms</h2>
        <p style={S.p}>
          By creating an account or accessing CrewNotice through a vessel invitation, you
          agree to be bound by these Terms of Service. If you do not agree, do not use the
          service. Your vessel operator may have additional policies that apply to your
          use of CrewNotice.
        </p>

        {/* ── 3 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>3. User accounts and responsibilities</h2>
        <p style={S.p}>As a crew member using CrewNotice, you agree to:</p>
        <ul style={S.ul}>
          <li style={S.li}>Provide accurate personal information during registration</li>
          <li style={S.li}>Keep your login credentials secure and not share them with others</li>
          <li style={S.li}>Promptly read and acknowledge safety-critical notices and required documents</li>
          <li style={S.li}>Complete assigned training modules within the specified deadlines</li>
          <li style={S.li}>Use the platform only for its intended operational purpose</li>
          <li style={S.li}>Report any security concerns or unauthorised access to your vessel administrator</li>
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
        <h2 style={S.h2}>5. Vessel operator responsibilities</h2>
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

        {/* ── 6 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>6. Content and data accuracy</h2>
        <p style={S.p}>
          CrewNotice is a tool that facilitates the distribution of operational information.
          The accuracy of notices, documents, training materials, and event details is the
          sole responsibility of the vessel operator and content authors. CrewNotice does not
          independently verify the correctness, completeness, or regulatory compliance of
          any content uploaded to the platform.
        </p>

        {/* ── 7 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>7. Availability and support</h2>
        <p style={S.p}>
          We aim to maintain high availability but do not guarantee uninterrupted access.
          The service may be temporarily unavailable due to maintenance, updates, or
          circumstances beyond our control (including vessel connectivity limitations).
          The PWA&rsquo;s offline capabilities provide limited access to cached content when
          connectivity is unavailable.
        </p>

        {/* ── 8 ──────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>8. Intellectual property</h2>
        <p style={S.p}>
          The CrewNotice platform, including its design, code, and branding, is the
          intellectual property of Sharp Digital Solutions Ltd. Content uploaded by vessel operators
          and crew members remains the property of the respective owners. By uploading
          content, you grant CrewNotice a limited licence to store and display it within
          the platform for its intended purpose.
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
        <h2 style={S.h2}>10. Termination</h2>
        <p style={S.p}>
          Your access to CrewNotice may be terminated by your vessel operator at any time
          (e.g. when you leave the vessel). We may also suspend or terminate accounts that
          violate these terms. Upon termination, your personal data will be handled in
          accordance with our Privacy Policy and applicable data retention requirements.
        </p>

        {/* ── 11 ─────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>11. Changes to these terms</h2>
        <p style={S.p}>
          We may update these terms from time to time. Material changes will be communicated
          via an in-app notification. Continued use of the service after changes constitutes
          acceptance of the revised terms.
        </p>

        {/* ── 12 ─────────────────────────────────────────────────────── */}
        <h2 style={S.h2}>12. Governing law</h2>
        <p style={S.p}>
          These terms are governed by the laws of England and Wales. Any disputes shall
          be subject to the exclusive jurisdiction of the courts of England and Wales.
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
