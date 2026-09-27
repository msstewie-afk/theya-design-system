import type { ReactNode } from 'react';
import { Bell, WarningCircle, CheckCircle, InfoCircle, Star, WarningTriangle } from 'iconoir-react';
import { cn } from '@/lib/utils';
import type { StatusTone } from './status-dot';

/**
 * A tone-tinted glyph: a subtle-fill container plus a shape-distinct
 * icon in the matching darker ink — the same pair Tabs/Toggle/Chip
 * already use. Stacks three independent signals (fill color, icon
 * shape, icon color) so tone still reads in grayscale, unlike a bare
 * StatusDot. Decorative by default (aria-hidden) — always pair with a
 * visible text label; this glyph reinforces it, it doesn't replace it. Pass
 * aria-hidden={false} only for the rare standalone instance with no
 * sibling text.
 */
const TONE_CLASS: Record<StatusTone, string> = {
  info: 'bg-[var(--color-cyan-cyan-050)] [[data-theme=dark]_&]:bg-[var(--color-cyan-cyan-800)] text-[var(--color-cyan-cyan-900)] [[data-theme=dark]_&]:text-[var(--color-cyan-cyan-200)]',
  success: 'bg-[var(--color-bg-success-bg-success-subtle)] text-[var(--color-icon-icon-success)]',
  warning: 'bg-[var(--color-bg-warning-bg-warning-subtle)] text-[var(--color-icon-icon-warning)]',
  destructive: 'bg-[var(--color-bg-danger-bg-danger-subtle)] text-[var(--color-icon-icon-danger)]',
  neutral: 'bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-[var(--color-icon-icon-subtle)]',
  primary: 'bg-[var(--color-bg-primary-bg-primary-subtle)] text-[var(--color-icon-icon-primary)]',
};

const DEFAULT_ICON: Record<StatusTone, ReactNode> = {
  info: <InfoCircle />,
  success: <CheckCircle />,
  warning: <WarningTriangle />,
  destructive: <WarningCircle />,
  neutral: <Bell />,
  primary: <Star />,
};

export interface ToneIconProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  tone: StatusTone;
  shape?: 'circle' | 'square';
  size?: 'sm' | 'default' | 'lg';
  /** Overrides the tone's default icon. */
  icon?: ReactNode;
}

const SHAPE_CLASS = { circle: 'rounded-full', square: 'rounded-[var(--size-border-radius-border-radius-md)]' };
const SIZE_CLASS = { sm: 'size-6 [&_svg]:size-3', default: 'size-8 [&_svg]:size-4', lg: 'size-10 [&_svg]:size-5' };

export function ToneIcon({ className, tone, shape = 'circle', size = 'default', icon, ...props }: ToneIconProps) {
  return (
    <span data-slot="tone-icon" aria-hidden="true" className={cn('inline-flex shrink-0 items-center justify-center [&_svg]:shrink-0', TONE_CLASS[tone], SHAPE_CLASS[shape], SIZE_CLASS[size], className)} {...props}>
      {icon ?? DEFAULT_ICON[tone]}
    </span>
  );
}
