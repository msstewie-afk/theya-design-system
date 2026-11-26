'use client';

import { Slot } from '@radix-ui/react-slot';
import type { CSSProperties, ComponentProps } from 'react';
import { cn } from '../../../lib/utils';

export type StickerTone = 'pink' | 'cream' | 'orange' | 'yellow';

export interface StickerProps extends ComponentProps<'button'> {
  /** The pastel fill, from the landing accent tokens. Default 'yellow'. */
  tone?: StickerTone;
  /** Tilt in degrees, clamped to −6…+6. Default −4. 0 keeps it straight. */
  tilt?: number;
  /** 'sm' 36px, 'md' 44px (default), 'lg' 56px with the heavy display face. */
  size?: 'sm' | 'md' | 'lg';
  /** Render the styles onto the child (an `<a>` for a link), like Button. */
  asChild?: boolean;
}

const TONE: Record<StickerTone, string> = {
  pink: 'bg-[var(--color-bg-accent-pink)] text-[var(--color-text-on-accent-pink)]',
  cream: 'bg-[var(--color-bg-accent-cream)] text-[var(--color-text-on-accent-cream)]',
  orange: 'bg-[var(--color-bg-accent-orange)] text-[var(--color-text-on-accent-orange)]',
  yellow: 'bg-[var(--color-bg-accent-yellow)] text-[var(--color-text-on-accent-yellow)]',
};

const SIZE = {
  sm: 'min-h-9 px-3 text-eyebrow-s font-bold',
  md: 'min-h-11 px-4 text-eyebrow-m font-bold',
  lg: 'min-h-14 px-6 font-display-heavy text-heading-s uppercase',
} as const;

/**
 * A tilted call to action with square corners on a pastel fill, for landing
 * pages: "Order now" slapped over the corner of a headline. It straightens
 * on hover and on keyboard focus, so the label reads level when it matters.
 *
 * Landing only: product screens use Button.
 */
export function Sticker({ tone = 'yellow', tilt = -4, size = 'md', asChild, className, style, ...props }: StickerProps) {
  const Comp = asChild ? Slot : 'button';
  const deg = Math.max(-6, Math.min(6, tilt));
  return (
    <Comp
      data-slot="sticker"
      data-tone={tone}
      {...(asChild ? {} : { type: props.type ?? 'button' })}
      style={{ '--sticker-tilt': `${deg}deg`, ...style } as CSSProperties}
      className={cn(
        'inline-flex w-fit items-center justify-center gap-2 rounded-none text-center no-underline whitespace-nowrap',
        'rotate-[var(--sticker-tilt)] hover:rotate-0 focus-visible:rotate-0',
        'transition-[rotate,translate] duration-fast ease-standard motion-reduce:transition-none',
        'cursor-pointer outline-none ring-offset-2 ring-offset-[var(--color-bg-surface-bg-surface-base)] focus-visible:ring-2 focus-visible:ring-[var(--color-focus-focus-ring)]',
        // Forced colors: the pastel fill drops; a border keeps the shape.
        'forced-colors:border forced-colors:border-solid forced-colors:border-[ButtonText]',
        TONE[tone],
        SIZE[size],
        className,
      )}
      {...props}
    />
  );
}
