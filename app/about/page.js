import Link from 'next/link';
import '../landing.css';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata = {
  title: 'About CrewNotice — Built by Crew, for Crew',
  description:
    'CrewNotice is built by an active superyacht Officer of the Watch. A product of Sharp Digital Solutions Ltd, London.',
};

const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const LayersIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const ZapIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export default function AboutPage() {
  return (
    <div className="lp-root">
      <MarketingNav />

      {/* Page Hero */}
      <section className="product-hero">
        <div className="wrap">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight />
            <span className="crumb-current">About</span>
          </nav>
          <div className="section-eyebrow">About Us</div>
          <h1>Built by Crew, for Crew</h1>
        </div>
      </section>

      {/* Section 1 — The Story */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">The Story</div>
            <h2>Where CrewNotice came from</h2>
          </div>
          <div className="story-text">
            <p>
              CrewNotice was born from a simple frustration: critical information on superyachts gets missed.
              Physical notice boards go unread. SOPs gather dust in binders. Safety updates get lost in WhatsApp
              groups. And when an auditor asks for proof that crew were informed — there isn&apos;t any.
            </p>
            <p>
              CrewNotice was created by an active superyacht Officer of the Watch who has lived these problems
              first-hand. Every feature is designed around how vessels actually operate — not how software
              companies imagine they operate.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 — What We Believe */}
      <section style={{ background: 'var(--bg-soft)', borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)' }}>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">What We Believe</div>
            <h2>The principles behind everything we build</h2>
          </div>
          <div className="beliefs-grid">

            <div className="belief-card">
              <div className="belief-icon"><ShieldIcon /></div>
              <h3>Crew Safety Starts with Information</h3>
              <p>
                A crew member can&apos;t follow a procedure they haven&apos;t read. CrewNotice ensures every safety
                update, every SOP change, and every operational notice reaches every crew member — with proof.
              </p>
            </div>

            <div className="belief-card">
              <div className="belief-icon"><LayersIcon /></div>
              <h3>Compliance Should Be Built-In, Not Bolted On</h3>
              <p>
                Audit-ready records shouldn&apos;t require hours of preparation. CrewNotice generates timestamped
                compliance data as a natural byproduct of daily operations.
              </p>
            </div>

            <div className="belief-card">
              <div className="belief-icon"><ZapIcon /></div>
              <h3>Simple Tools Get Used</h3>
              <p>
                The most powerful system is useless if crew don&apos;t use it. CrewNotice is designed to be
                faster than WhatsApp and simpler than a notice board.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Section 3 — The Company */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">The Company</div>
            <h2>Sharp Digital Solutions Ltd</h2>
          </div>
          <div className="company-block">
            <p>
              CrewNotice is a product of Sharp Digital Solutions Ltd, a UK-registered company building
              purpose-built digital tools for specialist industries.
            </p>
            <div className="company-details">
              <strong>Sharp Digital Solutions Ltd</strong>
              <span>
                71-75 Shelton Street, Covent Garden, London, WC2H 9JQ<br />
                Registered in England and Wales
              </span>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
