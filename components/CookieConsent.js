'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const COOKIE_NAME = 'cb_consent';
const COOKIE_DAYS = 365;

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if consent cookie is not already set.
    if (!getCookie(COOKIE_NAME)) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    setCookie(COOKIE_NAME, 'accepted', COOKIE_DAYS);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: '#1e293b',
      borderTop: '1px solid #334155',
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      flexWrap: 'wrap',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.25)',
    }}>
      <p style={{
        margin: 0,
        fontSize: 13,
        color: '#94a3b8',
        lineHeight: 1.5,
        maxWidth: 560,
      }}>
        CrewNotice uses essential cookies to keep you signed in.
        No tracking or advertising cookies are used.{' '}
        <Link href="/cookies" style={{ color: '#60a5fa', textDecoration: 'underline', fontWeight: 600 }}>
          Learn more
        </Link>
      </p>
      <button
        onClick={handleAccept}
        style={{
          padding: '9px 22px',
          borderRadius: 8,
          border: 'none',
          background: '#3b82f6',
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Accept
      </button>
    </div>
  );
}
