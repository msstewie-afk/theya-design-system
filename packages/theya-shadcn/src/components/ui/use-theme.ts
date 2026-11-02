'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { THEME_STORAGE_KEY } from '../../lib/preferences';
import { remember } from '../../lib/remember';

export type Theme = 'light' | 'dark';

const readTheme = (): Theme => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

/**
 * Minimal theme hook matching Theya's existing convention — reads/writes
 * `data-theme="dark"` on <html> (see globals.css). `setTheme` also
 * remembers the choice in localStorage; render `<ThemeScript>` in the
 * document head to apply it before the first paint. No ThemeProvider
 * dependency — this reads the DOM directly, so it works standalone or
 * alongside one.
 */
export function useTheme() {
  // Read straight from <html data-theme> and follow its changes: right on
  // the first render (the effect-based version said "light" for a frame on
  // a dark page, so ThemeToggle's label was wrong until then), and every
  // toggle on the page stays in sync with the others. Light on the server.
  const resolvedTheme = useSyncExternalStore(subscribeTheme, readTheme, () => 'light' as Theme);

  const setTheme = useCallback((theme: Theme) => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    remember(THEME_STORAGE_KEY, theme);
  }, []);

  return { resolvedTheme, setTheme };
}
