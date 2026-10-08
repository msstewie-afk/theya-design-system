'use client';

import { useEffect, useRef } from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '../../lib/utils';

/**
 * Progress bar for an operation advancing toward done (upload, install,
 * multi-step setup), on @radix-ui/react-progress. Reach for it when the value
 * reads as "how far along", not "how full" (that's Meter).
 *
 * - Determinate (default): `value` 0–100.
 * - `indeterminate`: work of unknown length — a bar sweeps across (Kinetics'
 *   Indeterminate Bar, MIT). With reduced motion it fills the track and slowly
 *   fades in and out.
 * - `segments`: the bar split into N equal steps, filled one after another
 *   (Kinetics' Segment Loader, MIT) — for a known number of stages.
 */
export interface ProgressProps extends Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, 'value'> {
  value?: number;
  /** Unknown length: no value, a sweeping bar. */
  indeterminate?: boolean;
  /** Split the bar into this many steps (2 or more). */
  segments?: number;
}

const TRACK = 'bg-[var(--color-bg-neutral-bg-neutral-subtle)]';
const FILL = 'bg-[var(--color-bg-primary-bg-primary)] forced-colors:forced-color-adjust-none forced-colors:bg-[Highlight]';

export function Progress({ className, value = 0, indeterminate = false, segments, ...props }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, value));
  const steps = segments && segments >= 2 ? Math.round(segments) : 0;
  const filled = steps ? Math.round((pct / 100) * steps) : 0;
  // Steps that fill in one update follow each other, 60ms apart, from the last filled one.
  const before = useRef(filled);
  useEffect(() => {
    before.current = filled;
  }, [filled]);

  if (steps && !indeterminate) {
    return (
      <ProgressPrimitive.Root value={pct} data-segments={steps} className={cn('flex h-1.5 w-full gap-1 rtl:-scale-x-100', className)} {...props}>
        {Array.from({ length: steps }, (_, i) => (
          <span key={i} className={cn('h-full flex-1 overflow-hidden rounded-full forced-colors:border forced-colors:border-solid forced-colors:border-[CanvasText]', TRACK)}>
            <span
              className={cn(
                'block h-full origin-left rounded-full transition-[scale] duration-slow ease-glide motion-reduce:transition-none',
                FILL,
                i < filled ? 'scale-x-100' : 'scale-x-0',
              )}
              style={{ transitionDelay: `${Math.max(0, i - before.current) * 60}ms` }}
            />
          </span>
        ))}
      </ProgressPrimitive.Root>
    );
  }

  return (
    <ProgressPrimitive.Root
      value={indeterminate ? null : pct}
      className={cn('relative h-1.5 w-full rtl:-scale-x-100 overflow-hidden rounded-full forced-colors:border forced-colors:border-solid forced-colors:border-[CanvasText]', TRACK, className)}
      {...props}
    >
      {indeterminate ? (
        <ProgressPrimitive.Indicator
          className={cn(
            'absolute inset-y-0 start-0 w-2/5 rounded-full animate-[theya-indeterminate_1.4s_var(--ease-glide)_infinite]',
            'motion-reduce:w-full motion-reduce:animate-[theya-breathe_2s_ease-in-out_infinite]',
            FILL,
          )}
        />
      ) : (
        <ProgressPrimitive.Indicator
          className={cn('h-full rounded-full transition-[transform] duration-slow ease-enter motion-reduce:transition-none', FILL)}
          style={{ transform: `translateX(-${100 - pct}%)` }}
        />
      )}
    </ProgressPrimitive.Root>
  );
}
