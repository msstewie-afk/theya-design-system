'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Sticky and fixed bars (Topbar, StickyActionBar, Fab, a sticky
 * AnnouncementBar) reserve their height as scroll-padding on the scroll
 * container they sit over, so an element scrolled into view by Tab
 * lands clear of them instead of underneath (WCAG 2.4.11 Focus Not
 * Obscured). Several bars on one edge add up. The container is the
 * nearest scrolling ancestor for a sticky bar, the document for a
 * fixed one. Inline scroll-padding the app set on that container is
 * restored when the last bar unmounts.
 */

type Edge = 'top' | 'bottom';

// Breathing room so the focus ring isn't flush against the bar.
const GAP = 8;

interface ContainerState {
  bars: Map<symbol, { edge: Edge; px: number }>;
  original: Record<Edge, string>;
}

const containers = new Map<HTMLElement, ContainerState>();

function scrollContainerOf(el: HTMLElement): HTMLElement {
  if (getComputedStyle(el).position !== 'fixed') {
    for (let p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
      const overflow = getComputedStyle(p).overflowY;
      if (overflow === 'auto' || overflow === 'scroll') return p;
    }
  }
  return document.documentElement;
}

function apply(container: HTMLElement, state: ContainerState) {
  for (const edge of ['top', 'bottom'] as const) {
    let sum = 0;
    for (const bar of state.bars.values()) if (bar.edge === edge) sum += bar.px;
    const prop = edge === 'top' ? 'scrollPaddingTop' : 'scrollPaddingBottom';
    container.style[prop] = sum > 0 ? `${Math.ceil(sum + GAP)}px` : state.original[edge];
  }
}

export function useScrollPadding(ref: RefObject<HTMLElement | null>, edge: Edge, enabled = true) {
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || typeof ResizeObserver === 'undefined') return;
    const container = scrollContainerOf(el);
    let state = containers.get(container);
    if (!state) {
      state = { bars: new Map(), original: { top: container.style.scrollPaddingTop, bottom: container.style.scrollPaddingBottom } };
      containers.set(container, state);
    }
    const id = Symbol('bar');
    const s = state;
    const measure = () => {
      // Height plus the bar's offset from its edge (a Fab floats 16-24px up).
      const offset = parseFloat(getComputedStyle(el)[edge]) || 0;
      s.bars.set(id, { edge, px: el.getBoundingClientRect().height + offset });
      apply(container, s);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
      s.bars.delete(id);
      apply(container, s);
      if (!s.bars.size) containers.delete(container);
    };
  }, [ref, edge, enabled]);
}
