import { useId, useMemo, useState, useEffect } from 'react';
import { Area, AreaChart, Line, LineChart, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

/**
 * A tiny, axis-less inline trend for a table cell, Stat card, or list
 * row, on recharts. No grid, axes, or tooltip: it carries the SHAPE
 * of a series while the precise numbers live in the surrounding
 * text. Exposed as a single role="img"; always pass a short ariaLabel.
 *
 *   <Sparkline data={[3, 5, 4, 6, 5, 7, 9]} tone="success"
 *     ariaLabel="Uptime trending up over the last 7 days." />
 */
export type SparklineTone = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

const TONE_STROKE: Record<SparklineTone, string> = {
  brand: 'var(--color-bg-primary-bg-primary)',
  success: 'var(--color-bg-success-bg-success)',
  warning: 'var(--color-bg-warning-bg-warning)',
  danger: 'var(--color-bg-danger-bg-danger)',
  // Fixed: was wired to the generic --color-bg-secondary-bg-secondary
  // (grayish) instead of the dedicated blue info family — same systemic
  // bug already fixed in StatusDot/ToneIcon/Chip/Badge/Alert/Timeline/
  // Meter, missed here (Sep 2026).
  info: 'var(--color-icon-icon-info)',
  muted: 'var(--color-icon-icon-subtle)',
};

export interface SparklineProps {
  data: number[];
  tone?: SparklineTone;
  /** Soft gradient area fill under the line. */
  area?: boolean;
  /** Dot on the latest point. */
  showLast?: boolean;
  height?: number;
  /** Fixed width in px; omit for fluid (fills the container). */
  width?: number;
  ariaLabel?: string;
  className?: string;
}

export function Sparkline({ data, tone = 'brand', area = false, showLast = true, height = 32, width, ariaLabel, className }: SparklineProps) {
  const gradientId = useId();
  const stroke = TONE_STROKE[tone];
  const points = useMemo(() => data.map((value, i) => ({ i, value })), [data]);
  const lastIndex = data.length - 1;

  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    setAnimate(!reduce);
  }, []);

  const lastDot = (props: { cx?: number; cy?: number; index?: number }) => {
    const { cx, cy, index } = props;
    if (!showLast || index !== lastIndex || cx == null || cy == null) return <g key={`d-${index}`} />;
    return <circle key={`d-${index}`} cx={cx} cy={cy} r={2.5} fill={stroke} stroke="var(--color-bg-surface-bg-surface)" strokeWidth={1.5} />;
  };

  const margin = { top: 4, right: 4, bottom: 4, left: 4 };

  return (
    <div data-slot="sparkline" className={cn('inline-block', width == null && 'w-full', className)} style={width != null ? { width, height } : { height }} role="img" aria-label={ariaLabel ?? `Trend across ${data.length} points`}>
      <ResponsiveContainer width="100%" height="100%">
        {area ? (
          <AreaChart data={points} margin={margin}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.24} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={stroke}
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={`url(#${gradientId})`}
              isAnimationActive={animate}
              animationDuration={520}
              animationEasing="ease-enter"
              dot={lastDot}
              activeDot={false}
            />
          </AreaChart>
        ) : (
          <LineChart data={points} margin={margin}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={stroke}
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              isAnimationActive={animate}
              animationDuration={520}
              animationEasing="ease-enter"
              dot={lastDot}
              activeDot={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
