import Link from 'next/link';
import '../landing.css';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata = {
  title: 'Security & Data Protection',
  description:
    'Enterprise-grade security. TLS 1.3 encryption, row-level database isolation, GDPR compliant. SOC 2 Type II certified infrastructure.',
};

const LockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ServerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </svg>
);

const KeyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const DatabaseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const ArchiveIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);

const AlertIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function SecurityPage() {
  return (
    <div className="lp-root">
      <MarketingNav />

      {/* Page Hero */}
      <section className="page-hero">
        <div className="wrap">
          <div className="section-eyebrow">Security</div>
          <h1>Security &amp; Data Protection</h1>
          <p className="page-subtitle">
            Your vessel&apos;s operational data is sensitive. Here&apos;s how we protect it.
          </p>
        </div>
      </section>

      {/* Section 1 — Infrastructure */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">Infrastructure</div>
            <h2>Built on enterprise-grade foundations</h2>
            <p className="section-sub">Every layer of the CrewNotice stack is designed with security as a default, not an afterthought.</p>
          </div>
          <div className="security-grid">

            <div className="security-card">
              <div className="security-card-icon"><LockIcon /></div>
              <div>
                <h3>Encryption</h3>
                <p>
                  All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Your crew&apos;s
                  information is protected at every stage of storage and transmission.
                </p>
              </div>
            </div>

            <div className="security-card">
              <div className="security-card-icon"><ServerIcon /></div>
              <div>
                <h3>Hosting</h3>
                <p>
                  CrewNotice is hosted on Vercel&apos;s global edge network with Supabase providing the
                  database infrastructure. Both platforms maintain SOC 2 Type II compliance.
                </p>
              </div>
            </div>

            <div className="security-card">
              <div className="security-card-icon"><KeyIcon /></div>
              <div>
                <h3>Authentication</h3>
                <p>
                  Industry-standard authentication with bcrypt password hashing. Session tokens are
                  short-lived and automatically rotated to minimise exposure risk.
                </p>
              </div>
            </div>

            <div className="security-card">
              <div className="security-card-icon"><DatabaseIcon /></div>
              <div>
                <h3>Data Isolation</h3>
                <p>
                  Every vessel&apos;s data is completely isolated using row-level security policies at the
                  database level. Crew on one vessel cannot access data from another vessel, ever.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 2 — Data Protection */}
      <section style={{ background: 'var(--bg-soft)', borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)' }}>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">Data Protection</div>
            <h2>Your data, your rights</h2>
            <p className="section-sub">We handle crew data with the care and transparency it deserves.</p>
          </div>
          <div className="security-grid">

            <div className="security-card">
              <div className="security-card-icon"><ShieldCheckIcon /></div>
              <div>
                <h3>GDPR Compliant</h3>
                <p>
                  As a UK-registered company, Sharp Digital Solutions Ltd complies with UK GDPR and the
                  Data Protection Act 2018. Crew members have the right to access, correct, and delete
                  their personal data.
                </p>
              </div>
            </div>

            <div className="security-card">
              <div className="security-card-icon"><GlobeIcon /></div>
              <div>
                <h3>Data Location</h3>
                <p>
                  Data is processed and stored in secure data centres. No crew data is sold, shared
                  with advertisers, or used for any purpose other than providing the CrewNotice service.
                </p>
              </div>
            </div>

            <div className="security-card">
              <div className="security-card-icon"><ArchiveIcon /></div>
              <div>
                <h3>Data Retention</h3>
                <p>
                  Vessel data is retained for the duration of the subscription plus 12 months. After
                  this period, all data is permanently deleted upon request.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 3 — Responsible Disclosure */}
      <section>
        <div className="wrap">
          <div className="disclosure-block">
            <div className="disc-icon"><AlertIcon /></div>
            <h2>Responsible Disclosure</h2>
            <p>
              If you discover a security vulnerability in CrewNotice, please report it to{' '}
              <a href="mailto:security@crewnotice.com">security@crewnotice.com</a>.
              We take all reports seriously and will respond within 48 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4 — Privacy Policy link */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <p className="privacy-strip">
            For full details on how we handle personal data, read our{' '}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
