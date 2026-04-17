'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signInWithPassword } from '@/lib/auth';

// Lightweight email/password login. No sign-up flow — crew accounts are
// created out-of-band by an admin (via migration 007 in dev).
//
// Styling deliberately mirrors CrewNotice's inline-style approach so we
// don't need to introduce a shared design system mid-refactor.
const T = {
  bg: 'var(--bg)',
  bgCard: 'var(--bg-card)',
  text: 'var(--text)',
  textMuted: 'var(--text-muted)',
  textDim: 'var(--text-dim)',
  border: 'var(--border)',
  accent: '#0f766e',
  accentHover: '#115e59',
  critical: '#ef4444',
  shadow: 'var(--shadow)',
};

const DEV_ACCOUNTS = [
  { name: 'Sophie Laurent', email: 'sophie.laurent@serenity.yacht', role: 'Chief Stewardess (Admin)' },
  { name: 'Tom Hayes',      email: 'tom.hayes@serenity.yacht',      role: 'Deckhand (Crew)' },
];

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      await signInWithPassword(email, password);
      // onAuthStateChange listener in the page gate will handle the rerender.
    } catch (err) {
      setError(err?.message || 'Sign-in failed. Check your email and password.');
      setSubmitting(false);
    }
  };

  const isDev = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const useDevAccount = (devEmail) => {
    setEmail(devEmail);
    // Dev password is only available in local development
    setPassword(isDev ? 'CrewNotice2026' : '');
    setError(null);
  };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 14, background: T.accent, color: '#fff', marginBottom: 14 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="3" />
              <line x1="12" y1="22" x2="12" y2="8" />
              <path d="M5 12H2a10 10 0 0020 0h-3" />
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, margin: '0 0 4px' }}>CrewNotice</h1>
          <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>Sign in to M/Y Serenity</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, boxShadow: T.shadow, marginBottom: 16 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.textMuted, marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@serenity.yacht"
              autoComplete="email"
              required
              disabled={submitting}
              style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.textMuted, marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
              required
              disabled={submitting}
              style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          {error && (
            <div style={{ fontSize: 12, color: T.critical, background: `${T.critical}10`, border: `1px solid ${T.critical}30`, borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: 'none', background: submitting ? T.textDim : T.accent, color: '#fff', fontSize: 14, fontWeight: 700, cursor: submitting ? 'default' : 'pointer' }}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Join-a-vessel CTA for crew who have a code but no account yet. */}
        <div style={{ textAlign: 'center', marginBottom: 16, fontSize: 13, color: T.textMuted }}>
          Don&apos;t have an account?{' '}
          <Link href="/join" style={{ color: T.accent, fontWeight: 700, textDecoration: 'none' }}>
            Join a vessel
          </Link>
        </div>

        {isDev && (
          <div style={{ background: T.bgCard, border: `1px dashed ${T.border}`, borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Dev accounts (local only)</div>
            <div style={{ fontSize: 11, color: T.textDim, marginBottom: 10 }}>Click to fill credentials.</div>
            {DEV_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                type="button"
                onClick={() => useDevAccount(acc.email)}
                style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 12px', marginBottom: 6, cursor: 'pointer' }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{acc.name}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{acc.role} — {acc.email}</div>
              </button>
            ))}
          </div>
        )}

        {/* Legal footer links */}
        <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 18, fontSize: 12, marginBottom: 10 }}>
            <Link href="/privacy" style={{ color: T.textDim, textDecoration: 'none' }}>Privacy</Link>
            <Link href="/terms" style={{ color: T.textDim, textDecoration: 'none' }}>Terms</Link>
            <Link href="/cookies" style={{ color: T.textDim, textDecoration: 'none' }}>Cookies</Link>
          </div>
          <div style={{ fontSize: 11, color: T.textDim }}>A product by Sharp Digital Solutions Ltd</div>
        </div>
      </div>
    </div>
  );
}
