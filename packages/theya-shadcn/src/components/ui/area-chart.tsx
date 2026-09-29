import { useId, useMemo, useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Area, AreaChart as RechartsAreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

/**
 * A calm time chart on recharts. Soft brand gradient fill, 2px smooth
 * line, light stepped y-grid, adaptive x-labels, crosshair tooltip.
 * Single-series by default (resting dots on the peak + latest
 * points); pass `series` for a multi-series stacked/overlaid chart.
 * Pass `floatingAxis` to float tick labels inside the plot area
 * instead of an outside gutter. Pass `loading` for the first-load
 * skeleton state.
 *
 *   <AreaChart data={[{ label: "Mon", value: 3.0 }, …]}
 *     yStep={1} unit="M" labelPrefix="Day "
 *     ariaLabel="Traffic across the last 14 days, peaking Friday." />
 *
 *   <AreaChart data={[{ label: "Mon", direct: 2.0, organic: 1.0 }, …]}
 *     series={[{ key: "direct", name: "Direct" }, { key: "organic", name: "Organic" }]}
 *     unit="M" ariaLabel="Direct vs organic traffic across the last 14 days." />
 */
export interface AreaChartPoint {
  label: string;
  value: number;
}

export interface AreaChartSeries {
  key: string;
  name: string;
}

export type AreaChartMultiPoint = { label: string } & Record<string, string | number>;

export interface AreaChartProps {
  data: AreaChartPoint[] | AreaChartMultiPoint[];
  /** Render one area per series (stacked by default) instead of the single `value` field. */
  series?: AreaChartSeries[];
  /** Stack series on top of each other; false overlays them (only applies with `series`). */
  stacked?: boolean;
  legend?: boolean;
  height?: number;
  /** Gridline interval in data units. */
  yStep?: number;
  unit?: string;
  labelPrefix?: string;
  format?: (v: number) => string;
  showXAxis?: boolean;
  showYAxis?: boolean;
  /** Float axis tick labels inside the plot area on a semi-transparent chip instead of an outside gutter. */
  floatingAxis?: boolean;
  loading?: boolean;
  ariaLabel?: string;
  className?: string;
}

// --color-bg-chart-01..07 (globals.css) — the same shared chart palette
// DonutChart reads, so a series' color never drifts between chart types.
// chart-01 is blue, matching --color-bg-primary-bg-primary, so a
// single-series chart still reads as the familiar brand blue.
const CHART_COLORS = [
  'var(--color-bg-chart-01)',
  'var(--color-bg-chart-02)',
  'var(--color-bg-chart-03)',
  'var(--color-bg-chart-04)',
  'var(--color-bg-chart-05)',
  'var(--color-bg-chart-06)',
  'var(--color-bg-chart-07)',
];
const seriesColor = (i: number) => CHART_COLORS[i % CHART_COLORS.length];

// Loading-state curve silhouettes in objectBoundingBox units (0..1), drawn
// back-to-front (fullest/lowest first) so overlapping opacities read as
// stacked series rather than one flat block.
const SKELETON_CURVES = [
  'M0,0.92 C0.2,0.82 0.4,0.95 0.6,0.85 C0.75,0.78 0.85,0.9 1,0.8 L1,1 L0,1 Z',
  'M0,0.85 C0.15,0.7 0.3,0.9 0.45,0.75 C0.6,0.6 0.75,0.8 0.9,0.65 L1,0.6 L1,1 L0,1 Z',
  'M0,0.7 C0.1,0.4 0.2,0.85 0.3,0.55 C0.4,0.25 0.5,0.6 0.6,0.35 C0.7,0.1 0.8,0.45 0.9,0.2 L1,0.15 L1,1 L0,1 Z',
];
const SKELETON_CURVE_OPACITY = [0.35, 0.55, 1];

function niceMax(v: number, step: number) {
  return Math.max(step, Math.ceil(v / step) * step);
}

function evenlySpacedValues<T>(values: T[], limit: number) {
  if (values.length <= limit) return values;
  return Array.from({ length: limit }, (_, index) => values[Math.round((index * (values.length - 1)) / (limit - 1))]);
}

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = (next: number) => setWidth((current) => (Math.abs(current - next) < 0.5 ? current : next));
    update(node.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => update(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

export function AreaChart({
  data,
  series,
  stacked = true,
  legend = true,
  height = 240,
  yStep = 1,
  unit = '',
  labelPrefix = '',
  format,
  showXAxis = true,
  showYAxis = true,
  floatingAxis = false,
  loading = false,
  ariaLabel,
  className,
}: AreaChartProps) {
  const gradientId = useId();
  const clipId = useId();
  const [chartRef, chartWidth] = useElementWidth<HTMLDivElement>();
  const fmt = useMemo(() => format ?? ((v: number) => `${Math.round(v * 10) / 10}${unit}`), [format, unit]);
  // Recharts 3 keeps chart data in a Redux/immer store, and immer deep-
  // freezes whatever it's given — including the caller's own array and
  // point objects. Anything that later writes to that array (the app, or
  // Storybook reusing the same args across stories) then throws "Cannot
  // assign to read only property '0'" (9 AreaChart/LineChart failures in
  // the 2026-09-28 test-runner pass). Hand Recharts a private copy.
  const chartData = useMemo(() => data.map((point) => ({ ...point })), [data]);

  const activeSeries = useMemo(() => series ?? [], [series]);
  const multi = activeSeries.length > 0;
  const step = yStep > 0 ? yStep : 1;

  const dataMax = useMemo(() => {
    if (!multi) {
      const vals = (data as AreaChartPoint[]).map((d) => d.value);
      return vals.length ? Math.max(...vals) : 0;
    }
    let m = 0;
    for (const d of data as AreaChartMultiPoint[]) {
      let sum = 0;
      for (const s of activeSeries) {
        const v = Number(d[s.key]);
        if (!Number.isFinite(v)) continue;
        if (stacked) sum += v;
        else if (v > m) m = v;
      }
      if (stacked && sum > m) m = sum;
    }
    return m;
  }, [data, multi, activeSeries, stacked]);

  const yMax = niceMax(dataMax * 1.04, step);
  const singleValues = multi ? [] : (data as AreaChartPoint[]).map((d) => d.value);
  const peakIndex = multi ? -1 : singleValues.indexOf(dataMax);
  const lastIndex = data.length - 1;

  const allTicks = useMemo(() => {
    const out: number[] = [];
    for (let g = 0; g <= yMax + 1e-9; g += step) out.push(g);
    return out;
  }, [yMax, step]);

  const availablePlotWidth = Math.max(0, chartWidth - (showYAxis && !floatingAxis ? 40 : 8) - 26);
  const maxXTicks = chartWidth > 0 ? Math.max(2, Math.min(8, Math.floor(availablePlotWidth / 64) + 1)) : 8;
  const xTicks = evenlySpacedValues(data.map((point) => point.label), maxXTicks);

  const maxYTicks = Math.max(2, Math.floor(Math.max(0, height - 20) / 32) + 1);
  const ticks = evenlySpacedValues(allTicks, maxYTicks);

  const yTickFormatter = useCallback((v: number) => (v === 0 ? '0' : fmt(v)), [fmt]);

  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    setAnimate(!reduce);
  }, []);

  const summary = ariaLabel ?? (multi ? `${activeSeries.map((s) => s.name).join(', ')} across ${data.length} points` : `Trend across ${data.length} points`);

  if (loading) {
    const layerCount = multi ? Math.min(Math.max(activeSeries.length, 2), 3) : 1;
    const layers = SKELETON_CURVES.slice(-layerCount);
    const opacities = SKELETON_CURVE_OPACITY.slice(-layerCount);

    return (
      <div ref={chartRef} className={cn('flex w-full gap-2', className)} aria-busy="true">
        {showYAxis && (
          <div className="flex w-10 shrink-0 flex-col justify-between py-1" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-6" />
            ))}
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-2" aria-hidden="true">
          <div className="relative w-full overflow-hidden rounded-[var(--size-border-radius-border-radius-2xl)]" style={{ height }}>
            <svg width="0" height="0">
              <defs>
                {layers.map((d, i) => (
                  <clipPath key={i} id={`${clipId}-${i}`} clipPathUnits="objectBoundingBox">
                    <path d={d} />
                  </clipPath>
                ))}
              </defs>
            </svg>
            {layers.map((_, i) => (
              <Skeleton key={i} className="absolute inset-0 h-full w-full rounded-none" style={{ clipPath: `url(#${clipId}-${i})`, opacity: opacities[i] }} />
            ))}
          </div>
          {showXAxis && (
            <div className="flex justify-between">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-8" />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={chartRef}
      className={cn('relative z-[2] w-full [--area-chart-background:var(--color-bg-surface-bg-surface)]', className)}
      role="img"
      aria-label={summary}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={chartData as AreaChartMultiPoint[]} margin={floatingAxis ? { top: 16, right: 14, bottom: 4, left: 12 } : { top: 16, right: 14, bottom: 4, left: 0 }}>
          <defs>
            {multi ? (
              activeSeries.map((s, i) => (
                <linearGradient key={s.key} id={`${gradientId}-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={seriesColor(i)} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={seriesColor(i)} stopOpacity={0} />
                </linearGradient>
              ))
            ) : (
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.22} />
                <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
              </linearGradient>
            )}
          </defs>

          <CartesianGrid vertical={false} stroke="var(--color-border-border-subtle)" strokeOpacity={0.6} />
          <Tooltip
            cursor={{ stroke: CHART_COLORS[0], strokeWidth: 1, strokeDasharray: '3 3', strokeOpacity: 0.5 }}
            content={({ active, payload, label }) =>
              multi ? (
                <AreaChartMultiTooltip active={active} payload={payload as unknown as TooltipEntry[] | undefined} label={label} fmt={fmt} labelPrefix={labelPrefix} series={activeSeries} />
              ) : (
                <AreaChartTooltip active={active} value={payload && payload.length && typeof payload[0]?.value === 'number' ? payload[0].value : undefined} label={label} fmt={fmt} labelPrefix={labelPrefix} />
              )
            }
          />
          {multi ? (
            activeSeries.map((s, i) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stackId={stacked ? 'stack' : undefined}
                stroke={seriesColor(i)}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={`url(#${gradientId}-${i})`}
                isAnimationActive={animate}
                animationDuration={720}
                animationEasing="ease-out"
                activeDot={{ r: 4, fill: seriesColor(i), stroke: 'var(--color-bg-surface-bg-surface)', strokeWidth: 2 }}
              />
            ))
          ) : (
            <Area
              type="monotone"
              dataKey="value"
              stroke={CHART_COLORS[0]}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={`url(#${gradientId})`}
              isAnimationActive={animate}
              animationDuration={720}
              animationEasing="ease-out"
              activeDot={{ r: 4.5, fill: CHART_COLORS[0], stroke: 'var(--color-bg-surface-bg-surface)', strokeWidth: 2.5 }}
              dot={(props: { cx?: number; cy?: number; index?: number }) => {
                const { cx, cy, index } = props;
                const show = index === peakIndex || index === lastIndex;
                if (!show || cx == null || cy == null) return <g key={`dot-${index}`} />;
                return <circle key={`dot-${index}`} cx={cx} cy={cy} r={3.5} fill="var(--color-bg-surface-bg-surface)" stroke={CHART_COLORS[0]} strokeWidth={2} />;
              }}
            />
          )}
          <XAxis
            dataKey="label"
            hide={!showXAxis}
            ticks={xTicks}
            interval={0}
            height={floatingAxis ? 8 : 30}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tick={(floatingAxis ? (props: FloatingTickProps & { index?: number }) => <AreaChartFloatingXTick {...props} lastIndex={xTicks.length - 1} /> : { fill: 'var(--color-text-text-subtler)', fontSize: 11 }) as any}
          />
          <YAxis
            width={floatingAxis ? 8 : 40}
            hide={!showYAxis}
            domain={[0, yMax]}
            ticks={ticks}
            tickLine={false}
            axisLine={false}
            tickFormatter={yTickFormatter}
            tick={(floatingAxis ? (props: FloatingTickProps) => <AreaChartFloatingYTick {...props} formatter={yTickFormatter} /> : { fill: 'var(--color-text-text-subtler)', fontSize: 11 }) as any}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>

      {multi && legend && activeSeries.length > 0 && (
        <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1" aria-hidden="true">
          {activeSeries.map((s, i) => (
            <li key={s.key} className="flex items-center gap-1.5 text-[0.6875rem] text-[var(--color-text-text-subtler)]">
              <span className="inline-block size-2.5 shrink-0 rounded-[0.1875rem]" style={{ background: seriesColor(i) }} />
              {s.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface FloatingTickProps {
  x?: number;
  y?: number;
  payload?: { value: number | string };
}

const FLOATING_CHIP_HEIGHT = 18;
const FLOATING_CHIP_PADDING_X = 8;

function useFloatingChipWidth(text: string) {
  const textRef = useRef<SVGTextElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState<number>();

  useLayoutEffect(() => {
    const node = textRef.current;
    if (!node) return;
    const next = node.getComputedTextLength();
    setMeasuredWidth((current) => (current === next ? current : next));
  }, [text]);

  return { textRef, width: Math.max(24, Math.ceil((measuredWidth ?? text.length * 6.4) + FLOATING_CHIP_PADDING_X * 2)) };
}

function rightDockedChipPath(xRight: number, yTop: number, w: number, h: number, r: number) {
  const xLeft = xRight - w;
  const yBottom = yTop + h;
  return [`M${xLeft + r},${yTop}`, `H${xRight}`, `V${yBottom}`, `H${xLeft + r}`, `Q${xLeft},${yBottom} ${xLeft},${yBottom - r}`, `V${yTop + r}`, `Q${xLeft},${yTop} ${xLeft + r},${yTop}`, 'Z'].join(' ');
}

function leftDockedChipPath(xLeft: number, yTop: number, w: number, h: number, r: number) {
  const xRight = xLeft + w;
  const yBottom = yTop + h;
  return [`M${xLeft},${yTop}`, `H${xRight - r}`, `Q${xRight},${yTop} ${xRight},${yTop + r}`, `V${yBottom - r}`, `Q${xRight},${yBottom} ${xRight - r},${yBottom}`, `H${xLeft}`, 'Z'].join(' ');
}

function AreaChartFloatingYTick({ x, y, payload, formatter }: FloatingTickProps & { formatter: (v: number) => string }) {
  const text = payload == null ? '' : formatter(Number(payload.value));
  const { textRef, width: w } = useFloatingChipWidth(text);
  if (x == null || y == null || payload == null || Number(payload.value) === 0) return null;
  const chipX = x + 4;
  return (
    <g>
      <rect x={chipX} y={y - FLOATING_CHIP_HEIGHT / 2} width={w} height={FLOATING_CHIP_HEIGHT} rx={FLOATING_CHIP_HEIGHT / 2} fill="var(--area-chart-background)" fillOpacity={0.85} />
      <text ref={textRef} x={chipX + w / 2} y={y} dy={3.5} textAnchor="middle" fontSize={11} fill="var(--color-text-text-subtler)">
        {text}
      </text>
    </g>
  );
}

function AreaChartFloatingXTick({ x, y, payload, index, lastIndex }: FloatingTickProps & { index?: number; lastIndex: number }) {
  const text = payload == null ? '' : String(payload.value);
  const { textRef, width: w } = useFloatingChipWidth(text);
  if (x == null || y == null || payload == null) return null;
  const chipY = y - 24;
  const r = FLOATING_CHIP_HEIGHT / 2;
  const pad = 8;
  const isLast = index === lastIndex;
  const anchorX = isLast ? x + pad : x - pad;
  const d = isLast ? rightDockedChipPath(anchorX, chipY, w, FLOATING_CHIP_HEIGHT, r) : leftDockedChipPath(anchorX, chipY, w, FLOATING_CHIP_HEIGHT, r);
  return (
    <g>
      <path d={d} fill="var(--area-chart-background)" fillOpacity={0.85} />
      <text ref={textRef} x={isLast ? anchorX - pad : anchorX + pad} y={chipY + FLOATING_CHIP_HEIGHT / 2} dy={3.5} textAnchor={isLast ? 'end' : 'start'} fontSize={11} fill="var(--color-text-text-subtler)">
        {text}
      </text>
    </g>
  );
}

function AreaChartTooltip({ active, value, label, fmt, labelPrefix }: { active?: boolean; value?: number; label?: ReactNode; fmt: (v: number) => string; labelPrefix: string }) {
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

interface TooltipEntry {
  dataKey?: string | number;
  value?: string | number;
}

function AreaChartMultiTooltip({ active, payload, label, fmt, labelPrefix, series }: { active?: boolean; payload?: TooltipEntry[]; label?: ReactNode; fmt: (v: number) => string; labelPrefix: string; series: AreaChartSeries[] }) {
  if (!active || !payload || !payload.length) return null;
  const indexFor = (key?: string | number) => series.findIndex((s) => s.key === key);
  return (
    <div className="flex flex-col gap-1 rounded-[var(--size-border-radius-border-radius-md)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface-overlay)] px-2.5 py-1.5 shadow-lg">
      <span className="text-[0.6875rem] text-[var(--color-text-text-subtler)]">
        {labelPrefix}
        {label}
      </span>
      <div className="flex flex-col gap-0.5">
        {payload.map((entry, i) => {
          const si = indexFor(entry.dataKey);
          return (
            <div key={i} className="flex items-center gap-2 font-body text-body-xs">
              <span className="inline-block size-2 shrink-0 rounded-[0.125rem]" style={{ background: seriesColor(si < 0 ? i : si) }} />
              <span className="text-[var(--color-text-text-subtler)]">{si < 0 ? String(entry.dataKey ?? '') : series[si].name}</span>
              <span className="ml-auto font-semibold tabular-nums text-[var(--color-text-text)]">{typeof entry.value === 'number' ? fmt(entry.value) : entry.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
