'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { useInView, useReducedMotion } from './use-in-view';

/**
 * Motion: a ring that fills to its value when it scrolls into view, the
 * number in the middle counting up with it — for "75% done", "3 of 4
 * steps" on a dashboard card or a landing bento.
 *
 * role="progressbar" with the final value from the start, so assistive
 * tech never hears the in-between numbers. prefers-reduced-motion: it is
 * drawn full at once. Not for a live value that changes every second —
 * use Progress / Meter there.
 */
export type ProgressRingTone = 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface ProgressRingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 0–max. */
  value: number;
  max?: number;
  /** Accessible name, e.g. "Components generated". */
  label: string;
  /** Diameter in px (default 120). */
  size?: number;
  /** Stroke width in px (default 10). */
  thickness?: number;
  tone?: ProgressRingTone;
  /** Fill time in ms (default 1200). */
  duration?: number;
  /** What sits in the middle; default the percentage. Pass null for an empty middle. */
  children?: ReactNode | ((shown: number) => ReactNode);
}

const TONE: Record<ProgressRingTone, string> = {
  primary: 'var(--color-bg-primary-bg-primary)',
  success: 'var(--color-bg-success-bg-success)',
  warning: 'var(--color-bg-warning-bg-warning-status)',
  danger: 'var(--color-bg-danger-bg-danger)',
  info: 'var(--color-bg-info-bg-info-status)',
};

const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);

export function ProgressRing({ value, max = 100, label, size = 120, thickness = 10, tone = 'primary', duration = 1200, children, className, style, ...props }: ProgressRingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduced = useReducedMotion();
  const target = Math.max(0, Math.min(max, value));
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) return setShown(target);
    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setShown(target * easeOutCubic(p));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, target, duration]);

  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const fraction = max > 0 ? shown / max : 0;
  const pct = Math.round(fraction * 100);
  const middle = children === undefined ? `${pct}%` : typeof children === 'function' ? children(shown) : children;

  return (
    <div
      ref={ref}
      data-slot="progress-ring"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={target}
      className={cn('relative inline-grid shrink-0 place-items-center', className)}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 rtl:scale-x-[-1]" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={thickness} stroke="var(--color-bg-neutral-bg-neutral-subtle)" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          stroke={TONE[tone]}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
          className="forced-colors:stroke-[Highlight]"
        />
      </svg>
      {middle != null && (
        <span aria-hidden="true" className="absolute font-body text-heading-xs font-semibold tabular-nums text-[var(--color-text-text)]">
          {middle}
        </span>
      )}
    </div>
  );
}
