'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/components/AuthProvider';
import { createInvite, listInvitesForVessel } from '@/lib/invites';

// ---------------------------------------------------------------------------
// /admin/invites — generate + manage vessel invite codes
// ---------------------------------------------------------------------------
// Admin-only screen for issuing join codes. Flow:
//
//   1. AuthProvider resolves the current crew member.
//   2. If loading → spinner. If anon → "you must sign in". If not admin →
//      access denied. Otherwise we render the admin UI.
//   3. On mount we fetch existing invites for the admin's vessel.
//   4. Admin fills the form (role preset, department preset, uses remaining,
//      expiry), clicks Generate, and we prepend the new invite to the list.
//   5. Each invite row shows code / uses remaining / expiry and a copy
//      button that writes `${origin}/join?code=XXXXXXXX` to the clipboard.
//
// The whole file is a client component because it needs supabase + clipboard
// + window.location.origin. Auth state comes from a locally-scoped
// AuthProvider so this route stays independent of /app's provider tree.
// ---------------------------------------------------------------------------

// Inline theme matching /join and the landing page (blue accent, light).
const T = {
  bg: '#f8fafc',
  bgCard: '#ffffff',
  text: '#0f172a',
  textMuted: '#475569',
  textDim: '#94a3b8',
  border: '#e2e8f0',
  borderLight: '#cbd5e1',
  accent: '#3b82f6',
  accentDark: '#2563eb',
  accentTint: '#f0f7ff',
  critical: '#ef4444',
  criticalTint: '#fef2f2',
  success: '#10b981',
  successTint: '#d1fae5',
  gold: '#f59e0b',
  shadow: '0 1px 3px rgba(15,23,42,0.05), 0 4px 12px rgba(15,23,42,0.04)',
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

// Returns a YYYY-MM-DDTHH:mm string suitable for a <input type="datetime-local">
// default value, offset by a number of days from now.
function datetimeLocalDefault(daysFromNow = 7) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  // Trim the timezone offset manually so toISOString() -> local-ish string.
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Nice human-readable "in 3 days" / "expired" label for the expiry column.
// Kept here (rather than in lib/invites.js) because it's purely presentational.
function formatExpiry(expiresAt) {
  if (!expiresAt) return 'Never';
  const d = new Date(expiresAt);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  if (diffMs <= 0) return 'Expired';
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 60) return `in ${diffMin} min`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 48) return `in ${diffHr}h`;
  const diffDay = Math.round(diffHr / 24);
  return `in ${diffDay}d`;
}

function isInviteExpired(invite) {
  if (!invite.expires_at) return false;
  return new Date(invite.expires_at).getTime() <= Date.now();
}

function inviteStatusPill(invite) {
  if (invite.uses_remaining <= 0) {
    return { label: 'Used', color: T.textDim, bg: '#f1f5f9' };
  }
  if (isInviteExpired(invite)) {
    return { label: 'Expired', color: T.critical, bg: T.criticalTint };
  }
  return { label: 'Active', color: T.success, bg: T.successTint };
}

