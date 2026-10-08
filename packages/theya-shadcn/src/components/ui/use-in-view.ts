'use client';

import { useEffect, useState, type RefObject } from 'react';
import { useMediaQuery } from './use-media-query';

export interface UseInViewOptions {
  /** Share of the element that must be visible, 0–1. */
  threshold?: number;
  /** Grow or shrink the viewport box, CSS margin syntax ("0px 0px -10% 0px"). */
  rootMargin?: string;
  /** Stay true after the first time the element comes into view (default). With `false` it follows the element in and out. */
  once?: boolean;
}

/**
 * Whether an element is in the viewport — the trigger for the Motion
 * presets (Reveal, CountUp, TextEffect). Returns `true` straight away
 * when the user prefers reduced motion or the browser has no
 * IntersectionObserver, so content never waits on an animation that
 * won't run.
 */
export function useInView(ref: RefObject<Element | null>, { threshold = 0.2, rootMargin = '0px', once = true }: UseInViewOptions = {}): boolean {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin, once, reduced]);

  return reduced || inView;
}

/** The user asked the system for less motion. */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
