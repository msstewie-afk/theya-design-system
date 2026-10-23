'use client';

import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Check, Xmark } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';

export interface PasswordStrengthRule {
  label: ReactNode;
  test: (value: string) => boolean;
}

// The default rules, labelled in the active locale.
const defaultRules = (labels: { length: string; upper: string; lower: string; number: string; symbol: string }): PasswordStrengthRule[] => [
  { label: labels.length, test: (v) => v.length >= 8 },
  { label: labels.upper, test: (v) => /[A-Z]/.test(v) },
  { label: labels.lower, test: (v) => /[a-z]/.test(v) },
  { label: labels.number, test: (v) => /[0-9]/.test(v) },
  { label: labels.symbol, test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export type PasswordStrengthBand = 'weak' | 'good' | 'strong';

/**
 * Score band, proportional to the number of rules: up to a third of the
 * rules met is weak, more than two thirds is strong, good in between.
 * Integer math (3·met vs. total) so there's no rounding at the edges.
 * For the default 5 rules that's 0–1 weak, 2–3 good, 4–5 strong; with 3
 * rules 0–1 / 2 / 3, with 2 rules 0 / 1 / 2 — every band is reachable from
 * 2 rules up. (The old "≤ total − 2 is good" made good unreachable at 3
 * rules or fewer: 2 of 3 already read strong.)
 */
function strengthBand(met: number, total: number): PasswordStrengthBand {
  if (met * 3 <= total) return 'weak';
  if (met * 3 > total * 2) return 'strong';
  return 'good';
}

const BAR_COLOR: Record<PasswordStrengthBand, string> = {
  weak: 'var(--color-bg-danger-bg-danger)',
  good: 'var(--color-bg-warning-bg-warning)',
  strong: 'var(--color-bg-success-bg-success)',
};

const PERCENT_COLOR: Record<PasswordStrengthBand, string> = {
  weak: 'var(--color-text-text-danger)',
  good: 'var(--color-text-text-warning)',
  strong: 'var(--color-text-text-success)',
};

export interface PasswordStrengthMeterProps {
  /** The current password value to evaluate. */
  value: string;
  /** Override the default 5 rules (length/upper/lower/number/symbol). The Weak / Good / Strong bands scale with the number of rules. */
  rules?: PasswordStrengthRule[];
  className?: string;
}

/**
 * Composition helper meant to sit below a Password field, not a
 * replacement for it — pass the same controlled value both components
 * share. Solid color per score band (danger/warning/success), no
 * rainbow gradient.
 */
export function PasswordStrengthMeter({ value, rules: rulesProp, className }: PasswordStrengthMeterProps) {
  const { t } = useTheyaI18n();
  const rules = useMemo(() => rulesProp ?? defaultRules(t.password.rules), [rulesProp, t]);

  const { score, percent, statusLabel, barColor, percentColor, checks } = useMemo(() => {
    const evaluated = rules.map((rule) => ({ label: rule.label, met: rule.test(value) }));
    const s = evaluated.filter((c) => c.met).length;
    const p = value ? Math.round((s / rules.length) * 100) : 0;
    // One band drives the label and both colors, so they can't drift apart.
    const band = strengthBand(s, rules.length);
    const status = !value ? '' : t.password[band];
    return { score: s, percent: p, statusLabel: status, barColor: BAR_COLOR[band], percentColor: PERCENT_COLOR[band], checks: evaluated };
  }, [value, rules]);

  return (
    <div className={cn('flex flex-col gap-3 w-full', className)}>
      <div className="flex items-center gap-2">
        <div
          role="progressbar"
          // Named by what it measures; the band goes in valuetext. It used
          // to be labelled by the band text itself, so its name was "—" or
          // "Weak" and the percentage was read with no context.
          aria-label={t.password.strength}
          aria-valuetext={statusLabel || t.password.empty}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="flex-1 h-1.5 rounded-full bg-[var(--color-bg-neutral-bg-neutral-subtle)] overflow-hidden"
        >
          <div
            className="h-full rounded-full transition-[width,background-color] duration-moderate ease-enter motion-reduce:transition-none"
            style={{ width: `${percent}%`, backgroundColor: barColor }}
          />
        </div>
        <span
          aria-hidden="true"
          className="font-body font-normal text-body-s w-14 text-end"
          style={{ color: percent ? percentColor : 'var(--color-text-text-subtler)' }}
        >
          {statusLabel || '—'}
        </span>
      </div>
      {/* Announces the strength label change to screen readers — the
          progressbar's aria-valuenow updates silently on its own, this
          gives an actual spoken status ("Weak" -> "Good" -> "Strong"). */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {statusLabel && t.password.strengthIs(statusLabel)}
      </span>

      <ul className="flex flex-col gap-1.5">
        {checks.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className={cn(
                'flex items-center justify-center size-4 rounded-full shrink-0',
                c.met
                  ? 'bg-[var(--color-bg-success-bg-success)] text-[var(--color-icon-icon-on-dark)]'
                  : 'bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-[var(--color-icon-icon-subtle)]',
              )}
              aria-hidden="true"
            >
              {c.met ? <Check width={10} height={10} /> : <Xmark width={10} height={10} />}
            </span>
            <span
              className="font-body font-normal text-body-s"
              style={{ color: c.met ? 'var(--color-text-text)' : 'var(--color-text-text-subtler)' }}
            >
              {c.label}
              {/* Met/unmet was only the hidden icon + text color. */}
              <span className="sr-only">{c.met ? t.password.met : t.password.notMet}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
