import { cn } from '@/lib/utils';

/**
 * A stacked, multi-segment proportional bar that breaks a total into
 * labelled parts. Use for a breakdown, not a single value: one
 * measurement against a range is Meter, percent-complete of a task
 * is Progress. Headless (no Radix, no hooks). The bar is decorative
 * (aria-hidden); the wrapper carries role="img" summarizing the
 * segments, and the legend repeats every label/value as text.
 *
 *   <UsageBar segments={[{ label: "Uploads", value: 18.2 }, ...]}
 *     total={50} formatValue={(n) => `${n} GB`} />
 */
// Same fix already applied to DonutChart/AreaChart/LineChart/BarChart/
// ChartRangeSelection/Sparkline this session — semantic tokens (primary/
// secondary/success/warning/danger) duplicate colors across components
// with unrelated meanings (e.g. info==primary) and aren't meant for an
// arbitrary index-driven palette. Reuses the shared chart primitives
// (--color-bg-chart-01/02/03 = blue/magenta/teal) plus purple, which
// isn't in that shared 7-color set — a UsageBar-local addition, not a
// change to the shared chart palette (Sep 2026, Мария's pick).
const CHART_COLORS = [
  'var(--color-bg-chart-01)', // blue
  'var(--color-bg-chart-02)', // magenta
  'var(--color-bg-chart-03)', // teal
  'var(--color-purple-purple-500)', // purple
] as const;

export interface UsageSegment {
  label: string;
  value: number;
  /** Optional fill, given as a CSS variable reference. Defaults to cycling through the chart palette by index. */
  colorVar?: string;
}

export interface UsageBarProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  segments: UsageSegment[];
  /** Denominator for the percentages; defaults to the sum of the values. */
  total?: number;
  showLegend?: boolean;
  formatValue?: (n: number) => string;
}

export function UsageBar({ className, segments, total, showLegend = true, formatValue = (n) => String(n), ...props }: UsageBarProps) {
  const sum = segments.reduce((acc, s) => acc + Math.max(0, s.value), 0);
  const denominator = total != null && total > 0 ? total : sum;

  const parts = segments.map((segment, i) => ({
    ...segment,
    color: segment.colorVar ?? CHART_COLORS[i % CHART_COLORS.length],
    pct: denominator > 0 ? (Math.max(0, segment.value) / denominator) * 100 : 0,
  }));

  const summary = parts.map((p) => `${p.label} ${formatValue(p.value)}`).join(', ');

  return (
    <div data-slot="usage-bar" className={cn('flex flex-col gap-3', className)} {...props}>
      <div role="img" aria-label={`Usage by segment: ${summary}`} className="flex h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-neutral-bg-neutral-subtle)]">
        {parts.map((p, i) => (
          <div key={`${p.label}-${i}`} aria-hidden="true" className="h-full first:rounded-l-full last:rounded-r-full" style={{ width: `${p.pct}%`, background: p.color }} />
        ))}
      </div>

      {showLegend && (
        <ul data-slot="usage-bar-legend" className="flex flex-wrap gap-x-4 gap-y-1.5">
          {parts.map((p, i) => (
            <li key={`${p.label}-${i}`} className="flex min-w-0 items-center gap-2 font-body text-body-s">
              <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[var(--size-border-radius-border-radius-sm)]" style={{ background: p.color }} />
              <span className="min-w-0 truncate text-[var(--color-text-text-subtler)]">{p.label}</span>
              <span className="shrink-0 tabular-nums text-[var(--color-text-text)]">{formatValue(p.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
