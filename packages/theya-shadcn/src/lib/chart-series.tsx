'use client';

/**
 * Series styling shared by the charts, so a series looks the same in every
 * chart type: its color (--color-bg-chart-01..07) and, as a second cue that
 * doesn't rely on color (WCAG 1.4.1), its dash (lines) or fill pattern
 * (slices). The first series stays solid; patterns start with the second.
 */
import { useId } from 'react';

export const CHART_COLORS = [
  'var(--color-bg-chart-01)',
  'var(--color-bg-chart-02)',
  'var(--color-bg-chart-03)',
  'var(--color-bg-chart-04)',
  'var(--color-bg-chart-05)',
  'var(--color-bg-chart-06)',
  'var(--color-bg-chart-07)',
];

export const seriesColor = (i: number) => CHART_COLORS[((i % CHART_COLORS.length) + CHART_COLORS.length) % CHART_COLORS.length];

/** strokeDasharray per series for 2px round-capped lines: solid, dashed, dotted, dash-dot… */
const DASHES = ['', '6 4', '0.5 4', '10 3 2 3', '2 4', '12 4 4 4', '4 3 0.5 3'];
export const seriesDash = (i: number) => DASHES[i % DASHES.length] || undefined;

type PatternKind = 'solid' | 'diagonal' | 'dots' | 'grid' | 'horizontal' | 'vertical' | 'diagonal-back';
const PATTERNS: PatternKind[] = ['solid', 'diagonal', 'dots', 'grid', 'horizontal', 'vertical', 'diagonal-back'];

/** Unique id prefix for one chart's <pattern> defs. */
export function usePatternId() {
  return `theya-pattern-${useId().replace(/:/g, '')}`;
}

/** Fill for slice i: the plain color for the first, the pattern for the rest. */
export const patternFill = (prefix: string, i: number) => (PATTERNS[i % PATTERNS.length] === 'solid' ? seriesColor(i) : `url(#${prefix}-${i})`);

/**
 * <pattern> defs for `count` series: the series color with lines or dots in
 * the surface color cut into it. Render inside the chart's <svg> (a recharts
 * chart accepts <defs> as a child).
 */
export function ChartPatternDefs({ prefix, count, cut = 'var(--color-bg-surface-bg-surface)' }: { prefix: string; count: number; cut?: string }) {
  return (
    <defs>
      {Array.from({ length: count }, (_, i) => {
        const kind = PATTERNS[i % PATTERNS.length];
        if (kind === 'solid') return null;
        const color = seriesColor(i);
        const id = `${prefix}-${i}`;
        const line = { stroke: cut, strokeWidth: 1.5 };
        switch (kind) {
          case 'diagonal':
          case 'diagonal-back':
            return (
              <pattern key={id} id={id} width={6} height={6} patternUnits="userSpaceOnUse" patternTransform={`rotate(${kind === 'diagonal' ? 45 : -45})`}>
                <rect width={6} height={6} style={{ fill: color }} />
                <line x1={0} y1={0} x2={0} y2={6} style={line} />
              </pattern>
            );
          case 'dots':
            return (
              <pattern key={id} id={id} width={5} height={5} patternUnits="userSpaceOnUse">
                <rect width={5} height={5} style={{ fill: color }} />
                <circle cx={2.5} cy={2.5} r={1.1} style={{ fill: cut }} />
              </pattern>
            );
          case 'grid':
            return (
              <pattern key={id} id={id} width={6} height={6} patternUnits="userSpaceOnUse">
                <rect width={6} height={6} style={{ fill: color }} />
                <path d="M0 3H6M3 0V6" style={{ ...line, strokeWidth: 1.2 }} />
              </pattern>
            );
          case 'horizontal':
          case 'vertical':
            return (
              <pattern key={id} id={id} width={5} height={5} patternUnits="userSpaceOnUse">
                <rect width={5} height={5} style={{ fill: color }} />
                {kind === 'horizontal' ? <line x1={0} y1={2.5} x2={5} y2={2.5} style={line} /> : <line x1={2.5} y1={0} x2={2.5} y2={5} style={line} />}
              </pattern>
            );
        }
      })}
    </defs>
  );
}

/**
 * The key beside a series name in a legend or tooltip: a short line with the
 * series dash, a pattern swatch, or (without patterns) the plain color square.
 * forced-color-adjust-none: in Windows High Contrast the key must keep the
 * colors the SVG series keep, or it can't be matched to them.
 */
export function SeriesKey({ index, kind, size = 10 }: { index: number; kind: 'square' | 'line' | 'pattern'; size?: number }) {
  if (kind === 'square') {
    return (
      <span
        className="inline-block shrink-0 rounded-[var(--size-border-radius-border-radius-sm)] forced-color-adjust-none"
        style={{ width: size, height: size, background: seriesColor(index) }}
      />
    );
  }
  if (kind === 'line') {
    return (
      <svg width={16} height={size} viewBox={`0 0 16 ${size}`} aria-hidden="true" className="shrink-0 forced-color-adjust-none">
        <line x1={1} y1={size / 2} x2={15} y2={size / 2} strokeWidth={2} strokeLinecap="round" strokeDasharray={seriesDash(index)} style={{ stroke: seriesColor(index) }} />
      </svg>
    );
  }
  return <PatternSwatch index={index} size={size} />;
}

function PatternSwatch({ index, size }: { index: number; size: number }) {
  const prefix = usePatternId();
  return (
    <svg width={size} height={size} aria-hidden="true" className="shrink-0 overflow-hidden rounded-[var(--size-border-radius-border-radius-sm)] forced-color-adjust-none">
      <ChartPatternDefs prefix={prefix} count={index + 1} />
      <rect width={size} height={size} style={{ fill: patternFill(prefix, index) }} />
    </svg>
  );
}
