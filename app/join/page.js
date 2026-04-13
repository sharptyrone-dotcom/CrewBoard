'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { consumeInvite, validateInviteCode } from '@/lib/invites';

// ---------------------------------------------------------------------------
// /join — two-step sign-up flow driven by a vessel_invites code
// ---------------------------------------------------------------------------
// Step 1: user pastes (or has the URL pre-fill) an invite code, we call
//         validateInviteCode against Supabase via the permissive lookup
//         policy added in migration 009.
// Step 2: we show a form pre-filled with the invite's role/department
//         presets (editable). On submit we:
//           a) supabase.auth.signUp — creates the auth.users row + session
//           b) insert crew_members — allowed by crew_members_insert_self
//           c) consumeInvite — SECURITY DEFINER RPC decrements uses_remaining
//           d) redirect to /app
//
// Email confirmation: if the Supabase project has "Enable email confirms"
// ticked, signUp returns a null session and we bail with a "check your
// email" message instead of attempting the crew_members insert (which
// would be blocked by RLS since there's no auth.uid() yet).
// ---------------------------------------------------------------------------

// Inline theme object — matches the landing page palette (blue accent,
// light surfaces) rather than the teal login screen.
const T = {
  bg: '#f8fafc',
  bgCard: '#ffffff',
  text: '#0f172a',
  textMuted: '#475569',
  textDim: '#94a3b8',
  border: '#e2e8f0',
  accent: '#3b82f6',
  accentDark: '#2563eb',
  accentTint: '#f0f7ff',
  critical: '#ef4444',
  success: '#10b981',
  shadow: '0 1px 3px rgba(15,23,42,0.05), 0 4px 12px rgba(15,23,42,0.04)',
  shadowLg: '0 10px 30px rgba(15,23,42,0.08)',
};

const DEPARTMENTS = ['Bridge', 'Deck', 'Engine', 'Interior', 'Safety', 'General'];

const input = {
  width: '100%',
  padding: 12,
  borderRadius: 10,
  border: `1px solid ${T.border}`,
  background: T.bgCard,
  color: T.text,
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const label = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: T.textMuted,
  marginBottom: 6,
};

