'use client';

import { useState } from 'react';
import Link from 'next/link';

const Check = ({ size = 16, strokeWidth = 3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    desc: 'For vessels getting started with digital crew operations.',
    annual: 1200,
    monthly: 120,
    features: [
      'Notice Board & acknowledgements',
      'Document Library (5GB)',
      'Unlimited crew members',
      'Offline PWA',
      'Email support',
    ],
    cta: { label: 'Start free trial', href: '/app' },
    featured: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    desc: 'For working superyachts needing full compliance and training tools.',
    annual: 2400,
    monthly: 249,
    features: [
      'Everything in Starter',
      'Training & Quizzes module',
      'Events & Briefings',
      'Compliance Dashboard & exports',
      '100GB document storage',
      'Priority support',
    ],
    cta: { label: 'Start free trial', href: '/app' },
    featured: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    desc: 'For fleet operators and management companies running multiple vessels.',
    custom: true,
    features: [
      'Everything in Professional',
      'Multi-vessel dashboard',
      'SSO & custom roles',
      'Custom integrations & API',
      'Dedicated account manager',
      '24/7 support & SLA',
    ],
    cta: { label: 'Contact sales', href: '/contact' },
    featured: false,
  },
];

const formatGBP = (n) => `£${n.toLocaleString('en-GB')}`;

export default function PricingTable() {
  const [billing, setBilling] = useState('annual'); // 'annual' | 'monthly'

  return (
    <>
      <div className="billing-toggle-wrap">
        <div className="billing-toggle" role="tablist" aria-label="Billing period">
          <button
            type="button"
            role="tab"
            aria-selected={billing === 'annual'}
            className={`billing-toggle-btn ${billing === 'annual' ? 'active' : ''}`}
            onClick={() => setBilling('annual')}
          >
            Annual
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={billing === 'monthly'}
            className={`billing-toggle-btn ${billing === 'monthly' ? 'active' : ''}`}
            onClick={() => setBilling('monthly')}
          >
            Monthly
          </button>
        </div>
        {billing === 'annual' && (
          <div className="billing-save-note">Save up to 17% with annual billing</div>
        )}
      </div>

      <div className="pricing-grid">
        {TIERS.map((tier) => {
          const isCustom = tier.custom;
          const mainPrice = isCustom
            ? 'Custom'
            : billing === 'annual'
              ? formatGBP(tier.annual)
              : formatGBP(tier.monthly);
          const mainSuffix = isCustom ? null : billing === 'annual' ? ' / year' : ' / month';
          const sub = isCustom
            ? null
            : billing === 'annual'
              ? `or ${formatGBP(tier.monthly)}/month`
              : `or ${formatGBP(tier.annual)}/year`;

          return (
            <div key={tier.id} className={`price-card ${tier.featured ? 'featured' : ''}`}>
              <div className="tier-name">{tier.name}</div>
              <div className="tier-price">
                {mainPrice}
                {mainSuffix && <span>{mainSuffix}</span>}
              </div>
              {sub ? (
                <div className="tier-price-sub">{sub}</div>
              ) : (
                <div className="tier-price-sub">&nbsp;</div>
              )}
              <div className="tier-desc">{tier.desc}</div>
              <ul className="tier-list">
                {tier.features.map((f) => (
                  <li key={f}>
                    <Check /> {f}
                  </li>
                ))}
              </ul>
              <Link href={tier.cta.href} className="tier-btn">
                {tier.cta.label}
              </Link>
            </div>
          );
        })}
      </div>
    </>
  );
}
