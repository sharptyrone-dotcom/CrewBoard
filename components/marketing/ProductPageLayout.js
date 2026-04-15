import Link from 'next/link';
import MarketingNav from './MarketingNav';
import MarketingFooter from './MarketingFooter';

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

const Check = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function ProductPageLayout({
  eyebrow = 'Product',
  breadcrumb,
  title,
  subtitle,
  featureBlocks,
  additionalTitle = 'Also included',
  additionalFeatures,
}) {
  return (
    <div className="lp-root">
      <MarketingNav />

      {/* Product Hero */}
      <section className="product-hero">
        <div className="wrap">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight />
            <span>Product</span>
            <ChevronRight />
            <span className="crumb-current">{breadcrumb}</span>
          </nav>
          <div className="product-hero-inner">
            <div className="eyebrow">{eyebrow}</div>
            <h1>{title}</h1>
            <p className="product-hero-sub">{subtitle}</p>
            <div className="hero-cta">
              <Link href="/app" className="btn btn-primary btn-lg">
                Start your free trial <Arrow />
              </Link>
              <Link href="/pricing" className="btn btn-ghost btn-lg">See pricing</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Blocks */}
      <section>
        <div className="wrap">
          <div className="features-grid product-features">
            {featureBlocks.map((block) => (
              <div key={block.title} className="feature">
                <div className="feature-ic">{block.icon}</div>
                <h3>{block.title}</h3>
                <p>{block.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section style={{ background: 'var(--bg-soft)', borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)' }}>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">More</div>
            <h2>{additionalTitle}</h2>
          </div>
          <ul className="additional-features-list">
            {additionalFeatures.map((item) => (
              <li key={item}>
                <span className="additional-check"><Check /></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="wrap">
          <div className="cta-box">
            <div className="cta-box-inner">
              <h2>Ready to get started?</h2>
              <p>
                Free 14-day trial, no credit card required. Have the whole vessel live in under
                an hour.
              </p>
              <div className="hero-cta" style={{ justifyContent: 'center' }}>
                <Link href="/app" className="btn btn-primary btn-lg">
                  Start your free trial <Arrow />
                </Link>
                <Link href="/contact" className="btn btn-ghost btn-lg">Talk to us</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
