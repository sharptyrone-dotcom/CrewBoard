import Link from 'next/link';
import '../landing.css';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import BlogSubscribe from './BlogSubscribe';

export const metadata = {
  title: 'CrewNotice Blog — Insights for Superyacht Captains & Crew',
  description:
    'Practical guides on crew compliance, ISM audit preparation, SOP management, and yacht operations.',
};

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ARTICLES = [
  {
    slug: 'why-physical-notice-boards-dont-work',
    title: "Why Physical Notice Boards Don't Work on Superyachts",
    category: 'Operations',
    tagClass: 'ops',
    readTime: '5 min read',
    excerpt: "Crew miss critical updates, there's no audit trail, and information gets buried. Here's why digital is the only way forward.",
  },
  {
    slug: 'ism-audit-preparation-checklist',
    title: "ISM Audit Preparation: A Captain's Digital Checklist",
    category: 'Compliance',
    tagClass: 'compliance',
    readTime: '7 min read',
    excerpt: 'A step-by-step guide to preparing for your next ISM audit using digital compliance records.',
  },
  {
    slug: 'how-to-manage-sops-on-superyachts',
    title: 'How to Manage SOPs on a Superyacht in 2026',
    category: 'Documents',
    tagClass: 'documents',
    readTime: '6 min read',
    excerpt: 'Version control, crew acknowledgements, and offline access — modern SOP management for working vessels.',
  },
  {
    slug: 'whatsapp-vs-crew-communication-system',
    title: 'WhatsApp vs a Proper Crew Communication System',
    category: 'Operations',
    tagClass: 'ops',
    readTime: '4 min read',
    excerpt: "Why the industry's most-used communication tool is also its biggest compliance risk.",
  },
  {
    slug: 'training-delivery-on-board',
    title: 'Training Delivery On Board: Without Disrupting Operations',
    category: 'Training',
    tagClass: 'training',
    readTime: '5 min read',
    excerpt: 'How to deliver effective crew training between watches, charters, and passages.',
  },
  {
    slug: 'guest-briefings-that-work',
    title: 'Guest Briefings That Actually Work',
    category: 'Events',
    tagClass: 'events',
    readTime: '4 min read',
    excerpt: 'Department-specific briefings, restricted information, and real-time updates for seamless guest visits.',
  },
];

function BlogCard({ article }) {
  const inner = (
    <>
      <div className="blog-card-head">
        <span className={`blog-tag ${article.tagClass}`}>{article.category}</span>
        <span className="blog-read-time">{article.readTime}</span>
      </div>
      <h2 className="blog-card-title">{article.title}</h2>
      <p className="blog-card-excerpt">{article.excerpt}</p>
      <div className="blog-card-foot">
        Read article <ArrowIcon />
      </div>
    </>
  );

  if (article.slug) {
    return (
      <Link href={`/blog/${article.slug}`} className="blog-card blog-card-link">
        {inner}
      </Link>
    );
  }

  return (
    <article className="blog-card" title="Coming soon" aria-disabled="true">
      <span className="blog-card-badge">Coming soon</span>
      {inner}
    </article>
  );
}

export default function BlogPage() {
  return (
    <div className="lp-root">
      <MarketingNav />

      {/* Page Hero */}
      <section className="page-hero">
        <div className="wrap">
          <div className="section-eyebrow">Blog</div>
          <h1>CrewNotice Blog</h1>
          <p className="page-subtitle">
            Practical guides on crew compliance, vessel operations, and maritime safety.
          </p>
        </div>
      </section>

      {/* Article grid */}
      <section>
        <div className="wrap">
          <div className="blog-grid">
            {ARTICLES.map(article => (
              <BlogCard key={article.title} article={article} />
            ))}
          </div>

          <BlogSubscribe />
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