// Derives two-letter initials for the avatar_initials column so the new
// crew member's avatar looks the same as the seeded ones.
function deriveInitials(fullName) {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function JoinPage() {
  // Step state. 'code' → 'form' → 'done' (redirect) or 'verify-email'.
  const [step, setStep] = useState('code');

  // Step 1 state
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [codeError, setCodeError] = useState(null);
  const [invite, setInvite] = useState(null);

  // Step 2 state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('General');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Pre-fill the code from ?code=XXXXXXXX so admins can share a single link.
  // Reading window.location here (inside useEffect) sidesteps the Next.js
  // Suspense requirement around useSearchParams in App Router client pages.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('code');
    if (fromUrl) {
      setCode(fromUrl.trim().toUpperCase());
    }
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setVerifying(true);
    setCodeError(null);
    try {
      const found = await validateInviteCode(code);
      if (!found) {
        setCodeError('That code is not valid, has been used up, or has expired.');
        setVerifying(false);
        return;
      }
      setInvite(found);
      // Pre-fill the form from the invite presets (still editable).
      setRole(found.role_preset || '');
      setDepartment(found.department_preset || 'General');
      setStep('form');
    } catch (err) {
      setCodeError(err?.message || 'Could not reach the server. Try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!invite) return;
    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setSubmitError('Password must be at least 8 characters.');
      return;
    }
    if (!fullName.trim() || !email.trim() || !role.trim()) {
      setSubmitError('Name, email and role are required.');
      return;
    }
    if (!agreed) {
      setSubmitError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Re-validate the code right before consumption to close the gap
      // between step 1 and step 2 (another user could have used the last
      // seat while this form was open).
      const fresh = await validateInviteCode(invite.code);
      if (!fresh) {
        setSubmitError('This invite is no longer valid. It may have been used up while you were filling the form.');
        setSubmitting(false);
        return;
      }

      // a) Supabase Auth — creates auth.users row + session (if email
      //    confirmation is disabled).
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
        },
      });
      if (signUpError) throw signUpError;

      // If email confirmation is required, Supabase returns a user but no
      // session. We can't proceed with the crew_members insert without an
      // auth.uid(), so bail here with a "check your email" message. The
      // user will need to click the confirmation link and sign in manually
      // afterwards.
      if (!authData.session) {
        setStep('verify-email');
        setSubmitting(false);
        return;
      }

      const userId = authData.user?.id;
      if (!userId) throw new Error('Sign-up did not return a user id.');

      // b) Insert the crew_members row. Allowed by the new
      //    crew_members_insert_self policy (id = auth.uid()).
      const { error: crewError } = await supabase
        .from('crew_members')
        .insert({
          id: userId,
          vessel_id: fresh.vessel_id,
          email: email.trim(),
          full_name: fullName.trim(),
          role: role.trim(),
          department,
          is_admin: false,
          is_hod: false,
          avatar_initials: deriveInitials(fullName),
          is_active: true,
        });
      if (crewError) throw crewError;

      // c) Consume the invite. SECURITY DEFINER RPC so the non-admin new
      //    user can decrement uses_remaining without tripping RLS.
      try {
        await consumeInvite(fresh.id);
      } catch (consumeErr) {
        // Non-fatal — the account is already created. Log and continue.
        console.warn('[join] consumeInvite failed (non-fatal)', consumeErr);
      }

      // d) Redirect to the authed app. The session is already set on the
      //    supabase client so /app's AuthProvider will pick it up
      //    immediately.
      window.location.href = '/app';
    } catch (err) {
      console.error('[join] submit failed', err);
      setSubmitError(err?.message || 'Could not create your account. Try again.');
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${T.accent}, ${T.accentDark})`, color: '#fff', marginBottom: 14, boxShadow: '0 10px 24px rgba(59,130,246,0.28)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="3" />
              <line x1="12" y1="22" x2="12" y2="8" />
              <path d="M5 12H2a10 10 0 0020 0h-3" />
            </svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: T.text, margin: '0 0 4px', letterSpacing: '-0.01em' }}>Join your vessel</h1>
          <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>Enter the invite code your admin shared with you.</p>
        </div>

        {/* Progress indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, justifyContent: 'center' }}>
          <Step n={1} label="Code" active={step === 'code'} done={step !== 'code'} />
          <div style={{ width: 32, height: 2, background: step === 'code' ? T.border : T.accent }} />
          <Step n={2} label="Details" active={step === 'form'} done={step === 'verify-email'} />
        </div>

        {/* Step 1: enter code */}
        {step === 'code' && (
          <form onSubmit={handleVerify} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, boxShadow: T.shadow }}>
            <div style={{ marginBottom: 16 }}>
              <label style={label}>Invite code</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="XXXXXXXX"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                required
                disabled={verifying}
                maxLength={16}
                style={{ ...input, letterSpacing: '0.18em', fontSize: 16, fontWeight: 700, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>
            {codeError && (
              <div style={{ fontSize: 12, color: T.critical, background: `${T.critical}10`, border: `1px solid ${T.critical}30`, borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
                {codeError}
              </div>
            )}
            <button
              type="submit"
              disabled={verifying || !code.trim()}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: 'none', background: verifying || !code.trim() ? T.textDim : T.accent, color: '#fff', fontSize: 14, fontWeight: 700, cursor: verifying || !code.trim() ? 'default' : 'pointer' }}
            >
              {verifying ? 'Verifying…' : 'Verify code'}
            </button>
          </form>
        )}

        {/* Step 2: registration form */}
        {step === 'form' && invite && (
          <form onSubmit={handleJoin} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, boxShadow: T.shadow }}>
            <div style={{ background: T.accentTint, border: `1px solid ${T.accent}30`, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: T.accentDark, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Code verified — {invite.uses_remaining} use{invite.uses_remaining === 1 ? '' : 's'} remaining
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={label}>Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Jane Smith"
                autoComplete="name"
                required
                disabled={submitting}
                style={input}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@vessel.yacht"
                autoComplete="email"
                required
                disabled={submitting}
                style={input}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={label}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  required
                  disabled={submitting}
                  style={input}
                />
              </div>
              <div>
                <label style={label}>Confirm</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  required
                  disabled={submitting}
                  style={input}
                />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={label}>
                Role
                {invite.role_preset && (
                  <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 600, color: T.accentDark, background: T.accentTint, padding: '2px 6px', borderRadius: 4, textTransform: 'none', letterSpacing: 0 }}>
                    pre-filled
                  </span>
                )}
              </label>
              <input
                type="text"
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Deckhand"
                required
                disabled={submitting}
                style={input}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={label}>
                Department
                {invite.department_preset && (
                  <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 600, color: T.accentDark, background: T.accentTint, padding: '2px 6px', borderRadius: 4, textTransform: 'none', letterSpacing: 0 }}>
                    pre-filled
                  </span>
                )}
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                disabled={submitting}
                style={{ ...input, cursor: submitting ? 'default' : 'pointer' }}
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
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

            {submitError && (
              <div style={{ fontSize: 12, color: T.critical, background: `${T.critical}10`, border: `1px solid ${T.critical}30`, borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: 'none', background: submitting ? T.textDim : T.accent, color: '#fff', fontSize: 14, fontWeight: 700, cursor: submitting ? 'default' : 'pointer' }}
            >
              {submitting ? 'Joining…' : 'Join Vessel'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('code'); setInvite(null); setSubmitError(null); }}
              disabled={submitting}
              style={{ width: '100%', marginTop: 10, padding: '10px 16px', borderRadius: 10, border: `1px solid ${T.border}`, background: 'none', color: T.textMuted, fontSize: 13, fontWeight: 600, cursor: submitting ? 'default' : 'pointer' }}
            >
              ← Use a different code
            </button>
          </form>
        )}

        {/* Step "verify-email": shown when Supabase requires email
            confirmation. The account exists but the crew_members row hasn't
            been created yet — that'll need to happen after they confirm. */}
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
              We sent a confirmation link to <strong style={{ color: T.text }}>{email}</strong>. Click it to activate your account, then sign in to finish joining the vessel.
            </p>
            <Link
              href="/app"
              style={{ display: 'inline-block', padding: '12px 20px', borderRadius: 10, border: 'none', background: T.accent, color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
            >
              Go to sign in
            </Link>
          </div>
        )}

        {/* Existing-user link */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: T.textMuted }}>
          Already have an account?{' '}
          <Link href="/app" style={{ color: T.accent, fontWeight: 700, textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>

        {/* Legal footer links */}
        <div style={{ textAlign: 'center', marginTop: 32, paddingTop: 16, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'center', gap: 18, fontSize: 12 }}>
          <Link href="/privacy" style={{ color: T.textDim, textDecoration: 'none' }}>Privacy</Link>
          <Link href="/terms" style={{ color: T.textDim, textDecoration: 'none' }}>Terms</Link>
          <Link href="/cookies" style={{ color: T.textDim, textDecoration: 'none' }}>Cookies</Link>
        </div>
      </div>
    </div>
  );
}

function Step({ n, label, active, done }) {
  const color = done ? '#10b981' : active ? '#3b82f6' : '#94a3b8';
  const bg = done ? '#d1fae5' : active ? '#dbeafe' : '#f1f5f9';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: bg, color, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {done ? '✓' : n}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color }}>{label}</span>
    </div>
  );
}
