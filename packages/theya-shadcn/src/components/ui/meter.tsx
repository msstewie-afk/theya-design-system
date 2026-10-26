'use client';

import { useId } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';

/**
 * No Radix meter primitive exists — built from scratch on native
 * role="meter" semantics (aria-valuenow/min/max/valuetext). A labelled
 * bar for a measured value inside a known range (disk usage, a quota,
 * capacity) — use this, not Progress, when the number is "how full"
 * rather than "how far along".
 *
 * For a PERCENTAGE, pass a fraction in [0,1] with min={0} max={1} and
 * format={{ style: 'percent' }} (e.g. value={0.38} max={1} reads "38%"
 * and fills 38%). Leaving the default max={100} with a fractional
 * value displays "38%" but fills only ~0.4% — this dev-warns on that.
 */
export type MeterTone = 'primary' | 'success' | 'warning' | 'danger' | 'info';

// icon-* tones, not bg-*: the fill is the value itself (showValue={false} leaves nothing else), so it
// needs 3:1 against the track. bg-* fell to 1.36-2.00:1 in dark and 1.64:1 for warning in light;
// icon-* is 3.20-5.88:1 in both themes (WCAG 1.4.11). Same choice as Sparkline's info line. Warning is the exception, below.
const TONE_INDICATOR: Record<MeterTone, string> = {
  primary: 'bg-[var(--color-icon-icon-primary)]',
  success: 'bg-[var(--color-icon-icon-success)]',
  // Light keeps the yellow fill (Мария, 2026-10-26): 1.64:1 against the track, so with showValue={false}
  // light warning is an accepted 1.4.11 deviation. Dark uses icon-warning (5.08:1).
  warning: 'bg-[var(--color-bg-warning-bg-warning)] [[data-theme=dark]_&]:bg-[var(--color-icon-icon-warning)]',
  danger: 'bg-[var(--color-icon-icon-danger)]',
  info: 'bg-[var(--color-icon-icon-info)]',
};

export interface MeterProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  value: number;
  min?: number;
  max?: number;
  label?: ReactNode;
  format?: Intl.NumberFormatOptions;
  /** Custom accessible value text (aria-valuetext), e.g. (f, v) => v >= 90 ? "Nearly full" : f. */
  getValueLabel?: (formattedValue: string, value: number) => string;
  tone?: MeterTone;
  showValue?: boolean;
  /** Render as `segments` discrete lit-or-not cells instead of a smooth
   * fill — for a fixed count of physical/logical units (GPUs, seats,
   * slots). Typically set `max` equal to `segments` so `value` maps
   * directly to a count of lit cells. */
  segments?: number;
}

export function Meter({ value, min = 0, max = 100, label, format, getValueLabel, tone = 'primary', showValue = true, segments, className, ...props }: MeterProps) {
  const { locale } = useTheyaI18n();
  const id = useId();
  const hasHeader = label != null || showValue;
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  if (process.env.NODE_ENV !== 'production' && format?.style === 'percent' && max > 1 && value <= 1) {
    console.warn(
      `Meter: format {style:"percent"} with max=${max} fills ${value}/${max} of the bar (~${((value / max) * 100).toFixed(1)}%) while the label reads "${Math.round(value * 100)}%". For a percentage, pass a fraction with min={0} max={1} (e.g. value={${value}} max={1}).`,
    );
  }

  const formatted = new Intl.NumberFormat(locale, format).format(value);
  const valueText = getValueLabel?.(formatted, value);

  return (
    <div
      role="meter"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={valueText}
      aria-labelledby={label != null ? `${id}-label` : undefined}
      className={cn('flex w-full flex-col gap-1', className)}
      {...props}
    >
      {hasHeader && (
        <div className={cn('flex items-baseline gap-3 font-body text-body-s', label != null ? 'justify-between' : 'justify-end')}>
          {label != null && (
            <span id={`${id}-label`} className="min-w-0 truncate text-[var(--color-text-text-subtler)]">
              {label}
            </span>
          )}
          {showValue && <span className="shrink-0 tabular-nums text-[var(--color-text-text)]">{formatted}</span>}
        </div>
      )}
      {segments != null && segments > 0 ? (
        <div className="flex w-full gap-1">
          {Array.from({ length: segments }, (_, i) => {
            const lit = i < Math.round((pct / 100) * segments);
            return (
              <div
                key={i}
                aria-hidden="true"
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors duration-slow ease-enter motion-reduce:transition-none',
                  lit ? TONE_INDICATOR[tone] : 'bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
                  'forced-colors:forced-color-adjust-none',
                  lit ? 'forced-colors:bg-[Highlight]' : 'forced-colors:border forced-colors:border-solid forced-colors:border-[CanvasText] forced-colors:bg-[Canvas]',
                )}
              />
            );
          })}
        </div>
      ) : (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-neutral-bg-neutral-subtle)] forced-colors:border forced-colors:border-solid forced-colors:border-[CanvasText]">
          <div
            className={cn('h-full rounded-full transition-[width] duration-slow ease-enter motion-reduce:transition-none forced-colors:forced-color-adjust-none forced-colors:bg-[Highlight]', TONE_INDICATOR[tone])}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
