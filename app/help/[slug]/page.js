import Link from 'next/link';
import { notFound } from 'next/navigation';
import '../../landing.css';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import ArticleBody from '@/components/marketing/ArticleBody';
import ArticleHelpful from '@/components/marketing/ArticleHelpful';
import { ARTICLES, getAllSlugs } from '../articles';

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const article = ARTICLES[params.slug];
  if (!article) {
    return { title: 'Article not found — CrewNotice' };
  }
  return {
    title: `${article.title} — CrewNotice Help Centre`,
    description: article.description,
  };
}

const BackArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default function HelpArticlePage({ params }) {
  const article = ARTICLES[params.slug];
  if (!article) notFound();

  return (
    <div className="lp-root">
      <MarketingNav />

      {/* Article Hero */}
      <section className="product-hero">
        <div className="wrap">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/help">Help Centre</Link>
            <ChevronRight />
            <span className="crumb-current">{article.title}</span>
          </nav>
          <div className="product-hero-inner">
            <div className="eyebrow">{article.category}</div>
            <h1>{article.title}</h1>
            {article.description && (
              <p className="product-hero-sub">{article.description}</p>
            )}
          </div>
        </div>
      </section>

      {/* Article body */}
      <section>
        <div className="wrap">
          <ArticleBody blocks={article.body} />

          <ArticleHelpful />

          <div className="article-back">
            <Link href="/help">
              <BackArrow /> Back to Help Centre
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
