import { DENSITY_STORAGE_KEY, THEME_STORAGE_KEY } from '../../lib/preferences';

/**
 * Applies the remembered theme and density before the first paint. Render it
 * in the document head (a server component is fine: it is a plain inline
 * script), and put `suppressHydrationWarning` on <html>, since the script
 * sets data-theme / data-density there before React hydrates.
 *
 *   <html lang="en" suppressHydrationWarning>
 *     <head><ThemeScript defaultTheme="system" /></head>
 *
 * Without it, a reader who chose dark sees the page light for a moment on
 * every load. `useTheme` / `useDensity` (ThemeToggle, DensityToggle) keep
 * the choice in localStorage.
 */
export interface ThemeScriptProps {
  /** When nothing is remembered yet: `light` (default), `dark`, or `system` (the OS setting). */
  defaultTheme?: 'light' | 'dark' | 'system';
  /** CSP nonce for the inline script. */
  nonce?: string;
}

export function ThemeScript({ defaultTheme = 'light', nonce }: ThemeScriptProps) {
  const fallback =
    defaultTheme === 'system' ? "matchMedia('(prefers-color-scheme: dark)').matches" : String(defaultTheme === 'dark');
  // Kept tiny and dependency-free: it runs before anything else on the page.
  const code =
    `(function(){var h=document.documentElement;try{` +
    `var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});` +
    `if(t==='dark'||(t!=='light'&&${fallback}))h.setAttribute('data-theme','dark');` +
    `var d=localStorage.getItem(${JSON.stringify(DENSITY_STORAGE_KEY)});` +
    `if(d==='compact'||d==='comfortable')h.setAttribute('data-density',d)` +
    `}catch(e){if(${fallback})h.setAttribute('data-theme','dark')}})()`;
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: code }} />;
}
