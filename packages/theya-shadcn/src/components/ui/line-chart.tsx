'use client';

import { useMemo, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { CartesianGrid, Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';
import { seriesRange } from '../../lib/chart-summary';
import { seriesColor, seriesDash, SeriesKey } from '../../lib/chart-series';

/**
 * A multi-series line chart for comparing a few trends at once (up
 * to 5), on recharts. Each series takes the next chart palette color;
 * a legend and the tooltip always repeat the series NAME beside its
 * swatch. 2px smooth lines, a light stepped y-grid, adaptive
 * x-labels, a crosshair tooltip, motion-safe draw-in.
 *
 *   <LineChart data={[{ label: "Mon", cpu: 32, mem: 51 }, …]}
 *     series={[{ key: "cpu", name: "CPU" }, { key: "mem", name: "Memory" }]}
 *     unit="%" ariaLabel="CPU vs memory across the week." />
 */
export interface LineChartSeries {
  key: string;
  name: string;
}

export type LineChartPoint = { label: string } & Record<string, string | number>;

export interface LineChartProps {
  data: LineChartPoint[];
  series: LineChartSeries[];
  height?: number;
  /** Gridline interval in data units. */
  yStep?: number;
  unit?: string;
  labelPrefix?: string;
  format?: (v: number) => string;
  legend?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  ariaLabel?: string;
  /**
   * Give each series its own dash (solid, dashed, dotted…) as well as its
   * color, so series can be told apart without color (WCAG 1.4.1). The
   * legend and tooltip keys show the same dash. Default true.
   */
  seriesPatterns?: boolean;
  className?: string;
}

// Colors (--color-bg-chart-01..07) and dashes are shared with the other
// charts (lib/chart-series), so a series looks the same everywhere.

function niceMax(v: number, step: number) {
  return Math.max(step, Math.ceil(v / step) * step);
}

export function LineChart({ data, series, height = 260, yStep = 1, unit = '', labelPrefix = '', format, legend = true, showXAxis = true, showYAxis = true, ariaLabel, seriesPatterns = true, className }: LineChartProps) {
  const { t } = useTheyaI18n();
  const fmt = useMemo(() => format ?? ((v: number) => `${Math.round(v * 10) / 10}${unit}`), [format, unit]);
  // Recharts 3 keeps chart data in a Redux/immer store, and immer deep-
  // freezes whatever it's given — including the caller's own array and
  // point objects. Anything that later writes to that array (the app, or
  // Storybook reusing the same args across stories) then throws "Cannot
  // assign to read only property '0'" (9 AreaChart/LineChart failures in
  // the 2026-09-28 test-runner pass). Hand Recharts a private copy.
  const chartData = useMemo(() => data.map((point) => ({ ...point })), [data]);

  const dataMax = useMemo(() => {
    let m = 0;
    for (const d of data)
      for (const s of series) {
        const v = Number(d[s.key]);
        if (Number.isFinite(v) && v > m) m = v;
      }
    return m;
  }, [data, series]);
  const step = yStep > 0 ? yStep : 1;
  const yMax = niceMax(dataMax * 1.04, step);

  const ticks = useMemo(() => {
    const out: number[] = [];
    for (let g = 0; g <= yMax + 1e-9; g += step) out.push(g);
    return out;
  }, [yMax, step]);

  const interval = Math.max(0, Math.ceil(data.length / 8) - 1);

  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    setAnimate(!reduce);
  }, []);

  const summary =
    ariaLabel ??
    [
      t.chart.seriesTrend(series.map((s) => s.name).join(', '), data.length),
      ...series.flatMap((s) => {
        const r = seriesRange(data.map((d) => ({ label: d.label, value: Number(d[s.key]) })), fmt, t.chart.range);
        return r ? [`${s.name}: ${r}`] : [];
      }),
    ].join('. ');
  const tickStyle = { fill: 'var(--color-text-text-subtler)', fontSize: 12 } as const; // = body-xs (SVG attrs can't read the CSS token)

  return (
    <div data-slot="line-chart" className={cn('relative z-[2] w-full', className)} role="img" aria-label={summary}>
      <ResponsiveContainer width="100%" height={height}>
        {/* accessibilityLayer off: the wrapper is role="img" with a spoken summary, and recharts' focusable svg[role=application] inside it was an empty tab stop. */}
        <RechartsLineChart accessibilityLayer={false} data={chartData} margin={{ top: 16, right: 14, bottom: 4, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-border-border)" strokeOpacity={0.6} />
          <XAxis dataKey="label" hide={!showXAxis} interval={interval} tickLine={false} axisLine={false} tickMargin={10} tick={tickStyle} />
          <YAxis width={40} hide={!showYAxis} domain={[0, yMax]} ticks={ticks} tickLine={false} axisLine={false} tickFormatter={(v: number) => (v === 0 ? '0' : fmt(v))} tick={tickStyle} />
          <Tooltip
            cursor={{ stroke: 'var(--color-border-border)', strokeWidth: 1, strokeDasharray: '3 3' }}
            content={({ active, payload, label }) => (
              <LineChartTooltip active={active} payload={payload as unknown as TooltipEntry[] | undefined} label={label} fmt={fmt} labelPrefix={labelPrefix} series={series} patterns={seriesPatterns} />
            )}
          />
          {series.map((s, i) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={seriesColor(i)}
              strokeDasharray={seriesPatterns ? seriesDash(i) : undefined}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={false}
              activeDot={{ r: 4, fill: seriesColor(i), stroke: 'var(--color-bg-surface-bg-surface)', strokeWidth: 2 }}
              isAnimationActive={animate}
              animationDuration={680}
              animationEasing="ease-out"
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>

      {legend && series.length > 0 && (
        <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1" aria-hidden="true">
          {series.map((s, i) => (
            <li key={s.key} className="flex items-center gap-1 text-body-xs text-[var(--color-text-text-subtler)]">
              <SeriesKey index={i} kind={seriesPatterns ? 'line' : 'square'} />
              {s.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface TooltipEntry {
  dataKey?: string | number;
  value?: string | number;
}

function LineChartTooltip({ active, payload, label, fmt, labelPrefix, series, patterns }: { active?: boolean; payload?: TooltipEntry[]; label?: ReactNode; fmt: (v: number) => string; labelPrefix: string; series: LineChartSeries[]; patterns: boolean }) {
  if (!active || !payload || !payload.length) return null;
  const indexFor = (key?: string | number) => series.findIndex((s) => s.key === key);
  return (
    <div className="flex flex-col gap-1 rounded-[var(--size-border-radius-border-radius-md)] border border-solid border-[var(--color-border-border)] bg-[var(--color-bg-surface-bg-surface-overlay)] px-3 py-2 shadow-elevation-lg">
      <span className="text-body-xs text-[var(--color-text-text-subtler)]">
        {labelPrefix}
        {label}
      </span>
      <div className="flex flex-col gap-0.5">
        {payload.map((entry, i) => {
          const si = indexFor(entry.dataKey);
          return (
            <div key={i} className="flex items-center gap-2 font-body text-body-xs">
              <SeriesKey index={si < 0 ? i : si} kind={patterns ? 'line' : 'square'} size={8} />
              <span className="text-[var(--color-text-text-subtler)]">{si < 0 ? String(entry.dataKey ?? '') : series[si].name}</span>
              <span className="ms-auto font-semibold tabular-nums text-[var(--color-text-text)]">{typeof entry.value === 'number' ? fmt(entry.value) : entry.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
