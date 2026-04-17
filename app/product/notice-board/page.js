import Link from 'next/link';
import '../../landing.css';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata = {
  title: 'Digital Notice Board with Read Tracking — CrewNotice',
  description:
    "Replace your physical notice board with a real-time digital system that tracks every read, requires acknowledgement for critical safety updates, and gives you auditable proof of crew awareness.",
};

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ── Icon components for the capabilities grid ── */
const BellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const PinIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="17" x2="12" y2="22" />
    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.89A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.89A2 2 0 0 0 5 15.24z" />
  </svg>
);
const PollIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const EditIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
  </svg>
);
const ClockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

function Screenshot({ src, alt, width }) {
  return (
    <img
      className="pd-screenshot-img"
      src={src}
      alt={alt}
      style={{ maxWidth: width }}
      loading="lazy"
    />
  );
}

function FeatureBullet({ children }) {
  return (
    <li>
      <span className="pd-bullet-check"><Check /></span>
      <span>{children}</span>
    </li>
  );
}

const CAPABILITIES = [
  { icon: <BellIcon />, title: 'Push Notifications', desc: 'Instant delivery to every crew member\u2019s phone, on or off watch.' },
  { icon: <SearchIcon />, title: 'Search', desc: 'Find any notice by title, content, or category in seconds.' },
  { icon: <PinIcon />, title: 'Pinned Notices', desc: 'Keep critical ongoing information at the top of the list.' },
  { icon: <PollIcon />, title: 'Polls', desc: 'Gather quick crew feedback directly inside a notice.' },
  { icon: <EditIcon />, title: 'Edit & Withdraw', desc: 'Update live notices or withdraw them. Crew are notified of changes.' },
  { icon: <ClockIcon />, title: 'Activity Log', desc: 'Every action timestamped and recorded for full audit trail.' },
];

