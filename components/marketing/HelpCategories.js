'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ClearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function ArticleCard({ article }) {
  const body = (
    <>
      <div className="help-article-body">
        <h3 className="help-article-title">{article.title}</h3>
        <p className="help-article-desc">{article.desc}</p>
      </div>
      <div className="help-article-arrow"><ArrowIcon /></div>
    </>
  );

  if (article.slug) {
    return (
      <Link href={`/help/${article.slug}`} className="help-article help-article-link">
        {body}
      </Link>
    );
  }

  return (
    <div className="help-article" title="Coming soon" aria-disabled="true">
      {body}
    </div>
  );
}

export default function HelpCategories({ categories }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        articles: cat.articles.filter((a) => {
          const haystack = `${a.title} ${a.desc}`.toLowerCase();
          return haystack.includes(q);
        }),
      }))
      .filter((cat) => cat.articles.length > 0);
  }, [query, categories]);

  const hasResults = filtered.length > 0;

  return (
    <>
      <div className="help-search">
        <span className="help-search-icon" aria-hidden="true"><SearchIcon /></span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search help articles…"
          aria-label="Search help articles"
        />
        {query && (
          <button
            type="button"
            className="help-search-clear"
            onClick={() => setQuery('')}
            aria-label="Clear search"
          >
            <ClearIcon />
          </button>
        )}
      </div>

      {hasResults ? (
        filtered.map((cat) => (
          <div key={cat.title} className="help-category">
            <div className="help-category-head">
              <h2>{cat.title}</h2>
              <span className="help-category-count">
                {cat.articles.length} article{cat.articles.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="help-grid">
              {cat.articles.map((article) => (
                <ArticleCard key={article.title} article={article} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="help-no-results">
          <h3>No articles found</h3>
          <p>
            We couldn&apos;t find anything matching &ldquo;{query}&rdquo;. Try a different search term,
            or email us at <a href="mailto:support@crewnotice.com">support@crewnotice.com</a>.
          </p>
        </div>
      )}
    </>
  );
}
