import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import CookieConsent from '@/components/CookieConsent';

export const metadata = {
  metadataBase: new URL('https://crewnotice.com'),
  title: {
    default: 'Yacht Crew Notice Board & Compliance Platform | CrewNotice',
    template: '%s | CrewNotice',
  },
  description:
    "Replace your yacht's physical notice board with CrewNotice. Track who reads every notice, manage SOPs with version control, deliver crew training, and generate audit-ready compliance reports. £2,400/year per vessel. 30-day free trial.",
  keywords:
    'yacht crew notice board, superyacht compliance software, yacht SOP management, crew training software, yacht document management, ISM audit software, maritime crew communications, MLC compliance yacht, superyacht operations platform',
  authors: [{ name: 'Sharp Digital Solutions Ltd' }],
  creator: 'Sharp Digital Solutions Ltd',
  publisher: 'Sharp Digital Solutions Ltd',
  openGraph: {
    title: 'CrewNotice — Digital Notice Board for Superyachts',
    description:
      'Every crew member informed. Every read tracked. Every audit ready. Purpose-built for superyacht crew operations.',
    url: 'https://crewnotice.com',
    siteName: 'CrewNotice',
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CrewNotice - Digital Notice Board for Superyachts',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CrewNotice — Digital Notice Board for Superyachts',
    description:
      "Replace your yacht's notice board. Track every read. Ace every audit. 30-day free trial.",
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://crewnotice.com' },
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
    <html lang="en-GB">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}<CookieConsent /><Analytics /><SpeedInsights /></body>
    </html>
  );
}
