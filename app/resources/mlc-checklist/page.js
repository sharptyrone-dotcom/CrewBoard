import Link from 'next/link';
import '../../landing.css';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata = {
  title: 'MLC 2006 Compliance Checklist for Yacht Crew',
  description:
    'Maritime Labour Convention requirements that CrewNotice helps you meet. Crew information, training, and documentation compliance.',
};

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const GROUPS = [
  {
    title: 'Information & Communication',
    items: [
      'Crew informed of vessel safety policies and procedures',
      'Timestamped proof of information dissemination',
      'Changes to operational procedures communicated and acknowledged',
      'Department-specific briefings for relevant crew only',
    ],
  },
  {
    title: 'Training & Familiarisation',
    items: [
      'Training modules delivered and tracked per crew member',
      'Assessment scores and pass/fail records maintained',
      'Training completion certificates generated',
      'Deadline tracking and automated reminders for overdue training',
    ],
  },
  {
    title: 'Documentation & Records',
    items: [
      'SOP version control with acknowledgement tracking',
      'Risk assessments accessible to all relevant crew',
      'MSDS/COSHH sheets available digitally',
      'Exportable audit reports with timestamps',
    ],
  },
  {
    title: 'Crew Welfare',
    items: [
      'Social notices and crew event coordination',
      'Transparent communication from management',
      'Offline access to important documents during passage',
    ],
  },
];

export default function MlcChecklistPage() {
  return (
    <div className="lp-root">
      <MarketingNav />

      {/* Page Hero */}
      <section className="page-hero">
        <div className="wrap">
          <div className="section-eyebrow">Resources</div>
          <h1>MLC 2006 Compliance Checklist for Yacht Crew</h1>
          <p className="page-subtitle">
            How CrewNotice helps you meet Maritime Labour Convention requirements.
          </p>
        </div>
      </section>

      {/* Section 1 — Intro */}
      <section>
        <div className="wrap">
          <p className="checklist-intro">
            The <strong>Maritime Labour Convention 2006</strong> sets minimum standards for seafarer
            working conditions. While CrewNotice is not a full MLC compliance system, it directly
            supports several key requirements related to crew information, training, documentation,
            and welfare.
          </p>
          <div className="checklist-wrap">
            {GROUPS.map(group => (
              <div key={group.title} className="checklist-group">
                <h3>{group.title}</h3>
                <ul>
                  {group.items.map(item => (
                    <li key={item}>
                      <span className="checklist-check"><CheckIcon /></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="checklist-note">
            <strong>Note:</strong> This checklist covers CrewNotice&apos;s contribution to MLC
            compliance. For full MLC compliance — including hours of rest, leave management, and
            employment conditions — consult your flag state requirements and consider
            complementary tools like WorkRest.
          </div>
        </div>
      </section>

      {/* Section 2 — CTA */}
      <section>
        <div className="wrap">
          <div className="cta-box">
            <div className="cta-box-inner">
              <h2>Start tracking crew compliance today</h2>
              <p>
                Free 30-day trial, no credit card required. See how much easier MLC-aligned
                recordkeeping becomes when every notice, acknowledgement, and training event is
                captured automatically.
              </p>
              <div className="hero-cta" style={{ justifyContent: 'center' }}>
                <Link href="/app" className="btn btn-primary btn-lg">
                  Start Free Trial <Arrow />
                </Link>
                <Link href="/contact" className="btn btn-ghost btn-lg">Talk to Us</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
