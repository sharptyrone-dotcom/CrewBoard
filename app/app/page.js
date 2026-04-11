'use client';

import CrewBoard from '@/components/CrewBoard';
import LoginScreen from '@/components/LoginScreen';
import { AuthProvider, useAuth } from '@/components/AuthProvider';

// Thin shell around <AuthProvider>. The provider owns the loading/authed/
// anon state; this file just picks the right tree based on the current
// status.
//
// Realtime subscriptions (useRealtime, usePresence) live inside CrewBoard
// and therefore only mount once `status === 'authed'`, guaranteeing they
// start post-auth and tear down automatically on sign-out.
function AppPageInner() {
  const { status, user, loadError } = useAuth();

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

export default function AppPage() {
  return (
    <AuthProvider>
      <AppPageInner />
    </AuthProvider>
  );
}
