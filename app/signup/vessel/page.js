'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// /signup/vessel — the "I'm setting up a new vessel" flow.
//
// Step 1 collects personal details (name, email, password, role).
// Step 2 collects vessel details (name, type, departments) + T&C checkbox.
//
// On submit we:
//   a) supabase.auth.signUp on the client so the user gets an active session
//      immediately (matches the /join flow).
//   b) POST to /api/signup/vessel with the userId + vessel details. The
//      server uses the service role client to create vessel + crew_member +
//      departments + subscription in one shot (everything else would trip
//      RLS because there's no crew_member row yet).
//   c) redirect to /app, where the AuthProvider picks up the already-set
//      session and boots straight into the admin view.
//
// If the Supabase project requires email confirmation, signUp returns a
// user with no session — we bail with a "check your email" state and the
// user signs in manually after confirming. In that case the vessel etc.
// is still created server-side using the returned userId.
// ---------------------------------------------------------------------------

// Palette mirrors /join so both auth screens share the same look.
const T = {
  bg: 'var(--bg)',
  bgCard: 'var(--bg-card)',
  bgInput: 'var(--bg-input)',
  text: 'var(--text)',
  textMuted: 'var(--text-muted)',
  textDim: 'var(--text-dim)',
  border: 'var(--border)',
  accent: '#3b82f6',
  accentDark: '#2563eb',
  accentTint: 'var(--accent-tint)',
  critical: '#ef4444',
  shadow: 'var(--shadow)',
};

