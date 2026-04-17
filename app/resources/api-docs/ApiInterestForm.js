'use client';

import { useState } from 'react';

export default function ApiInterestForm() {
  const [form, setForm] = useState({ name: '', email: '', company: '', integration: '' });
  const [submitted, setSubmitted] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="api-form">
        <div className="api-form-success">
          Thanks for your interest! We&apos;ll be in touch once API access is ready for Fleet customers.
        </div>
      </div>
    );
  }

  return (
    <form className="api-form" onSubmit={handleSubmit}>
      <div className="api-form-row">
        <div className="api-form-field">
          <label htmlFor="api-name">Name</label>
          <input
            id="api-name"
            type="text"
            required
            value={form.name}
            onChange={update('name')}
            placeholder="Captain Jane Smith"
          />
        </div>
        <div className="api-form-field">
          <label htmlFor="api-email">Email</label>
          <input
            id="api-email"
            type="email"
            required
            value={form.email}
            onChange={update('email')}
            placeholder="you@vessel.com"
          />
        </div>
      </div>

      <div className="api-form-field">
        <label htmlFor="api-company">Company / Vessel</label>
        <input
          id="api-company"
          type="text"
          value={form.company}
          onChange={update('company')}
          placeholder="M/Y Aurora"
        />
      </div>

      <div className="api-form-field">
        <label htmlFor="api-integration">What integration are you interested in?</label>
        <textarea
          id="api-integration"
          value={form.integration}
          onChange={update('integration')}
          placeholder="Tell us about your existing systems and what you'd like to integrate with CrewNotice..."
        />
      </div>

      <button type="submit" className="api-form-submit">Register Interest</button>
    </form>
  );
}
