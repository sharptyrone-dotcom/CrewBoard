import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import CookieConsent from '@/components/CookieConsent';

export const metadata = {
  title: 'CrewNotice — Yacht Crew Operational Platform',
  description: 'Digital notice board, document library, and compliance tracking for superyacht crew.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CrewNotice',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

// Blocking script that runs before React hydrates to prevent flash of
// wrong theme. Reads localStorage, falls back to system preference.
const themeScript = `(function(){try{var t=localStorage.getItem('crewnotice-theme');if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.setAttribute('data-theme','dark')}}catch(e){}})()`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}<CookieConsent /><Analytics /><SpeedInsights /></body>
    </html>
  );
}
