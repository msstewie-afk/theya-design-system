'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Tracks a media query. In the browser the first render already has the
 * real answer — the earlier useState(false) + effect version rendered the
 * "no match" layout first and flipped after mount, so a desktop page
 * flashed its mobile variant (PushSheet and Sidebar mounted a modal
 * Drawer for one frame, which hid the page from assistive tech until it
 * unmounted). On the server, and while hydrating, it reports `false`.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
