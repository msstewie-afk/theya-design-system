import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import type { StatusTone } from './status-dot';

/**
 * Semantic status pill. Pairs with StatusDot for "dot + label". `variant`
 * is a superset of the canonical StatusTone vocabulary — it shares
 * neutral/primary/success/warning/destructive/info and adds the
 * Badge-only `solid` visual (not a status).
 */
export type BadgeVariant = StatusTone | 'solid';

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

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  neutral: 'bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-[var(--color-text-text-subtler)] border-transparent',
  primary: 'bg-[var(--color-bg-primary-bg-primary-subtle)] text-[var(--color-text-text-link-subtle)] border-transparent',
  success: 'bg-[var(--color-bg-success-bg-success-subtle)] text-[var(--color-text-text-success)] border-transparent',
  warning: 'bg-[var(--color-bg-warning-bg-warning-subtle)] text-[var(--color-text-text-warning)] border-transparent',
  destructive: 'bg-[var(--color-bg-danger-bg-danger-subtle)] text-[var(--color-text-text-danger)] border-transparent',
  info: 'bg-[var(--color-bg-info-bg-info-subtle)] text-[var(--color-text-text-info)] border-transparent',
  solid: 'bg-[var(--color-bg-primary-bg-primary)] text-[var(--color-icon-icon-on-dark)] border-transparent',
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
  variant?: BadgeVariant;
  size?: BadgeSize;
  asChild?: boolean;
}

export function Badge({ className, variant = 'neutral', size = 'sm', asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : 'span';
  return (
    <Comp
      className={cn(
        'inline-flex w-fit shrink-0 items-center whitespace-nowrap rounded-full border border-solid',
        'font-body font-medium outline-none [&_svg]:pointer-events-none',
        'focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
        SIZE_CLASS[size],
        VARIANT_CLASS[variant],
        className,
      )}
      {...props}
    />
  );
}

/** Translate a canonical StatusTone to the matching Badge variant (every status tone is a valid Badge variant). */
export function statusToneToBadgeVariant(tone: StatusTone): BadgeVariant {
  return tone;
}
