import Link from 'next/link';
import '../landing.css';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata = {
  title: 'CrewNotice Customers — Trusted by Forward-Thinking Vessels',
  description:
    'How superyacht captains use CrewNotice to keep crew informed, track compliance, and streamline ISM audit preparation.',
};

const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const AnchorIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3" />
    <line x1="12" y1="22" x2="12" y2="8" />
    <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
  </svg>
);

const RotateIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const GridIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);

export default function CustomersPage() {
  return (
    <div className="lp-root">
      <MarketingNav />

      {/* Page Hero */}
      <section className="product-hero">
        <div className="wrap">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight />
            <span className="crumb-current">Customers</span>
          </nav>
          <div className="section-eyebrow">Customers</div>
          <h1>Trusted by Forward-Thinking Vessels</h1>
          <p className="page-subtitle">
            CrewNotice is used by captains and crew who believe every crew member deserves access
            to the information they need — and every vessel deserves proof they provided it.
          </p>
        </div>
      </section>

      {/* Section 1 — Built For */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">Built For</div>
            <h2>Designed for how vessels actually operate</h2>
          </div>
          <div className="built-for-grid">

            <div className="built-for-card">
              <div className="built-for-icon"><AnchorIcon /></div>
              <h3>Private Superyachts</h3>
              <p>
                Captains running vessels from 30m to 100m+ who want a simple, professional way to keep
                their crew informed and their compliance records audit-ready.
              </p>
            </div>

            <div className="built-for-card">
              <div className="built-for-icon"><RotateIcon /></div>
              <h3>Charter Yachts</h3>
              <p>
                Vessels running back-to-back charters where guest briefings, crew rotations, and
                operational updates need to reach the right people at the right time.
              </p>
            </div>

            <div className="built-for-card">
              <div className="built-for-icon"><GridIcon /></div>
              <h3>Management Companies</h3>
              <p>
                Fleet operators overseeing multiple vessels who need standardised crew communications
                and cross-vessel compliance visibility.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Section 2 — Testimonials */}
      <section style={{ background: 'var(--bg-soft)', borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)' }}>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">What Crews Say</div>
            <h2>Feedback from vessels using CrewNotice</h2>
            <p className="section-sub">Early adopter perspectives from captains and officers across the fleet.</p>
          </div>
          <div className="testimonials-grid">

            <div className="tq-card">
              <div className="tq-mark">&ldquo;</div>
              <p className="tq-text">
                Finally, a system where I can see exactly who has read my safety notices. The compliance
                dashboard alone saved us hours before our last ISM audit.
              </p>
              <div className="tq-author">
                <div className="tq-name">Captain</div>
                <div className="tq-role">72m Motor Yacht</div>
                <span className="tq-badge">Early adopter feedback</span>
              </div>
            </div>

            <div className="tq-card">
              <div className="tq-mark">&ldquo;</div>
              <p className="tq-text">
                My crew actually use it. That&apos;s the difference. It&apos;s faster than posting a notice on
                the board and I know it&apos;s been read.
              </p>
              <div className="tq-author">
                <div className="tq-name">Chief Officer</div>
                <div className="tq-role">55m Motor Yacht</div>
                <span className="tq-badge">Early adopter feedback</span>
              </div>
            </div>

            <div className="tq-card">
              <div className="tq-mark">&ldquo;</div>
              <p className="tq-text">
                The document acknowledgement tracking is exactly what we needed. When we update an SOP,
                every crew member gets notified and has to re-acknowledge. No more guessing.
              </p>
              <div className="tq-author">
                <div className="tq-name">Bosun</div>
                <div className="tq-role">48m Sailing Yacht</div>
                <span className="tq-badge">Early adopter feedback</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 3 — CTA */}
      <section>
        <div className="wrap">
          <div className="cta-box">
            <div className="cta-box-inner">
              <h2>Want to see CrewNotice on your vessel?</h2>
              <p>
                Join the captains and crew already using CrewNotice to keep their vessels informed,
                compliant, and audit-ready.
              </p>
              <div className="hero-cta" style={{ justifyContent: 'center' }}>
                <Link href="/signup" className="btn btn-primary btn-lg">
                  Start Free Trial <Arrow />
                </Link>
                <Link href="/contact" className="btn btn-ghost btn-lg">Contact Us</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
