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
  /** Limits marked on the bar, e.g. [{ value: 2, label: '2 g per serving' }]. Each draws a thin tick
   * with its label under the bar. Once `value` reaches a threshold, the fill takes that threshold's
   * `tone` (warning by default); below every threshold it keeps `tone`. For a minimum that is good to
   * pass, give the Meter `tone="warning"` and the threshold `tone: 'success'`. Screen readers hear the
   * value against max and the nearest thresholds ("1.1 g of 3 g, below the 2 g threshold") unless
   * `getValueLabel` is set. */
  thresholds?: MeterThreshold[];
}

export interface MeterThreshold {
  value: number;
  /** Shown under the tick. Keep it short: "2 g per serving". */
  label?: ReactNode;
  /** Fill tone once the value reaches this threshold. Default warning. */
  tone?: MeterTone;
}

export function Meter({ value, min = 0, max = 100, label, format, getValueLabel, tone = 'primary', showValue = true, segments, thresholds, className, ...props }: MeterProps) {
  const { locale, t } = useTheyaI18n();
  const id = useId();
  const hasHeader = label != null || showValue;
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  if (process.env.NODE_ENV !== 'production' && format?.style === 'percent' && max > 1 && value <= 1) {
    console.warn(
      `Meter: format {style:"percent"} with max=${max} fills ${value}/${max} of the bar (~${((value / max) * 100).toFixed(1)}%) while the label reads "${Math.round(value * 100)}%". For a percentage, pass a fraction with min={0} max={1} (e.g. value={${value}} max={1}).`,
    );
  }

  const numberFormat = new Intl.NumberFormat(locale, format);
  const formatted = numberFormat.format(value);
  const pctOf = (v: number) => Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100));

  // Thresholds: the highest one reached sets the tone; the text names it and the next one up.
  const marks = [...(thresholds ?? [])].sort((a, b) => a.value - b.value);
  const passed = marks.filter((m) => value >= m.value);
  const reached = passed[passed.length - 1];
  const next = marks.find((m) => value < m.value);
  const fillTone: MeterTone = reached ? (reached.tone ?? 'warning') : tone;
  const thresholdText =
    marks.length > 0
      ? [
          t.meter.of(formatted, numberFormat.format(max)),
          reached && t.meter.above(numberFormat.format(reached.value)),
          next && t.meter.below(numberFormat.format(next.value)),
        ]
          .filter(Boolean)
          .join(', ')
      : undefined;
  const valueText = getValueLabel?.(formatted, value) ?? thresholdText;

  return (
    <div
      role="meter"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={valueText}
      aria-labelledby={label != null ? `${id}-label` : undefined}
      data-tone={fillTone}
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
      <div className="relative">
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
                  lit ? TONE_INDICATOR[fillTone] : 'bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
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
            className={cn('h-full rounded-full transition-[width] duration-slow ease-enter motion-reduce:transition-none forced-colors:forced-color-adjust-none forced-colors:bg-[Highlight]', TONE_INDICATOR[fillTone])}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {marks.map((m) => (
        // A 2px tick a little taller than the bar, in the strong border color so it reads on the
        // track and on the fill (WCAG 1.4.11).
        <span
          key={m.value}
          aria-hidden="true"
          className="absolute -top-1 h-3.5 w-0.5 -translate-x-1/2 rounded-full bg-[var(--color-border-border-strong)] rtl:translate-x-1/2 forced-colors:bg-[CanvasText]"
          style={{ insetInlineStart: `${pctOf(m.value)}%` }}
        />
      ))}
      </div>
      {marks.some((m) => m.label != null) && (
        // Labels sit under their ticks; near an end they align to it so they stay inside.
        <div aria-hidden="true" className="relative mt-1 h-4 font-body text-body-xs text-[var(--color-text-text-subtler)]">
          {marks.map((m) => {
            const at = pctOf(m.value);
            return m.label == null ? null : (
              <span
                key={m.value}
                className={cn(
                  'absolute top-0 whitespace-nowrap',
                  at < 15 ? '' : at > 85 ? '-translate-x-full rtl:translate-x-full' : '-translate-x-1/2 rtl:translate-x-1/2',
                )}
                style={{ insetInlineStart: `${at}%` }}
              >
                {m.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
