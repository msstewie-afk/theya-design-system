import type { ReactNode } from 'react';
import { GraphUp, GraphDown, Minus } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { StatusDot, type StatusTone } from './status-dot';
import { ToneIcon } from './tone-icon';

/**
 * Compact KPI metric card: a label, a big tabular-nums value, and an
 * optional status dot, top-right icon, and trend delta. `toneIcon`
 * renders a ToneIcon instead of a bare StatusDot — its stacked
 * fill/shape/color signals still distinguish tones in grayscale.
 *
 *   <Stat label="Active sites" value={128} tone="success" delta={{ value: "+12%", direction: "up" }} />
 *
 * Nesting: inside a Card or Widget, pass variant="plain" so Stat
 * doesn't paint a second border/surface inside one that already has them.
 */
export type StatTone = StatusTone;

export interface StatDelta {
  /** Display text for the change, e.g. "+12%" or "3 fewer". */
  value: string;
  direction: 'up' | 'down' | 'flat';
}

const DELTA_ICON = { up: GraphUp, down: GraphDown, flat: Minus } as const;
const DELTA_CLASS: Record<StatDelta['direction'], string> = {
  up: 'text-[var(--color-text-text-success)]',
  down: 'text-[var(--color-text-text-danger)]',
  flat: 'text-[var(--color-text-text-subtler)]',
};
const DELTA_SR = { up: 'increased', down: 'decreased', flat: 'no change' } as const;

const TONE_SR: Record<StatTone, string> = {
  success: 'healthy',
  warning: 'needs attention',
  danger: 'critical',
  neutral: 'neutral',
  primary: 'active',
  info: 'informational',
};

export interface StatProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  label: string;
  /** A string/number is the common case (tabular-nums); a ReactNode is allowed for a composite value. */
  value: ReactNode;
  /** Optional icon, rendered muted in the top-right corner. */
  icon?: ReactNode;
  tone?: StatTone;
  /** Word conveying the status meaning for assistive tech. Defaults to a per-tone word. */
  toneLabel?: string;
  /** Render a ToneIcon instead of a bare StatusDot for the tone signal. */
  toneIcon?: boolean;
  delta?: StatDelta;
  variant?: 'card' | 'plain';
}

export function Stat({ className, variant = 'card', label, value, icon, tone, toneLabel, toneIcon = false, delta, ...props }: StatProps) {
  const DeltaIcon = delta ? DELTA_ICON[delta.direction] : null;
  const status = tone ? (toneLabel ?? TONE_SR[tone]) : null;
  const toneVisual = tone ? toneIcon ? <ToneIcon tone={tone} size="sm" /> : <StatusDot tone={tone} /> : null;

  return (
    <div
      data-slot="stat"
      data-variant={variant}
      role="group"
      aria-label={label}
      className={cn(
        variant === 'card' && 'rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-4 shadow-elevation-xs',
        'text-[var(--color-text-text)]',
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <span data-slot="stat-label" className="min-w-0 font-body text-body-s text-[var(--color-text-text-subtler)]">{label}</span>
        {icon && (
          <span data-slot="stat-icon" aria-hidden="true" className="shrink-0 text-[var(--color-icon-icon-subtle)] [&_svg]:size-4 [&_svg]:shrink-0">
            {icon}
          </span>
        )}
      </div>

      <div className="mt-1 flex items-center gap-2">
        {tone && (
          <>
            {toneVisual}
            <span className="sr-only">{status}: </span>
          </>
        )}
        {/* text-heading-m (24px)/font-medium — bumped one size step up
            (from text-heading-s, 20px) and one weight step down (from
            font-semibold) from the first pass at this: still bigger than
            Metric's value (text-heading-xs/font-semibold, 16px) overall,
            just trading some weight for size instead of stacking both. */}
        <span data-slot="stat-value" className="min-w-0 break-words font-body text-heading-m font-medium tabular-nums text-[var(--color-text-text)]">{value}</span>
      </div>

      {delta && DeltaIcon && (
        <p data-slot="stat-delta" className={cn('mt-1.5 flex items-center gap-1 font-body text-body-s font-medium tabular-nums', DELTA_CLASS[delta.direction])}>
          <DeltaIcon className="size-4 shrink-0" aria-hidden="true" />
          <span className="sr-only">{DELTA_SR[delta.direction]}: </span>
          <span className="min-w-0 break-words">{delta.value}</span>
        </p>
      )}
    </div>
  );
}
