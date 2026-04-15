import Link from 'next/link';
import '../landing.css';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import PricingTable from '@/components/marketing/PricingTable';
import PricingFaq from '@/components/marketing/PricingFaq';

export const metadata = {
  title: 'Pricing — CrewNotice',
  description: 'Simple, transparent pricing. One vessel, one price. Starter from £1,200/year. Professional £2,400/year. Enterprise custom.',
};

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
              No per-seat fees. No hidden costs. Every tier includes unlimited crew and a 14-day
              free trial.
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
