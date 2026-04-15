import Link from 'next/link';
import '../landing.css';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata = {
  title: 'Careers — CrewNotice',
  description: 'Join Sharp Digital Solutions Ltd. We build purpose-built tools for specialist industries.',
};

const BriefcaseIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export default function CareersPage() {
  return (
    <div className="lp-root">
      <MarketingNav />

      {/* Page Hero */}
      <section className="page-hero">
        <div className="wrap">
          <div className="section-eyebrow">Careers</div>
          <h1>Careers at Sharp Digital Solutions</h1>
          <p className="page-subtitle">
            We&apos;re a small team building tools that make real differences in specialist industries.
            We&apos;re not always hiring, but we&apos;re always interested in hearing from talented people.
          </p>
        </div>
      </section>

      {/* Section 1 — How We Work */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">How We Work</div>
            <h2>Remote-first, self-directed, detail-oriented</h2>
          </div>
          <div className="how-we-work-text">
            <p>
              Sharp Digital Solutions is a UK-based company. We work remotely and value people who are
              self-directed, detail-oriented, and care about building products that genuinely help their users.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 — Current Openings */}
      <section style={{ background: 'var(--bg-soft)', borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)' }}>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">Open Roles</div>
            <h2>Current Openings</h2>
          </div>
          <div className="no-openings">
            <div className="no-openings-icon">
              <BriefcaseIcon />
            </div>
            <h3>No open positions right now</h3>
            <p>
              We don&apos;t have any open roles at the moment. When we do, they&apos;ll be listed here.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 — Speculative Applications */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">Get in Touch</div>
            <h2>Speculative Applications</h2>
          </div>
          <div className="speculative-block">
            <p>
              If you have experience in the superyacht industry, maritime compliance, or building SaaS
              products — and you think you&apos;d be a great fit — we&apos;d like to hear from you.
            </p>
            <a href="mailto:careers@crewnotice.com" className="email-link">
              <MailIcon />
              careers@crewnotice.com
            </a>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
