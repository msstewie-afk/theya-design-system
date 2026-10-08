'use client';

import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils';
import type { StatusTone } from './status-dot';
import { SOLID_TONE_CLASS } from './chip';

/**
 * Semantic status pill. Pairs with StatusDot for "dot + label". `tone`
 * is the canonical StatusTone vocabulary (neutral/primary/success/warning/
 * danger/info). `appearance` is the fill axis: `tonal` (default, tinted
 * background) or `filled` (full tone background). Filled colors are
 * Chip's own solid look, imported rather than copied so the two stay in sync.
 */
export type BadgeTone = StatusTone;
export type BadgeAppearance = 'tonal' | 'filled';

/**
 * 'sm' (default) is the original, only size Badge had. 'md' matches
 * Chip's own `size="lg"` step for height and icon (h-8, size-4), but
 * uses text-body-m (14px) instead of Chip's text-body-s (12px) —
 * Мария's call, a bigger type step for Badge's own bigger size. Named
 * 'md' here, not 'lg', since Badge only has two sizes and 'md' reads
 * as the more natural "bigger of two" label. The pill shape
 * (rounded-full) is Badge's own and doesn't change with size.
 */
export type BadgeSize = 'sm' | 'md';

const TONAL_CLASS: Record<BadgeTone, string> = {
  neutral: 'bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-[var(--color-text-text-subtler)] border-transparent',
  primary: 'bg-[var(--color-bg-primary-bg-primary-subtle)] text-[var(--color-text-text-link-on-tonal)] border-transparent',
  success: 'bg-[var(--color-bg-success-bg-success-subtle)] text-[var(--color-text-text-success-on-tonal)] border-transparent',
  warning: 'bg-[var(--color-bg-warning-bg-warning-subtle)] text-[var(--color-text-text-warning-on-tonal)] border-transparent',
  danger: 'bg-[var(--color-bg-danger-bg-danger-subtle)] text-[var(--color-text-text-danger-on-tonal)] border-transparent',
  info: 'bg-[var(--color-bg-info-bg-info-subtle)] text-[var(--color-text-text-info-on-tonal)] border-transparent',
};

// h-8 / size-4 icon copied 1:1 from Chip's size="lg" (see chip.tsx);
// text bumped to text-body-m (14px) rather than Chip's own text-body-s
// (12px) — Мария's call, Badge's md reads the same height as Chip's lg
// but with the larger of the two type steps.
const SIZE_CLASS: Record<BadgeSize, string> = {
  sm: 'h-[1.3125rem] gap-1.5 px-2 text-body-xs [&_svg]:size-3',
  md: 'h-8 gap-1.5 px-2.5 text-body-m [&_svg]:size-4',
};

export interface BadgeProps extends React.ComponentProps<'span'> {
  tone?: BadgeTone;
  /** `tonal` (default) — tinted background. `filled` — full tone background, same colors as Chip's solid look. */
  appearance?: BadgeAppearance;
  size?: BadgeSize;
  asChild?: boolean;
}

export function Badge({ className, tone = 'neutral', appearance = 'tonal', size = 'sm', asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : 'span';
  return (
    <Comp
      className={cn(
        'inline-flex w-fit shrink-0 items-center whitespace-nowrap rounded-full border border-solid',
        'font-body font-medium outline-none [&_svg]:pointer-events-none',
        'focus-visible:focus-ring',
        SIZE_CLASS[size],
        appearance === 'filled' ? [SOLID_TONE_CLASS[tone], 'border-transparent'] : TONAL_CLASS[tone],
        className,
      )}
      {...props}
    />
  );
}

/** Translate a canonical StatusTone to the matching Badge tone (identical sets since `solid` moved to `appearance`). */
export function statusToneToBadgeTone(tone: StatusTone): BadgeTone {
  return tone;
}
