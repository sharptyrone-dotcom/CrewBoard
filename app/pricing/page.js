import Link from 'next/link';
import '../landing.css';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import PricingTable from '@/components/marketing/PricingTable';
import PricingFaq from '@/components/marketing/PricingFaq';

export const metadata = {
  title: 'CrewNotice Pricing — £2,400/year per Vessel',
  description:
    'One plan, every feature. Notice board, document library, training, compliance dashboard, unlimited crew. £2,400/year or £249/month. 30-day free trial.',
};

const CheckMark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default function PricingPage() {
  return (
    <div className="lp-root">
      <MarketingNav />

      {/* Pricing Hero */}
      <section className="product-hero">
        <div className="wrap">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight />
            <span className="crumb-current">Pricing</span>
          </nav>
          <div className="product-hero-inner">
            <div className="eyebrow">Pricing</div>
            <h1>Simple pricing. One vessel, one price.</h1>
            <p className="product-hero-sub">
              No per-seat fees. No hidden costs. Every feature included. 30-day free trial, no
              credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section>
        <div className="wrap">
          <PricingTable />
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="pd-section pd-section-alt">
        <div className="wrap">
          <div className="section-head" style={{ textAlign: 'center' }}>
            <div className="section-eyebrow">Compare</div>
            <h2>Feature comparison</h2>
          </div>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <table className="pricing-compare">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Vessel</th>
                  <th>Fleet</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Notice Board & Acknowledgements', true, true],
                  ['Document Library — reads, acknowledgements & version control (100GB)', true, 'Unlimited'],
                  ['Training & Quiz Engine', true, true],
                  ['Events & Guest Briefings', true, true],
                  ['Compliance Dashboard & Exports', true, true],
                  ['Unlimited Crew', true, true],
                  ['Offline PWA', true, true],
                  ['Priority Support', true, true],
                  ['Multi-vessel Dashboard', false, true],
                  ['Cross-fleet Reporting', false, true],
                  ['SSO & Custom Roles', false, true],
                  ['API Access', false, true],
                  ['Dedicated Account Manager', false, true],
                  ['24/7 Support & SLA', false, true],
                ].map(([feature, vessel, fleet]) => (
                  <tr key={feature}>
                    <td>{feature}</td>
                    <td className="pricing-compare-check">
                      {vessel === true ? <CheckMark /> : vessel === false ? <span className="pricing-compare-dash">—</span> : vessel}
                    </td>
                    <td className="pricing-compare-check">
                      {fleet === true ? <CheckMark /> : fleet === false ? <span className="pricing-compare-dash">—</span> : fleet}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: 'var(--bg-soft)', borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)' }}>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">FAQ</div>
            <h2>Frequently asked questions</h2>
            <p className="section-sub">Everything you need to know about CrewNotice pricing and plans.</p>
          </div>
          <PricingFaq />
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
