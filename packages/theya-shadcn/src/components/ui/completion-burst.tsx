'use client';

import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Spinner } from './spinner';
import { SuccessCheck } from './success-check';

/**
 * Motion: a "working on it" state that ends in a small celebration — an
 * icon in a circle with an arc running round it ("Preparing your plan"),
 * and when the work is done the arc gives way to a tick that draws itself
 * while a ring of short strokes bursts out of it ("Your plan is ready").
 *
 * - Driven by `status`, never by a timer: switch it to `done` when the work
 *   really is done. The burst plays once, on that switch.
 * - The text is a polite live region (role="status"), so the change from the
 *   busy line to the done line is announced; the picture is decorative.
 * - Built on Spinner (the running arc) and SuccessCheck (the tick).
 * - prefers-reduced-motion: no burst and no drawing — the tick simply
 *   appears; the arc fades in and out instead of turning (Spinner's own rule).
 */
export type CompletionBurstTone = 'success' | 'primary';

export interface CompletionBurstProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  status: 'busy' | 'done';
  /** "Preparing your plan". */
  busyLabel: ReactNode;
  /** "Your plan is ready". */
  doneLabel: ReactNode;
  /** A line under the label, e.g. "Setting up your nutrition plan…". */
  description?: ReactNode;
  /** Shown in the circle while busy (an Iconoir icon). */
  icon?: ReactNode;
  tone?: CompletionBurstTone;
}

const TONE: Record<CompletionBurstTone, { fill: string; ink: string; arc: string }> = {
  success: {
    fill: 'bg-[var(--color-bg-success-bg-success)]',
    ink: 'text-[var(--color-text-text-on-primary)]',
    arc: 'text-[var(--color-icon-icon-success)]',
  },
  primary: {
    fill: 'bg-[var(--color-bg-primary-bg-primary)]',
    ink: 'text-[var(--color-text-text-on-primary)]',
    arc: 'text-[var(--color-icon-icon-primary)]',
  },
};

// Twelve strokes round the circle, alternating long and short, so the burst reads as light rather than confetti.
const RAYS = Array.from({ length: 12 }, (_, i) => ({ angle: i * 30, long: i % 2 === 0 }));

export function CompletionBurst({ status, busyLabel, doneLabel, description, icon, tone = 'success', className, ...props }: CompletionBurstProps) {
  const done = status === 'done';
  const c = TONE[tone];
  return (
    <div data-slot="completion-burst" data-status={status} className={cn('flex flex-col items-center gap-6 text-center', className)} {...props}>
      <div aria-hidden className="relative grid size-20 place-items-center">
        {/* The running arc round the circle while busy. */}
        {!done && <Spinner className={cn('absolute inset-0 size-20', c.arc)} />}
        <span className={cn('relative grid size-14 place-items-center rounded-full [&_svg]:size-7', c.fill, c.ink)}>
          {done ? <SuccessCheck key="done" /> : icon}
        </span>
        {/* The burst: mounted on the switch to done, so it plays once. */}
        {done &&
          RAYS.map((r) => (
            <span key={r.angle} className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0 motion-reduce:hidden" style={{ rotate: `${r.angle}deg` }}>
              <span
                className={cn(
                  'absolute -translate-x-1/2 rounded-full opacity-0 animate-[theya-spark_var(--motion-duration-slower)_var(--ease-glide)_forwards]',
                  r.long ? 'h-3 w-0.5' : 'h-2 w-0.5',
                  tone === 'success' ? 'bg-[var(--color-icon-icon-success)]' : 'bg-[var(--color-icon-icon-primary)]',
                )}
                // Start at the circle's edge and fly outward along the ray (the parent is rotated, so -y is outward).
                style={{ top: '-2.25rem', '--spark-x': '0px', '--spark-y': r.long ? '-1.25rem' : '-0.875rem', animationDelay: 'var(--motion-duration-standard)' } as CSSProperties}
              />
            </span>
          ))}
      </div>
      <div role="status" className="flex flex-col gap-1">
        <p className="m-0 font-heading text-heading-xs font-semibold text-[var(--color-text-text)]">{done ? doneLabel : busyLabel}</p>
        {description && <p className="m-0 font-body text-body-s text-[var(--color-text-text-subtle)]">{description}</p>}
      </div>
    </div>
  );
}
