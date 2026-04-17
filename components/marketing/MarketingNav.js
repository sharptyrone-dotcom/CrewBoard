import Link from 'next/link';

const AnchorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3" />
    <line x1="12" y1="22" x2="12" y2="8" />
    <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
  </svg>
);

export default function MarketingNav() {
  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <Link href="/" className="logo">
          <span className="logo-mark"><AnchorIcon /></span>
          CrewNotice
        </Link>

        <div className="nav-links">
          {/* Product dropdown */}
          <div className="nav-company-group">
            <span className="nav-company-trigger">Product</span>
            <div className="nav-company-menu">
              <div className="nav-company-menu-inner">
                <Link href="/product/notice-board">Notice Board</Link>
                <Link href="/product/document-library">Document Library</Link>
                <Link href="/product/training">Training</Link>
                <Link href="/product/compliance">Compliance</Link>
                <Link href="/pricing">Pricing</Link>
              </div>
            </div>
          </div>

          {/* Resources dropdown */}
          <div className="nav-company-group">
            <span className="nav-company-trigger">Resources</span>
            <div className="nav-company-menu">
              <div className="nav-company-menu-inner">
                <Link href="/help">Help Centre</Link>
                <Link href="/resources/ism-guide">ISM Guide</Link>
                <Link href="/resources/mlc-checklist">MLC Checklist</Link>
                <Link href="/blog">Blog</Link>
                <Link href="/resources/api-docs">API Docs</Link>
              </div>
            </div>
          </div>

          {/* Company dropdown */}
          <div className="nav-company-group">
            <span className="nav-company-trigger">Company</span>
            <div className="nav-company-menu">
              <div className="nav-company-menu-inner">
                <Link href="/about">About</Link>
                <Link href="/customers">Customers</Link>
                <Link href="/careers">Careers</Link>
                <Link href="/contact">Contact</Link>
                <Link href="/security">Security</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="nav-cta">
          <Link href="/app" className="login">Log in</Link>
          <Link href="/join" className="btn btn-primary">Get Started</Link>
          <button className="hamburger" aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
