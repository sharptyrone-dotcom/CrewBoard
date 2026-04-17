import Link from 'next/link';

const Check = ({ size = 16, strokeWidth = 3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const VESSEL_FEATURES = [
  'Digital Notice Board with read tracking & acknowledgements',
  'Document Library with read tracking, acknowledgements & version control (100GB)',
  'Training & Quiz Engine',
  'Events & Guest Briefings',
  'Compliance Dashboard & audit exports',
  'Unlimited crew members',
  'Offline PWA',
  'Priority support',
];

const FLEET_FEATURES = [
  'Everything in Vessel across your entire fleet',
  'Multi-vessel compliance dashboard',
  'Cross-fleet reporting & analytics',
  'SSO & custom roles',
  'API access & integrations',
  'Dedicated account manager',
  '24/7 support & SLA',
  'Unlimited storage',
];

export default function PricingTable() {
  return (
    <>
      <div className="pricing-grid pricing-grid-two">
        {/* Vessel card */}
        <div className="price-card featured">
          <div className="tier-badge">Most Popular</div>
          <div className="tier-name">Vessel</div>
          <div className="tier-price">£2,400<span> / year</span></div>
          <div className="tier-price-sub">or £249/month</div>
          <div className="tier-desc">Everything you need to run crew operations on a single vessel.</div>
          <ul className="tier-list">
            {VESSEL_FEATURES.map((f) => (
              <li key={f}><Check /> {f}</li>
            ))}
          </ul>
          <Link href="/signup" className="tier-btn">Start 30-day free trial</Link>
        </div>

        {/* Fleet card */}
        <div className="price-card">
          <div className="tier-name">Fleet</div>
          <div className="tier-price">Custom</div>
          <div className="tier-price-sub">Tailored to your fleet</div>
          <div className="tier-desc">For management companies and fleet operators running multiple vessels.</div>
          <ul className="tier-list">
            {FLEET_FEATURES.map((f) => (
              <li key={f}><Check /> {f}</li>
            ))}
          </ul>
          <Link href="/contact" className="tier-btn tier-btn-outline">Contact sales</Link>
        </div>
      </div>

      <p className="pricing-trial-note">
        All plans include a 30-day free trial with full access. No credit card required.
      </p>
    </>
  );
}
