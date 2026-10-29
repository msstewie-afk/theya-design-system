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
    <section ref={root} data-slot="card-deck" data-scale="display" aria-label={label} className={cn('relative', className)} style={{ height: `${100 + (n - 1) * pace * 100}vh` }} {...props}>
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center gap-8 overflow-hidden py-16">
        {header && (
          <div className="w-full">
            <div className="container-display">{header}</div>
          </div>
        )}
        <div className="mt-[8vh] w-full flex-1">
          <div className="container-display relative h-full [perspective:1200px] [perspective-origin:50%_0%]">
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
    <p ref={ref} data-slot="scroll-highlight" className={cn('m-0 text-balance font-heading text-heading-2xl text-[var(--color-text-text)]', className)} {...props}>
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
        const r = el.offsetParent
          ? {
              x: el.offsetLeft + el.offsetWidth / 2,
              y: el.offsetTop + el.offsetHeight / 2,
            }
          : { x: 0, y: 0 };
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

  const cols = {
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
  }[columns];
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

// ---------------------------------------------------------------------------

export interface DepthTunnelProps extends ComponentProps<'section'> {
  /** The decorative items that fly past (small cards, photos). Hidden from assistive tech. */
  items: ReactNode[];
  /** What the section says: stays in the middle, always readable. */
  children: ReactNode;
  /** Viewport heights of scrolling for the flight (default 2.5). */
  length?: number;
}

// A fixed scatter (no Math.random: the same layout on the server and every render).
const SCATTER = [
  [-38, -26],
  [34, -30],
  [-12, 32],
  [42, 18],
  [-44, 10],
  [8, -36],
  [26, 34],
  [-28, -6],
  [46, -12],
  [-6, 28],
  [18, -18],
  [-40, 30],
  [36, 4],
  [-20, -34],
  [4, 38],
  [-46, -18],
];

/**
 * Cards scattered through a deep space fly toward the viewer as the page
 * scrolls, sharp up close and soft far away, while the message stays still
 * in the middle (a warp / tunnel shot). The flying items are decoration
 * (aria-hidden); the message carries the meaning. Reduced motion: the items
 * rest around the message, no flight.
 */
