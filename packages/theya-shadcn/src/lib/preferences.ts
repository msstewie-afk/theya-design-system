/**
 * Where Theya remembers the reader's theme and density (localStorage).
 * `useTheme` / `useDensity` write these keys; `<ThemeScript>` reads them
 * before the first paint, so a dark page doesn't flash light on load.
 * Constants only, so the server-rendered ThemeScript can import them
 * (writing lives in lib/remember.ts, a client module).
 */
export const THEME_STORAGE_KEY = 'theya-theme';
export const DENSITY_STORAGE_KEY = 'theya-density';
