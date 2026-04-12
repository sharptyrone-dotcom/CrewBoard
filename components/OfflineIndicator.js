'use client';

import { useEffect, useState } from 'react';

/**
 * OfflineIndicator — shows a subtle banner at the top of the viewport
 * when the browser loses its network connection. Auto-dismisses once
 * connectivity is restored. Uses the browser's navigator.onLine plus
 * online/offline events so it reacts instantly.
 */
export default function OfflineIndicator() {
  const [offline, setOffline] = useState(false);
  // Brief "back online" flash so the user sees the transition.
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // Set initial state — SSR always assumes online so we check on mount.
    setOffline(!navigator.onLine);

    const goOffline = () => setOffline(true);
    const goOnline = () => {
      setOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 2500);
    };

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);

    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline && !showReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '8px 16px',
        fontSize: 13,
        fontWeight: 600,
        textAlign: 'center',
        color: '#fff',
        background: offline
          ? 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)'
          : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        transition: 'opacity 0.3s, background 0.3s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      {offline
        ? "You\u2019re offline \u2014 cached documents are still available"
        : 'Back online'}
    </div>
  );
}
