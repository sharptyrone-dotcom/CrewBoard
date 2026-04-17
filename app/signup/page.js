import Link from 'next/link';

// ---------------------------------------------------------------------------
// /signup — the "which path are you on?" hub.
//
// Two options, shown side-by-side on desktop and stacked on mobile:
//   1) "Set up a new vessel" → /signup/vessel (the owner/captain flow that
//      creates a vessel record and becomes the first admin)
//   2) "Join an existing vessel" → /join (the invite-code flow)
//
// We intentionally `noindex` the whole /signup tree: these pages are
// transactional, not marketing, and we don't want them competing with the
// landing page in search results.
// ---------------------------------------------------------------------------

export const metadata = {
  title: 'Get Started — CrewNotice',
  description: '30-day free trial. No credit card required.',
  robots: { index: false, follow: false },
};

const T = {
  bg: 'var(--bg)',
  bgCard: 'var(--bg-card)',
  text: 'var(--text)',
  textMuted: 'var(--text-muted)',
  textDim: 'var(--text-dim)',
  border: 'var(--border)',
  accent: '#3b82f6',
  accentDark: '#2563eb',
  accentTint: 'var(--accent-tint)',
  shadow: 'var(--shadow)',
};

export default function SignupHubPage() {
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
      <div style={{ width: '100%', maxWidth: 780 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
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
              marginBottom: 18,
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
          <h1 style={{ fontSize: 30, fontWeight: 800, color: T.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Get Started with CrewNotice
          </h1>
          <p style={{ fontSize: 15, color: T.textMuted, margin: 0 }}>
            30-day free trial. No credit card required.
          </p>
        </div>

        {/* Two choice cards */}
        <div className="signup-hub-grid">
          <Link href="/signup/vessel" className="signup-hub-card" aria-label="Set up a new vessel">
            <div className="signup-hub-icon signup-hub-icon-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1" />
                <path d="M19.38 20A11.6 11.6 0 0022 14l-8.63-5.23a2 2 0 00-2 0L3 14a11.6 11.6 0 002.61 6" />
                <path d="M12 10v-3.5a2.5 2.5 0 015 0V8" />
              </svg>
            </div>
            <div className="signup-hub-card-body">
              <div className="signup-hub-card-title">Set up a new vessel</div>
              <div className="signup-hub-card-desc">
                I&apos;m the captain, owner, or manager. I need to create a vessel and invite my crew.
              </div>
              <div className="signup-hub-card-cta">
                Start your free trial
                <Arrow />
              </div>
            </div>
          </Link>

          <Link href="/join" className="signup-hub-card" aria-label="Join an existing vessel">
            <div className="signup-hub-icon signup-hub-icon-ghost">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <div className="signup-hub-card-body">
              <div className="signup-hub-card-title">Join an existing vessel</div>
              <div className="signup-hub-card-desc">
                I have an invite code from my vessel&apos;s admin. I&apos;m joining an existing crew.
              </div>
              <div className="signup-hub-card-cta">
                Enter invite code
                <Arrow />
              </div>
            </div>
          </Link>
        </div>

        {/* Existing user */}
        <div style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: T.textMuted }}>
          Already have an account?{' '}
          <Link href="/app" style={{ color: T.accent, fontWeight: 700, textDecoration: 'none' }}>
            Log in
          </Link>
        </div>

        {/* Legal footer */}
        <div
          style={{
            textAlign: 'center',
            marginTop: 40,
            paddingTop: 18,
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

      {/* Styles kept local to the page via a styled-jsx-ish block so the hub
          doesn't drag anything into the marketing bundle. Uses the same CSS
          variables as the rest of the auth screens so dark mode "just works". */}
      <style>{`
        .signup-hub-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        @media (max-width: 720px) {
          .signup-hub-grid { grid-template-columns: 1fr; }
        }
        .signup-hub-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 28px 24px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: var(--shadow);
          text-decoration: none;
          color: inherit;
          min-height: 220px;
          transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
        }
        .signup-hub-card:hover {
          transform: translateY(-2px);
          border-color: #3b82f6;
          box-shadow: 0 12px 28px rgba(59,130,246,0.18);
        }
        .signup-hub-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
        }
        .signup-hub-icon-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #fff;
          box-shadow: 0 6px 14px rgba(59,130,246,0.25);
        }
        .signup-hub-icon-ghost {
          background: var(--accent-tint);
          color: #2563eb;
        }
        .signup-hub-card-body { display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .signup-hub-card-title {
          font-size: 19px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.01em;
        }
        .signup-hub-card-desc {
          font-size: 14px;
          line-height: 1.55;
          color: var(--text-muted);
          flex: 1;
        }
        .signup-hub-card-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
          font-size: 14px;
          font-weight: 700;
          color: #2563eb;
        }
        .signup-hub-card:hover .signup-hub-card-cta { gap: 10px; }
      `}</style>
    </div>
  );
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
