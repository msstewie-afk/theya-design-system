'use client';

import { Children, useEffect, useRef, useState, type ComponentProps, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, RefreshDouble } from 'iconoir-react';
import { cn } from '../../../lib/utils';
import { inertProps } from '../../../lib/inert';
import { useTheyaI18n } from '../../../lib/i18n';
import { Button } from '../../ui/button';
import { useInView } from '../../ui/use-in-view';
import { useMediaQuery } from '../../ui/use-media-query';

/*
 * Card motion for landing pages: 3D ring, fan carousel, folder reveal, flip
 * card. Driven by the reader (drag, keys, buttons, hover, scroll), never by a
 * timer. Only the card in front is reachable by Tab and screen readers; with
 * reduced motion the same states switch without travelling.
 */

const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Prev / next buttons shared by the carousels. */
function Arrows({ onPrev, onNext, className }: { onPrev: () => void; onNext: () => void; className?: string }) {
  const { t } = useTheyaI18n();
  return (
    <div className={cn('flex gap-2', className)}>
      <Button appearance="outlined" tone="secondary" iconOnly className="rounded-full" aria-label={t.carousel.previous} leftIcon={<ArrowLeft className="rtl:-scale-x-100" />} onClick={onPrev} />
      <Button appearance="outlined" tone="secondary" iconOnly className="rounded-full" aria-label={t.carousel.next} leftIcon={<ArrowRight className="rtl:-scale-x-100" />} onClick={onNext} />
    </div>
  );
}

/** Horizontal drag → callback with the distance; returns pointer handlers. */
function useDrag(onMove: (dx: number) => void, onEnd: (dx: number) => void) {
  const start = useRef<number | null>(null);
  const last = useRef(0);
  return {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      start.current = e.clientX;
      last.current = 0;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (start.current == null) return;
      last.current = e.clientX - start.current;
      onMove(last.current);
    },
    onPointerUp: () => {
      if (start.current == null) return;
      start.current = null;
      onEnd(last.current);
    },
    onPointerCancel: () => {
      if (start.current == null) return;
      start.current = null;
      onEnd(last.current);
    },
  };
}

// ---------------------------------------------------------------------------

export interface RingCarouselProps extends Omit<ComponentProps<'section'>, 'children'> {
  /** Names the carousel ("Templates"). */
  'aria-label': string;
  children: ReactNode;
  /** Card width, px (default 280). */
  cardWidth?: number;
  /** How far the ring leans toward the viewer, degrees (default 10). */
  lean?: number;
  /**
   * Something in the middle of the ring — a word, a logo. The cards orbit
   * round it, passing behind and in front (the "ring around a word").
   */
  center?: ReactNode;
}

/**
 * Cards standing in a ring in 3D. Drag, the arrows or the Arrow keys turn it
 * and it settles with the next card facing the viewer (3D card carousels).
 */
