import Link from 'next/link';
import '../../landing.css';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata = {
  title: 'Yacht Document Library with Read Tracking, Acknowledgements & Version Control',
  description:
    'Upload SOPs, risk assessments, and manuals with automatic version control. See who has read each document and track crew acknowledgements per version. Offline access for passages. 100GB storage included.',
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
const FolderIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);
const TagIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);
const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const StarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const CalendarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const FileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
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
  { icon: <FolderIcon />, title: 'Department Filtering', desc: 'Bridge, Deck, Engine, Interior, Safety, and General — crew only see what applies to them.' },
  { icon: <TagIcon />, title: 'Type Filtering', desc: 'SOPs, Risk Assessments, Manuals, MSDS/COSHH, Checklists, and Policies in one organised library.' },
  { icon: <SearchIcon />, title: 'Search', desc: 'Find any document by title across all departments in seconds.' },
  { icon: <StarIcon />, title: 'Favourites', desc: 'Star frequently accessed documents for instant access at the top of the library.' },
  { icon: <CalendarIcon />, title: 'Review Date Reminders', desc: 'Get notified when SOPs are due for review so nothing drifts silently out of date.' },
  { icon: <FileIcon />, title: 'Built-in PDF Viewer', desc: 'Read documents inline without leaving the app. Pinch-to-zoom, page navigation, and table of contents.' },
];

