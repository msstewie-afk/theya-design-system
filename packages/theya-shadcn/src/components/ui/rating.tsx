import { forwardRef, useState } from 'react';
import type { ComponentPropsWithoutRef, ElementRef } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '@/lib/utils';

/**
 * Star rating, two modes:
 *
 * - Input (default): a Radix RadioGroup, one radio per star — arrow keys,
 *   Home/End, roving focus and form `name` come from the primitive. Each
 *   star is a radio named "{n} of {max}" (`formatLabel`). Hovering previews
 *   the value. `clearable` lets a click on the current star reset to 0.
 * - `readOnly`: a single role="img" with the value as its accessible name
 *   ("4.5 of 5"), so fractional values (0.1 steps) are drawn as partial
 *   stars and read out exactly.
 *
 * Filled vs empty never relies on color alone: an empty star is an outline
 * (border-default, 3:1), a filled one is solid. The fill (icon-rating,
 * yellow-300) is too light on white for 3:1, so it carries a yellow-500
 * stroke (border-rating, 3.9:1); in dark the fill itself passes.
 *
 * Hit targets stay ≥ 24px: small stars get padding (WCAG 2.5.8).
 */

const STAR_PATH =
  'M8.58737 8.23597L11.1849 3.00376C11.5183 2.33208 12.4817 2.33208 12.8151 3.00376L15.4126 8.23597L21.2215 9.08017C21.9668 9.18848 22.2638 10.0994 21.7243 10.6219L17.5217 14.6918L18.5135 20.4414C18.6409 21.1798 17.8614 21.7428 17.1945 21.3941L12 18.678L6.80547 21.3941C6.1386 21.7428 5.35909 21.1798 5.48645 20.4414L6.47825 14.6918L2.27575 10.6219C1.73617 10.0994 2.03322 9.18848 2.77852 9.08017L8.58737 8.23597Z';

type RatingSize = 'sm' | 'md';

const STAR_SIZE: Record<RatingSize, string> = {
  sm: 'size-[var(--size-icon-icon-sm)]', // 16px
  md: 'size-[var(--size-icon-icon-md)]', // 24px
};
// Padding that brings each radio's hit area to at least 24px.
const HIT_PAD: Record<RatingSize, string> = { sm: 'p-1', md: 'p-0.5' };

/**
 * One star, `fill` 0–1 (fraction drawn from the left). Exported as
 * RatingStar for single-star markers elsewhere (a favourite in a card) so
 * they share the outline + stroked fill and its contrast.
 */
export function RatingStar({ fill, size }: { fill: number; size: RatingSize }) {
  const pct = Math.max(0, Math.min(1, fill)) * 100;
  return (
    <span aria-hidden="true" className={cn('relative inline-block shrink-0', STAR_SIZE[size])}>
      <svg viewBox="0 0 24 24" className="absolute inset-0 size-full" fill="none">
        <path d={STAR_PATH} stroke="var(--color-border-border-default)" strokeWidth={1.5} strokeLinejoin="round" />
      </svg>
      {pct > 0 && (
        <svg
          viewBox="0 0 24 24"
          className="absolute inset-0 size-full"
          style={pct < 100 ? { clipPath: `inset(0 ${100 - pct}% 0 0)` } : undefined}
        >
          <path
            d={STAR_PATH}
            fill="var(--color-icon-icon-rating)"
            stroke="var(--color-border-border-rating)"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

const defaultFormatLabel = (value: number, max: number) => `${value} of ${max}`;

type RootProps = Omit<
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
  'value' | 'defaultValue' | 'onValueChange' | 'orientation' | 'dir'
>;

export interface RatingProps extends RootProps {
  /** Controlled value, 0 = no rating. Fractions are drawn only in readOnly. */
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Number of stars. Default 5. */
  max?: number;
  size?: RatingSize;
  /** Display only: one image named by the value, fractional values allowed. */
  readOnly?: boolean;
  /** A click on the currently selected star resets the rating to 0. */
  clearable?: boolean;
  /** Accessible text for a value ("3 of 5"). Localize here. */
  formatLabel?: (value: number, max: number) => string;
}

export const Rating = forwardRef<ElementRef<typeof RadioGroupPrimitive.Root>, RatingProps>(function Rating(
  {
    value,
    defaultValue = 0,
    onValueChange,
    max = 5,
    size = 'md',
    readOnly = false,
    clearable = false,
    formatLabel = defaultFormatLabel,
    disabled,
    className,
    'aria-label': ariaLabel,
    ...props
  },
  ref,
) {
  const [internal, setInternal] = useState(defaultValue);
  const [hovered, setHovered] = useState<number | null>(null);
  const current = value ?? internal;
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  const commit = (next: number) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  if (readOnly) {
    const label = formatLabel(Math.round(current * 10) / 10, max);
    return (
      <span
        role="img"
        aria-label={ariaLabel ? `${ariaLabel}: ${label}` : label}
        data-slot="rating"
        data-readonly=""
        className={cn('inline-flex items-center gap-0.5', className)}
      >
        {stars.map((n) => (
          <RatingStar key={n} size={size} fill={current - (n - 1)} />
        ))}
      </span>
    );
  }

  const shown = hovered ?? current;
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      data-slot="rating"
      orientation="horizontal"
      aria-label={ariaLabel}
      disabled={disabled}
      value={current > 0 ? String(current) : ''}
      onValueChange={(v) => commit(Number(v))}
      onPointerLeave={() => setHovered(null)}
      className={cn('inline-flex items-center', disabled && 'opacity-50', className)}
      {...props}
    >
      {stars.map((n) => (
        <RadioGroupPrimitive.Item
          key={n}
          value={String(n)}
          aria-label={formatLabel(n, max)}
          onPointerEnter={() => !disabled && setHovered(n)}
          onClick={() => {
            // Radix doesn't uncheck a checked radio; clearable does it here.
            if (clearable && n === current) commit(0);
          }}
          className={cn(
            'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[var(--size-border-radius-border-radius-md)] outline-none',
            'focus-visible:focus-ring',
            'disabled:cursor-not-allowed',
            'motion-safe:transition-transform motion-safe:active:not-disabled:scale-90',
            HIT_PAD[size],
          )}
        >
          <RatingStar size={size} fill={n <= shown ? 1 : 0} />
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
});