export function RingCarousel({ cardWidth = 280, lean = 10, center, className, children, 'aria-label': label, ...props }: RingCarouselProps) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const cards = Children.toArray(children);
  const n = cards.length;
  const step = 360 / n;
  const radius = Math.round(cardWidth / 2 / Math.tan(Math.PI / n) + 32);
  const [angle, setAngle] = useState(0);
  const [dragging, setDragging] = useState(false);
  const base = useRef(0);
  const front = mod(Math.round(-angle / step), n);

  const go = (dir: 1 | -1) => setAngle((a) => Math.round(a / step) * step - dir * step);
  const drag = useDrag(
    (dx) => {
      if (!dragging) {
        base.current = angle;
        setDragging(true);
      }
      setAngle(base.current + dx * 0.35);
    },
    () => {
      setDragging(false);
      setAngle((a) => Math.round(a / step) * step);
    },
  );
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
    else return;
    e.preventDefault();
  };

  return (
    <section
      data-slot="ring-carousel"
      aria-roledescription="carousel"
      aria-label={label}
      className={cn('flex flex-col items-center gap-8', className)}
      {...props}
    >
      <div
        tabIndex={0}
        onKeyDown={onKey}
        {...drag}
        className="relative h-[26rem] w-full cursor-grab touch-pan-y select-none overflow-hidden rounded-[var(--size-border-radius-border-radius-5xl)] outline-none [perspective:1400px] focus-visible:focus-ring active:cursor-grabbing"
        style={{ '--card-w': `${cardWidth}px` } as CSSProperties}
      >
        <div className="absolute inset-0 [transform-style:preserve-3d]">
          {center && <div className="absolute inset-0 flex items-center justify-center [transform:translateZ(0)]">{center}</div>}
          <div
            className={cn(
              'absolute left-1/2 top-1/2 [transform-style:preserve-3d]',
              !dragging && !reduced && 'transition-transform duration-slower ease-spring',
            )}
            style={{ transform: `rotateX(${-lean}deg) rotateY(${angle}deg)` }}
          >
            {cards.map((c, i) => {
              // How squarely this card faces the viewer: 1 front, -1 back.
              const facing = Math.cos(((i * step + angle) * Math.PI) / 180);
              const isFront = i === front;
              return (
                <div
                  key={i}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${n}`}
                  aria-hidden={!isFront || undefined}
                  {...inertProps(!isFront)}
                  className="absolute w-[var(--card-w)] -translate-x-1/2 -translate-y-1/2 [&>*]:h-full"
                  style={{
                    transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
                    filter: `brightness(${0.55 + 0.45 * Math.max(0, facing)})`,
                    opacity: facing < -0.2 ? 0.5 : 1,
                  }}
                >
                  {c}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Arrows onPrev={() => go(-1)} onNext={() => go(1)} />
      <p className="sr-only" aria-live="polite">{`${front + 1} of ${n}`}</p>
    </section>
  );
}

// ---------------------------------------------------------------------------

export interface FanCarouselProps extends Omit<ComponentProps<'section'>, 'children'> {
  'aria-label': string;
  children: ReactNode;
  defaultIndex?: number;
}

/**
 * Cards fanned out on an arc, the middle one in focus and the others turned
 * away, smaller and dimmer. Drag, click a side card, the arrows or the Arrow
 * keys move the fan; it settles with a spring (Fan Card Carousel).
 */
export function FanCarousel({ defaultIndex, className, children, 'aria-label': label, ...props }: FanCarouselProps) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const cards = Children.toArray(children);
  const n = cards.length;
  const [active, setActive] = useState(defaultIndex ?? Math.floor(n / 2));
  const [dx, setDx] = useState(0);
  const go = (dir: 1 | -1) => setActive((a) => Math.min(n - 1, Math.max(0, a + dir)));
  const drag = useDrag(
    (d) => setDx(d),
    (d) => {
      setDx(0);
      if (d < -60) go(1);
      else if (d > 60) go(-1);
    },
  );
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
    else return;
    e.preventDefault();
  };

  return (
    <section data-slot="fan-carousel" aria-roledescription="carousel" aria-label={label} className={cn('flex flex-col items-center gap-8', className)} {...props}>
      <div tabIndex={0} onKeyDown={onKey} {...drag} className="relative h-[30rem] w-full cursor-grab touch-pan-y select-none overflow-hidden outline-none focus-visible:focus-ring active:cursor-grabbing">
        {cards.map((c, i) => {
          // Distance from the middle, following the finger while dragging.
          const d = i - active + dx / -280;
          const ad = Math.abs(d);
          const isActive = i === active;
          return (
            <div key={i} className="absolute left-1/2 top-6 w-[min(22rem,72vw)]" style={{ zIndex: 100 - Math.round(ad * 10) }}>
              <div
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${n}`}
                aria-hidden={!isActive || undefined}
                {...inertProps(!isActive)}
                className={cn(
                  '[transform-origin:50%_140%] [&>*]:h-full',
                  dx === 0 && !reduced && 'transition-[transform,filter,opacity] duration-slower ease-spring',
                )}
                style={{
                  transform: `translateX(-50%) rotate(${d * 9}deg) scale(${1 - Math.min(ad, 3) * 0.06})`,
                  filter: `brightness(${1 - Math.min(ad, 3) * 0.12})`,
                  opacity: ad > 3.2 ? 0 : 1,
                }}
              >
                {c}
              </div>
              {/* Pointer shortcut: clicking a side card brings it to the middle. Keyboard uses the arrows. */}
              {!isActive && <div aria-hidden className="absolute inset-0 cursor-pointer" onClick={() => setActive(i)} />}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-6">
        <Arrows onPrev={() => go(-1)} onNext={() => go(1)} />
        <ol aria-hidden className="m-0 flex list-none gap-2 p-0">
          {cards.map((_, i) => (
            <li key={i} className={cn('h-2 rounded-full transition-[width,background-color] duration-moderate', i === active ? 'w-6 bg-[var(--color-icon-icon-primary)]' : 'w-2 bg-[var(--color-border-border-strong)]')} />
          ))}
        </ol>
      </div>
      <p className="sr-only" aria-live="polite">{`${active + 1} of ${n}`}</p>
    </section>
  );
}

// ---------------------------------------------------------------------------

export interface FolderRevealProps extends Omit<ComponentProps<'a'>, 'children'> {
  href: string;
  /** The folder's name: also the link's name. */
  label: string;
  /** "128 links". */
  meta?: string;
  /** Up to three small cards that live in the folder (decoration). */
  items: ReactNode[];
}

/**
 * A folder with cards in it (WalletCards, Card Folder). The cards drop into
 * the pocket when the folder scrolls into view, and fan up out of it on hover
 * or keyboard focus. The folder is one link; the cards are decoration.
 */
export function FolderReveal({ href, label, meta, items, className, ...props }: FolderRevealProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const seen = useInView(ref as React.RefObject<HTMLElement>, { threshold: 0.4, once: true });
  const three = items.slice(0, 3);
  // Resting in the pocket, and fanned out on hover / focus (index 0, 1, 2).
  const fan = ['group-hover/folder:-translate-x-[42%] group-hover/folder:-translate-y-[58%] group-hover/folder:-rotate-[14deg] group-focus-visible/folder:-translate-x-[42%] group-focus-visible/folder:-translate-y-[58%] group-focus-visible/folder:-rotate-[14deg]',
    'group-hover/folder:-translate-y-[78%] group-focus-visible/folder:-translate-y-[78%]',
    'group-hover/folder:translate-x-[42%] group-hover/folder:-translate-y-[58%] group-hover/folder:rotate-[14deg] group-focus-visible/folder:translate-x-[42%] group-focus-visible/folder:-translate-y-[58%] group-focus-visible/folder:rotate-[14deg]'];
  return (
    <a
      ref={ref}
      href={href}
      data-slot="folder-reveal"
      className={cn('group/folder relative block h-64 w-80 rounded-[var(--size-border-radius-border-radius-4xl)] no-underline outline-none focus-visible:focus-ring', className)}
      {...props}
    >
      {/* Back of the folder, with its tab. */}
      <span aria-hidden className="absolute inset-x-0 bottom-0 top-6 rounded-[var(--size-border-radius-border-radius-4xl)] rounded-tl-none bg-[var(--color-bg-primary-bg-primary)] brightness-[0.85]" />
      <span aria-hidden className="absolute left-0 top-0 h-8 w-28 rounded-t-[var(--size-border-radius-border-radius-2xl)] bg-[var(--color-bg-primary-bg-primary)] brightness-[0.85]" />
      {/* The cards: dropped in once seen, fanned out on hover / focus. */}
      {three.map((item, i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            'absolute left-1/2 top-10 -ml-28 transition-[translate,rotate,opacity] duration-slower ease-spring motion-reduce:transition-none',
            seen ? 'translate-y-0 opacity-100' : '-translate-y-[140%] opacity-0',
            fan[i],
          )}
          style={{ transitionDelay: seen ? `${i * 90}ms` : undefined, zIndex: 1 + i }}
        >
          {item}
        </span>
      ))}
      {/* The front pocket, over the cards. */}
      <span className="absolute inset-x-0 bottom-0 z-10 flex h-[62%] flex-col justify-end gap-1 rounded-[var(--size-border-radius-border-radius-4xl)] bg-[var(--color-bg-primary-bg-primary)] p-6 text-[var(--color-text-text-on-primary)] shadow-elevation-lg transition-transform duration-slower ease-spring group-hover/folder:translate-y-2 motion-reduce:transition-none">
        <span className="font-heading text-heading-xs font-semibold">{label}</span>
        {meta && <span className="font-body text-body-s text-[var(--color-text-text-subtle-on-primary)]">{meta}</span>}
      </span>
    </a>
  );
}