export function DepthTunnel({ items, children, length = 2.5, className, ...props }: DepthTunnelProps) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const root = useRef<HTMLElement>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const DEPTH = 3200; // px of depth the items are spread over
  const n = items.length;

  useScrollFrame(
    root,
    (rect, vh) => {
      const travel = Math.max(1, rect.height - vh);
      const p = clamp(-rect.top / travel);
      refs.current.forEach((el, i) => {
        if (!el) return;
        // Spread the items evenly in depth; the camera moves DEPTH + 800 px forward.
        const base = -((i + 0.5) / n) * DEPTH;
        const z = base + p * (DEPTH + 800);
        const far = clamp(-z / DEPTH); // 0 near, 1 far
        const [x, y] = SCATTER[i % SCATTER.length];
        // Fade in from the far end, fade out once it has passed the viewer.
        const opacity = z > 400 ? clamp(1 - (z - 400) / 400) : clamp(1.2 - far * 1.1);
        el.style.transform = `translate(-50%, -50%) translate3d(${x}vw, ${y}vh, ${z}px)`;
        el.style.opacity = String(opacity);
        el.style.filter = far > 0.15 ? `blur(${(far - 0.15) * 6}px)` : 'none';
      });
    },
    !reduced,
  );

  if (reduced) {
    return (
      <section data-slot="depth-tunnel" data-scale="display" className={cn('section-display', className)} {...props}>
        <div className="container-display flex flex-col items-center gap-12">
          <div className="flex max-w-[48rem] flex-col items-center text-center">{children}</div>
          <div aria-hidden className="flex flex-wrap justify-center gap-4 opacity-80">
            {items.slice(0, 8)}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={root} data-slot="depth-tunnel" data-scale="display" className={cn('relative', className)} style={{ height: `${100 + length * 100}vh` }} {...props}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <div aria-hidden className="absolute inset-0 [perspective:900px]">
          {items.map((item, i) => (
            <div
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className="absolute left-1/2 top-1/2 will-change-transform"
            >
              {item}
            </div>
          ))}
        </div>
        <div className="relative z-10 flex h-full items-center justify-center px-[var(--display-gutter)]">
          {/* A soft pool of the page color behind the message, so it never sits on a busy card. */}
          <div className="relative flex max-w-[48rem] flex-col items-center text-center before:absolute before:-inset-x-24 before:-inset-y-20 before:-z-10 before:bg-[radial-gradient(closest-side,var(--color-bg-surface-bg-surface)_55%,transparent)] before:content-['']">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

export interface ScrollMaskRevealProps extends Omit<ComponentProps<'section'>, 'title'> {
  /** The picture: an image, a video poster, a product shot. It fills the frame (object-cover it). */
  media: ReactNode;
  /** What the section says: shown on the media once it has opened (a heading, a button). */
  children?: ReactNode;
  /** Viewport heights of scrolling for the opening (default 1.2). */
  length?: number;
}

/**
 * The picture starts as a small capsule in the middle of the screen and
 * opens to fill it edge to edge as the page scrolls (Nexacard, Apple
 * product pages). The section is pinned while it opens; the text fades in
 * over the opened picture. Reduced motion: a rounded panel with the text on it.
 */
export function ScrollMaskReveal({ media, children, length = 1.2, className, ...props }: ScrollMaskRevealProps) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const pic = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLDivElement>(null);

  useScrollFrame(
    root,
    (rect, vh) => {
      const travel = Math.max(1, rect.height - vh);
      // Opens over the first 75% of the pinned stretch, then holds open for the text.
      const p = ease(clamp(-rect.top / travel / 0.75));
      if (!frame.current || !pic.current) return;
      // A capsule ~30% wide and 70% tall → the whole screen.
      const side = (1 - p) * 35;
      const top = (1 - p) * 15;
      // A full capsule at the start, square corners when it fills the screen.
      const w = window.innerWidth * (1 - side / 50);
      const h = vh * (1 - top / 50);
      const round = (Math.min(w, h) / 2) * (1 - p);
      frame.current.style.clipPath = `inset(${top}% ${side}% ${top}% ${side}% round ${round}px)`;
      // The picture zooms out a little as the frame opens, so it feels like moving through it.
      pic.current.style.transform = `scale(${1.25 - p * 0.25})`;
      if (text.current) {
        const t = clamp((p - 0.7) / 0.3);
        text.current.style.opacity = String(t);
        text.current.style.transform = `translateY(${(1 - t) * 24}px)`;
        // Not reachable until it shows.
        text.current.toggleAttribute('inert', t < 0.5);
      }
    },
    !reduced,
  );

  if (reduced) {
    return (
      <section data-slot="scroll-mask-reveal" data-scale="display" className={cn('section-display', className)} {...props}>
        <div className="container-display">
          <div className="relative isolate flex min-h-[36rem] items-end overflow-hidden rounded-[var(--size-border-radius-border-radius-5xl)]">
            <div className="absolute inset-0 -z-10 [&>*]:size-full [&>*]:object-cover">{media}</div>
            {children && <div className="relative w-full p-8 lg:p-16">{children}</div>}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={root} data-slot="scroll-mask-reveal" data-scale="display" className={cn('relative', className)} style={{ height: `${100 + length * 100}vh` }} {...props}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <div ref={frame} className="absolute inset-0 overflow-hidden will-change-[clip-path]" style={{ clipPath: 'inset(15% 35% 15% 35% round 999px)' }}>
          <div ref={pic} className="absolute inset-0 will-change-transform [&>*]:size-full [&>*]:object-cover">
            {media}
          </div>
        </div>
        {children && (
          <div ref={text} className="absolute inset-x-0 bottom-0 opacity-0" {...{ inert: '' }}>
            <div className="container-display pb-16 lg:pb-24">{children}</div>
          </div>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

export interface HorizontalScrollProps extends Omit<ComponentProps<'section'>, 'title'> {
  /** Stays on top while the cards pass (a SectionHead). */
  header?: ReactNode;
  /** Names the list of cards. */
  'aria-label': string;
  /** The cards; give them a fixed width (w-80, w-[26rem]). */
  children: ReactNode;
}

/**
 * Scrolling down moves a row of cards sideways: the section is pinned and
 * the row slides past under its heading until the last card is in (Klarna
 * “Get 24/7 control”). Tabbing to a card scrolls the page to where that card
 * is in view. Below lg or with reduced motion: a plain row you swipe.
 */
export function HorizontalScroll({ header, className, children, 'aria-label': label, ...props }: HorizontalScrollProps) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const wide = useMediaQuery('(min-width: 1024px)');
  const active = !reduced && wide;
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const [shift, setShift] = useState(0); // px the row has to travel
  const items = Children.toArray(children);

  // The row's overflow sets how tall the section is: 1px of scroll = 1px sideways.
  useEffect(() => {
    if (!active || !track.current) return;
    const el = track.current;
    const measure = () => setShift(Math.max(0, el.scrollWidth - el.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [active, items.length]);

  useScrollFrame(
    root,
    (rect, vh) => {
      if (!track.current) return;
      const travel = Math.max(1, rect.height - vh);
      const p = clamp(-rect.top / travel);
      const rtl = getComputedStyle(track.current).direction === 'rtl';
      track.current.style.transform = `translate3d(${(rtl ? 1 : -1) * p * shift}px, 0, 0)`;
    },
    active,
  );

  // Keyboard: bring the focused card into view by scrolling the page, not the clipped row.
  const onFocus = (e: React.FocusEvent<HTMLOListElement>) => {
    if (!active || !root.current || !track.current) return;
    const li = (e.target as HTMLElement).closest('li');
    if (!li) return;
    track.current.scrollLeft = 0;
    const travel = root.current.offsetHeight - window.innerHeight;
    const want = clamp((li.offsetLeft - (track.current.clientWidth - li.offsetWidth) / 2) / Math.max(1, shift));
    const top = root.current.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: top + want * travel,
      behavior: 'instant' as ScrollBehavior,
    });
  };

  return (
    <section
      ref={root}
      data-slot="horizontal-scroll"
      data-scale="display"
      className={cn(active ? 'relative' : 'section-display', className)}
      style={active ? { height: `calc(100vh + ${shift}px)` } : undefined}
      {...props}
    >
      <div className={cn(active && 'sticky top-0 flex h-svh flex-col justify-center gap-10 overflow-hidden py-16', !active && 'flex flex-col gap-8')}>
        {header && (
          <div className="w-full">
            <div className="container-display">{header}</div>
          </div>
        )}
        <ol
          ref={track}
          aria-label={label}
          onFocus={onFocus}
          // As a swipe row it scrolls by itself: a Tab stop so keyboards can scroll it too.
          tabIndex={active ? undefined : 0}
          className={cn(
            'outline-none focus-visible:focus-ring',
            'm-0 flex list-none gap-4 p-0 px-[max(var(--display-gutter),calc((100%-var(--display-container))/2))] lg:gap-6 [&>li]:shrink-0',
            active ? 'will-change-transform' : 'snap-x snap-mandatory overflow-x-auto pb-2 [&>li]:snap-start',
          )}
        >
          {items.map((c, i) => (
            <li key={i} className="flex [&>*]:w-full">
              {c}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
