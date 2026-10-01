/**
 * Live token values for the Foundations docs, read straight from
 * @theya/tokens' built CSS — so the tables can't drift from the build the
 * way the hand-copied hex did (27.09: info, warning and border-subtle had
 * silently diverged). Rebuild tokens and these follow automatically.
 */
import lightCss from '@theya/tokens/build/css/variables.css?raw';
import darkCss from '@theya/tokens/build/css/variables-dark.css?raw';

export type Theme = 'light' | 'dark';

/** Shown in a table when a documented token isn't in the build at all. */
export const MISSING = '(not in build)';

function parse(css: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const m of css.matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)) map.set(m[1], m[2].trim());
  return map;
}

const VALUES: Record<Theme, Map<string, string>> = { light: parse(lightCss), dark: parse(darkCss) };

/** The built value of a CSS custom property, e.g. tokenValue('--color-bg-primary-bg-primary', 'dark'). */
export function tokenValue(name: string, theme: Theme = 'light'): string {
  return VALUES[theme].get(name) ?? MISSING;
}