// ---------------------------------------------------------------------------

export interface FlipCardProps extends Omit<ComponentProps<'div'>, 'children'> {
  front: ReactNode;
  /** The back: a glass face over the card's own color. */
  back: ReactNode;
  /** Names the flip button ("Show how it works"). */
  flipLabel: string;
}

type Edge = 'left' | 'right' | 'top' | 'bottom';
const FLIP: Record<Edge, string> = { left: 'rotateY(180deg)', right: 'rotateY(-180deg)', top: 'rotateX(-180deg)', bottom: 'rotateX(180deg)' };

/**
 * A card that turns over from the edge the pointer comes in by and shows a
 * glass back (LiquidGlass FlipCard). The button in the corner turns it for
 * keyboard and touch; only the face in view is read out. Reduced motion:
 * the faces cross-fade instead of turning.
 */
export function FlipCard({ front, back, flipLabel, className, ...props }: FlipCardProps) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  // Hover turns it while the pointer is over it; the button pins it turned.
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const flipped = hovered || pinned;
  const [edge, setEdge] = useState<Edge>('left');
  const hoverable = useMediaQuery('(hover: hover)');

  const enter = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    const d = { left: e.clientX - r.left, right: r.right - e.clientX, top: e.clientY - r.top, bottom: r.bottom - e.clientY };
    if (!pinned) setEdge((Object.keys(d) as Edge[]).reduce((a, b) => (d[a] < d[b] ? a : b)));
    setHovered(true);
  };

  return (
    <div
      data-slot="flip-card"
      className={cn('relative h-80 [perspective:1200px]', className)}
      onPointerEnter={hoverable ? enter : undefined}
      onPointerLeave={hoverable ? () => setHovered(false) : undefined}
      {...props}
    >
      <div
        className={cn('relative size-full [transform-style:preserve-3d]', !reduced && 'transition-transform duration-slower ease-spring')}
        style={{ transform: flipped && !reduced ? FLIP[edge] : 'none' }}
      >
        <div
          aria-hidden={flipped || undefined}
          {...inertProps(flipped)}
          className={cn('absolute inset-0 [backface-visibility:hidden] [&>*]:h-full', reduced && 'transition-opacity duration-standard', reduced && flipped && 'opacity-0')}
        >
          {front}
        </div>
        <div
          aria-hidden={!flipped || undefined}
          {...inertProps(!flipped)}
          className={cn(
            'absolute inset-0 overflow-hidden rounded-[var(--size-border-radius-border-radius-4xl)] [backface-visibility:hidden]',
            // Glass: the card color through frosted, tinted glass, a light rim and a sweep of light.
            'border border-solid border-[color-mix(in_srgb,white_35%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-surface-bg-surface)_55%,transparent)] shadow-elevation-lg backdrop-blur-xl',
            "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(120deg,transparent_30%,color-mix(in_srgb,white_28%,transparent)_45%,transparent_60%)] before:content-['']",
            reduced && 'transition-opacity duration-standard',
            reduced && !flipped && 'opacity-0',
          )}
          style={{ transform: reduced ? 'none' : FLIP[edge] }}
        >
          <div className="relative h-full p-6 lg:p-8">{back}</div>
        </div>
      </div>
      <Button
        appearance="outlined"
        tone="secondary"
        size="sm"
        iconOnly
        aria-label={flipLabel}
        aria-pressed={pinned}
        leftIcon={<RefreshDouble />}
        onClick={() => {
          if (!hovered) setEdge('left');
          setPinned((p) => !p);
        }}
        className="absolute end-4 top-4 z-10 rounded-full bg-[var(--color-bg-surface-bg-surface)]"
      />
    </div>
  );
}

