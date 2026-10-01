import { useMemo, useState, useEffect } from 'react';
import { Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

/**
 * A proportional breakdown of a whole into a few parts (up to 7), on
 * recharts. Each slice takes the next chart palette color (the
 * --chart-1..7 CSS vars in globals.css — primitive hues at their -500
 * step, not semantic bg-*-bg-* tokens, so every slice stays visually
 * distinct); the legend always repeats the slice NAME and value beside
 * its swatch. The center shows the total by default. Pass `loading`
 * for the first-load state.
 *
 *   <DonutChart data={[{ label: "Prod", value: 62 }, { label: "Staging", value: 24 }, …]}
 *     unit=" GB" centerLabel="Storage" ariaLabel="Storage by environment: production leads at 62 GB." />
 */
export interface DonutChartSlice {
  label: string;
  value: number;
}

export interface DonutChartProps {
  data: DonutChartSlice[];
  height?: number;
  unit?: string;
  format?: (v: number) => string;
  centerLabel?: string;
  centerValue?: string;
  showCenter?: boolean;
  legend?: boolean;
  /** Ring band width: "default" (thicker) or "thin" (a slim indicator ring). */
  thickness?: 'default' | 'thin';
  layout?: 'vertical' | 'horizontal';
  loading?: boolean;
  ariaLabel?: string;
  className?: string;
}

const RING_RADIUS = {
  default: { inner: '62%', outer: '92%' },
  thin: { inner: '78%', outer: '92%' },
} as const;

const RING_INSET = { default: '19%', thin: '11%' } as const;

// --color-bg-chart-01..07 (globals.css) are the single source of truth
// for this palette — reading them here instead of re-declaring the
// colors keeps DonutChart, and anything else that charts, from
// drifting apart (this is also what fixed a real bug: the old
// per-component array reused semantic bg-*-bg-* tokens directly, and
// --color-bg-info-bg-info happened to be the exact same hex as
// --color-bg-primary-bg-primary — two indistinguishable slices).
const CHART_COLORS = [
  'var(--color-bg-chart-01)',
  'var(--color-bg-chart-02)',
  'var(--color-bg-chart-03)',
  'var(--color-bg-chart-04)',
  'var(--color-bg-chart-05)',
  'var(--color-bg-chart-06)',
  'var(--color-bg-chart-07)',
];
const sliceColor = (i: number) => CHART_COLORS[i % CHART_COLORS.length];

export function DonutChart({
  data,
  height = 200,
  unit = '',
  format,
  centerLabel = 'Total',
  centerValue,
  showCenter = true,
  legend = true,
  thickness = 'default',
  layout = 'vertical',
  loading = false,
  ariaLabel,
  className,
}: DonutChartProps) {
  const fmt = useMemo(() => format ?? ((v: number) => `${Math.round(v * 10) / 10}${unit}`), [format, unit]);
  // Recharts 3 keeps chart data in a Redux/immer store, and immer deep-
  // freezes whatever it's given — including the caller's own array and
  // point objects. Anything that later writes to that array (the app, or
  // Storybook reusing the same args across stories) then throws "Cannot
  // assign to read only property '0'" (9 AreaChart/LineChart failures in
  // the 2026-09-28 test-runner pass). Hand Recharts a private copy.
  const chartData = useMemo(() => data.map((point) => ({ ...point })), [data]);
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);
  const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);

  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    setAnimate(!reduce);
  }, []);

  const summary = ariaLabel ?? `${centerLabel} ${fmt(total)} across ${data.length} parts: ${data.map((d) => `${d.label} ${fmt(d.value)}`).join(', ')}`;

  if (loading) {
    const legendItems = data.length > 0 ? data.length : 3;
    return (
      <div className={cn('@container/donut w-full', className)} aria-busy="true">
        <div className={cn('relative z-[2] flex flex-col items-center gap-3', layout === 'horizontal' && '@min-[22rem]/donut:flex-row @min-[22rem]/donut:gap-5')}>
          <div
            className={cn('relative w-full', layout === 'horizontal' && '@min-[22rem]/donut:w-[var(--donut-size)] @min-[22rem]/donut:shrink-0')}
            style={layout === 'horizontal' ? ({ height, '--donut-size': `${height}px` } as React.CSSProperties) : { height }}
            aria-hidden="true"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ height, width: height }}>
              <Skeleton className="absolute inset-0 rounded-full" />
              <div className="absolute rounded-full bg-[var(--color-bg-surface-bg-surface)]" style={{ inset: RING_INSET[thickness] }} />
            </div>
          </div>
          {legend && legendItems > 0 && (
            <ul
              className={cn(
                'flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-1.5',
                layout === 'horizontal' && '@min-[22rem]/donut:w-auto @min-[22rem]/donut:min-w-0 @min-[22rem]/donut:flex-col @min-[22rem]/donut:flex-nowrap @min-[22rem]/donut:items-start @min-[22rem]/donut:justify-start @min-[22rem]/donut:gap-x-0',
              )}
              aria-hidden="true"
            >
              {Array.from({ length: legendItems }).map((_, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <Skeleton className="size-2.5 shrink-0 rounded-[0.1875rem]" />
                  <Skeleton className="h-3 w-16" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('@container/donut w-full', className)} role="img" aria-label={summary}>
      <div className={cn('relative z-[2] flex flex-col items-center gap-3', layout === 'horizontal' && '@min-[22rem]/donut:flex-row @min-[22rem]/donut:gap-5')}>
        <div
          className={cn('relative w-full', layout === 'horizontal' && '@min-[22rem]/donut:w-[var(--donut-size)] @min-[22rem]/donut:shrink-0')}
          style={layout === 'horizontal' ? ({ height, '--donut-size': `${height}px` } as React.CSSProperties) : { height }}
          aria-hidden="true"
        >
          <ResponsiveContainer width="100%" height="100%">
            {/* accessibilityLayer disabled: recharts injects a hidden
               focusable keyboard-nav surrogate by default, which lands
               inside this chart's own aria-hidden wrapper (the outer
               `role="img" aria-label={summary}` element already gives
               assistive tech the full accessible description). */}
            <RechartsPieChart accessibilityLayer={false}>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="label"
                rootTabIndex={-1}
                innerRadius={RING_RADIUS[thickness].inner}
                outerRadius={RING_RADIUS[thickness].outer}
                paddingAngle={data.length > 1 ? 2 : 0}
                stroke="var(--color-bg-surface-bg-surface)"
                strokeWidth={2}
                isAnimationActive={animate}
                animationDuration={640}
                animationEasing="ease-out"
              >
                {data.map((d, i) => (
                  <Cell key={d.label} fill={sliceColor(i)} />
                ))}
              </Pie>
              <Tooltip
                wrapperStyle={{ zIndex: 10 }}
                content={({ active, payload }) => {
                  const p = payload && payload.length ? payload[0] : undefined;
                  const v = typeof p?.value === 'number' ? p.value : undefined;
                  if (!active || v == null) return null;
                  return (
                    <div className="flex flex-col gap-px rounded-[var(--size-border-radius-border-radius-md)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface-overlay)] px-2.5 py-1.5 shadow-elevation-lg">
                      <span className="text-[0.6875rem] text-[var(--color-text-text-subtler)]">{String(p?.name ?? '')}</span>
                      <span className="font-body text-body-s font-semibold tabular-nums text-[var(--color-text-text)]">
                        {fmt(v)} <span className="font-normal text-[var(--color-text-text-subtler)]">({pct(v)}%)</span>
                      </span>
                    </div>
                  );
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>

          {showCenter && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="whitespace-nowrap font-body text-heading-xs font-semibold tabular-nums text-[var(--color-text-text)]">{centerValue ?? fmt(total)}</span>
              <span className="text-[0.6875rem] text-[var(--color-text-text-subtler)]">{centerLabel}</span>
            </div>
          )}
        </div>

        {legend && data.length > 0 && (
          <ul
            className={cn(
              'flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-1.5',
              layout === 'horizontal' && '@min-[22rem]/donut:w-auto @min-[22rem]/donut:min-w-0 @min-[22rem]/donut:flex-col @min-[22rem]/donut:flex-nowrap @min-[22rem]/donut:items-start @min-[22rem]/donut:justify-start @min-[22rem]/donut:gap-x-0',
            )}
            aria-hidden="true"
          >
            {data.map((d, i) => (
              <li key={d.label} className="flex items-center gap-1.5 font-body text-body-xs text-[var(--color-text-text-subtler)]">
                <span className="inline-block size-2.5 shrink-0 rounded-[0.1875rem]" style={{ background: sliceColor(i) }} />
                <span>{d.label}</span>
                <span className="font-medium tabular-nums text-[var(--color-text-text)]">{fmt(d.value)}</span>
                <span className="tabular-nums">({pct(d.value)}%)</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
