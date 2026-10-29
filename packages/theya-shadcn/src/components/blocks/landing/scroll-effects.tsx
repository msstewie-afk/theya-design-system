'use client';

import { Children, useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import { inertProps } from '../../../lib/inert';
import { useMediaQuery } from '../../ui/use-media-query';

/*
 * Scroll effects for landing pages: motion tied to the scroll position, not
 * to a timer. Scrolling back plays it backwards, the reader sets the pace,
 * and each state where text sits still is fully readable. With
 * prefers-reduced-motion every effect falls back to its plain layout.
 *
 * Progress is written to CSS / inline styles on requestAnimationFrame from a
 * passive scroll listener: no React render per frame, and it works in every
 * browser (CSS scroll-driven animations are not in all of them yet).
 */

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3); // ease-out cubic

/** Calls `onProgress` with how far `ref` has travelled, on every frame the page scrolls. */
function useScrollFrame(ref: React.RefObject<HTMLElement | null>, onFrame: (rect: DOMRect, vh: number) => void, enabled: boolean) {
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

// ---------------------------------------------------------------------------

export interface CardDeckProps extends ComponentProps<'section'> {
  /** Viewport heights of scrolling per card (default 0.9). More is calmer. */
  pace?: number;
  /** Share of each card's scroll it stays still in front, readable (default 0.55). */
  hold?: number;
  /** Optional heading content shown above the deck while it plays. */
  header?: ReactNode;
  /** Names the deck for assistive tech ("Product tour"). */
  'aria-label': string;
}

/**
 * A deck of big cards standing one behind another. As the page scrolls the
 * front card falls toward the viewer and fades, and the next one comes
 * forward out of the depth (Framer's cinematic card deck). The section is
 * pinned while the deck plays — the only pinned scene in the landing set —
 * so give every card a resting moment (`hold`) where it can be read.
 *
 * Only the front card is reachable by Tab and screen readers; the progress
 * dots say where you are. Reduced motion: the cards are a plain list.
 */
export function CardDeck({ pace = 0.9, hold = 0.55, header, className, children, 'aria-label': label, ...props }: CardDeckProps) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const cards = Children.toArray(children);
  const n = cards.length;
  const root = useRef<HTMLElement>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [front, setFront] = useState(0);

  useScrollFrame(
    root,
    (rect, vh) => {
      // 0 → 1 over the pinned stretch (section height minus one screen).
      const travel = Math.max(1, rect.height - vh);
      const p = clamp(-rect.top / travel) * (n - 1);
      // k: the card in front (holding or leaving); e: how far it has fallen.
      const k = Math.min(Math.floor(p), n - 1);
      const e = k === n - 1 ? 0 : ease(clamp((p - k - hold) / (1 - hold)));
      const current = e > 0.5 ? Math.min(k + 1, n - 1) : k;
      setFront((f) => (f === current ? f : current));
      refs.current.forEach((el, i) => {
        if (!el) return;
        let transform: string;
        let opacity: number;
        let filter = 'none';
        if (i > k) {
          // Waiting in the depth. The whole pile only steps forward while the
          // front card falls, so it stands still while the front one is read.
          // Each step back is smaller, higher (it peeks over the card in
          // front), darker and softer.
          const depth = Math.min(i - k - e, 3);
          transform = `translate3d(0, ${-depth * 13}%, ${-depth * 160}px) scale(${1 - depth * 0.05})`;
          opacity = depth > 2.5 ? 1 - (depth - 2.5) * 2 : 1;
          filter = depth > 0.05 ? `brightness(${1 - depth * 0.08}) blur(${depth * 1.2}px)` : 'none';
        } else {
          // In front (i === k) or already gone (i < k): the top edge tips out
          // of the screen, the card drops and grows, and fades at the very end.
          const f = i < k ? 1 : e;
          transform = `translate3d(0, ${f * 70}%, ${f * 520}px) rotateX(${-f * 52}deg)`;
          opacity = 1 - Math.pow(f, 3);
        }
        el.style.transform = transform;
        el.style.opacity = String(opacity);
        el.style.filter = filter;
        el.style.zIndex = String(n - i);
      });
    },
    !reduced,
  );

  if (reduced) {
    return (
      <section data-slot="card-deck" data-scale="display" aria-label={label} className={cn('section-display', className)} {...props}>
        <div className="container-display flex flex-col gap-8">
          {header}
          <ol className="m-0 flex list-none flex-col gap-6 p-0">
            {cards.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={root}
      data-slot="card-deck"
      data-scale="display"
      aria-label={label}
      className={cn('relative', className)}
      style={{ height: `${100 + (n - 1) * pace * 100}vh` }}
      {...props}
    >
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center gap-8 overflow-hidden py-16">
        {header && <div className="container-display w-full">{header}</div>}
        <div className="container-display relative mt-[8vh] w-full flex-1 [perspective:1200px] [perspective-origin:50%_0%]">
          {cards.map((c, i) => (
            <div
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              aria-hidden={i !== front || undefined}
              {...inertProps(i !== front)}
              className="absolute inset-x-[var(--display-gutter)] inset-y-0 flex items-stretch will-change-transform [transform-origin:50%_100%] [&>*]:w-full"
            >
              {c}
            </div>
          ))}
        </div>
        {/* Where you are in the deck. */}
        <ol aria-label={`${label}: card ${front + 1} of ${n}`} className="m-0 flex list-none gap-2 p-0">
          {cards.map((_, i) => (
            <li
              key={i}
              aria-hidden
              className={cn(
                'h-2 rounded-full transition-[width,background-color] duration-moderate',
                i === front ? 'w-6 bg-[var(--color-icon-icon-primary)]' : 'w-2 bg-[var(--color-border-border-strong)]',
              )}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

export interface TiltInProps extends ComponentProps<'div'> {
  /** The starting tilt, degrees (default 32). */
  tilt?: number;
}

/**
 * The product visual starts tilted back in 3D, like a screen lying on a desk,
 * and stands up flat and full size as it scrolls into view (Linear, Stripe
 * heroes). Reduced motion: it is simply flat.
 */
export function TiltIn({ tilt = 32, className, style, children, ...props }: TiltInProps) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useScrollFrame(
    ref,
    (rect, vh) => {
      if (!inner.current) return;
      // 0 when the top enters at the bottom of the screen, 1 by the time it reaches 30% from the top.
      const p = ease(clamp((vh - rect.top) / (vh * 0.75)));
      inner.current.style.transform = `rotateX(${(1 - p) * tilt}deg) scale(${0.8 + p * 0.2}) translateY(${(1 - p) * 8}%)`;
      inner.current.style.opacity = String(0.4 + p * 0.6);
    },
    !reduced,
  );
  return (
    <div ref={ref} data-slot="tilt-in" className={cn('text-start [perspective:1600px]', className)} style={style} {...props}>
      <div ref={inner} className="will-change-transform [transform-origin:50%_0%]">
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

export interface ScrollHighlightProps extends ComponentProps<'p'> {
  /** The statement. Plain text: it is split into words. */
  children: string;
}

/**
 * A big statement whose words light up one by one as it scrolls through the
 * screen (Apple, Linear). The words start dim, never invisible: the full
 * sentence is always readable. Reduced motion: all lit.
 */
export function ScrollHighlight({ className, children, ...props }: ScrollHighlightProps) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const ref = useRef<HTMLParagraphElement>(null);
  const words = children.split(/(\s+)/);
  useScrollFrame(
    ref,
    (rect, vh) => {
      // Lit from when the paragraph's top reaches 85% of the screen until its bottom passes 45%.
      const p = clamp((vh * 0.85 - rect.top) / (rect.height + vh * 0.4));
      const spans = ref.current?.querySelectorAll<HTMLSpanElement>('[data-word]');
      if (!spans) return;
      const lit = p * spans.length;
      spans.forEach((s, i) => {
        s.style.opacity = String(0.28 + 0.72 * clamp(lit - i));
      });
    },
    !reduced,
  );
  return (
    <p
      ref={ref}
      data-slot="scroll-highlight"
      className={cn('m-0 text-balance font-heading text-heading-2xl text-[var(--color-text-text)]', className)}
      {...props}
    >
      {words.map((w, i) =>
        /\s+/.test(w) ? (
          w
        ) : (
          <span key={i} data-word className="transition-opacity duration-standard">
            {w}
          </span>
        ),
      )}
    </p>
  );
}

// ---------------------------------------------------------------------------

export interface FanOutProps extends ComponentProps<'div'> {
  /** Columns once spread, from lg up (default 3). */
  columns?: 2 | 3 | 4;
}

/**
 * A pile of cards that deals itself out into a grid as it scrolls into view:
 * the cards start stacked and turned in the middle and slide to their places.
 * Reduced motion, or below lg: just the grid.
 */
export function FanOut({ columns = 3, className, children, ...props }: FanOutProps) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const wide = useMediaQuery('(min-width: 1024px)');
  const ref = useRef<HTMLDivElement>(null);
  const cells = useRef<(HTMLDivElement | null)[]>([]);
  const items = Children.toArray(children);
  const active = !reduced && wide;

  useScrollFrame(
    ref,
    (rect, vh) => {
      const grid = ref.current;
      if (!grid) return;
      // Dealt out between the top entering at 90% and reaching 35% of the screen.
      const p = ease(clamp((vh * 0.9 - rect.top) / (vh * 0.55)));
      const g = grid.getBoundingClientRect();
      const cx = g.left + g.width / 2;
      const cy = g.top + g.height / 2;
      cells.current.forEach((el, i) => {
        if (!el) return;
        // Distance from the cell's resting place to the middle of the grid.
        const r = el.offsetParent ? { x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2 } : { x: 0, y: 0 };
        const dx = cx - (g.left + r.x);
        const dy = cy - (g.top + r.y);
        const turn = (i - (items.length - 1) / 2) * 6;
        const k = 1 - p;
        el.style.transform = `translate(${dx * k}px, ${dy * k}px) rotate(${turn * k}deg) scale(${1 - 0.08 * k})`;
        el.style.zIndex = String(items.length - i);
      });
    },
    active,
  );

  // Back to rest when the effect switches off (resize below lg, reduced motion).
  useEffect(() => {
    if (!active) cells.current.forEach((el) => el && (el.style.transform = ''));
  }, [active]);

  const cols = { 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' }[columns];
  return (
    <div ref={ref} data-slot="fan-out" className={cn('relative grid gap-4 sm:grid-cols-2 lg:gap-6', cols, className)} {...props}>
      {items.map((c, i) => (
        <div
          key={i}
          ref={(el) => {
            cells.current[i] = el;
          }}
          className="relative min-w-0 will-change-transform [&>*]:h-full"
        >
          {c}
        </div>
      ))}
    </div>
  );
}
