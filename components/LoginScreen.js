'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signInWithPassword } from '@/lib/auth';

// Lightweight email/password login. No sign-up flow — crew accounts are
// created via the /join invite flow. The look matches the marketing site
// (light surfaces, blue accent, Outfit font). CSS variables come from
// globals.css so the page auto-adapts to dark mode without any extra
// state wiring here.

const DEV_ACCOUNTS = [
  { name: 'Sophie Laurent', email: 'sophie.laurent@serenity.yacht', role: 'Chief Stewardess (Admin)' },
  { name: 'Tom Hayes',      email: 'tom.hayes@serenity.yacht',      role: 'Deckhand (Crew)' },
];

// Anchor icon — same glyph used in the marketing nav logo so the brand
// reads consistently from landing → login.
const AnchorIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3" />
    <line x1="12" y1="22" x2="12" y2="8" />
    <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
  </svg>
);

const EyeIcon = ({ off }) => off ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const Spinner = () => (
  <svg className="auth-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="9" opacity="0.25" />
    <path d="M21 12a9 9 0 0 1-9 9" />
  </svg>
);

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      await signInWithPassword(email, password);
      // onAuthStateChange in AuthProvider handles the re-render.
    } catch (err) {
      setError(err?.message || 'Sign-in failed. Check your email and password.');
      setSubmitting(false);
    }
  };

  const isDev = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const useDevAccount = (devEmail) => {
    setEmail(devEmail);
    setPassword(isDev ? 'CrewNotice2026' : '');
    setError(null);
  };

  return (
    <div className="auth-screen">
      <style>{authStyles}</style>

      <main className="auth-shell">
        <div className="auth-card">
          {/* Brand header — anchor mark + wordmark, matches MarketingNav */}
          <Link href="/" className="auth-brand" aria-label="CrewNotice home">
            <span className="auth-brand-mark"><AnchorIcon /></span>
            <span className="auth-brand-text">CrewNotice</span>
          </Link>
          <h1 className="auth-title">Sign in to your vessel</h1>
          <p className="auth-subtitle">Welcome back — enter your details to continue.</p>

          {error && (
            <div className="auth-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="auth-email" className="auth-label">Email address</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@vessel.yacht"
                autoComplete="email"
                inputMode="email"
                required
                disabled={submitting}
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="auth-password" className="auth-label">Password</label>
              <div className="auth-password-wrap">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  disabled={submitting}
                  className="auth-input auth-input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="auth-password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="auth-submit">
              {submitting ? (<><Spinner /> Signing in…</>) : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account?{' '}
            <Link href="/join" className="auth-switch-link">Join your vessel</Link>
          </p>

          {isDev && (
            <div className="auth-dev">
              <div className="auth-dev-title">Dev accounts (local only)</div>
              <div className="auth-dev-hint">Click to fill credentials.</div>
              {DEV_ACCOUNTS.map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => useDevAccount(acc.email)}
                  className="auth-dev-row"
                >
                  <div className="auth-dev-name">{acc.name}</div>
                  <div className="auth-dev-meta">{acc.role} — {acc.email}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <footer className="auth-footer">
          <div className="auth-footer-links">
            <Link href="/privacy">Privacy Policy</Link>
            <span aria-hidden="true">·</span>
            <Link href="/terms">Terms of Service</Link>
          </div>
          <div className="auth-footer-credit">A product by Sharp Digital Solutions Ltd</div>
        </footer>
      </main>
    </div>
  );
}

// Scoped styles. Inline <style> keeps the redesign bundled with the
// component and avoids polluting globals.css with auth-only rules. The
// colours pull from the CSS variables in globals.css so dark mode is
// automatic via the [data-theme="dark"] attribute.
const authStyles = `
  .auth-screen {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    font-family: 'Outfit', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  }
  .auth-shell {
    width: 100%;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .auth-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 36px 32px 32px;
    box-shadow: var(--shadow-lg);
  }
  .auth-brand {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-weight: 700;
    font-size: 20px;
    letter-spacing: -0.01em;
    color: var(--text);
    text-decoration: none;
    margin-bottom: 18px;
  }
  .auth-brand-mark {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    display: grid;
    place-items: center;
    color: #fff;
    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.35);
  }
  .auth-brand-text { color: var(--text); }
  .auth-title {
    font-size: 24px;
    font-weight: 800;
    color: var(--text);
    margin: 0 0 6px;
    text-align: center;
    letter-spacing: -0.01em;
  }
  .auth-subtitle {
    font-size: 14px;
    color: var(--text-muted);
    margin: 0 0 24px;
    text-align: center;
    line-height: 1.5;
  }
  .auth-error {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    background: var(--critical-tint);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #b91c1c;
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 13px;
    margin-bottom: 18px;
    line-height: 1.45;
  }
  [data-theme="dark"] .auth-error { color: #fca5a5; }
  .auth-error svg { flex-shrink: 0; margin-top: 1px; }

  .auth-field { margin-bottom: 16px; }
  .auth-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 8px;
  }
  [data-theme="dark"] .auth-label { color: var(--text-muted); }
  .auth-input {
    width: 100%;
    min-height: 48px;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--bg-input);
    color: var(--text);
    font-size: 16px;
    font-family: inherit;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  }
  .auth-input::placeholder { color: var(--text-dim); }
  .auth-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18);
    background: var(--bg-card);
  }
  .auth-input:disabled { opacity: 0.6; cursor: not-allowed; }

  .auth-password-wrap { position: relative; }
  .auth-input-password { padding-right: 48px; }
  .auth-password-toggle {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--text-dim);
    cursor: pointer;
    border-radius: 6px;
  }
  .auth-password-toggle:hover { color: var(--text-muted); }
  .auth-password-toggle:focus-visible { outline: 2px solid #3b82f6; outline-offset: 2px; }

  .auth-submit {
    width: 100%;
    min-height: 48px;
    padding: 12px 20px;
    border-radius: 10px;
    border: none;
    background: #3b82f6;
    color: #ffffff;
    font-size: 16px;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    margin-top: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.2s ease;
    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.25);
  }
  .auth-submit:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(59, 130, 246, 0.32);
  }
  .auth-submit:disabled {
    background: #93c5fd;
    cursor: default;
    box-shadow: none;
  }
  [data-theme="dark"] .auth-submit:disabled { background: #1e3a8a; color: #cbd5e1; }

  .auth-spinner {
    animation: auth-spin 0.8s linear infinite;
  }
  @keyframes auth-spin { to { transform: rotate(360deg); } }

  .auth-switch {
    margin: 22px 0 0;
    text-align: center;
    font-size: 14px;
    color: var(--text-muted);
  }
  .auth-switch-link {
    color: #3b82f6;
    font-weight: 600;
    text-decoration: none;
  }
  .auth-switch-link:hover { color: #2563eb; text-decoration: underline; }

  .auth-dev {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px dashed var(--border);
  }
  .auth-dev-title {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 4px;
  }
  .auth-dev-hint {
    font-size: 11px;
    color: var(--text-dim);
    margin-bottom: 10px;
  }
  .auth-dev-row {
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 12px;
    margin-bottom: 6px;
    cursor: pointer;
    font-family: inherit;
  }
  .auth-dev-row:hover { border-color: var(--border-light); background: var(--bg-hover); }
  .auth-dev-name { font-size: 13px; font-weight: 700; color: var(--text); }
  .auth-dev-meta { font-size: 11px; color: var(--text-muted); }

  .auth-footer {
    text-align: center;
    padding: 4px 8px 0;
  }
  .auth-footer-links {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    margin-bottom: 8px;
  }
  .auth-footer-links a {
    color: var(--text-muted);
    text-decoration: none;
  }
  .auth-footer-links a:hover { color: var(--text); text-decoration: underline; }
  .auth-footer-links span { color: var(--text-dim); }
  .auth-footer-credit {
    font-size: 12px;
    color: var(--text-dim);
  }

  /* Mobile: card fills the screen, no shadow, gentler padding — feels
     more native than a floating card on a tiny viewport. */
  @media (max-width: 520px) {
    .auth-screen { padding: 24px 16px; align-items: flex-start; }
    .auth-card {
      padding: 28px 20px 24px;
      border-radius: 16px;
      box-shadow: none;
      border-color: transparent;
      background: var(--bg);
    }
    [data-theme="dark"] .auth-card { background: var(--bg); }
    .auth-title { font-size: 22px; }
  }
`;
