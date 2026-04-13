'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { fetchCurrentCrewMember, getSession, onAuthStateChange } from '@/lib/auth';
import { trackCrewLogin } from '@/lib/analytics';

// ---------------------------------------------------------------------------
// AuthProvider
// ---------------------------------------------------------------------------
// Session gate + single source of truth for the authenticated user.
//
// Previously this logic lived inside app/app/page.js. It was lifted into a
// provider so that any feature needing "the current crew member" can grab it
// via useAuth() without prop drilling, and so that realtime subscriptions
// (useRealtime, usePresence) naturally initialise once the provider has
// resolved a session — because any consumer that depends on `user` will
// only mount after `status === 'authed'`.
//
// Exposes:
//   status    — 'loading' | 'authed' | 'anon'
//   user      — the crew_members row (UI-shape) or null
//   loadError — string message shown near the login screen when the auth
//               user exists but has no matching crew_members row
//
// Realtime note: initialising the websocket here would start it even for the
// auth/anon states, which is wasteful. Instead, we keep the provider stateful
// only and let downstream components (CrewNotice) invoke useRealtime inside
// their own render tree — they're only mounted after status flips to
// 'authed', so realtime naturally starts post-auth and tears down on
// sign-out.
// ---------------------------------------------------------------------------
const AuthContext = createContext({
  status: 'loading',
  user: null,
  loadError: null,
});

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'authed' | 'anon'
  const [user, setUser] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadUserForSession = async (session) => {
      if (!session?.user) {
        if (!cancelled) {
          setUser(null);
          setStatus('anon');
          setLoadError(null);
        }
        return;
      }
      try {
        const crewMember = await fetchCurrentCrewMember(session.user.id);
        if (cancelled) return;
        if (!crewMember) {
          // Signed in but no matching crew_members row — surface the
          // mismatch instead of silently rendering a broken CrewNotice.
          setLoadError('No crew profile found for this account. Ask an admin to link it.');
          setUser(null);
          setStatus('anon');
          return;
        }
        setUser(crewMember);
        setLoadError(null);
        setStatus('authed');
        trackCrewLogin(crewMember.id, crewMember.department);
      } catch (err) {
        if (cancelled) return;
        setLoadError(err?.message || 'Failed to load your crew profile.');
        setUser(null);
        setStatus('anon');
      }
    };

    (async () => {
      const session = await getSession();
      if (cancelled) return;
      await loadUserForSession(session);
    })();

    const unsubscribe = onAuthStateChange(async (session) => {
      await loadUserForSession(session);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, loadError }}>
      {children}
    </AuthContext.Provider>
  );
}

// Consumer hook. Returns the current { status, user, loadError }. Any
// component needing the authed user should go through this instead of
// accepting `user` as a prop.
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;
