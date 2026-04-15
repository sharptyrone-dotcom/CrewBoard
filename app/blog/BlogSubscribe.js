'use client';

import { useState } from 'react';

export default function BlogSubscribe() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="blog-subscribe">
      <h3>Get notified when new articles are published</h3>
      <p>No spam. Unsubscribe at any time.</p>
      {submitted ? (
        <div className="blog-subscribe-success">
          Thanks! We&apos;ll let you know when the next article goes live.
        </div>
      ) : (
        <form className="blog-subscribe-form" onSubmit={handleSubmit}>
          <input
            type="email"
            required
            placeholder="you@vessel.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email address"
          />
          <button type="submit">Subscribe</button>
        </form>
      )}
    </div>
  );
}
