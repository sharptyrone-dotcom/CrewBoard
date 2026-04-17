import Link from 'next/link';
import './landing.css';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata = {
  title: 'Page Not Found',
};

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export default function NotFound() {
  return (
    <div className="lp-root">
      <MarketingNav />

      <section className="page-hero" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <div className="wrap" style={{ textAlign: 'center' }}>
          <div className="section-eyebrow">404</div>
          <h1>Page not found</h1>
          <p className="page-subtitle" style={{ maxWidth: 480, margin: '0 auto 32px' }}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="hero-cta" style={{ justifyContent: 'center' }}>
            <Link href="/" className="btn btn-primary btn-lg">
              Go home <Arrow />
            </Link>
            <Link href="/contact" className="btn btn-ghost btn-lg">Contact us</Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