export default function DocumentLibraryPage() {
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
            <span className="crumb-current">Document Library</span>
          </nav>

          <div className="pd-hero-split">
            <div className="pd-hero-text">
              <div className="eyebrow">Product</div>
              <h1>Document Library with Version Control</h1>
              <p className="product-hero-sub">
                SOPs, risk assessments, and manuals — always current, always accessible, always
                acknowledged. End the binder problem for good.
              </p>
              <div className="hero-cta">
                <Link href="/signup" className="btn btn-primary btn-lg">
                  Start free trial <Arrow />
                </Link>
                <a href="#scenario" className="btn btn-ghost btn-lg">Learn more</a>
              </div>
            </div>
            <Screenshot
              src="/screenshots/document-library.png"
              alt="Document library with department and type filters, version numbers, and acknowledgement progress"
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
              Standard Operating Procedures, risk assessments, and safety manuals are the backbone
              of safe vessel operations. But on most superyachts, they live in ring binders on the
              bridge or in the crew mess — heavy, in one location, and rarely opened. When SOPs are
              updated, the new version somehow has to find its way into the binder, and someone has
              to communicate the changes to crew across three watch rotations.
            </p>
            <p>
              CrewNotice gives you a single source of truth for every document. Upload a new version
              and the old one is archived automatically. All previous crew acknowledgements are
              cleared. Crew are notified to review and re-acknowledge the new version. There is only
              ever one current version — and proof of who has read it.
            </p>
          </div>
        </div>
      </section>

      {/* ── Feature 1: Version Control ── */}
      <section className="pd-section pd-section-alt">
        <div className="wrap">
          <div className="pd-feature-row">
            <div className="pd-feature-text">
              <h2>Automatic Version Control</h2>
              <p>
                Upload a new version of any document and CrewNotice handles everything automatically.
                The previous version is archived with full history. All crew acknowledgements are
                cleared. Relevant crew are notified that a new version requires their review. Add
                version notes describing what changed (e.g., &ldquo;Updated Section 3.2 — new
                tender boarding procedure&rdquo;) so crew know what to focus on.
              </p>
              <ul className="pd-feature-bullets">
                <FeatureBullet>Old versions archived but retained for audit</FeatureBullet>
                <FeatureBullet>Acknowledgements automatically reset on new version</FeatureBullet>
                <FeatureBullet>Version notes guide crew to what changed</FeatureBullet>
                <FeatureBullet>Full revision history per document</FeatureBullet>
              </ul>
            </div>
            <Screenshot
              src="/screenshots/document-version-history.png"
              alt="Document detail showing version number, review date, and replace with new version button"
              width={500}
            />
          </div>
        </div>
      </section>

      {/* ── Feature 2: Acknowledgement Tracking (reversed) ── */}
      <section className="pd-section">
        <div className="wrap">
          <div className="pd-feature-row pd-feature-row-reversed">
            <Screenshot
              src="/screenshots/document-acknowledgement-dashboard.png"
              alt="Document acknowledgement dashboard with per-crew status and progress bars"
              width={500}
            />
            <div className="pd-feature-text">
              <h2>Acknowledgement Tracking by Version</h2>
              <p>
                For every required document, see exactly which crew have acknowledged the current
                version and which have not. Send reminders with one tap. Export the acknowledgement
                data for audits. When a new version is uploaded, the dashboard resets — making it
                immediately clear who needs to review the changes.
              </p>
              <ul className="pd-feature-bullets">
                <FeatureBullet>Per-version acknowledgement records</FeatureBullet>
                <FeatureBullet>Visual progress bars showing acknowledgement rates</FeatureBullet>
                <FeatureBullet>Send reminders to outstanding crew</FeatureBullet>
                <FeatureBullet>Exportable acknowledgement reports</FeatureBullet>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature 3: Offline Access ── */}
      <section className="pd-section pd-section-alt">
        <div className="wrap">
          <div className="pd-feature-row">
            <div className="pd-feature-text">
              <h2>Offline Access for Passages</h2>
              <p>
                During passages with limited connectivity, crew need access to safety documents and
                procedures. CrewNotice lets crew cache critical documents on their devices for
                offline reading. The PWA-based system means documents are stored locally and
                accessible even without WiFi. When connection returns, any pending acknowledgements
                sync automatically.
              </p>
              <ul className="pd-feature-bullets">
                <FeatureBullet>One-tap document caching</FeatureBullet>
                <FeatureBullet>Works completely offline once cached</FeatureBullet>
                <FeatureBullet>Manage cached storage from profile settings</FeatureBullet>
                <FeatureBullet>Automatic sync when reconnected</FeatureBullet>
              </ul>
            </div>
            <Screenshot
              src="/screenshots/crew-offline-view.png"
              alt="Crew document library on mobile showing favourite stars and acknowledgement checkmarks"
              width={500}
            />
          </div>
        </div>
      </section>

      {/* ── Real-World Scenario ── */}
      <section className="pd-section" id="scenario">
        <div className="wrap">
          <div className="pd-scenario">
            <div className="pd-scenario-eyebrow">On Board: SOP Update Mid-Charter</div>
            <p>
              Mid-charter, the chief engineer identifies a near-miss involving the tender hydraulic
              system. He drafts an updated tender operations SOP with a new pre-launch check. The
              captain reviews it and uploads version 3.2 to CrewNotice with version notes describing
              the change.
            </p>
            <p>
              All previous deck crew acknowledgements are automatically cleared. Push notifications
              go to the four deck crew. Within two hours, all four have read the updated section and
              re-acknowledged the new version. The next tender launch follows the new procedure.
            </p>
            <p>
              The audit log shows the version change, the notification timestamps, and the
              acknowledgement records — complete evidence for the next ISM inspection.
            </p>
          </div>
        </div>
      </section>

      {/* ── Additional Capabilities ── */}
      <section className="pd-section pd-section-alt">
        <div className="wrap">
          <div className="section-head" style={{ textAlign: 'center' }}>
            <div className="section-eyebrow">Capabilities</div>
            <h2>A complete document management system for vessels</h2>
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
            <h2>Audit-Ready Document Control</h2>
            <p>
              ISM Code Element 11 requires documented procedures with version control and crew
              familiarity. CrewNotice provides exactly that — automatic version control, timestamped
              acknowledgements per version, and exportable evidence reports. Your document control
              system is not a folder of paperwork. It is a complete audit trail.
            </p>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="pd-section">
        <div className="wrap">
          <div className="cta-box">
            <div className="cta-box-inner">
              <h2>Start managing documents the modern way</h2>
              <p>
                Free 30-day trial. No credit card required. Have your document library live in under
                an hour.
              </p>
              <div className="hero-cta" style={{ justifyContent: 'center' }}>
                <Link href="/signup" className="btn btn-primary btn-lg">
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
