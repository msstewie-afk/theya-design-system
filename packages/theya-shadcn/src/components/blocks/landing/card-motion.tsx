'use client';

import { useEffect, useRef, useState, type ComponentProps, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { RefreshDouble } from 'iconoir-react';
import { cn } from '../../../lib/utils';
import { inertProps } from '../../../lib/inert';
import { Button } from '../../ui/button';
import { useInView } from '../../ui/use-in-view';
import { useMediaQuery } from '../../ui/use-media-query';

/*
 * Card motion for landing pages: folder reveal, flip card, parallax layers.
 * Driven by the reader (hover, focus, scroll, the pointer), never by a
 * timer; with reduced motion the same states switch without travelling.
 * The ring, wall and fan carousels are OrbitCarousel (Motion) shapes.
 */

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
      <span className="absolute inset-x-0 bottom-0 z-10 flex h-[62%] flex-col justify-end gap-1 rounded-[var(--size-border-radius-border-radius-4xl)] bg-[var(--color-bg-primary-bg-primary)] p-6 text-[var(--color-text-text-on-primary)] shadow-elevation-md transition-transform duration-slower ease-spring group-hover/folder:translate-y-2 motion-reduce:transition-none">
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

  // Escape undoes a hover flip (WCAG 1.4.13): it stays down until the pointer leaves and comes back.
  useEffect(() => {
    if (!hovered) return;
    const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && setHovered(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [hovered]);

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
            'border border-solid border-[var(--color-border-border-subtle)] shadow-elevation-md',
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
