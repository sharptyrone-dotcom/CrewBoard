import Link from 'next/link';
import '../../landing.css';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata = {
  title: 'Yacht Compliance Dashboard & ISM Audit Reports',
  description:
    'Real-time crew compliance scoring, exportable PDF and CSV audit reports, and a complete activity log. Prepare for ISM audits and flag state inspections in minutes.',
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

/* ── Capability icons ── */
const GridIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);
const LayersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);
const BellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const AlertIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const GlobeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const ArchiveIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);

/* ── Standard icons for the three-column block ── */
const ShieldIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const AnchorIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3" />
    <line x1="12" y1="22" x2="12" y2="8" />
    <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
  </svg>
);
const AwardIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
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
  { icon: <GridIcon />, title: 'Compliance Heatmap', desc: 'Visual grid of crew versus compliance categories — see the whole picture at a glance.' },
  { icon: <LayersIcon />, title: 'Department-Level Views', desc: 'Compliance broken down by department so HODs can own their team\u2019s readiness.' },
  { icon: <BellIcon />, title: 'Automated Reminders', desc: 'Trigger when compliance drops below thresholds — intervene before gaps become findings.' },
  { icon: <AlertIcon />, title: 'Overdue Tracking', desc: 'Identify outstanding items before they become non-conformities at inspection.' },
  { icon: <GlobeIcon />, title: 'Fleet-Wide Compliance', desc: 'Cross-vessel reporting for management companies on Fleet plans.' },
  { icon: <ArchiveIcon />, title: 'Historical Reports', desc: 'Pull compliance data for any past period — last rotation, last quarter, last year.' },
];

const STANDARDS = [
  {
    icon: <ShieldIcon />,
    title: 'ISM Code',
    body: 'Demonstrates Element 6 (resources and personnel), Element 7 (shipboard operations), Element 8 (emergency preparedness), and Element 11 (documentation) compliance.',
  },
  {
    icon: <AnchorIcon />,
    title: 'MLC 2006',
    body: 'Supports crew information, training, and welfare requirements with timestamped records of every interaction.',
  },
  {
    icon: <AwardIcon />,
    title: 'STCW & Flag State',
    body: 'Training records with completion dates and scores satisfy STCW certification and flag state inspection requirements.',
  },
];