// Main inner component. Expects to render inside an <AuthProvider>.
function InvitesPageInner() {
  const { status, user, loadError } = useAuth();

  // Existing invites for the current vessel.
  const [invites, setInvites] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState(null);

  // Form state.
  const [rolePreset, setRolePreset] = useState('');
  const [departmentPreset, setDepartmentPreset] = useState('');
  const [usesRemaining, setUsesRemaining] = useState(1);
  const [expiryLocal, setExpiryLocal] = useState(() => datetimeLocalDefault(7));
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);

  // Per-row "Copied!" feedback keyed on invite id.
  const [copiedId, setCopiedId] = useState(null);

  // origin is only available client-side — memo'd once on mount.
  const origin = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return window.location.origin;
  }, []);

  // Fetch the existing invites as soon as we have an authed admin user.
  useEffect(() => {
    let cancelled = false;
    if (status !== 'authed' || !user?.isAdmin || !user?.vesselId) return;
    setLoadingList(true);
    (async () => {
      try {
        const rows = await listInvitesForVessel(user.vesselId);
        if (cancelled) return;
        setInvites(rows);
        setListError(null);
      } catch (err) {
        if (cancelled) return;
        setListError(err?.message || 'Could not load invites.');
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();
    return () => { cancelled = true; };
  }, [status, user?.isAdmin, user?.vesselId]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!user?.vesselId) return;

    // Parse the datetime-local string back into an ISO timestamp. An empty
    // field means "no expiry" which we send as null.
    let expiresAt = null;
    if (expiryLocal) {
      const parsed = new Date(expiryLocal);
      if (Number.isNaN(parsed.getTime())) {
        setGenerateError('Expiry date is invalid.');
        return;
      }
      expiresAt = parsed.toISOString();
    }

    const usesInt = parseInt(usesRemaining, 10);
    if (!Number.isFinite(usesInt) || usesInt < 1) {
      setGenerateError('Uses remaining must be at least 1.');
      return;
    }

    setGenerating(true);
    setGenerateError(null);
    try {
      const created = await createInvite(user.vesselId, {
        rolePreset: rolePreset.trim() || null,
        departmentPreset: departmentPreset || null,
        usesRemaining: usesInt,
        expiresAt,
      });
      // Prepend so the newest invite is visually at the top of the list
      // (listInvitesForVessel also sorts desc, but we don't want to refetch).
      setInvites(prev => [created, ...prev]);
      // Reset only the "variable" fields — keep role/dept presets in case
      // the admin is generating a batch of similar codes.
      setExpiryLocal(datetimeLocalDefault(7));
      setUsesRemaining(1);
    } catch (err) {
      console.error('[admin/invites] generate failed', err);
      setGenerateError(err?.message || 'Could not generate invite. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (invite) => {
    const url = `${origin}/join?code=${invite.code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(invite.id);
      setTimeout(() => {
        setCopiedId(curr => (curr === invite.id ? null : curr));
      }, 2000);
    } catch (err) {
      console.warn('[admin/invites] clipboard write failed', err);
    }
  };

  // ── Gated states ──────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textMuted, fontSize: 13 }}>
        Loading…
      </div>
    );
  }

  if (status === 'anon') {
    return (
      <GatedShell
        title="Sign in required"
        body={loadError || 'You must sign in as an admin to manage invites.'}
      />
    );
  }

  if (!user?.isAdmin) {
    return (
      <GatedShell
        title="Admins only"
        body="This page is only available to vessel admins."
      />
    );
  }

  // ── Main render ───────────────────────────────────────────────────
  return (
    <div style={{ background: T.bg, minHeight: '100vh', padding: '32px 20px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>Admin</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: T.text, margin: 0, letterSpacing: '-0.01em' }}>Invite Crew</h1>
            <p style={{ fontSize: 13, color: T.textMuted, margin: '4px 0 0' }}>Generate join codes for new crew members. Share the link or the code itself.</p>
          </div>
          <Link
            href="/app"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.textMuted, fontSize: 12, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}
          >
            ← Back to app
          </Link>
        </div>

        {/* Generate form */}
        <form
          onSubmit={handleGenerate}
          style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, boxShadow: T.shadow, marginBottom: 24 }}
        >
          <h2 style={{ fontSize: 14, fontWeight: 800, color: T.text, margin: '0 0 16px' }}>Generate a new invite</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={label}>
                Role preset
                <span style={{ marginLeft: 6, fontWeight: 500, color: T.textDim }}>(optional)</span>
              </label>
              <input
                type="text"
                value={rolePreset}
                onChange={e => setRolePreset(e.target.value)}
                placeholder="e.g. Deckhand"
                disabled={generating}
                style={input}
              />
            </div>
            <div>
              <label style={label}>
                Department preset
                <span style={{ marginLeft: 6, fontWeight: 500, color: T.textDim }}>(optional)</span>
              </label>
              <select
                value={departmentPreset}
                onChange={e => setDepartmentPreset(e.target.value)}
                disabled={generating}
                style={{ ...input, cursor: generating ? 'default' : 'pointer' }}
              >
                <option value="">— None —</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 18 }}>
            <div>
              <label style={label}>Uses remaining</label>
              <input
                type="number"
                min={1}
                max={999}
                value={usesRemaining}
                onChange={e => setUsesRemaining(e.target.value)}
                disabled={generating}
                style={input}
              />
            </div>
            <div>
              <label style={label}>Expires at</label>
              <input
                type="datetime-local"
                value={expiryLocal}
                onChange={e => setExpiryLocal(e.target.value)}
                disabled={generating}
                style={input}
              />
            </div>
          </div>

          {generateError && (
            <div style={{ fontSize: 12, color: T.critical, background: T.criticalTint, border: `1px solid ${T.critical}30`, borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
              {generateError}
            </div>
          )}

          <button
            type="submit"
            disabled={generating}
            style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: 'none', background: generating ? T.textDim : T.accent, color: '#fff', fontSize: 14, fontWeight: 700, cursor: generating ? 'default' : 'pointer' }}
          >
            {generating ? 'Generating…' : 'Generate Invite Code'}
          </button>
        </form>

        {/* Existing invites */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
            Existing invites
          </h2>
          <span style={{ fontSize: 12, color: T.textDim }}>
            {invites.length} total
          </span>
        </div>

        {loadingList && (
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, textAlign: 'center', color: T.textMuted, fontSize: 13 }}>
            Loading invites…
          </div>
        )}

        {!loadingList && listError && (
          <div style={{ fontSize: 12, color: T.critical, background: T.criticalTint, border: `1px solid ${T.critical}30`, borderRadius: 8, padding: '10px 12px' }}>
            {listError}
          </div>
        )}

        {!loadingList && !listError && invites.length === 0 && (
          <div style={{ background: T.bgCard, border: `1px dashed ${T.border}`, borderRadius: 14, padding: 24, textAlign: 'center', color: T.textDim, fontSize: 13 }}>
            No invites yet. Generate one above to get started.
          </div>
        )}

        {!loadingList && !listError && invites.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {invites.map(invite => {
              const pill = inviteStatusPill(invite);
              const joinUrl = `${origin}/join?code=${invite.code}`;
              const copied = copiedId === invite.id;
              return (
                <div
                  key={invite.id}
                  style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, boxShadow: T.shadow }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <code
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 16,
                          fontWeight: 800,
                          letterSpacing: '0.14em',
                          color: T.text,
                          background: T.accentTint,
                          padding: '6px 10px',
                          borderRadius: 8,
                          border: `1px solid ${T.accent}20`,
                        }}
                      >
                        {invite.code}
                      </code>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: 1.1,
                          color: pill.color,
                          background: pill.bg,
                          padding: '4px 9px',
                          borderRadius: 6,
                        }}
                      >
                        {pill.label}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(invite)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: `1px solid ${copied ? T.success : T.border}`,
                        background: copied ? T.successTint : T.bgCard,
                        color: copied ? T.success : T.accentDark,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      {copied ? '✓ Copied' : 'Copy link'}
                    </button>
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: T.textMuted,
                      fontFamily: "'JetBrains Mono', monospace",
                      background: T.bg,
                      border: `1px solid ${T.border}`,
                      borderRadius: 8,
                      padding: '8px 10px',
                      marginBottom: 10,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {joinUrl}
                  </div>

                  <div style={{ display: 'flex', gap: 16, fontSize: 11, color: T.textMuted, flexWrap: 'wrap' }}>
                    <span>
                      <strong style={{ color: T.text }}>{invite.uses_remaining}</strong> use{invite.uses_remaining === 1 ? '' : 's'} left
                    </span>
                    <span>
                      Expires <strong style={{ color: T.text }}>{formatExpiry(invite.expires_at)}</strong>
                    </span>
                    {invite.role_preset && (
                      <span>
                        Role: <strong style={{ color: T.text }}>{invite.role_preset}</strong>
                      </span>
                    )}
                    {invite.department_preset && (
                      <span>
                        Dept: <strong style={{ color: T.text }}>{invite.department_preset}</strong>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Shared shell for auth-gated "access denied" style screens — keeps the
// look consistent whether we're rejecting an anon user or a non-admin.
function GatedShell({ title, body }) {
  return (
    <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, boxShadow: T.shadow, maxWidth: 360, width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 12, background: T.accentTint, color: T.accent, marginBottom: 12 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: '0 0 6px' }}>{title}</h1>
        <p style={{ fontSize: 13, color: T.textMuted, margin: '0 0 16px', lineHeight: 1.5 }}>{body}</p>
        <Link
          href="/app"
          style={{ display: 'inline-block', padding: '10px 18px', borderRadius: 10, border: 'none', background: T.accent, color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
        >
          Go to sign in
        </Link>
      </div>
    </div>
  );
}

// Default export wraps the inner component in its own AuthProvider so this
// route doesn't have to share a tree with /app — each route owns its own
// auth state, avoiding weird double-mount scenarios during navigation.
export default function AdminInvitesPage() {
  return (
    <AuthProvider>
      <InvitesPageInner />
    </AuthProvider>
  );
}
