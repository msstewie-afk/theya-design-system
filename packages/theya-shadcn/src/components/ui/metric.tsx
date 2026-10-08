import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * A compact single-line "value + label" row with an optional leading
 * icon and actions slot, for a quick-glance count inside a wider Card
 * body — one step below Stat's self-contained KPI tile, meant to
 * repeat as list rows rather than stand alone.
 *
 * `icon` is rendered muted and decorative — for a severity tone, pass
 * the icon pre-colored via its own className and wrap `value` in a
 * matching span; Metric doesn't own a tone system itself.
 */
export interface MetricProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /** Optional leading icon (decorative — the visible value/label carry the meaning). */
  icon?: ReactNode;
  /** The metric value — a string/number is the common case (tabular-nums). */
  value: ReactNode;
  label: string;
  /** Optional muted explainer line below the value/label. */
  description?: string;
  /** Optional trailing controls. Omit to render none. */
  actions?: ReactNode;
}

export function Metric({ className, icon, value, label, description, actions, ...props }: MetricProps) {
  return (
    <div
      data-slot="metric"
      role="group"
      aria-label={description ? `${label}, ${description}` : label}
      className={cn('group/metric flex min-h-[4.125rem] items-center justify-between gap-3 py-[1.125rem] ps-5 pe-4', className)}
      {...props}
    >
      <div data-slot="metric-header" className="flex min-w-0 flex-1 -translate-y-px flex-col gap-1">
        <div className="flex min-w-0 items-center gap-2">
          {icon && (
            <span data-slot="metric-icon" aria-hidden="true" className="shrink-0 text-[var(--color-icon-icon-subtle)] [&_svg]:size-5 [&_svg]:shrink-0">
              {icon}
            </span>
          )}
          {/* gap-0 is deliberate, not a missed spacing token: it lets a
              caller glue `value` straight to a suffix label ("121" +
              "/150 mailboxes") with no gap at all. A word-separated label
              ("aliases") needs its OWN leading space in the string
              (label=" aliases") — that's the caller's job, not this
              component's; a label passed without it (e.g. "aliases" instead
              of " aliases") renders glued to the value ("8aliases"). */}
          <span className="flex min-w-0 items-baseline gap-0">
            <span data-slot="metric-value" className="shrink-0 font-body text-heading-xs font-semibold leading-none tabular-nums text-[var(--color-text-text)]">{value}</span>
            <span data-slot="metric-label" className="min-w-0 truncate font-body text-body-m text-[var(--color-text-text-subtler)]">{label}</span>
          </span>
        </div>
        {description && <span data-slot="metric-description" className="truncate font-body text-body-xs text-[var(--color-text-text-subtler)]">{description}</span>}
      </div>
      {actions && <div data-slot="metric-actions" className="relative z-10 flex shrink-0 items-center gap-2 text-[var(--color-text-text-subtler)]">{actions}</div>}
    </div>
  );
}
