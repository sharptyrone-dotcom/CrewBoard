'use client';

import { useEffect, useState } from 'react';

// Returns `true` when the viewport matches the given CSS media query string.
// Falls back to `false` during SSR (no `window`) so the first client paint
// uses the mobile layout and then hydrates to the correct value once the
// effect fires. That one‑frame flash is invisible in practice because Next
// already streams the shell before React hydrates.
//
// Usage:
//   const isDesktop = useMediaQuery('(min-width: 768px)');
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
