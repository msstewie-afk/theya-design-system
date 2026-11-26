'use client';

import { useId } from 'react';
import type { CSSProperties, ComponentProps, ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import type { StickerTone } from './sticker';

export type StampTone = StickerTone;

export interface StampProps extends Omit<ComponentProps<'span'>, 'children'> {
  /** 'circle' (default) or 'squircle' (a rounded square). */
  shape?: 'circle' | 'squircle';
  /** The pastel fill, from the landing accent tokens. Default 'yellow'. */
  tone?: StampTone;
  /** Tilt in degrees, clamped to −15…+15. Default −8. */
  tilt?: number;
  /** Fluid sizes: 'sm' 80–104px, 'md' 104–144px (default), 'lg' 128–192px. */
  size?: 'sm' | 'md' | 'lg';
  /** One to three short lines in the middle ("New", "Since 2014"). */
  children?: ReactNode;
  /** Text set around the edge (circle only), e.g. "Handmade · Small batch · ". */
  ring?: string;
  /**
   * What the stamp says, when nowhere else on the page says it (an award, a
   * guarantee). Without it the stamp is decoration and hidden from screen readers.
   */
  label?: string;
}

const TONE: Record<StampTone, string> = {
  pink: 'bg-[var(--color-bg-accent-pink)] text-[var(--color-text-on-accent-pink)]',
  cream: 'bg-[var(--color-bg-accent-cream)] text-[var(--color-text-on-accent-cream)]',
  orange: 'bg-[var(--color-bg-accent-orange)] text-[var(--color-text-on-accent-orange)]',
  yellow: 'bg-[var(--color-bg-accent-yellow)] text-[var(--color-text-on-accent-yellow)]',
};

const SIZE = {
  sm: 'size-[clamp(5rem,8vw,6.5rem)] text-eyebrow-s',
  md: 'size-[clamp(6.5rem,11vw,9rem)] text-body-m',
  lg: 'size-[clamp(8rem,14vw,12rem)] text-heading-xs',
} as const;

/**
 * A round or rounded-square badge with a tilt and a dashed inner border, for
 * landing pages: "New", "Award 2026", "Handmade" set over the corner of a
 * headline or a picture. Not clickable: for an action use Sticker.
 *
 * Landing only: product screens use Badge.
 */
export function Stamp({ shape = 'circle', tone = 'yellow', tilt = -8, size = 'md', children, ring, label, className, style, ...props }: StampProps) {
  const pathId = useId();
  const deg = Math.max(-15, Math.min(15, tilt));
  const withRing = shape === 'circle' && !!ring;
  return (
    <span
      data-slot="stamp"
      data-tone={tone}
      data-shape={shape}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      style={{ '--stamp-tilt': `${deg}deg`, ...style } as CSSProperties}
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center rotate-[var(--stamp-tilt)]',
        shape === 'circle' ? 'rounded-full' : 'rounded-[28%]',
        // Forced colors: the pastel fill drops; the outer edge keeps the shape.
        'forced-colors:border forced-colors:border-solid forced-colors:border-[CanvasText]',
        TONE[tone],
        SIZE[size],
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute border-2 border-dashed border-current opacity-60',
          // With a ring the dashed line sits inside the words; without one, near the edge.
          withRing ? 'inset-[23%]' : 'inset-[6%]',
          shape === 'circle' ? 'rounded-full' : 'rounded-[24%]',
        )}
      />
      {withRing && (
        <svg aria-hidden viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 size-full overflow-visible">
          <defs>
            <path id={pathId} d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
          </defs>
          <text className="fill-current font-display-heavy uppercase" fontSize="8.5" letterSpacing="0.06em">
            <textPath href={`#${pathId}`} textLength="216" lengthAdjust="spacing">
              {ring}
            </textPath>
          </text>
        </svg>
      )}
      {children != null && (
        <span
          className={cn(
            'relative flex flex-col items-center text-center font-display-heavy uppercase leading-[0.95]',
            withRing ? 'max-w-[44%] text-[0.75em]' : 'max-w-[72%]',
          )}
        >
          {children}
        </span>
      )}
    </span>
  );
}
