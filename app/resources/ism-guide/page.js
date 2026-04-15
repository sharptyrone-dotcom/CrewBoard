import Link from 'next/link';
import '../../landing.css';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata = {
  title: 'ISM Code Compliance Guide for Superyachts — CrewNotice',
  description: 'A practical guide to how CrewNotice supports your ISM Code obligations. Element-by-element breakdown and audit preparation steps.',
};

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const ISM_ELEMENTS = [
  {
    num: '6',
    title: 'Element 6 — Resources and Personnel',
    body: 'CrewNotice ensures crew receive vessel-specific information, acknowledge safety procedures, and complete required training. Timestamped records prove compliance at every stage.',
  },
  {
    num: '7',
    title: 'Element 7 — Shipboard Operations',
    body: 'Operational notices, SOPs, and risk assessments are distributed digitally with version control. Document acknowledgement tracking ensures crew are always working from current procedures.',
  },
  {
    num: '8',
    title: 'Element 8 — Emergency Preparedness',
    body: 'Drill notices, safety briefings, and emergency procedure updates reach every crew member with proof of delivery — no more missed notice-board updates.',
  },
  {
    num: '11',
    title: 'Element 11 — Documentation',
    body: 'Full audit trail of all notices, document versions, read receipts, and acknowledgements. Exportable PDF and CSV reports give auditors exactly what they need.',
  },
  {
    num: '12',
    title: 'Element 12 — Verification and Review',
    body: 'Compliance dashboard provides real-time visibility into crew awareness levels. The activity log records every interaction, making internal audits and management reviews effortless.',
  },
];

const AUDIT_STEPS = [
  {
    title: 'Export your compliance report',
    desc: 'From the admin dashboard, generate a PDF or CSV compliance report covering the audit period.',
  },
  {
    title: 'Review outstanding acknowledgements',
    desc: 'Check the Needs Attention panel for any unacknowledged critical notices or required documents. Chase them up before the auditor arrives.',
  },
  {
    title: 'Verify document versions are current',
    desc: 'Use the document library to confirm every SOP and risk assessment reflects the latest procedures. Update and re-request acknowledgement if needed.',
  },
  {
    title: 'Check training completion rates',
    desc: 'Open each training module to confirm all required crew have completed and passed. Send reminders to anyone outstanding.',
  },
  {
    title: 'Prepare the activity log',
    desc: 'Filter the activity log to the audit period and export as CSV. This gives your auditor a complete timestamped record of every notice, acknowledgement, and training event.',
  },
];

export default function IsmGuidePage() {
  return (
    <div className="lp-root">
      <MarketingNav />

      {/* Page Hero */}
      <section className="page-hero">
        <div className="wrap">
          <div className="section-eyebrow">Resources</div>
          <h1>ISM Code Compliance Guide for Superyachts</h1>
          <p className="page-subtitle">
            A practical guide to how CrewNotice supports your ISM Code obligations.
          </p>
        </div>
      </section>

      {/* Section 1 — What is the ISM Code */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">Background</div>
            <h2>What is the ISM Code?</h2>
          </div>
          <div className="prose">
            <p>
              The <strong>International Safety Management (ISM) Code</strong> is an international standard,
              adopted by the IMO, that requires vessels to have a Safety Management System (SMS) ensuring
              safe ship operation and the prevention of pollution. It sets out how responsibilities should
              be assigned, how procedures should be documented, and how crew should be trained and informed.
            </p>
            <p>
              The ISM Code is mandatory for all vessels over 500 GT engaged on international voyages. Many
              superyachts also adopt it voluntarily — either because their flag state requires it, their
              insurer expects it, or because owners and management companies want the operational discipline
              it brings. Whichever applies to you, CrewNotice is built to support the information, training,
              and documentation elements of the Code.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 — ISM Elements */}
      <section style={{ background: 'var(--bg-soft)', borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)' }}>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">Code Elements</div>
            <h2>ISM Elements CrewNotice Supports</h2>
            <p className="section-sub">Each element below maps to functionality you get out of the box.</p>
          </div>
          <div className="ism-element-grid">
            {ISM_ELEMENTS.map(el => (
              <div key={el.num} className="ism-element-card">
                <div className="ism-element-num">{el.num}</div>
                <div className="ism-element-body">
                  <h3>{el.title}</h3>
                  <p>{el.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Audit preparation */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">Audit Preparation</div>
            <h2>Preparing for an ISM Audit with CrewNotice</h2>
            <p className="section-sub">Five practical steps to walk into your next audit with confidence.</p>
          </div>
          <ol className="ism-steps">
            {AUDIT_STEPS.map(step => (
              <li key={step.title}>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Section 4 — CTA */}
      <section>
        <div className="wrap">
          <div className="cta-box">
            <div className="cta-box-inner">
              <h2>Ready to make your next audit stress-free?</h2>
              <p>
                Start your free 14-day trial and see how much time CrewNotice saves you the next time an
                auditor steps aboard.
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
