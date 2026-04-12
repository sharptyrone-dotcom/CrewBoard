import Link from 'next/link';
import './landing.css';

export const metadata = {
  title: "CrewBoard — The operational platform superyachts actually need",
  description: "Digital notices, document management, and compliance tracking — purpose-built for superyacht crew. Every read tracked. Every audit ready.",
};

const Check = ({ size = 16, strokeWidth = 3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);

const AnchorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3" /><line x1="12" y1="22" x2="12" y2="8" /><path d="M5 12H2a10 10 0 0 0 20 0h-3" /></svg>
);

export default function LandingPage() {
  return (
    <div className="lp-root">
      {/* Nav */}
      <nav className="nav">
        <div className="wrap nav-inner">
          <Link href="/" className="logo">
            <span className="logo-mark"><AnchorIcon /></span>
            CrewBoard
          </Link>
          <div className="nav-links">
            <a href="#features">Product</a>
            <a href="#compliance">Compliance</a>
            <a href="#pricing">Pricing</a>
            <a href="#">Resources</a>
            <a href="#">Contact</a>
          </div>
          <div className="nav-cta">
            <Link href="/app" className="login">Log in</Link>
            <Link href="/app" className="btn btn-primary">Get Started</Link>
            <button className="hamburger" aria-label="Menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow">Purpose-built for superyachts</div>
            <h1>Your vessel&apos;s notice board. <span className="accent">Reimagined.</span></h1>
            <p className="hero-sub">Digital notices, document management, and compliance tracking — every read tracked, every acknowledgement timestamped, every audit ready.</p>
            <div className="hero-cta">
              <Link href="/app" className="btn btn-primary btn-lg">
                Book a demo <Arrow />
              </Link>
              <a href="#features" className="btn btn-ghost btn-lg">See how it works</a>
            </div>
            <div className="hero-meta">
              <span><Check /> Works offline</span>
              <span><Check /> ISM &amp; MLC ready</span>
              <span><Check /> No setup fees</span>
            </div>
          </div>

          <div className="mockup-stage">
            <div className="phone">
              <div className="screen">
                <div className="screen-head">
                  <div className="screen-logo"><span className="dot">⚓</span> CrewBoard</div>
                  <div className="screen-pill">CREW</div>
                </div>
                <h2>Welcome, Tom</h2>
                <div className="screen-sub">M/Y Serenity — Friday 10 April</div>
                <div className="stat-row">
                  <div className="stat-card"><div className="stat-ic b">📄</div><div><div className="stat-num">2</div><div className="stat-lbl">Unread Notices</div></div></div>
                  <div className="stat-card"><div className="stat-ic r">⚠</div><div><div className="stat-num">6</div><div className="stat-lbl">Pending Ack.</div></div></div>
                </div>
                <div className="section-lbl">REQUIRES YOUR ATTENTION</div>
                <div className="notice">
                  <div className="notice-title">Port Side Hydraulic System</div>
                  <div className="notice-meta">Acknowledgement required</div>
                </div>
                <div className="notice amber">
                  <div className="notice-title">Tender Operations SOP</div>
                  <div className="notice-meta">Document pending — v3.2</div>
                </div>
                <div className="tabs">
                  <div className="tab active"><div className="tab-ic">🏠</div>Home</div>
                  <div className="tab"><div className="tab-ic">📋</div>Notices<span className="badge">2</span></div>
                  <div className="tab"><div className="tab-ic">📚</div>Library<span className="badge">5</span></div>
                  <div className="tab"><div className="tab-ic">👤</div>Profile</div>
                </div>
              </div>
            </div>
            <div className="float-card a">
              <div className="ic"><Check size={18} strokeWidth={2.5} /></div>
              <div>
                <div className="t">Acknowledged</div>
                <div className="s">12 of 14 crew · 2m ago</div>
              </div>
            </div>
            <div className="float-card b">
              <div className="ic">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <div>
                <div className="t">Audit-ready</div>
                <div className="s">Flag state compliant</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="trust">
        <div className="wrap">
          <div className="trust-label">Trusted by the world&apos;s leading vessels</div>
          <div className="trust-logos">
            <div className="tl">⚓ OCEAN FLEET</div>
            <div className="tl">⎈ MARITIME CO.</div>
            <div className="tl">◆ BLUE HORIZON</div>
            <div className="tl">✦ SEAWARD GROUP</div>
            <div className="tl">⬢ PELAGIC YACHTS</div>
          </div>
        </div>
      </div>

      {/* Problem */}
      <section className="problem">
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">The Problem</div>
            <h2>Physical notice boards don&apos;t work.</h2>
            <p className="section-sub">Paper gets ignored, forgotten, or lost overboard — and when the auditor arrives, you have no proof anyone ever read it.</p>
          </div>
          <div className="problem-grid">
            <div className="pain-card">
              <div className="pain-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg></div>
              <h3>No proof of read</h3>
              <p>Paper notices offer zero evidence when flag state or class arrive for inspection.</p>
            </div>
            <div className="pain-card">
              <div className="pain-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div>
              <h3>Crew out of sync</h3>
              <p>Rotational crew and shift changes mean critical updates never reach everyone.</p>
            </div>
            <div className="pain-card">
              <div className="pain-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg></div>
              <h3>Document chaos</h3>
              <p>SOPs, manuals, and revisions scattered across email, USBs, and printed binders.</p>
            </div>
            <div className="pain-card">
              <div className="pain-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg></div>
              <h3>Audit anxiety</h3>
              <p>Preparing for inspection means weeks of scrambling and late-night paperwork.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features">
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">Product</div>
            <h2>Everything your vessel needs. Nothing it doesn&apos;t.</h2>
            <p className="section-sub">Six integrated modules built for the realities of life at sea — from daily briefings to end-of-season audits.</p>
          </div>
          <div className="features-grid">
            <div className="feature">
              <div className="feature-ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg></div>
              <h3>Notice Board</h3>
              <p>Publish priority notices directly to every crew member&apos;s device. Track exactly who has read and acknowledged each one.</p>
              <a href="#" className="more">Learn more →</a>
            </div>
            <div className="feature">
              <div className="feature-ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg></div>
              <h3>Document Library</h3>
              <p>SOPs, manuals, and safety documents — versioned, searchable, and available offline on every device.</p>
              <a href="#" className="more">Learn more →</a>
            </div>
            <div className="feature">
              <div className="feature-ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg></div>
              <h3>Training &amp; Quizzes</h3>
              <p>Validate comprehension, not just acknowledgement. Built-in assessments prove the crew understood what they read.</p>
              <a href="#" className="more">Learn more →</a>
            </div>
            <div className="feature">
              <div className="feature-ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></svg></div>
              <h3>Events &amp; Briefings</h3>
              <p>Schedule safety drills, pre-departure briefings, and guest arrival protocols. Everyone knows where to be.</p>
              <a href="#" className="more">Learn more →</a>
            </div>
            <div className="feature">
              <div className="feature-ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></div>
              <h3>Compliance Dashboard</h3>
              <p>Real-time view of acknowledgement rates, overdue items, and audit-ready exports. One click, fully defensible.</p>
              <a href="#" className="more">Learn more →</a>
            </div>
            <div className="feature">
              <div className="feature-ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23" /><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" /><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" /><path d="M10.71 5.05A16 16 0 0 1 22.58 9" /><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg></div>
              <h3>Offline PWA</h3>
              <p>Full functionality mid-ocean, mid-anchor, or mid-crossing. Syncs seamlessly when connectivity returns.</p>
              <a href="#" className="more">Learn more →</a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how">
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">Get Started</div>
            <h2>Live across the whole vessel in under an hour.</h2>
            <p className="section-sub">No IT team required. Captains set it up themselves and have crew using it the same day.</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <h3>Create your vessel</h3>
              <p>Sign up and add your vessel details, departments, and crew structure in minutes.</p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <h3>Invite your crew</h3>
              <p>Send invites by email or QR code. Crew are up and running in seconds, no app store required.</p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h3>Go live</h3>
              <p>Publish your first notice and watch acknowledgements come in live across the whole vessel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section id="compliance">
        <div className="wrap">
          <div className="compliance-grid">
            <div className="compliance-content">
              <div className="section-eyebrow">Compliance</div>
              <h2>Auditable proof, every time.</h2>
              <p>CrewBoard turns daily communications into a defensible compliance record. When flag state, class, or the MCA come aboard, you&apos;re ready in seconds — not weeks.</p>
              <ul className="check-list">
                <li>
                  <div className="check-ic"><Check size={14} /></div>
                  <div className="check-text"><strong>ISM Code aligned</strong><span>Documented SMS procedures, drills, and corrective actions.</span></div>
                </li>
                <li>
                  <div className="check-ic"><Check size={14} /></div>
                  <div className="check-text"><strong>MLC 2006 ready</strong><span>Crew communication evidence, hours of rest, and welfare tracking.</span></div>
                </li>
                <li>
                  <div className="check-ic"><Check size={14} /></div>
                  <div className="check-text"><strong>Flag state exports</strong><span>One-click reports for Cayman, Marshall Islands, Malta, and more.</span></div>
                </li>
                <li>
                  <div className="check-ic"><Check size={14} /></div>
                  <div className="check-text"><strong>Immutable audit trail</strong><span>Cryptographically signed logs of every read, ack, and document version.</span></div>
                </li>
              </ul>
            </div>
            <div className="compliance-visual">
              <div className="cv-head">
                <h4>Fleet Compliance — April</h4>
                <div className="cv-badge">✓ Audit-ready</div>
              </div>
              <div className="cv-row"><div className="cv-label">Safety Notices Ack.</div><div className="cv-bar"><div style={{ width: '100%' }} /></div><div className="cv-pct">100%</div></div>
              <div className="cv-row"><div className="cv-label">SOP Comprehension</div><div className="cv-bar"><div style={{ width: '96%' }} /></div><div className="cv-pct">96%</div></div>
              <div className="cv-row"><div className="cv-label">Drill Completion</div><div className="cv-bar"><div style={{ width: '100%' }} /></div><div className="cv-pct">100%</div></div>
              <div className="cv-row"><div className="cv-label">Document Versions</div><div className="cv-bar"><div style={{ width: '98%' }} /></div><div className="cv-pct">98%</div></div>
              <div className="cv-row"><div className="cv-label">Crew Onboarding</div><div className="cv-bar"><div style={{ width: '100%' }} /></div><div className="cv-pct">100%</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="testimonial">
        <div className="wrap">
          <div className="testimonial-card">
            <div className="quote-mark">&ldquo;</div>
            <q>For the first time in fifteen years at sea, I can honestly tell an auditor that every member of my crew has read every notice — and I can prove it in thirty seconds. CrewBoard has completely changed how we run the vessel.</q>
            <div className="author">
              <div className="avatar">JR</div>
              <div className="author-info">
                <strong>Captain James Rowland</strong>
                <span>M/Y Meridian · 68m · Cayman Islands flag</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing">
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">Pricing</div>
            <h2>Simple pricing. One vessel, one price.</h2>
            <p className="section-sub">No per-seat fees. No hidden costs. Every tier includes unlimited crew.</p>
          </div>
          <div className="pricing-grid">
            <div className="price-card">
              <div className="tier-name">Starter</div>
              <div className="tier-price">€149<span> / month</span></div>
              <div className="tier-desc">For smaller vessels getting started with digital crew operations.</div>
              <ul className="tier-list">
                <li><Check /> Notice Board &amp; acknowledgements</li>
                <li><Check /> Document Library (5GB)</li>
                <li><Check /> Unlimited crew members</li>
                <li><Check /> Offline PWA</li>
                <li><Check /> Email support</li>
              </ul>
              <Link href="/app" className="tier-btn">Start free trial</Link>
            </div>
            <div className="price-card featured">
              <div className="tier-name">Professional</div>
              <div className="tier-price">€349<span> / month</span></div>
              <div className="tier-desc">For working superyachts needing full compliance and training tools.</div>
              <ul className="tier-list">
                <li><Check /> Everything in Starter</li>
                <li><Check /> Training &amp; Quizzes module</li>
                <li><Check /> Events &amp; Briefings</li>
                <li><Check /> Compliance Dashboard &amp; exports</li>
                <li><Check /> 100GB document storage</li>
                <li><Check /> Priority support</li>
              </ul>
              <Link href="/app" className="tier-btn">Start free trial</Link>
            </div>
            <div className="price-card">
              <div className="tier-name">Enterprise</div>
              <div className="tier-price">Custom</div>
              <div className="tier-desc">For fleet operators and management companies running multiple vessels.</div>
              <ul className="tier-list">
                <li><Check /> Everything in Professional</li>
                <li><Check /> Multi-vessel dashboard</li>
                <li><Check /> SSO &amp; custom roles</li>
                <li><Check /> Custom integrations &amp; API</li>
                <li><Check /> Dedicated account manager</li>
                <li><Check /> 24/7 support &amp; SLA</li>
              </ul>
              <Link href="/app" className="tier-btn">Contact sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="wrap">
          <div className="final-cta-inner">
            <h2>Ready to go?</h2>
            <p>Join the vessels already using CrewBoard to prove compliance, protect crew, and sleep better at anchor.</p>
            <div className="hero-cta">
              <Link href="/app" className="btn btn-primary btn-lg">
                Book a demo <Arrow />
              </Link>
              <Link href="/app" className="btn btn-ghost btn-lg">Start free trial</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="wrap">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link href="/" className="logo">
                <span className="logo-mark"><AnchorIcon /></span>
                CrewBoard
              </Link>
              <p>The operational platform superyachts actually need. Built by crew, for crew.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <ul>
                <li><a href="#">Notice Board</a></li>
                <li><a href="#">Document Library</a></li>
                <li><a href="#">Training</a></li>
                <li><a href="#">Compliance</a></li>
                <li><a href="#pricing">Pricing</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <ul>
                <li><a href="#">Help Centre</a></li>
                <li><a href="#">ISM Guide</a></li>
                <li><a href="#">MLC Checklist</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">API Docs</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About</a></li>
                <li><a href="#">Customers</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Security</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/terms">Terms</Link></li>
                <li><Link href="/cookies">Cookies</Link></li>
                <li><a href="#">DPA</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div>© 2026 CrewBoard Ltd. Made for the crew who keep vessels running.</div>
            <div className="socials">
              <a href="#" aria-label="LinkedIn"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" /></svg></a>
              <a href="#" aria-label="Instagram"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg></a>
              <a href="#" aria-label="Twitter"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" /></svg></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