// 16px / 48px min-height so iOS Safari doesn't zoom on focus.
const input = {
  width: '100%',
  minHeight: 48,
  padding: '12px 16px',
  borderRadius: 8,
  border: `1px solid ${T.border}`,
  background: T.bgInput,
  color: T.text,
  fontSize: 16,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const label = {
  display: 'block',
  fontSize: 14,
  fontWeight: 600,
  color: T.text,
  marginBottom: 8,
};

const ROLES = [
  'Captain',
  'Chief Officer',
  'Chief Engineer',
  'Chief Stewardess',
  'Bosun',
  'Purser',
  'Other',
];

const VESSEL_TYPES = ['Motor Yacht', 'Sailing Yacht', 'Explorer Yacht', 'Commercial Vessel'];

const DEFAULT_DEPARTMENTS = [
  { id: 'Bridge', label: 'Bridge' },
  { id: 'Deck', label: 'Deck' },
  { id: 'Engine', label: 'Engine' },
  { id: 'Interior', label: 'Interior' },
  { id: 'Safety', label: 'Safety' },
];

export default function VesselSignupPage() {
  const [step, setStep] = useState('account'); // 'account' | 'vessel' | 'verify-email'

  // Step 1
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('');

  // Step 2
  const [vesselName, setVesselName] = useState('');
  const [vesselType, setVesselType] = useState(VESSEL_TYPES[0]);
  const [departments, setDepartments] = useState(
    Object.fromEntries(DEFAULT_DEPARTMENTS.map(d => [d.id, true])),
  );
  const [agreed, setAgreed] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleAccountNext = (e) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim() || !password || !role.trim()) {
      setError('Please fill in every field before continuing.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    // Defer auth signup until the vessel step so the user can back out
    // without creating an orphaned auth.users row.
    setStep('vessel');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);

    if (!vesselName.trim()) {
      setError('Vessel name is required.');
      return;
    }
    if (!agreed) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    const selectedDepartments = Object.entries(departments)
      .filter(([, on]) => on)
      .map(([id]) => id);

    setSubmitting(true);

    try {
      // a) Supabase Auth signup.
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName.trim() } },
      });
      if (signUpError) {
        // Supabase's default message is "User already registered" — soften.
        if (/already/i.test(signUpError.message || '')) {
          setError('An account with this email already exists. Please log in instead.');
        } else {
          setError(signUpError.message || 'Could not create your account.');
        }
        setSubmitting(false);
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        setError('Sign-up did not return a user ID. Please try again.');
        setSubmitting(false);
        return;
      }

      // b) Server-side vessel + crew + departments + subscription.
      const res = await fetch('/api/signup/vessel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email: email.trim(),
          fullName: fullName.trim(),
          role: role.trim(),
          vesselName: vesselName.trim(),
          vesselType,
          departments: selectedDepartments,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error || 'Could not create your vessel. Please try again.');
        setSubmitting(false);
        return;
      }

      // c) If email confirmation is required Supabase returned no session,
      //    so send the user to the "check your email" state instead of the
      //    app. If a session exists, drop straight into /app.
      if (!authData.session) {
        setStep('verify-email');
        setSubmitting(false);
        return;
      }

      window.location.href = '/app';
    } catch (err) {
      console.error('[signup/vessel] submit failed', err);
      setError(err?.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const toggleDepartment = (id) => {
    setDepartments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      style={{
        background: T.bg,
        minHeight: '100vh',
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link
            href="/"
            aria-label="CrewNotice home"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${T.accent}, ${T.accentDark})`,
              color: '#fff',
              marginBottom: 14,
              boxShadow: '0 10px 24px rgba(59,130,246,0.28)',
              textDecoration: 'none',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="3" />
              <line x1="12" y1="22" x2="12" y2="8" />
              <path d="M5 12H2a10 10 0 0020 0h-3" />
            </svg>
          </Link>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: T.text, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
            Set up your vessel
          </h1>
          <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>
            30-day free trial. No credit card required.
          </p>
        </div>

        {/* Progress */}
        {step !== 'verify-email' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, justifyContent: 'center' }}>
            <Step n={1} label="Account" active={step === 'account'} done={step === 'vessel'} />
            <div style={{ width: 32, height: 2, background: step === 'account' ? T.border : T.accent }} />
            <Step n={2} label="Vessel" active={step === 'vessel'} done={false} />
          </div>
        )}

        {/* Step 1 — account */}
        {step === 'account' && (
          <form onSubmit={handleAccountNext} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, boxShadow: T.shadow }}>
            <div style={{ marginBottom: 14 }}>
              <label style={label}>Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Jane Smith"
                autoComplete="name"
                required
                style={input}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={label}>Work email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@vessel.yacht"
                autoComplete="email"
                required
                style={input}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={label}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  style={{ ...input, paddingRight: 56 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: T.textMuted,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '6px 10px',
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={label}>Your role on board</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                required
                style={{ ...input, cursor: 'pointer' }}
              >
                <option value="" disabled>Select your role…</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {error && <ErrorBanner>{error}</ErrorBanner>}

            <button
              type="submit"
              style={{
                width: '100%',
                minHeight: 48,
                padding: '12px 20px',
                borderRadius: 10,
                border: 'none',
                background: T.accent,
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(59,130,246,0.25)',
              }}
            >
              Continue
            </button>
          </form>
        )}

        {/* Step 2 — vessel */}
        {step === 'vessel' && (
          <form onSubmit={handleCreate} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, boxShadow: T.shadow }}>
            <div style={{ marginBottom: 14 }}>
              <label style={label}>Vessel name</label>
              <input
                type="text"
                value={vesselName}
                onChange={e => setVesselName(e.target.value)}
                placeholder="M/Y Example"
                required
                disabled={submitting}
                style={input}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={label}>Vessel type</label>
              <select
                value={vesselType}
                onChange={e => setVesselType(e.target.value)}
                disabled={submitting}
                style={{ ...input, cursor: submitting ? 'default' : 'pointer' }}
              >
                {VESSEL_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={label}>Departments</label>
              <p style={{ fontSize: 12, color: T.textMuted, margin: '-4px 0 10px' }}>
                Pick the departments your vessel uses. You can add more later.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
                {DEFAULT_DEPARTMENTS.map(d => (
                  <label
                    key={d.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      border: `1px solid ${departments[d.id] ? T.accent : T.border}`,
                      background: departments[d.id] ? T.accentTint : T.bgInput,
                      borderRadius: 10,
                      cursor: submitting ? 'default' : 'pointer',
                      minHeight: 44,
                      transition: 'border-color 120ms ease, background 120ms ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!departments[d.id]}
                      onChange={() => toggleDepartment(d.id)}
                      disabled={submitting}
                      style={{ accentColor: T.accent, width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{d.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 18, cursor: submitting ? 'default' : 'pointer' }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                disabled={submitting}
                style={{ marginTop: 3, accentColor: T.accent, width: 16, height: 16, flexShrink: 0 }}
              />
              <span style={{ fontSize: 12, lineHeight: 1.5, color: T.textMuted }}>
                I agree to the{' '}
                <Link href="/terms" target="_blank" style={{ color: T.accent, textDecoration: 'underline' }}>Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" target="_blank" style={{ color: T.accent, textDecoration: 'underline' }}>Privacy Policy</Link>
              </span>
            </label>

            {error && <ErrorBanner>{error}</ErrorBanner>}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                minHeight: 48,
                padding: '12px 20px',
                borderRadius: 10,
                border: 'none',
                background: submitting ? T.textDim : T.accent,
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                cursor: submitting ? 'default' : 'pointer',
                boxShadow: submitting ? 'none' : '0 4px 10px rgba(59,130,246,0.25)',
              }}
            >
              {submitting ? 'Creating your vessel…' : 'Create Vessel & Start Trial'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('account'); setError(null); }}
              disabled={submitting}
              style={{
                width: '100%',
                marginTop: 10,
                padding: '10px 16px',
                borderRadius: 10,
                border: `1px solid ${T.border}`,
                background: 'none',
                color: T.textMuted,
                fontSize: 13,
                fontWeight: 600,
                cursor: submitting ? 'default' : 'pointer',
              }}
            >
              ← Back
            </button>
          </form>
        )}

        {/* Verify-email state */}
        {step === 'verify-email' && (
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, boxShadow: T.shadow, textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 12, background: T.accentTint, color: T.accent, marginBottom: 14 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: '0 0 8px' }}>Check your email</h2>
            <p style={{ fontSize: 13, color: T.textMuted, margin: '0 0 18px', lineHeight: 1.5 }}>
              We sent a confirmation link to <strong style={{ color: T.text }}>{email}</strong>. Click it to activate your account, then sign in to access your vessel.
            </p>
            <Link
              href="/app"
              style={{
                display: 'inline-block',
                padding: '12px 20px',
                borderRadius: 10,
                background: T.accent,
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Go to sign in
            </Link>
          </div>
        )}

        {/* Existing user / invite flow link */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: T.textMuted }}>
          Already have an account?{' '}
          <Link href="/app" style={{ color: T.accent, fontWeight: 700, textDecoration: 'none' }}>
            Log in
          </Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: T.textMuted }}>
          Joining an existing vessel?{' '}
          <Link href="/join" style={{ color: T.accent, fontWeight: 700, textDecoration: 'none' }}>
            Use an invite code
          </Link>
        </div>

        {/* Legal footer */}
        <div
          style={{
            textAlign: 'center',
            marginTop: 32,
            paddingTop: 16,
            borderTop: `1px solid ${T.border}`,
            display: 'flex',
            justifyContent: 'center',
            gap: 18,
            fontSize: 12,
          }}
        >
          <Link href="/privacy" style={{ color: T.textDim, textDecoration: 'none' }}>Privacy</Link>
          <Link href="/terms" style={{ color: T.textDim, textDecoration: 'none' }}>Terms</Link>
          <Link href="/cookies" style={{ color: T.textDim, textDecoration: 'none' }}>Cookies</Link>
        </div>
      </div>
    </div>
  );
}

function Step({ n, label: text, active, done }) {
  const color = done ? '#10b981' : active ? '#3b82f6' : '#94a3b8';
  const bg = done ? '#d1fae5' : active ? '#dbeafe' : '#f1f5f9';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: bg, color, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {done ? '✓' : n}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color }}>{text}</span>
    </div>
  );
}

function ErrorBanner({ children }) {
  return (
    <div
      style={{
        fontSize: 12,
        color: T.critical,
        background: `${T.critical}10`,
        border: `1px solid ${T.critical}30`,
        borderRadius: 8,
        padding: '10px 12px',
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}
