'use client';

import { useEffect, useState } from 'react';
import CrewBoard from '@/components/CrewBoard';
import LoginScreen from '@/components/LoginScreen';
import { fetchCurrentCrewMember, getSession, onAuthStateChange } from '@/lib/auth';

// Client-side session gate. Subscribes to Supabase auth state changes so
// sign-in/sign-out swaps the rendered tree without a hard refresh.
//
// Auth handoff flow:
//   1. On mount, read the cached session (fast, no network).
//   2. If signed in, load the matching crew_members row (one round trip).
//   3. Render <LoginScreen /> or <CrewBoard user={...} /> accordingly.
//   4. onAuthStateChange keeps everything in sync as the user signs in/out.
export default function AppPage() {
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
          // Signed in but no matching crew_members row — treat as error
          // rather than silently showing a broken UI.
          setLoadError('No crew profile found for this account. Ask an admin to link it.');
          setUser(null);
          setStatus('anon');
          return;
        }
        setUser(crewMember);
        setLoadError(null);
        setStatus('authed');
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

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#64748b', fontSize: 13 }}>
        Loading CrewBoard…
      </div>
    );
  }

  if (status === 'anon') {
    return (
      <>
        {loadError && (
          <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 16px', fontSize: 12, zIndex: 200, maxWidth: 380, textAlign: 'center' }}>
            {loadError}
          </div>
        )}
        <LoginScreen />
      </>
    );
  }

  return <CrewBoard user={user} />;
}
