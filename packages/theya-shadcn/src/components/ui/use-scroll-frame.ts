'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Calls `onFrame` with the element's box and the viewport height on every
 * frame the page scrolls or resizes (requestAnimationFrame from a passive
 * listener). The callback writes styles directly — no React render per
 * frame. Used by the scroll-driven Motion and landing effects.
 */
export function useScrollFrame(ref: RefObject<HTMLElement | null>, onFrame: (rect: DOMRect, vh: number) => void, enabled: boolean) {
  const cb = useRef(onFrame);
  cb.current = onFrame;
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const run = () => {
      raf = 0;
      if (ref.current) cb.current(ref.current.getBoundingClientRect(), window.innerHeight);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(run);
    };
    run();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [enabled, ref]);
}
