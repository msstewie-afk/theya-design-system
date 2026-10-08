'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';
import { useInView, useReducedMotion } from './use-in-view';

/**
 * Motion preset (landing pages): a number counts up to its value the
 * first time it scrolls into view — "12,400 sites", "99.98% uptime".
 * Ported from Kinetics' Odometer Count-up (MIT, kinetics.colorion.co):
 * requestAnimationFrame with an ease-out-cubic curve, tabular digits so
 * the width doesn't jitter while it runs.
 *
 * Screen readers get the final value only (the running digits are
 * hidden from them); with prefers-reduced-motion the final value shows
 * at once.
 */
export interface CountUpProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The value to land on. */
  to: number;
  /** Where to start. */
  from?: number;
  /** Run time, ms. */
  duration?: number;
  /** Number format (locale from TheyaLocaleProvider): `{ maximumFractionDigits: 1 }`, `{ style: 'percent' }`, `{ notation: 'compact' }`… */
  format?: Intl.NumberFormatOptions;
  /** Text before / after the number, inside the same line: "$", "+". */
  prefix?: string;
  suffix?: string;
}

const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);

export function CountUp({ to, from = 0, duration = 1400, format, prefix = '', suffix = '', className, ...props }: CountUpProps) {
  const { locale } = useTheyaI18n();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { threshold: 0.5 });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(from);
  const formatter = useMemo(() => new Intl.NumberFormat(locale, format), [locale, format]);

  useEffect(() => {
    if (!inView) return;
    if (reduced || duration <= 0) {
      setValue(to);
      return;
    }
    let frame = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      setValue(from + (to - from) * easeOutCubic(p));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, from, to, duration]);

  // Whole numbers count in whole steps; fractional targets keep the
  // format's own decimals.
  const shown = Number.isInteger(to) && !format?.maximumFractionDigits ? Math.round(value) : value;
  const final = `${prefix}${formatter.format(to)}${suffix}`;
  return (
    <span ref={ref} data-slot="count-up" className={cn('tabular-nums', className)} {...props}>
      <span aria-hidden="true">
        {prefix}
        {formatter.format(shown)}
        {suffix}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}
