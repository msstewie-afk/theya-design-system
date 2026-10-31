'use client';

import { useId, useRef, useState, type ComponentProps, type PointerEvent } from 'react';
import { cn } from '../../../lib/utils';
import { useTheyaI18n } from '../../../lib/i18n';
import { useInView } from '../../ui/use-in-view';

/*
 * Small live charts for landing cards and bento tiles: bars that grow, a
 * ring that fills, a trend you can scrub. They play once, the first time
 * they scroll into view (with reduced motion they are simply drawn), and
 * each is one picture to assistive tech: role="img" with a label that says
 * what the chart shows, so nothing depends on seeing it move.
 */

// ---------------------------------------------------------------------------

export interface GrowBarsProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** Bar heights, any scale (the tallest fills the box). */
  values: number[];
  /** What the bars show, read out instead of them ("Weekly saves, January to June: rising from 12 to 48"). */
  label: string;
  /** The last bar in the accent color, the others muted (default true). */
  highlightLast?: boolean;
}

/** A row of bars that grow up from the baseline one after another as they scroll in (User Growth tiles). */
export function GrowBars({ values, label, highlightLast = true, className, ...props }: GrowBarsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { threshold: 0.4 });
  const max = Math.max(...values, 1);
  return (
    <div ref={ref} role="img" aria-label={label} data-slot="grow-bars" className={cn('flex h-24 items-end gap-1.5', className)} {...props}>
      {values.map((v, i) => (
        <span
          key={i}
          className={cn(
            'flex-1 origin-bottom rounded-t-[var(--size-border-radius-border-radius-sm)] motion-safe:transition-transform motion-safe:duration-slower motion-safe:ease-spring',
            highlightLast && i === values.length - 1 ? 'bg-[var(--color-icon-icon-primary)]' : 'bg-[color-mix(in_oklab,var(--color-icon-icon-primary)_30%,transparent)]',
          )}
          style={{ height: `${(v / max) * 100}%`, transform: seen ? 'scaleY(1)' : 'scaleY(0)', transitionDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------

export interface ProgressRingProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** 0–100. */
  value: number;
  /** What it measures ("Links sorted automatically"); the value is added to the read-out. */
  label: string;
  /** Diameter, px (default 128). */
  size?: number;
}

/** A ring that fills to its value while the number counts up beside it (the 0 → 75% bento tile). */
export function ProgressRing({ value, label, size = 128, className, ...props }: ProgressRingProps) {
  const { locale } = useTheyaI18n();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { threshold: 0.4 });
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = new Intl.NumberFormat(locale, { style: 'percent' }).format(value / 100);
  return (
    <div ref={ref} role="img" aria-label={`${label}: ${pct}`} data-slot="progress-ring" className={cn('relative inline-grid place-items-center', className)} style={{ width: size, height: size }} {...props}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-[color-mix(in_oklab,var(--color-icon-icon-primary)_18%,transparent)]" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={seen ? c * (1 - value / 100) : c}
          className="stroke-[var(--color-icon-icon-primary)] motion-safe:transition-[stroke-dashoffset] motion-safe:duration-[1400ms] motion-safe:ease-out"
        />
      </svg>
      <span aria-hidden className="absolute font-heading text-heading-xs font-semibold tabular-nums text-[var(--color-text-text)]">
        {pct}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------

export interface TrendChartProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** One value per period, oldest first. */
  values: number[];
  /** A name per period, for the scrubber bubble ("Week 12"). */
  periods?: string[];
  /** What the chart shows, read out as a whole ("Followers per week, 12 weeks: from 210 to 587, peak 602 in week 11"). */
  label: string;
}

/**
 * Thin bars for a trend; move the pointer across it and a marker with the
 * value follows (Followers Trend). Mouse only — the label says the whole
 * story for everyone else, so the scrubber adds detail, never meaning.
 */
export function TrendChart({ values, periods, label, className, ...props }: TrendChartProps) {
  const { locale } = useTheyaI18n();
  const uid = useId();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { threshold: 0.4 });
  const [at, setAt] = useState<number | null>(null);
  const max = Math.max(...values, 1);
  const fmt = new Intl.NumberFormat(locale);
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    // Physical left: the bars are laid out left to right in every direction (a time axis).
    const i = Math.round(((e.clientX - r.left) / r.width) * (values.length - 1));
    setAt(Math.min(values.length - 1, Math.max(0, i)));
  };
  return (
    <div
      ref={ref}
      role="img"
      aria-label={label}
      data-slot="trend-chart"
      dir="ltr"
      onPointerMove={move}
      onPointerLeave={() => setAt(null)}
      // Thin bars spread across the width; the top quarter is left free for the value bubble.
      className={cn('relative flex h-36 cursor-crosshair items-end justify-between', className)}
      {...props}
    >
      {values.map((v, i) => (
        <span
          key={i}
          className={cn(
            'w-1.5 origin-bottom rounded-full motion-safe:transition-[transform,background-color] motion-safe:duration-slower motion-safe:ease-spring',
            at === null ? (i === values.length - 1 ? 'bg-[var(--color-icon-icon-primary)]' : 'bg-[color-mix(in_oklab,var(--color-icon-icon-primary)_28%,transparent)]') : i === at ? 'bg-[var(--color-icon-icon-primary)]' : i < at ? 'bg-[color-mix(in_oklab,var(--color-icon-icon-primary)_45%,transparent)]' : 'bg-[color-mix(in_oklab,var(--color-icon-icon-primary)_18%,transparent)]',
          )}
          style={{ height: `${Math.max(6, (v / max) * 75)}%`, transform: seen ? 'scaleY(1)' : 'scaleY(0)', transitionDelay: seen && at === null ? `${i * 25}ms` : undefined }}
        />
      ))}
      {at !== null && (
        <span
          aria-hidden
          id={`${uid}-tip`}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full bg-[var(--color-bg-surface-bg-surface-inverse,var(--color-text-text))] px-2.5 py-1 font-body text-body-xs font-semibold tabular-nums text-[var(--color-bg-surface-bg-surface)] shadow-elevation-md"
          style={{ left: `calc(${at / Math.max(1, values.length - 1)} * (100% - 6px) + 3px)`, bottom: `calc(${Math.max(6, (values[at] / max) * 75)}% + 8px)` }}
        >
          {periods?.[at] ? `${periods[at]} · ` : ''}
          {fmt.format(values[at])}
        </span>
      )}
    </div>
  );
}