export default function NoticeBoardPage() {
  return (
    <div className="lp-root">
      <MarketingNav />

      {/* ── Hero ── */}
      <section className="product-hero">
        <div className="wrap">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight />
            <span>Product</span>
            <ChevronRight />
            <span className="crumb-current">Notice Board</span>
          </nav>

          <div className="pd-hero-split">
            <div className="pd-hero-text">
              <div className="eyebrow">Product</div>
              <h1>Digital Notice Board with Read Tracking</h1>
              <p className="product-hero-sub">
                Replace your physical notice board with a real-time digital system that tracks every
                read, requires acknowledgement for critical safety updates, and gives you auditable
                proof of crew awareness.
              </p>
              <div className="hero-cta">
                <Link href="/app" className="btn btn-primary btn-lg">
                  Start free trial <Arrow />
                </Link>
                <a href="#scenario" className="btn btn-ghost btn-lg">See it in action</a>
              </div>
            </div>
            <Screenshot
              src="/screenshots/notice-list-read-receipts.png"
              alt="Admin notice board showing priority-coded notices with read receipt counts"
              width={800}
            />
          </div>
        </div>
      </section>

      {/* ── Problem / Solution intro ── */}
      <section className="pd-section">
        <div className="wrap">
          <div className="pd-intro">
            <p>
              On a working superyacht, the notice board is where critical operational information
              lives — guest movements, safety updates, schedule changes, restricted areas. But
              physical notice boards have a fundamental flaw: there is no way to know who has
              actually read what. When a flag state inspector asks for proof that crew were informed
              of a safety procedure change, a paper sign-off sheet that went missing is not
              acceptable evidence.
            </p>
            <p>
              CrewNotice replaces the physical notice board with a real-time digital system. Every
              notice is delivered as a push notification to every crew member&apos;s phone. Every read is
              timestamped. Critical safety notices require explicit acknowledgement. And captains can
              generate exportable compliance reports in seconds — not hours.
            </p>
          </div>
        </div>
      </section>

      {/* ── Feature row 1: Priority Levels ── */}
      <section className="pd-section pd-section-alt">
        <div className="wrap">
          <div className="pd-feature-row">
            <div className="pd-feature-text">
              <h2>Priority Levels That Actually Mean Something</h2>
              <p>
                Three priority levels — Critical, Important, and Routine — with colour-coded
                indicators that crew see at a glance. Critical notices appear in red and require
                explicit acknowledgement. Important notices are highlighted in amber. Routine notices
                use standard formatting. No more burying a safety update next to the crew BBQ
                announcement.
              </p>
              <ul className="pd-feature-bullets">
                <FeatureBullet>Visual hierarchy crew can scan in seconds</FeatureBullet>
                <FeatureBullet>Critical notices cannot be dismissed without acknowledgement</FeatureBullet>
                <FeatureBullet>Send reminders to non-readers with one tap</FeatureBullet>
              </ul>
            </div>
            <Screenshot
              src="/screenshots/notice-list-read-receipts.png"
              alt="Notice priority levels showing Critical, Important, and Routine with colour-coded indicators"
              width={500}
            />
          </div>
        </div>
      </section>

      {/* ── Feature row 2: Read Receipts (reversed) ── */}
      <section className="pd-section">
        <div className="wrap">
          <div className="pd-feature-row pd-feature-row-reversed">
            <Screenshot
              src="/screenshots/read-receipt-dashboard.png"
              alt="Read receipt dashboard showing per-crew read and acknowledgement status"
              width={500}
            />
            <div className="pd-feature-text">
              <h2>Read Receipts and Acknowledgement Tracking</h2>
              <p>
                When you post a notice, you can see exactly which crew have read it and when. For
                critical safety notices, crew must explicitly tap &ldquo;I have read and
                understood&rdquo; — creating a timestamped acknowledgement record that satisfies ISM
                Code Element 6 requirements. No more wondering whether your message landed.
              </p>
              <ul className="pd-feature-bullets">
                <FeatureBullet>See read status per crew member with timestamps</FeatureBullet>
                <FeatureBullet>Acknowledgement records exportable for audits</FeatureBullet>
                <FeatureBullet>Send targeted reminders to specific crew</FeatureBullet>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature row 3: Targeting & Categorisation ── */}
      <section className="pd-section pd-section-alt">
        <div className="wrap">
          <div className="pd-feature-row">
            <div className="pd-feature-text">
              <h2>Department Targeting and Smart Categorisation</h2>
              <p>
                Post notices to the entire crew or target specific departments. Categorise by Safety,
                Operations, Guest Info, HR, Social, or Departmental — crew can filter the notice
                board by category to find what&apos;s relevant. Pin notices to keep ongoing important
                items at the top. Schedule notices for future posting. Set expiry dates so old
                notices auto-archive.
              </p>
              <ul className="pd-feature-bullets">
                <FeatureBullet>Six built-in categories with custom colour coding</FeatureBullet>
                <FeatureBullet>Pin critical notices to the top</FeatureBullet>
                <FeatureBullet>Schedule notices in advance</FeatureBullet>
                <FeatureBullet>Set expiry dates for time-sensitive information</FeatureBullet>
              </ul>
            </div>
            <Screenshot
              src="/screenshots/notice-detail-acknowledge.png"
              alt="Crew notice detail view with acknowledgement status and category tags"
              width={500}
            />
          </div>
        </div>
      </section>

      {/* ── Real-World Scenario ── */}
      <section className="pd-section" id="scenario">
        <div className="wrap">
          <div className="pd-scenario">
            <div className="pd-scenario-eyebrow">On Board: Friday Afternoon</div>
            <p>
              It&apos;s 1500 on a Friday in Antibes. Guests arrive Sunday at 1400. The captain
              posts a guest arrival notice with priority &ldquo;Important&rdquo; and category
              &ldquo;Guest Info&rdquo; — guest count, ETA, special requirements, dietary notes
              restricted to galley crew. Push notifications go to all 14 crew immediately.
            </p>
            <p>
              By 1700, 11 crew have read it. The captain sees the dashboard, sees three crew
              haven&apos;t read it (two on shore leave, one off-watch sleeping). At 1900 he sends
              a reminder. By 2000, all crew have read and acknowledged.
            </p>
            <p>
              Sunday&apos;s arrival runs flawlessly. No verbal briefings, no missed information, no
              chasing. And the read receipt record sits in the audit log, available for the next ISM
              inspection.
            </p>
          </div>
        </div>
      </section>

      {/* ── Additional Capabilities ── */}
      <section className="pd-section pd-section-alt">
        <div className="wrap">
          <div className="section-head" style={{ textAlign: 'center' }}>
            <div className="section-eyebrow">Capabilities</div>
            <h2>Everything you need to run a professional notice board</h2>
          </div>
          <div className="pd-capabilities-grid">
            {CAPABILITIES.map((cap) => (
              <div key={cap.title} className="pd-capability">
                <div className="pd-capability-icon">{cap.icon}</div>
                <h3>{cap.title}</h3>
                <p>{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Compliance Benefits ── */}
      <section className="pd-section">
        <div className="wrap">
          <div className="pd-compliance">
            <h2>Built for ISM, MLC, and Flag State Compliance</h2>
            <p>
              Every notice read, every acknowledgement, every update is timestamped and stored in
              your audit log. When inspectors ask for evidence that crew were informed of safety
              procedures, you can export a complete report in seconds — not hours of digging through
              paper sign-off sheets.
            </p>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="pd-section">
        <div className="wrap">
          <div className="cta-box">
            <div className="cta-box-inner">
              <h2>Ready to replace your notice board?</h2>
              <p>
                Start your 30-day free trial. No credit card required. Live on your vessel in under
                10 minutes.
              </p>
              <div className="hero-cta" style={{ justifyContent: 'center' }}>
                <Link href="/app" className="btn btn-primary btn-lg">
                  Start free trial <Arrow />
                </Link>
                <Link href="/pricing" className="btn btn-ghost btn-lg">View pricing</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
