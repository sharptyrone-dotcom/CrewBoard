import FAQAccordion from '../FAQAccordion';

// Source-of-truth for the marketing FAQ. Both the <PricingFaq /> component
// and the FAQPage JSON-LD schema (in the landing page + pricing page
// <script type="application/ld+json"> blocks) read from this list, so
// edits here stay in sync across the visual UI and SEO metadata.
export const PRICING_FAQ_ITEMS = [
  {
    question: 'How much does CrewNotice cost?',
    answer:
      'CrewNotice is £2,400 per year (or £249/month) per vessel. This includes every feature — notice board, document library, training, events, compliance dashboard, and unlimited crew. For fleets of multiple vessels, contact our sales team for custom pricing.',
  },
  {
    question: "What's included in the free trial?",
    answer:
      "Everything. You get full access to every feature for 30 days with no credit card required. Upload documents, post notices, create training modules, and see your compliance dashboard populate with real data. If you decide CrewNotice isn't for you, simply stop using it.",
  },
  {
    question: 'Can I switch from monthly to annual billing?',
    answer:
      'Yes, you can switch to annual billing at any time from your billing settings. Annual billing saves you approximately 20% compared to monthly.',
  },
  {
    question: 'What happens when my trial ends?',
    answer:
      "We'll email you at day 20 to remind you. If you choose a plan before day 30, everything continues seamlessly. If not, your account is paused but your data is preserved for 30 days in case you decide to subscribe later.",
  },
  {
    question: 'Do you offer discounts for multiple vessels?',
    // JSX answer — keeps the accordion's link styling in blue and
    // preserves the original inline <a href="/contact"> link.
    answer: (
      <p>
        Yes. Our Fleet plan includes volume discounts based on the number of vessels. Contact
        our <a href="/contact">sales team</a> for a custom quote.
      </p>
    ),
  },
];

export default function PricingFaq() {
  return <FAQAccordion items={PRICING_FAQ_ITEMS} />;
}
