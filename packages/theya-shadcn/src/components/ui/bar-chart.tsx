import { useMemo, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Bar, BarChart as RechartsBarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';

/**
 * A calm, single-series categorical chart on recharts. One brand
 * fill, rounded bar caps, a light stepped value-grid, adaptive
 * labels, a crosshair tooltip. Use orientation="horizontal" for a
 * ranked breakdown.
 *
 *   <BarChart data={[{ label: "eu-west-1", value: 42 }, …]}
 *     orientation="horizontal" unit="%" ariaLabel="Storage by region, led by eu-west-1 at 42%." />
 */
export interface BarChartPoint {
  label: string;
  value: number;
}

export interface BarChartProps {
  data: BarChartPoint[];
  orientation?: 'vertical' | 'horizontal';
  height?: number;
  /** Gridline interval in data units. */
  valueStep?: number;
  unit?: string;
  labelPrefix?: string;
  format?: (v: number) => string;
  ariaLabel?: string;
  className?: string;
}

// --color-bg-chart-01 (globals.css) — same shared chart palette
// AreaChart/LineChart/DonutChart read; chart-01 is blue, matching
// --color-bg-primary-bg-primary, so this single-series bar stays the
// same brand blue as before.
const FILL = 'var(--color-bg-chart-01)';

function niceMax(v: number, step: number) {
  return Math.max(step, Math.ceil(v / step) * step);
}

export function BarChart({ data, orientation = 'vertical', height = 240, valueStep = 1, unit = '', labelPrefix = '', format, ariaLabel, className }: BarChartProps) {
  const fmt = useMemo(() => format ?? ((v: number) => `${Math.round(v * 10) / 10}${unit}`), [format, unit]);
  // Recharts 3 keeps chart data in a Redux/immer store, and immer deep-
  // freezes whatever it's given — including the caller's own array and
  // point objects. Anything that later writes to that array (the app, or
  // Storybook reusing the same args across stories) then throws "Cannot
  // assign to read only property '0'" (9 AreaChart/LineChart failures in
  // the 2026-09-28 test-runner pass). Hand Recharts a private copy.
  const chartData = useMemo(() => data.map((point) => ({ ...point })), [data]);

  const step = valueStep > 0 ? valueStep : 1;
  const values = data.map((d) => d.value);
  const dataMax = values.length ? Math.max(...values) : 0;
  const valueMax = niceMax(dataMax * 1.04, step);

  const ticks = useMemo(() => {
    const out: number[] = [];
    for (let g = 0; g <= valueMax + 1e-9; g += step) out.push(g);
    return out;
  }, [valueMax, step]);

  const horizontal = orientation === 'horizontal';
  const interval = horizontal ? 0 : Math.max(0, Math.ceil(data.length / 10) - 1);

  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    setAnimate(!reduce);
  }, []);

  const tickStyle = { fill: 'var(--color-text-text-subtler)', fontSize: 11 } as const;

  const leader = data.length ? data.reduce((a, b) => (b.value > a.value ? b : a)) : null;
  const summary = ariaLabel ?? (leader ? `Comparison across ${data.length} categories; highest is ${leader.label} at ${fmt(leader.value)}.` : 'No data to compare');

  return (
    <div className={cn('relative z-[2] w-full', className)} role="img" aria-label={summary}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={chartData} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 16, right: 14, bottom: 4, left: 0 }}>
          <CartesianGrid vertical={horizontal} horizontal={!horizontal} stroke="var(--color-border-border-subtle)" strokeOpacity={0.6} />
          {horizontal ? (
            <>
              <XAxis type="number" domain={[0, valueMax]} ticks={ticks} tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v: number) => (v === 0 ? '0' : fmt(v))} tick={tickStyle} />
              <YAxis type="category" dataKey="label" width={92} tickLine={false} axisLine={false} tickMargin={8} tick={tickStyle} />
            </>
          ) : (
            <>
              <XAxis dataKey="label" interval={interval} tickLine={false} axisLine={false} tickMargin={10} tick={tickStyle} />
              <YAxis width={40} domain={[0, valueMax]} ticks={ticks} tickLine={false} axisLine={false} tickFormatter={(v: number) => (v === 0 ? '0' : fmt(v))} tick={tickStyle} />
            </>
          )}
          <Tooltip
            cursor={{ fill: FILL, fillOpacity: 0.08 }}
            content={({ active, payload, label }) => (
              <BarChartTooltip active={active} value={payload && payload.length && typeof payload[0]?.value === 'number' ? payload[0].value : undefined} label={label} fmt={fmt} labelPrefix={labelPrefix} />
            )}
          />
          <Bar dataKey="value" fill={FILL} radius={horizontal ? [0, 5, 5, 0] : [5, 5, 0, 0]} maxBarSize={horizontal ? 22 : 48} isAnimationActive={animate} animationDuration={640} animationEasing="ease-out" />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

function BarChartTooltip({ active, value, label, fmt, labelPrefix }: { active?: boolean; value?: number; label?: ReactNode; fmt: (v: number) => string; labelPrefix: string }) {
  if (!active || value == null) return null;
  return (
    <div className="flex flex-col gap-px rounded-[var(--size-border-radius-border-radius-md)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface-overlay)] px-2.5 py-1.5 shadow-lg">
      <span className="text-[0.6875rem] text-[var(--color-text-text-subtler)]">
        {labelPrefix}
        {label}
      </span>
      <span className="font-body text-body-s font-semibold tabular-nums text-[var(--color-text-text)]">{fmt(value)}</span>
    </div>
  );
}
