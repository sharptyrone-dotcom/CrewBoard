'use client';

import { useState } from 'react';

const Check = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function ContactForm() {
  const [fields, setFields] = useState({
    name: '', email: '', vessel: '', size: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="form-success">
        <div className="form-success-icon">
          <Check size={24} />
        </div>
        <h3>Message sent!</h3>
        <p>Thanks for reaching out. We&apos;ll get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="cn-name">Name</label>
        <input
          id="cn-name"
          type="text"
          className="form-input"
          placeholder="Your name"
          value={fields.name}
          onChange={set('name')}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="cn-email">Email</label>
        <input
          id="cn-email"
          type="email"
          className="form-input"
          placeholder="you@example.com"
          value={fields.email}
          onChange={set('email')}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="cn-vessel">
          Vessel Name <span className="opt">(optional)</span>
        </label>
        <input
          id="cn-vessel"
          type="text"
          className="form-input"
          placeholder="M/Y Serenity"
          value={fields.vessel}
          onChange={set('vessel')}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="cn-size">Vessel Size</label>
        <select
          id="cn-size"
          className="form-select"
          value={fields.size}
          onChange={set('size')}
        >
          <option value="">Select vessel size…</option>
          <option value="under30">Under 30m</option>
          <option value="30-40">30–40m</option>
          <option value="40-60">40–60m</option>
          <option value="60+">60m+</option>
          <option value="fleet">Fleet / Management Company</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="cn-message">Message</label>
        <textarea
          id="cn-message"
          className="form-textarea"
          placeholder="Tell us about your vessel and what you're looking for…"
          value={fields.message}
          onChange={set('message')}
          required
        />
      </div>

      <button type="submit" className="form-submit">Send Message</button>
    </form>
  );
}
