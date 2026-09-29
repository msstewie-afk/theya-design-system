import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Check, Xmark } from 'iconoir-react';
import { cn } from '@/lib/utils';

export interface PasswordStrengthRule {
  label: ReactNode;
  test: (value: string) => boolean;
}

const DEFAULT_RULES: PasswordStrengthRule[] = [
  { label: '8+ characters', test: (v) => v.length >= 8 },
  { label: 'Uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'Lowercase letter', test: (v) => /[a-z]/.test(v) },
  { label: 'Number', test: (v) => /[0-9]/.test(v) },
  { label: 'Symbol', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export interface PasswordStrengthMeterProps {
  /** The current password value to evaluate. */
  value: string;
  /** Override the default 5 rules (length/upper/lower/number/symbol). */
  rules?: PasswordStrengthRule[];
  className?: string;
}

/**
 * Composition helper meant to sit below a Password field, not a
 * replacement for it — pass the same controlled value both components
 * share. Solid color per score band (danger/warning/success), no
 * rainbow gradient.
 */
export function PasswordStrengthMeter({ value, rules = DEFAULT_RULES, className }: PasswordStrengthMeterProps) {

  const { score, percent, statusLabel, barColor, percentColor, checks } = useMemo(() => {
    const evaluated = rules.map((rule) => ({ label: rule.label, met: rule.test(value) }));
    const s = evaluated.filter((c) => c.met).length;
    const p = value ? Math.round((s / rules.length) * 100) : 0;
    const status = !value ? '' : s <= 1 ? 'Weak' : s <= rules.length - 2 ? 'Good' : 'Strong';
    const bar =
      s <= 1
        ? 'var(--color-bg-danger-bg-danger)'
        : s <= rules.length - 2
          ? 'var(--color-bg-warning-bg-warning)'
          : 'var(--color-bg-success-bg-success)';
    const pctColor =
      s <= 1
        ? 'var(--color-text-text-danger)'
        : s <= rules.length - 2
          ? 'var(--color-text-text-warning)'
          : 'var(--color-text-text-success)';
    return { score: s, percent: p, statusLabel: status, barColor: bar, percentColor: pctColor, checks: evaluated };
  }, [value, rules]);

  return (
    <div className={cn('flex flex-col gap-3 w-full', className)}>
      <div className="flex items-center gap-2">
        <div
          role="progressbar"
          // Named by what it measures; the band goes in valuetext. It used
          // to be labelled by the band text itself, so its name was "—" or
          // "Weak" and the percentage was read with no context.
          aria-label="Password strength"
          aria-valuetext={statusLabel || 'No password entered'}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="flex-1 h-1.5 rounded-full bg-[var(--color-bg-neutral-bg-neutral-subtle)] overflow-hidden"
        >
          <div
            className="h-full rounded-full transition-[width,background-color] duration-200 ease-out motion-reduce:transition-none"
            style={{ width: `${percent}%`, backgroundColor: barColor }}
          />
        </div>
        <span
          aria-hidden="true"
          className="font-body font-normal text-body-s w-14 text-right"
          style={{ color: percent ? percentColor : 'var(--color-text-text-subtler)' }}
        >
          {statusLabel || '—'}
        </span>
      </div>
      {/* Announces the strength label change to screen readers — the
          progressbar's aria-valuenow updates silently on its own, this
          gives an actual spoken status ("Weak" -> "Good" -> "Strong"). */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {statusLabel && `Password strength: ${statusLabel}`}
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
              <span className="sr-only">{c.met ? ', met' : ', not met'}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
