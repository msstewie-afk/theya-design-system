'use client';

import { Children, useEffect, useId, useRef, useState, type ComponentProps, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
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

/** The name of the slide in front, read from its heading, for the position announcement ("2 of 8: Research"). */
function useSlideName(stage: React.RefObject<HTMLElement | null>, index: number) {
  const [name, setName] = useState<string | undefined>(undefined);
  useEffect(() => {
    const h = stage.current?.querySelector(`[data-slide="${index}"] :is(h2, h3, h4)`);
    setName(h?.textContent?.trim() || undefined);
  }, [stage, index]);
  return name;
}

/** Props that make a carousel's drag-and-keys stage a named group with a hint about the arrow keys. */
function useStageProps(hintId: string) {
  const { t } = useTheyaI18n();
  return { role: 'group', 'aria-label': t.carousel.slides, 'aria-describedby': hintId } as const;
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
  /**
   * `ring` (default): the cards stand round the outside of a cylinder, the
   * back ones turned away. `wall`: the viewer stands inside it — a curved
   * wall of cards, the middle one in front and the edges swinging in toward
   * you, bigger (coverflow, the 3D card wall). The wall does not wrap round.
   */
  shape?: 'ring' | 'wall';
}

/**
 * Cards standing in a ring in 3D. Drag, the arrows or the Arrow keys turn it
 * and it settles with the next card facing the viewer (3D card carousels).
 */
export function RingCarousel({ cardWidth = 280, lean: leanProp, center, shape = 'ring', className, children, 'aria-label': label, ...props }: RingCarouselProps) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const cards = Children.toArray(children);
  const n = cards.length;
  const wall = shape === 'wall';
  const lean = leanProp ?? (wall ? 0 : 10);
  // Wall: a wide cylinder (radius 2.6 cards), the cards side by side with a small gap.
  const radius = wall ? Math.round(cardWidth * 2.6) : Math.round(cardWidth / 2 / Math.tan(Math.PI / n) + 32);
  const step = wall ? (2 * Math.asin((cardWidth / 2 + 10) / radius) * 180) / Math.PI : 360 / n;
  const clampAngle = (a: number) => (wall ? Math.min(0, Math.max(-(n - 1) * step, a)) : a);
  const [angle, setAngle] = useState(0);
  const [dragging, setDragging] = useState(false);
  const base = useRef(0);
  const front = mod(Math.round(-angle / step), n);
  const { t } = useTheyaI18n();
  const uid = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const stageProps = useStageProps(`${uid}-hint`);
  const frontName = useSlideName(stageRef, front);

  const go = (dir: 1 | -1) => setAngle((a) => clampAngle(Math.round(a / step) * step - dir * step));
  const drag = useDrag(
    (dx) => {
      if (!dragging) {
        base.current = angle;
        setDragging(true);
      }
      setAngle(clampAngle(base.current + dx * (wall ? 0.12 : 0.35)));
    },
    () => {
      setDragging(false);
      setAngle((a) => clampAngle(Math.round(a / step) * step));
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
      className={cn('flex w-full flex-col items-center gap-8', className)}
      {...props}
    >
      <div
        ref={stageRef}
        tabIndex={0}
        {...stageProps}
        onKeyDown={onKey}
        {...drag}
        className="relative h-[26rem] w-full cursor-grab touch-pan-y select-none overflow-hidden rounded-[var(--size-border-radius-border-radius-5xl)] outline-none focus-visible:focus-ring active:cursor-grabbing"
        // A closer camera for the wall, so its edges swing in harder.
        style={{ '--card-w': `${cardWidth}px`, perspective: wall ? '900px' : '1400px' } as CSSProperties}
      >
        <div className="absolute inset-0 [transform-style:preserve-3d]">
          {center && <div className="absolute inset-0 flex items-center justify-center [transform:translateZ(0)]">{center}</div>}
          <div
            className={cn(
              'absolute left-1/2 top-1/2 [transform-style:preserve-3d]',
              !dragging && !reduced && 'transition-transform duration-slower ease-spring',
            )}
            // Wall: the axis is pushed toward the viewer by the radius, so the middle card sits at z = 0.
            style={{ transform: wall ? `translateZ(${radius}px) rotateX(${-lean}deg) rotateY(${-angle}deg)` : `rotateX(${-lean}deg) rotateY(${angle}deg)` }}
          >
            {cards.map((c, i) => {
              const rel = i * step + angle; // degrees from straight ahead
              // How squarely this card faces the viewer: 1 front, -1 back.
              const facing = Math.cos((rel * Math.PI) / 180);
              const isFront = i === front;
              if (wall) {
                // Beyond ~75° a wall card would pass beside the camera: hide it.
                const out = Math.abs(rel) > 75;
                return (
                  <div
                    key={i}
                    role="group"
                    data-slide={i}
                    aria-roledescription="slide"
                    aria-label={`${i + 1} of ${n}`}
                    aria-hidden={!isFront || undefined}
                    {...inertProps(!isFront)}
                    className={cn('absolute w-[var(--card-w)] -translate-x-1/2 -translate-y-1/2 [&>*]:h-full', !dragging && !reduced && 'transition-[opacity,filter] duration-slower')}
                    style={{
                      transform: `rotateY(${-i * step}deg) translateZ(${-radius}px)`,
                      filter: `brightness(${isFront ? 1 : 0.92 - 0.12 * (Math.min(Math.abs(rel), 60) / 60)})`,
                      opacity: out ? 0 : 1,
                      visibility: out ? 'hidden' : undefined,
                    }}
                  >
                    {c}
                  </div>
                );
              }
              return (
                <div
                  key={i}
                  role="group"
                  data-slide={i}
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
      <p id={`${uid}-hint`} className="sr-only">
        {t.carousel.keysHint}
      </p>
      <p className="sr-only" aria-live="polite">
        {t.carousel.position(front + 1, n, frontName)}
      </p>
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
  const { t } = useTheyaI18n();
  const uid = useId();
  const [dx, setDx] = useState(0);
  // The first time it comes into view the fan deals itself out: the middle
  // card rises from below, then the others open out to its sides (PayCard).
  const stage = useRef<HTMLDivElement>(null);
  const seen = useInView(stage, { threshold: 0.35 });
  const stageProps = useStageProps(`${uid}-hint`);
  const activeName = useSlideName(stage, active);
  const [dealing, setDealing] = useState(true);
  useEffect(() => {
    if (!seen) return;
    const t = setTimeout(() => setDealing(false), 1400);
    return () => clearTimeout(t);
  }, [seen]);
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
    <section data-slot="fan-carousel" aria-roledescription="carousel" aria-label={label} className={cn('flex w-full flex-col items-center gap-8', className)} {...props}>
      <div ref={stage} tabIndex={0} {...stageProps} onKeyDown={onKey} {...drag} className="relative h-[30rem] w-full cursor-grab touch-pan-y select-none overflow-hidden outline-none focus-visible:focus-ring active:cursor-grabbing">
        {cards.map((c, i) => {
          // Distance from the middle, following the finger while dragging.
          const d = i - active + dx / -280;
          const ad = Math.abs(d);
          const isActive = i === active;
          return (
            <div key={i} className="absolute left-1/2 top-6 w-[min(22rem,72vw)]" style={{ zIndex: 100 - Math.round(ad * 10) }}>
              <div
                role="group"
                data-slide={i}
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${n}`}
                aria-hidden={!isActive || undefined}
                {...inertProps(!isActive)}
                className={cn(
                  '[transform-origin:50%_140%] [&>*]:h-full',
                  dx === 0 && !reduced && 'transition-[transform,filter,opacity] duration-slower ease-spring',
                )}
                style={
                  !seen
                    ? // Before the deal: all in a pile below the stage, the middle one on top.
                      { transform: 'translateX(-50%) translateY(70%) scale(0.9)', opacity: 0 }
                    : {
                        transform: `translateX(-50%) rotate(${d * 9}deg) scale(${1 - Math.min(ad, 3) * 0.06})`,
                        filter: `brightness(${1 - Math.min(ad, 3) * 0.12})`,
                        opacity: ad > 3.2 ? 0 : 1,
                        // The middle card first, then outward, pair by pair.
                        transitionDelay: dealing ? `${Math.round(ad) * 110}ms` : undefined,
                      }
                }
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
            <li key={i} className={cn('h-2 rounded-full motion-safe:transition-[width,background-color] motion-safe:duration-moderate', i === active ? 'w-6 bg-[var(--color-icon-icon-primary)]' : 'w-2 bg-[var(--color-border-border-strong)]')} />
          ))}
        </ol>
      </div>
      <p id={`${uid}-hint`} className="sr-only">
        {t.carousel.keysHint}
      </p>
      <p className="sr-only" aria-live="polite">
        {t.carousel.position(active + 1, n, activeName)}
      </p>
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
      <span aria-hidden className="absolute inset-x-0 bottom-0 top-6 rounded-[var(--size-border-radius-border-radius-4xl)] rounded-ss-none bg-[var(--color-bg-primary-bg-primary)] brightness-[0.85]" />
      <span aria-hidden className="absolute start-0 top-0 h-8 w-28 rounded-t-[var(--size-border-radius-border-radius-2xl)] bg-[var(--color-bg-primary-bg-primary)] brightness-[0.85]" />
      {/* The cards: dropped in once seen, fanned out on hover / focus. */}
      {three.map((item, i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            'absolute start-1/2 top-10 -ms-28 transition-[translate,rotate,scale,opacity] duration-slower ease-spring motion-reduce:transition-none',
            // A fanned card under the pointer comes to the front, straight and a little larger,
            // clear of the pocket, so it can be read. (Important: beats the fan and the inline z-index.)
            'hover:!z-20 hover:!-translate-y-[88%] hover:!rotate-0 hover:!scale-105',
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
      className={cn('relative h-80 min-w-56 [perspective:1200px]', className)}
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
            // The reverse side: a tinted pane (nothing shows through a card's own back, so the
            // tint carries the glass look), a light rim and a sweep of light.
            'border border-solid border-[var(--color-border-border-subtle)] shadow-elevation-lg',
            '[background:radial-gradient(120%_90%_at_100%_0%,color-mix(in_srgb,var(--color-bg-primary-bg-primary)_22%,transparent),transparent_60%),var(--color-bg-primary-bg-primary-subtle)]',
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


// ---------------------------------------------------------------------------

export interface ParallaxLayersProps extends ComponentProps<'div'> {
  /** How far the nearest layer travels at the edge of the area, px (default 28). */
  strength?: number;
}

/**
 * A stage whose layers shift with the pointer, each by its own depth, so a
 * flat composition reads as standing in space (the glass cards over a cloud
 * in a hero). Put ParallaxLayer children in it, positioned as you like. Mouse
 * only; on touch and with reduced motion it stays still. Purely visual: the
 * layers keep their place in the reading order.
 */
export function ParallaxLayers({ strength = 28, className, style, children, ...props }: ParallaxLayersProps) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== 'mouse') return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    // -1 … 1 from the middle of the stage.
    const x = ((e.clientX - r.left) / r.width) * 2 - 1;
    const y = ((e.clientY - r.top) / r.height) * 2 - 1;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty('--px', x.toFixed(3));
      el.style.setProperty('--py', y.toFixed(3));
    });
  };
  const leave = (e: PointerEvent<HTMLDivElement>) => {
    cancelAnimationFrame(raf.current);
    e.currentTarget.style.setProperty('--px', '0');
    e.currentTarget.style.setProperty('--py', '0');
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return (
    <div
      ref={ref}
      data-slot="parallax-layers"
      onPointerMove={move}
      onPointerLeave={leave}
      className={cn('relative [perspective:1200px]', className)}
      style={{ '--px': 0, '--py': 0, '--parallax': `${strength}px`, ...style } as CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ParallaxLayerProps extends ComponentProps<'div'> {
  /**
   * 0 stays put, 1 travels the full strength; negative moves against the
   * pointer (background). Nearer layers also turn a little toward it.
   */
  depth?: number;
}

/** One layer of ParallaxLayers. Eases after the pointer, so the layers trail at different speeds. */
export function ParallaxLayer({ depth = 0.5, className, style, ...props }: ParallaxLayerProps) {
  return (
    <div
      data-slot="parallax-layer"
      className={cn('transition-transform duration-slower ease-glide will-change-transform motion-reduce:!transform-none', className)}
      style={
        {
          transform: `translate3d(calc(var(--px) * var(--parallax) * ${depth}), calc(var(--py) * var(--parallax) * ${depth}), 0) rotateY(calc(var(--px) * ${depth * 8}deg)) rotateX(calc(var(--py) * ${-depth * 8}deg))`,
          ...style,
        } as CSSProperties
      }
      {...props}
    />
  );
}
