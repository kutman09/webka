'use client';

import { useSyncExternalStore } from 'react';

/** SSR-safe media query hook. Returns `serverValue` during SSR/hydration. */
export function useMediaQuery(query, serverValue = false) {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
