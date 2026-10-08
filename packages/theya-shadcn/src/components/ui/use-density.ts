'use client';

import { useCallback, useSyncExternalStore } from 'react';

export type Density = 'compact' | 'default' | 'comfortable';

const DENSITIES: readonly Density[] = ['compact', 'default', 'comfortable'];

const readDensity = (): Density => {
  const value = document.documentElement.getAttribute('data-density');
  return DENSITIES.includes(value as Density) ? (value as Density) : 'default';
};

function subscribeDensity(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-density'] });
  return () => observer.disconnect();
}

/**
 * Page-wide density, read from and written to `data-density` on <html>
 * (packages/tokens/src/density → density.css). Same shape as useTheme:
 * follows the attribute from the first browser render, so every
 * DensityToggle on the page stays in sync; "default" on the server.
 * "default" removes the attribute. No persistence — store the choice in
 * the product (user settings, cookie) and set it back on load.
 *
 * For one region only (a dense table on a regular page) skip the hook and
 * put `data-density="compact"` on that region's container.
 */
export function useDensity() {
  const density = useSyncExternalStore(subscribeDensity, readDensity, () => 'default' as Density);

  const setDensity = useCallback((next: Density) => {
    if (next === 'default') document.documentElement.removeAttribute('data-density');
    else document.documentElement.setAttribute('data-density', next);
  }, []);

  return { density, setDensity };
}
