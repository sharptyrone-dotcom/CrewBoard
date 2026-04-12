const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  // Don't precache anything — let runtime caching handle it so the
  // service worker doesn't bloat with every build output file.
  buildExcludes: [/./],
  // Custom worker adds push notification handlers alongside the
  // generated Workbox runtime caching.
  customWorkerDir: 'worker',
  fallbacks: {
    document: '/offline.html',
  },
  runtimeCaching: [
    // ── API routes: network-first, fall back to cache after 5s ──
    {
      urlPattern: /^https?:\/\/.*\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'crewboard-api',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24, // 1 day
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // ── Supabase Storage documents: cache-first, 30-day expiry ──
    {
      urlPattern: /^https?:\/\/.*\.supabase\.co\/storage\/v1\/object\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'crewboard-documents',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // ── Images: cache-first, 60-day expiry ──
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'crewboard-images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 60, // 60 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // ── Fonts: cache-first, 365-day expiry ──
    {
      urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'crewboard-fonts',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // ── App shell + static assets: stale-while-revalidate ──
    {
      urlPattern: /^https?:\/\/.*\/_next\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'crewboard-static',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // ── HTML pages (app shell): stale-while-revalidate ──
    {
      urlPattern: /^https?:\/\/.*\/(?:app|join|admin)?.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'crewboard-pages',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
