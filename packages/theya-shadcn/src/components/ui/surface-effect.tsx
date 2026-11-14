'use client';

import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * Motion preset (landing pages): a decorative effect on a card or panel.
 * Ported from Kinetics' Surface & Motion set (MIT, kinetics.colorion.co)
 * onto Theya's tokens:
 *
 * - `spotlight` — a soft primary glow follows the pointer (Cursor Spotlight).
 * - `beam` — a light runs round the border while the card is hovered or holds focus (Border Beam).
 * - `tilt` — the card tilts toward the pointer, up to 8° (Parallax Tilt).
 * - `shine` — a light streak sweeps across on hover (Shine Sweep).
 * - `lift` — the card rises with a larger shadow on hover (Hover Lift),
 *   `ease-spring`.
 * - `reveal` — a second picture (`reveal`) shows through a circle that
 *   follows the pointer (Hover Mask): a sketch under the photo, the dark
 *   theme under the light one. Decorative only: the revealed layer is
 *   aria-hidden and must not carry anything the card doesn't already say.
 *
 * Purely visual: no role, no focus, nothing announced. Pointer effects
 * (spotlight, tilt) do nothing on touch; everything is still under
 * prefers-reduced-motion (the beam keeps only its border).
 * Pass the card's own radius through `className` (rounded-*) so the
 * effect is clipped to it.
 */
// useLayoutEffect warns on the server; the effect only reads the DOM.
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export type SurfaceEffectKind = 'spotlight' | 'beam' | 'tilt' | 'shine' | 'lift' | 'reveal';

export interface SurfaceEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  effect: SurfaceEffectKind;
  /** With `tilt`: the largest turn toward the pointer, in degrees (default 8). */
  maxTilt?: number;
  /** With `reveal`: what shows through the circle (same size as the children, e.g. an <img alt="">). */
  reveal?: ReactNode;
  /** With `reveal`: the circle's radius (CSS length, default 8rem). */
  revealSize?: string;
}

