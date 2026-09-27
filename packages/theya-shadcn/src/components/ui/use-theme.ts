'use client';

import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

/**
 * Minimal theme hook matching Theya's existing convention — reads/writes
 * `data-theme="dark"` on <html> (see globals.css). No persistence
 * (localStorage/cookies) in this draft; add later if needed. No
 * ThemeProvider dependency — this reads the DOM directly, so it works
 * standalone or alongside one.
 */
export function useTheme() {
  const [resolvedTheme, setResolvedTheme] = useState<Theme>('light');

  useEffect(() => {
    setResolvedTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    setResolvedTheme(theme);
  }, []);

  return { resolvedTheme, setTheme };
}