export default function CompliancePage() {
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
            <span className="crumb-current">Compliance</span>
          </nav>

          <div className="pd-hero-split">
            <div className="pd-hero-text">
              <div className="eyebrow">Product</div>
              <h1>Compliance Dashboard &amp; Audit Reports</h1>
              <p className="product-hero-sub">
                Real-time visibility into crew compliance. Exportable reports for ISM, MLC, and flag
                state inspections. Audit preparation that takes minutes, not days.
              </p>
              <div className="hero-cta">
                <Link href="/join" className="btn btn-primary btn-lg">
                  Start free trial <Arrow />
                </Link>
                <a href="#scenario" className="btn btn-ghost btn-lg">Learn more</a>
              </div>
            </div>
            <Screenshot
              src="/screenshots/compliance-dashboard.png"
              alt="Compliance dashboard showing overall compliance score, attention items, and quick actions"
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
              ISM audits, flag state inspections, and MLC reviews share a common requirement:
              documented evidence that crew are informed, trained, and aware of safety procedures. On
              most yachts, this evidence is scattered across paper sign-off sheets, training
              certificates, and email confirmations — assembled frantically in the days before an
              inspection.
            </p>
            <p>
              CrewNotice generates audit-ready evidence as a natural byproduct of daily operations.
              Every notice read, document acknowledged, and training module completed is timestamped
              and stored. When an auditor arrives, you export a complete compliance report in
              seconds. Audit preparation that takes minutes, not days.
            </p>
          </div>
        </div>
      </section>

      {/* ── Feature 1: Per-Crew Compliance Scoring ── */}
      <section className="pd-section pd-section-alt">
        <div className="wrap">
          <div className="pd-feature-row">
            <div className="pd-feature-text">
              <h2>Per-Crew Compliance Scoring</h2>
              <p>
                Every crew member has a single compliance score that rolls up notices read, documents
                acknowledged, and training completed. Green for compliant, amber for partial, red for
                outstanding items. Captains spot gaps instantly without reviewing dozens of
                individual records. Drill into any crew member to see exactly which items are
                missing — and send targeted reminders with one tap.
              </p>
              <ul className="pd-feature-bullets">
                <FeatureBullet>Single compliance percentage per crew member</FeatureBullet>
                <FeatureBullet>Colour-coded traffic light indicators</FeatureBullet>
                <FeatureBullet>Drill-down view of outstanding items</FeatureBullet>
                <FeatureBullet>One-tap targeted reminders</FeatureBullet>
              </ul>
            </div>
            <Screenshot
              src="/screenshots/compliance-dashboard.png"
              alt="Per-crew compliance scoring with attention items and critical unacknowledged notices"
              width={500}
            />
          </div>
        </div>
      </section>

      {/* ── Feature 2: Exportable Audit Reports (reversed) ── */}
      <section className="pd-section">
        <div className="wrap">
          <div className="pd-feature-row pd-feature-row-reversed">
            <Screenshot
              src="/screenshots/pdf-export.png"
              alt="Export report dialog with PDF and CSV options for compliance, notices, and training records"
              width={500}
            />
            <div className="pd-feature-text">
              <h2>Exportable Audit Reports</h2>
              <p>
                Generate professional PDF compliance reports covering any date range. The report
                includes vessel summary, crew roster, per-notice read receipts with timestamps,
                document acknowledgement records by version, training completion data, and a complete
                activity log. Perfect for ISM audits, flag state inspections, MLC reviews, and
                management company reporting.
              </p>
              <ul className="pd-feature-bullets">
                <FeatureBullet>PDF reports formatted for inspectors</FeatureBullet>
                <FeatureBullet>CSV exports for data analysis</FeatureBullet>
                <FeatureBullet>Date range filtering</FeatureBullet>
                <FeatureBullet>Department-level and vessel-wide reports</FeatureBullet>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature 3: Complete Activity Log ── */}
      <section className="pd-section pd-section-alt">
        <div className="wrap">
          <div className="pd-feature-row">
            <div className="pd-feature-text">
              <h2>Complete Activity Log</h2>
              <p>
                Every action in CrewNotice is timestamped and recorded — who posted what notice, who
                read it and when, who acknowledged what document, who completed what training. The
                activity log is your single source of truth. Filter by crew member, action type, or
                date range. Export for any reporting requirement. Nothing is ever lost or modified.
              </p>
              <ul className="pd-feature-bullets">
                <FeatureBullet>Every action timestamped and immutable</FeatureBullet>
                <FeatureBullet>Filter by crew, action type, or date</FeatureBullet>
                <FeatureBullet>Daily summary views available</FeatureBullet>
                <FeatureBullet>Full audit trail for the lifetime of the vessel subscription</FeatureBullet>
              </ul>
            </div>
            <Screenshot
              src="/screenshots/activity-log.png"
              alt="Activity log showing timestamped crew actions with filtering and CSV export"
              width={500}
            />
          </div>
        </div>
      </section>

      {/* ── Real-World Scenario ── */}
      <section className="pd-section" id="scenario">
        <div className="wrap">
          <div className="pd-scenario">
            <div className="pd-scenario-eyebrow">On Board: ISM Audit Tomorrow</div>
            <p>
              The DPA emails on Monday: ISM audit Wednesday morning. Six months ago, this would have
              meant two days of frantic paperwork — chasing crew sign-off sheets, verifying training
              records, reconstructing what was communicated when.
            </p>
            <p>
              With CrewNotice, the captain logs in, opens the Compliance Dashboard, and exports a
              six-month compliance report. The PDF includes every safety notice with read receipts,
              every SOP version with acknowledgements, every training completion with scores. Total
              prep time: 12 minutes.
            </p>
            <p>
              The audit on Wednesday lasts 90 minutes instead of the usual three hours — the auditor
              has every piece of evidence they need at their fingertips. Zero non-conformities. The
              DPA emails again on Thursday: &ldquo;Easiest audit we&apos;ve had on this vessel.
              Whatever you&apos;re using, keep using it.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* ── Additional Capabilities ── */}
      <section className="pd-section pd-section-alt">
        <div className="wrap">
          <div className="section-head" style={{ textAlign: 'center' }}>
            <div className="section-eyebrow">Capabilities</div>
            <h2>Compliance visibility from every angle</h2>
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

      {/* ── Compliance Standards ── */}
      <section className="pd-section">
        <div className="wrap">
          <div className="section-head" style={{ textAlign: 'center' }}>
            <div className="section-eyebrow">Standards</div>
            <h2>Built for the Standards You&apos;re Held To</h2>
          </div>
          <div className="pd-standards-grid">
            {STANDARDS.map((std) => (
              <div key={std.title} className="pd-standard-card">
                <div className="pd-standard-icon">{std.icon}</div>
                <h3>{std.title}</h3>
                <p>{std.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="pd-section">
        <div className="wrap">
          <div className="cta-box">
            <div className="cta-box-inner">
              <h2>Make your next audit stress-free</h2>
              <p>
                Free 30-day trial. No credit card required. Compliance dashboard live the moment
                your first crew member logs in.
              </p>
              <div className="hero-cta" style={{ justifyContent: 'center' }}>
                <Link href="/join" className="btn btn-primary btn-lg">
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