export function SurfaceEffect({ effect, maxTilt = 8, reveal, revealSize = '8rem', className, children, onPointerMove, onPointerLeave, ...props }: SurfaceEffectProps) {
  const ref = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  // Beam: the inner panel sits 1px inside the card (the ring), so its corners
  // are the card's minus 1px — concentric, not as round as the card
  // (rounded-[inherit] made them equal: nested corners, 2026-11-14). Read from
  // the card's own computed radius, again when the theme or brand changes it.
  useIsoLayoutEffect(() => {
    if (effect !== 'beam') return;
    const sync = () => {
      const card = ref.current;
      const inner = panel.current;
      if (!card || !inner) return;
      const cs = getComputedStyle(card);
      const corner = (v: string) => `max(0px, calc(${v.split(' ')[0]} - 1px))`;
      inner.style.borderRadius = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].map(corner).join(' ');
    };
    sync();
    const watch = new MutationObserver(sync);
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'data-brand', 'data-density', 'style'] });
    return () => watch.disconnect();
  }, [effect]);

  const track = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (event.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = event.clientX - r.left;
    const y = event.clientY - r.top;
    // CSS variables, not React state: no re-render on every pointer move.
    if (effect === 'spotlight') {
      // The glow is placed from the inline start (it's the right edge in RTL).
      const rtl = getComputedStyle(ref.current).direction === 'rtl';
      ref.current.style.setProperty('--spot-x', `${rtl ? r.width - x : x}px`);
      ref.current.style.setProperty('--spot-y', `${y}px`);
    } else if (effect === 'reveal') {
      // clip-path circle() is placed from the physical left, in every direction.
      ref.current.style.setProperty('--mask-x', `${x}px`);
      ref.current.style.setProperty('--mask-y', `${y}px`);
    } else if (effect === 'tilt') {
      ref.current.style.setProperty('--tilt-x', `${(y / r.height - 0.5) * -maxTilt * 2}deg`);
      ref.current.style.setProperty('--tilt-y', `${(x / r.width - 0.5) * maxTilt * 2}deg`);
    }
  };
  const reset = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    ref.current?.style.setProperty('--tilt-x', '0deg');
    ref.current?.style.setProperty('--tilt-y', '0deg');
  };
  const pointer = effect === 'spotlight' || effect === 'tilt' || effect === 'reveal' ? { onPointerMove: track, onPointerLeave: reset } : { onPointerMove, onPointerLeave };

  if (effect === 'beam') {
    return (
      <div
        ref={ref}
        data-slot="surface-effect"
        data-effect="beam"
        className={cn(
          // The ring is an ordinary card border; the light runs over it.
          'relative isolate overflow-hidden bg-[var(--color-border-border-subtle)] p-px',
          // The spinning light, clipped to a 1px ring by the inner panel. A centred square
          // 2.5× the card's width, so the light reaches the sides of a wide card too
          // (an inset of -50% kept the card's proportions and left the sides dark).
          "before:absolute before:top-1/2 before:left-1/2 before:-z-10 before:aspect-square before:w-[250%] before:-translate-x-1/2 before:-translate-y-1/2 before:animate-[theya-spin_4s_linear_infinite] before:bg-[conic-gradient(from_0deg,transparent_0_72%,var(--color-icon-icon-primary)_84%,var(--color-border-border-subtle)_90%,transparent_96%)] before:content-['']",
          // At rest the light sits still on the border; it runs only while the card is
          // hovered or holds focus, so nothing moves on its own (WCAG 2.2.2).
          'before:[animation-play-state:paused] hover:before:[animation-play-state:running] focus-within:before:[animation-play-state:running]',
          // Reduced motion: just the border.
          'motion-reduce:before:hidden',
          className,
        )}
        {...props}
      >
        <div ref={panel} className="relative h-full rounded-[inherit] bg-[var(--color-bg-surface-bg-surface)]">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      data-slot="surface-effect"
      data-effect={effect}
      className={cn(
        'relative',
        effect === 'spotlight' &&
          "isolate overflow-hidden before:pointer-events-none before:absolute before:start-[var(--spot-x,-999px)] before:top-[var(--spot-y,-999px)] before:-z-10 before:size-56 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-icon-icon-primary)_22%,transparent),transparent_70%)] before:opacity-0 before:transition-opacity before:duration-moderate before:content-[''] hover:before:opacity-100 motion-reduce:before:hidden rtl:before:translate-x-1/2",
        effect === 'tilt' &&
          'transition-transform duration-standard ease-enter [transform:perspective(800px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] motion-reduce:transform-none motion-reduce:transition-none',
        effect === 'shine' &&
          "isolate overflow-hidden before:pointer-events-none before:absolute before:inset-y-0 before:-start-[120%] before:z-10 before:w-3/5 before:-skew-x-[20deg] before:bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,white_35%,transparent),transparent)] before:content-[''] hover:before:start-[120%] hover:before:transition-[inset-inline-start] hover:before:duration-[calc(var(--motion-duration-slower)*2)] hover:before:ease-press motion-reduce:before:hidden",
        effect === 'lift' &&
          'transition-[translate,box-shadow] duration-slower ease-spring hover:-translate-y-1.5 hover:shadow-elevation-md motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        effect === 'reveal' && 'group/reveal isolate overflow-hidden',
        className,
      )}
      {...pointer}
      {...props}
    >
      {children}
      {effect === 'reveal' && reveal != null && (
        <div
          aria-hidden="true"
          data-slot="surface-effect-reveal"
          className={cn(
            'pointer-events-none absolute inset-0 z-10 [&>img]:size-full [&>img]:object-cover',
            // A circle of 0 at rest; it opens to revealSize under the pointer and trails it a little.
            '[clip-path:circle(0_at_var(--mask-x,50%)_var(--mask-y,50%))] group-hover/reveal:[clip-path:circle(var(--reveal-r)_at_var(--mask-x,50%)_var(--mask-y,50%))]',
            'transition-[clip-path] duration-moderate ease-glide motion-reduce:transition-none',
          )}
          style={{ '--reveal-r': revealSize } as React.CSSProperties}
        >
          {reveal}
        </div>
      )}
    </div>
  );
}

/**
 * Motion preset (landing pages): a slow drifting aurora of brand colors
 * behind a hero (Kinetics' Aurora Drift). Place it as the first child of
 * a `relative isolate` section; it fills it and stays behind the content.
 * Decorative and hidden from assistive tech. It drifts once, for under
 * 5 seconds, and then rests, so it needs no pause control (WCAG 2.2.2);
 * prefers-reduced-motion keeps it still. Keep text on top of it at full contrast — put
 * copy on a solid surface or keep `intensity` low.
 */
export function Aurora({ intensity = 'subtle', className, ...props }: React.HTMLAttributes<HTMLDivElement> & { intensity?: 'subtle' | 'vivid' }) {
  const a = intensity === 'vivid' ? '55%' : '28%';
  return (
    <div aria-hidden="true" data-slot="aurora" className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)} {...props}>
      <div
        className="absolute inset-[-40%] animate-[theya-aurora-drift_4.5s_ease-out_both] blur-2xl motion-reduce:animate-none"
        style={{
          background: [
            `radial-gradient(40% 50% at 30% 38%, color-mix(in oklab, var(--color-bg-primary-bg-primary) ${a}, transparent), transparent 60%)`,
            `radial-gradient(45% 55% at 72% 62%, color-mix(in oklab, var(--color-bg-info-bg-info) ${a}, transparent), transparent 60%)`,
            `radial-gradient(40% 50% at 50% 82%, color-mix(in oklab, var(--color-bg-success-bg-success) ${a}, transparent), transparent 60%)`,
          ].join(', '),
        }}
      />
    </div>
  );
}
