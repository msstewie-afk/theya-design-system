'use client';

import { useEffect, useRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';
import { SuccessCheck } from './success-check';

/**
 * Countdown — time left until a deadline: a sale ending, a maintenance
 * window starting, a trial expiring, a "resend code in 0:42" timer.
 *
 * - `appearance="inline"` (default) flows inside text and inherits its font:
 *   `clock` → "2d 04:12:09", `compact` → "2d 4h 12m".
 * - `appearance="blocks"` renders one tile per unit with a label under the
 *   number — the promo/landing variant.
 *
 * The visible digits are aria-hidden; the element is a `role="timer"` whose
 * accessible text is a sentence ("2 days, 4 hours, 12 minutes") that only
 * changes once a minute, so screen readers aren't flooded every second.
 *
 * `useCountdown` is exported for custom layouts.
 */

export type CountdownUnit = 'days' | 'hours' | 'minutes' | 'seconds';
const UNITS: CountdownUnit[] = ['days', 'hours', 'minutes', 'seconds'];
const UNIT_MS: Record<CountdownUnit, number> = { days: 86_400_000, hours: 3_600_000, minutes: 60_000, seconds: 1000 };

export interface CountdownParts {
  /** Milliseconds left, never below 0. */
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function toTime(target: Date | string | number) {
  return target instanceof Date ? target.getTime() : typeof target === 'number' ? target : new Date(target).getTime();
}

function partsFor(total: number): CountdownParts {
  const t = Math.max(0, total);
  return {
    total: t,
    days: Math.floor(t / UNIT_MS.days),
    hours: Math.floor((t % UNIT_MS.days) / UNIT_MS.hours),
    minutes: Math.floor((t % UNIT_MS.hours) / UNIT_MS.minutes),
    seconds: Math.floor((t % UNIT_MS.minutes) / UNIT_MS.seconds),
    done: t === 0,
  };
}

export interface UseCountdownOptions {
  /** Smallest unit that ticks. `minutes` re-renders once a minute. */
  precision?: 'seconds' | 'minutes';
  /** Fires once when the countdown reaches zero while mounted. */
  onComplete?: () => void;
  /** Freezes the countdown at its current value. */
  paused?: boolean;
}

export function useCountdown(target: Date | string | number, { precision = 'seconds', onComplete, paused = false }: UseCountdownOptions = {}) {
  const end = toTime(target);
  const [now, setNow] = useState(() => Date.now());
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Re-sync immediately when the target changes.
  useEffect(() => setNow(Date.now()), [end]);

  useEffect(() => {
    if (paused) return;
    const step = precision === 'minutes' ? UNIT_MS.minutes : UNIT_MS.seconds;
    let timer: ReturnType<typeof setTimeout>;
    let wasRunning = end - Date.now() > 0;
    const tick = () => {
      const current = Date.now();
      setNow(current);
      const left = end - current;
      if (left <= 0) {
        if (wasRunning) onCompleteRef.current?.();
        wasRunning = false;
        return;
      }
      // Wake up on the next unit boundary of the remaining time (so the
      // displayed value flips exactly when it should, without drift).
      timer = setTimeout(tick, (left % step || step) + 5);
    };
    tick();
    return () => clearTimeout(timer);
  }, [end, precision, paused]);

  return partsFor(end - now);
}

/* ------------------------------------------------------------------ */

const pad = (n: number) => String(n).padStart(2, '0');

function visibleUnits(parts: CountdownParts, precision: 'seconds' | 'minutes', trimLeading: boolean): CountdownUnit[] {
  const last = precision === 'minutes' ? 'minutes' : 'seconds';
  const units = UNITS.slice(0, UNITS.indexOf(last) + 1);
  if (!trimLeading) return units;
  // Drop leading zero units, but always keep the last two (a clock never reads just "09").
  let start = 0;
  while (start < units.length - 2 && parts[units[start]] === 0) start++;
  return units.slice(start);
}


function spoken(parts: CountdownParts, word: (unit: CountdownUnit, n: number) => string) {
  // Minute resolution on purpose — see the component doc.
  const units: CountdownUnit[] = parts.days || parts.hours || parts.minutes ? ['days', 'hours', 'minutes'] : ['seconds'];
  const words = units.filter((u) => parts[u] > 0).map((u) => `${parts[u]} ${word(u, parts[u])}`);
  return words.length ? words.join(', ') : `0 ${word('seconds', 0)}`;
}

/* ------------------------------------------------------------------ */

const RING_PX = { sm: 40, md: 56, lg: 72 } as const;
const RING_TEXT = { sm: 'text-body-s', md: 'text-body-l', lg: 'text-heading-xs' } as const;

const tileVariants = cva(
  'flex flex-col items-center justify-center rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] tabular-nums',
  {
    variants: {
      size: {
        sm: 'min-w-12 px-2 py-1.5 gap-0.5 [&_[data-value]]:text-heading-xs [&_[data-label]]:text-body-xs',
        md: 'min-w-16 px-3 py-2 gap-0.5 [&_[data-value]]:text-heading-s [&_[data-label]]:text-body-xs',
        // Below sm four lg tiles (80px each + gaps) don't fit a 360px phone; step down a notch there.
        lg: 'min-w-16 px-3 py-2.5 sm:min-w-20 sm:px-4 sm:py-3 gap-1 [&_[data-value]]:text-heading-m [&_[data-label]]:text-body-s',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export interface CountdownProps
  extends Omit<React.ComponentProps<'span'>, 'children'>,
    VariantProps<typeof tileVariants>,
    UseCountdownOptions {
  /** Deadline: a Date, an ISO string or a timestamp in ms. */
  to: Date | string | number;
  /**
   * `inline` text, `blocks` tiles, or `ring`: a ring that drains as time runs out, with
   * the largest unit left in the middle and a check at zero (Kinetics' Countdown Ring, MIT).
   */
  appearance?: 'inline' | 'blocks' | 'ring';
  /** Ring only: when the countdown started, for the share left. Defaults to when it mounted. */
  from?: Date | string | number;
  /** Inline format: `clock` → 2d 04:12:09, `compact` → 2d 4h 12m. */
  format?: 'clock' | 'compact';
  /** Hides leading units that are zero (days, then hours). */
  trimLeading?: boolean;
  /** Below this many seconds the numbers turn danger. */
  urgentBelow?: number;
  /** Shown instead of the zeros once the deadline has passed. */
  completed?: React.ReactNode;
  /** Unit names (singular, plural) — used for block labels and the spoken text. */
  labels?: Partial<Record<CountdownUnit, [string, string]>>;
  /** Prefix/suffix for the spoken text, e.g. (t) => `Sale ends in ${t}`. */
  srText?: (remaining: string) => string;
}

export function Countdown({
  to,
  appearance = 'inline',
  format = 'clock',
  size,
  precision = 'seconds',
  trimLeading = true,
  urgentBelow,
  completed,
  labels: labelsProp,
  srText,
  onComplete,
  paused,
  from,
  className,
  ...props
}: CountdownProps) {
  const [mountedAt] = useState(() => Date.now());
  const { t } = useTheyaI18n();
  const parts = useCountdown(to, { precision, onComplete, paused });
  // `labels` (singular, plural) overrides the locale's unit words; the
  // locale's own function handles languages with more plural forms.
  const word = (unit: CountdownUnit, n: number) => (labelsProp?.[unit] ? labelsProp[unit]![n === 1 ? 0 : 1] : t.countdown.unitWord(unit, n));
  const sayLeft = srText ?? t.countdown.left;
  const units = visibleUnits(parts, precision, trimLeading);
  const urgent = urgentBelow !== undefined && !parts.done && parts.total <= urgentBelow * 1000;
  const toneClass = urgent && 'text-[var(--color-text-text-danger)]';

  if (parts.done && completed !== undefined) {
    return (
      <span className={className} {...props}>
        {completed}
      </span>
    );
  }

  const sr = <span className="sr-only">{sayLeft(spoken(parts, word))}</span>;

  if (appearance === 'ring') {
    const start = from !== undefined ? toTime(from) : mountedAt;
    const span = Math.max(1, toTime(to) - start);
    const share = Math.min(1, Math.max(0, parts.total / span));
    const lead = units.find((u) => parts[u] > 0) ?? 'seconds';
    const ring = RING_PX[size ?? 'md'];
    return (
      <span
        role="timer"
        aria-atomic="true"
        data-appearance="ring"
        className={cn('relative inline-flex shrink-0 items-center justify-center tabular-nums', className)}
        style={{ width: ring, height: ring }}
        {...props}
      >
        {sr}
        <svg viewBox="0 0 48 48" aria-hidden="true" className="absolute inset-0 -rotate-90 rtl:scale-x-[-1] rtl:rotate-90">
          <circle cx="24" cy="24" r="20" fill="none" strokeWidth="4" className="stroke-[var(--color-bg-neutral-bg-neutral-subtle)]" />
          <circle
            cx="24"
            cy="24"
            r="20"
            pathLength={100}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="100"
            strokeDashoffset={100 - share * 100}
            className={cn(
              'transition-[stroke-dashoffset,stroke] duration-1000 ease-linear motion-reduce:transition-none',
              parts.done ? 'stroke-[var(--color-icon-icon-success)]' : urgent ? 'stroke-[var(--color-icon-icon-danger)]' : 'stroke-[var(--color-icon-icon-primary)]',
              share === 0 && !parts.done && 'opacity-0',
            )}
          />
        </svg>
        {parts.done ? (
          <SuccessCheck className="size-1/2 text-[var(--color-icon-icon-success)]" />
        ) : (
          <span aria-hidden className={cn('relative font-body font-semibold text-[var(--color-text-text)]', RING_TEXT[size ?? 'md'], toneClass)}>
            {lead === 'seconds' ? parts.seconds : `${parts[lead]}${t.countdown.short[lead]}`}
          </span>
        )}
      </span>
    );
  }

  if (appearance === 'blocks') {
    return (
      <span role="timer" aria-atomic="true" className={cn('inline-flex items-start gap-2', className)} {...props}>
        {sr}
        {units.map((unit) => (
          <span key={unit} aria-hidden className={tileVariants({ size })}>
            <span data-value="" className={cn('text-[var(--color-text-text)]', toneClass)}>
              {unit === 'days' ? parts.days : pad(parts[unit])}
            </span>
            <span data-label="" className="text-[var(--color-text-text-subtle)]">
              {word(unit, parts[unit])}
            </span>
          </span>
        ))}
      </span>
    );
  }

  let text: string;
  if (format === 'compact') {
    text = units
      .filter((u, i) => parts[u] > 0 || i === units.length - 1)
      .map((u) => `${parts[u]}${t.countdown.short[u]}`)
      .join(' ');
  } else {
    const clock = units.filter((u) => u !== 'days');
    const clockText = clock.map((u, i) => (i === 0 ? String(parts[u]) : pad(parts[u]))).join(':');
    // Once days are shown, the clock part is always zero-padded (2d 04:12:09).
    text = units[0] === 'days' ? `${parts.days}d ${clock.map((u) => pad(parts[u])).join(':')}` : clockText;
  }

  return (
    <span role="timer" aria-atomic="true" className={cn('tabular-nums', toneClass, className)} {...props}>
      {sr}
      <span aria-hidden>{text}</span>
    </span>
  );
}
