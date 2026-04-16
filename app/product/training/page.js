import Link from 'next/link';
import '../../landing.css';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata = {
  title: 'Crew Training & Quiz Engine — CrewNotice',
  description:
    'Deliver structured training between watches. Test knowledge with built-in quizzes. Track completion automatically.',
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
const DatabaseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);
const HistoryIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
    <polyline points="21 3 21 8 16 8" />
  </svg>
);
const AwardIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);
const FilterIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const UsersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

function ScreenshotPlaceholder({ label, width, height }) {
  return (
    <div
      className="pd-screenshot"
      style={{ maxWidth: width, aspectRatio: `${width} / ${height}` }}
      aria-label={label}
    >
      <span className="pd-screenshot-label">Screenshot Placeholder</span>
      <span className="pd-screenshot-desc">{label}</span>
    </div>
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
  { icon: <DatabaseIcon />, title: 'Question Banks', desc: 'Build a library of reusable questions that you can mix into multiple modules.' },
  { icon: <HistoryIcon />, title: 'Attempt History', desc: 'See every quiz attempt with individual scores, timestamps, and answer breakdowns.' },
  { icon: <AwardIcon />, title: 'Training Certificates', desc: 'Auto-generated on completion — crew can download or share them directly.' },
  { icon: <FilterIcon />, title: 'Department Filtering', desc: 'Assign modules by role so crew only see training relevant to their department.' },
  { icon: <UsersIcon />, title: 'Bulk Assignment', desc: 'Assign one module to entire departments with a single tap.' },
  { icon: <DownloadIcon />, title: 'Compliance Export', desc: 'Full training records as PDF or CSV — ready for STCW, MLC, and ISM audits.' },
];

export default function TrainingPage() {
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
            <span className="crumb-current">Training</span>
          </nav>

          <div className="pd-hero-split">
            <div className="pd-hero-text">
              <div className="eyebrow">Product</div>
              <h1>Crew Training &amp; Quiz Engine</h1>
              <p className="product-hero-sub">
                Deliver structured training between watches. Test knowledge with built-in quizzes.
                Track completion automatically. No classroom, no disruption, no missed sessions.
              </p>
              <div className="hero-cta">
                <Link href="/app" className="btn btn-primary btn-lg">
                  Start free trial <Arrow />
                </Link>
                <a href="#scenario" className="btn btn-ghost btn-lg">Learn more</a>
              </div>
            </div>
            <ScreenshotPlaceholder
              label="Training module with quiz interface"
              width={800}
              height={500}
            />
          </div>
        </div>
      </section>

      {/* ── Problem / Solution intro ── */}
      <section className="pd-section">
        <div className="wrap">
          <div className="pd-intro">
            <p>
              Training on a superyacht is a constant tension between &ldquo;we need to do
              this&rdquo; and &ldquo;we don&apos;t have time.&rdquo; Between watches, charters,
              passages, and guest programmes, finding time for structured crew training feels
              impossible. Classroom-style sessions never get full attendance. External courses
              require crew ashore. The result: training gets deferred, records are incomplete, and
              audit evidence is patchy.
            </p>
            <p>
              CrewNotice delivers training in short, focused modules that crew complete on their
              phones between tasks. Quizzes verify understanding. Completion is tracked
              automatically. Records are exportable for STCW, MLC, and ISM compliance. Training
              that fits around operations, not the other way around.
            </p>
          </div>
        </div>
      </section>

      {/* ── Feature 1: Module Builder ── */}
      <section className="pd-section pd-section-alt">
        <div className="wrap">
          <div className="pd-feature-row">
            <div className="pd-feature-text">
              <h2>Build Modules, Not Lectures</h2>
              <p>
                Create training modules using a simple block-based editor. Add text, images, and
                embedded videos in any order. Crew progress through the content at their own pace,
                then take a quiz to verify understanding. Modules can be 5 minutes or 30 minutes —
                what matters is they fit between tasks.
              </p>
              <ul className="pd-feature-bullets">
                <FeatureBullet>Drag-and-drop content blocks</FeatureBullet>
                <FeatureBullet>Text, image, and video support</FeatureBullet>
                <FeatureBullet>Save as draft, publish when ready</FeatureBullet>
                <FeatureBullet>Update content anytime</FeatureBullet>
              </ul>
            </div>
            <ScreenshotPlaceholder
              label="Module builder with content blocks"
              width={500}
              height={350}
            />
          </div>
        </div>
      </section>

      {/* ── Feature 2: Quiz Engine (reversed) ── */}
      <section className="pd-section">
        <div className="wrap">
          <div className="pd-feature-row pd-feature-row-reversed">
            <ScreenshotPlaceholder
              label="Quiz builder with multiple question types"
              width={500}
              height={350}
            />
            <div className="pd-feature-text">
              <h2>Built-In Quiz Engine</h2>
              <p>
                Test crew understanding with multiple choice, true/false, and scenario-based
                questions. Add explanations to each answer so the quiz itself is educational. Set
                pass marks, time limits, and randomised question order. Crew see instant results —
                failed attempts allow retakes so crew can learn from mistakes rather than just
                failing.
              </p>
              <ul className="pd-feature-bullets">
                <FeatureBullet>Three question types: multiple choice, true/false, scenario</FeatureBullet>
                <FeatureBullet>Image support in questions for visual identification</FeatureBullet>
                <FeatureBullet>Configurable pass marks and time limits</FeatureBullet>
                <FeatureBullet>Unlimited retakes with answer explanations</FeatureBullet>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature 3: Assignment & Tracking ── */}
      <section className="pd-section pd-section-alt">
        <div className="wrap">
          <div className="pd-feature-row">
            <div className="pd-feature-text">
              <h2>Assignment, Tracking, and Reminders</h2>
              <p>
                Assign training to all crew, specific departments, or individual crew members. Set
                deadlines and let CrewNotice handle the chasing — automated reminders go to crew who
                have not started or have not passed. As an admin, you see completion rates,
                individual scores, attempts, and pass/fail status across your entire crew. Export
                records for STCW certification or ISM audit evidence.
              </p>
              <ul className="pd-feature-bullets">
                <FeatureBullet>Department or individual assignment</FeatureBullet>
                <FeatureBullet>Deadline tracking with countdowns</FeatureBullet>
                <FeatureBullet>Automated reminder notifications</FeatureBullet>
                <FeatureBullet>Exportable training records with scores</FeatureBullet>
              </ul>
            </div>
            <ScreenshotPlaceholder
              label="Training results dashboard for admins"
              width={500}
              height={350}
            />
          </div>
        </div>
      </section>

      {/* ── Real-World Scenario ── */}
      <section className="pd-section" id="scenario">
        <div className="wrap">
          <div className="pd-scenario">
            <div className="pd-scenario-eyebrow">On Board: New Tender Crew Training</div>
            <p>
              Three new junior crew join in Palma for the season. The bosun creates a tender
              operations training module: 8 minutes of content covering safety procedures, an
              8-question quiz, 80% pass mark required. He assigns it to all deck crew with a 7-day
              deadline.
            </p>
            <p>
              The new crew complete it within 48 hours. Two pass first time. One fails the quiz with
              60%, reviews the explanations, retakes and passes. Records are stored automatically.
            </p>
            <p>
              Three weeks later, when the management company asks for evidence of crew
              familiarisation training, the bosun exports a PDF report in 30 seconds — completion
              dates, scores, attempts, all timestamped.
            </p>
          </div>
        </div>
      </section>

      {/* ── Additional Capabilities ── */}
      <section className="pd-section pd-section-alt">
        <div className="wrap">
          <div className="section-head" style={{ textAlign: 'center' }}>
            <div className="section-eyebrow">Capabilities</div>
            <h2>Everything you need to train a professional crew</h2>
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
            <h2>STCW, MLC, and ISM Training Evidence</h2>
            <p>
              STCW 2025 amendments require fatigue management training for all seafarers certified
              after January 2026. ISM Element 6 requires evidence of crew familiarisation.
              CrewNotice provides the digital infrastructure to deliver, track, and prove crew
              training — with timestamped records that satisfy any auditor.
            </p>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="pd-section">
        <div className="wrap">
          <div className="cta-box">
            <div className="cta-box-inner">
              <h2>Start training your crew the modern way</h2>
              <p>
                Free 14-day trial. No credit card required. First module live in under 10 minutes.
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
