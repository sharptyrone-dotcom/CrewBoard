'use client';

import { useState } from 'react';

const ThumbUp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

const ThumbDown = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zM17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
  </svg>
);

export default function ArticleHelpful() {
  const [feedback, setFeedback] = useState(null); // null | 'yes' | 'no'

  if (feedback) {
    return (
      <div className="article-helpful submitted">
        <p>
          {feedback === 'yes'
            ? 'Thanks for letting us know — glad it helped.'
            : 'Thanks for the feedback. We\u2019ll use it to improve this article.'}
        </p>
      </div>
    );
  }

  return (
    <div className="article-helpful">
      <h3>Was this helpful?</h3>
      <div className="article-helpful-buttons">
        <button type="button" onClick={() => setFeedback('yes')}>
          <ThumbUp /> Yes
        </button>
        <button type="button" onClick={() => setFeedback('no')}>
          <ThumbDown /> No
        </button>
      </div>
    </div>
  );
}
