'use client';

import { Children, createContext, useContext, useRef } from 'react';
import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import { useInView, useReducedMotion } from '../../ui/use-in-view';
import { useScrollFrame } from '../../ui/use-scroll-frame';

const IndexContext = createContext(0);

export interface ProductCollageProps extends ComponentProps<'div'> {
  /**
   * The ground: a photo (alt '' when it is mood only), or, without one, the
   * theme's gradient canvas with its blooms.
   */
  image?: { src: string; alt: string };
  /** The ground's shape on wide collages, as CSS aspect-ratio. Default '4 / 3'. */
  ratio?: string;
  /** CollageItem elements, in reading order: the first one floats in first. */
  children: ReactNode;
}

/**
 * A product shot made of real Theya pieces: two to four UI cards floating
 * over a photo or the theme's gradient. When the collage scrolls into view
 * the cards rise in one after another; while the page scrolls, cards with a
 * depth drift at their own speed. With reduced motion everything is still.
 *
 * Under 512px of its own width the cards stop floating and stack inside
 * the ground in reading order (CollageItem hideNarrow drops the extras).
 */
export function ProductCollage({ image, ratio = '4 / 3', className, style, children, ...props }: ProductCollageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useInView(ref, { threshold: 0.25 });
  const reduced = useReducedMotion();
  // -1 when the collage's centre is a viewport below the centre, 1 a viewport above.
  useScrollFrame(
    ref,
    (rect, vh) => {
      const p = Math.max(-1, Math.min(1, (vh / 2 - (rect.top + rect.height / 2)) / vh));
      ref.current?.style.setProperty('--collage-scroll', p.toFixed(3));
    },
    !reduced,
  );
  return (
    <div data-slot="product-collage" className={cn('@container w-full min-w-0', className)} style={style} {...props}>
      <div
        ref={ref}
        data-shown={shown || reduced || undefined}
        data-canvas={image ? undefined : 'gradient'}
        data-canvas-blooms={image ? undefined : ''}
        className={cn(
          'group/collage relative isolate flex flex-col gap-4 overflow-hidden rounded-[var(--size-border-radius-border-radius-5xl)] p-5',
          // On a photo the cards are the same frosted sheets as on the gradient
          // canvas (Maria, 23.11): no border, the largest radius, 90% surface
          // over a blur, a soft shadow (neutral: a photo has no single ground colour).
          image &&
            cn(
              '[&_[data-slot=card]]:border-transparent [&_[data-slot=card]]:rounded-[var(--size-border-radius-border-radius-5xl)]',
              '[&_[data-slot=card]]:bg-[color-mix(in_srgb,var(--color-bg-surface-bg-surface)_90%,transparent)] [&_[data-slot=card]]:backdrop-blur-xl',
              '[&_[data-slot=card]]:shadow-elevation-xl',
            ),
          '@lg:block @lg:aspect-[var(--collage-ratio)] @lg:p-0',
        )}
        style={{ '--collage-ratio': ratio } as CSSProperties}
      >
        {/* Narrow: the photo is its own block on top and the stacked cards only
            overlap its lower edge, so the stack never hides the person in it. */}
        {image && (
          <div className="relative -z-10 -mx-5 -mt-5 -mb-12 @lg:absolute @lg:inset-0 @lg:m-0">
            <img src={image.src} alt={image.alt} className="aspect-[4/3] w-full object-cover @lg:aspect-auto @lg:size-full" />
          </div>
        )}
        {Children.toArray(children).map((child, i) => (
          <IndexContext.Provider key={i} value={i}>
            {child}
          </IndexContext.Provider>
        ))}
      </div>
    </div>
  );
}

export interface CollageItemProps extends ComponentProps<'div'> {
  /** Wide collages: the card's inline-start edge, % of the collage width. */
  x: number;
  /** Wide collages: the card's top edge, % of the collage height. */
  y: number;
  /** Wide collages: the card's width, % of the collage width. Default 44. */
  width?: number;
  /** Scroll drift: 0 stays with the page, 1 drifts most, negative drifts the other way. Default 0.5. */
  depth?: number;
  /** Leave this card out when the collage is narrow (it stacks). */
  hideNarrow?: boolean;
}

/** One floating card of ProductCollage. Put a Card (or any surface) inside. */
export function CollageItem({ x, y, width = 44, depth = 0.5, hideNarrow, className, style, children, ...props }: CollageItemProps) {
  const index = useContext(IndexContext);
  return (
    <div
      data-slot="collage-item"
      className={cn(
        'relative min-w-0',
        '@lg:absolute @lg:start-[var(--x)] @lg:top-[var(--y)] @lg:w-[var(--w)]',
        hideNarrow && 'hidden @lg:block',
        // Float in: rise and fade, one after another.
        // raw-ok: the 120ms stagger step between cards has no motion token.
        'translate-y-6 opacity-0 transition-[opacity,translate] duration-slower ease-glide [transition-delay:calc(var(--i)*120ms+120ms)]',
        'group-data-[shown]/collage:translate-y-0 group-data-[shown]/collage:opacity-100',
        'motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none',
        className,
      )}
      style={{ '--x': `${x}%`, '--y': `${y}%`, '--w': `${width}%`, '--i': index, ...style } as CSSProperties}
      {...props}
    >
      {/* Scroll drift lives on its own layer, so it never fights the float-in. */}
      <div className="@lg:[translate:0_calc(var(--collage-scroll,0)*var(--depth)*-48px)]" style={{ '--depth': depth } as CSSProperties}>
        {children}
      </div>
    </div>
  );
}
