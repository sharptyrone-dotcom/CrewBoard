/**
 * In-memory rate limiter using a Map with IP-based keys.
 * Entries are cleaned up automatically every 5 minutes.
 *
 * Usage:
 *   import { rateLimit } from '@/lib/rateLimit';
 *   const limiter = rateLimit({ max: 10, windowMs: 60_000 });
 *
 *   export async function POST(request) {
 *     const limited = limiter(request);
 *     if (limited) return limited; // 429 response
 *     // ... handle request
 *   }
 */

import { NextResponse } from 'next/server';

const store = new Map();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now - entry.start > entry.windowMs) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Create a rate limiter.
 * @param {object} opts
 * @param {number} opts.max        - Maximum requests per window (default 60)
 * @param {number} opts.windowMs   - Window size in ms (default 60_000 = 1 minute)
 * @returns {function} A function that takes a Request and returns null (allowed) or a 429 Response (blocked)
 */
export function rateLimit({ max = 60, windowMs = 60_000 } = {}) {
  return function check(request) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const key = `${ip}:${request.nextUrl?.pathname || request.url}`;
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now - entry.start > windowMs) {
      store.set(key, { count: 1, start: now, windowMs });
      return null;
    }

    entry.count++;

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.start + windowMs - now) / 1000);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(max),
            'X-RateLimit-Remaining': '0',
          },
        },
      );
    }

    return null;
  };
}

// Pre-configured limiters for common use cases
export const apiLimiter = rateLimit({ max: 60, windowMs: 60_000 });
export const authLimiter = rateLimit({ max: 10, windowMs: 60_000 });
export const strictLimiter = rateLimit({ max: 5, windowMs: 60_000 });
export const writeLimiter = rateLimit({ max: 30, windowMs: 60_000 });
export const uploadLimiter = rateLimit({ max: 20, windowMs: 60_000 });
