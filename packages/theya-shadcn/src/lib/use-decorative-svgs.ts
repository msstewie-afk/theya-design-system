'use client';

import { useEffect, useRef } from 'react';

/**
 * Marks the unnamed SVGs matched by `selector` inside the returned ref as
 * decorative (aria-hidden), for slots that take consumer content — an icon
 * passed as a child or a leading visual — where the component can't add the
 * attribute itself. Chrome exposes an unnamed inline SVG as an image, and
 * NVDA reads it as "graphic" (WCAG 1.1.1). An SVG that has a role, a name or
 * a non-empty <title> is left alone, and so is everything inside a button or
 * link (the selector's default only looks at direct children).
 *
 * Content that mounts later (a chart that renders once its container is
 * measured) is caught by watching the subtree.
 */
export function useDecorativeSvgs<T extends Element>(selector = ':scope > svg') {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const hide = () =>
      root.querySelectorAll<SVGElement>(selector).forEach((svg) => {
        if (['aria-hidden', 'aria-label', 'aria-labelledby', 'role'].some((a) => svg.hasAttribute(a)) || svg.querySelector(':scope > title')?.textContent?.trim()) return;
        svg.setAttribute('aria-hidden', 'true');
      });
    hide();
    const observer = new MutationObserver(hide);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
    // Every render: the slot itself can mount later (an optional icon).
  });
  return ref;
}
