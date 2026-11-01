'use client';

import { useRef, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import { useInView } from '../../ui/use-in-view';

/*
 * Numbers as proof on a landing page: a row of big figures (Miro's
 * "100M+ / 250+ / 6,000+"), two or three bars measuring the same thing
 * (Wispr's "Keyboard 45 wpm / Flow 220 wpm"), and a before / after table.
 * Every number is text: the bars only repeat what the text says, so they
 * can stay light and are hidden from assistive tech. Motion is a one-off
 * as the block scrolls in; with reduced motion everything is simply drawn.
 * For a counting number, pass a CountUp as the value.
 */

// ---------------------------------------------------------------------------

export interface StatsRowItem {
  /** The figure: text ("4.8") or a CountUp. */
  value: ReactNode;
  /** What it counts ("links saved this year"). */
  label: ReactNode;
}

export interface StatsRowProps extends Omit<ComponentProps<'dl'>, 'children'> {
  items: StatsRowItem[];
  /** `start` (default) or `center`. */
  align?: 'start' | 'center';
}

/**
 * Three or four big numbers side by side, a thin rule between them (two
 * columns on a phone). A description list: each label is the term, its
 * number the description, so a screen reader reads "links saved this year,
 * 12 million".
 */
export function StatsRow({ items, align = 'start', className, ...props }: StatsRowProps) {
  return (
    <dl
      data-slot="stats-row"
      className={cn(
        'm-0 grid grid-cols-2 gap-x-6 gap-y-10 lg:flex lg:gap-0',
        align === 'center' && 'text-center',
        className,
      )}
      {...props}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            'flex min-w-0 flex-col gap-2 lg:flex-1 lg:px-8',
            // A rule before every figure but the first, on wide screens.
            i > 0 && 'lg:border-0 lg:border-s lg:border-solid lg:border-[var(--color-border-border-subtle)]',
            i === 0 && 'lg:ps-0',
            i === items.length - 1 && 'lg:pe-0',
          )}
        >
          {/* The number comes first on screen, the label first in the reading order. */}
          <dt className="order-2 font-body text-body-l text-[var(--color-text-text-subtle)]">{item.label}</dt>
          <dd className="order-1 m-0 font-heading text-heading-2xl font-semibold tabular-nums text-[var(--color-text-text)]">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// ---------------------------------------------------------------------------

export interface CompareBarsItem {
  /** What is measured this way ("Scrolling through bookmarks"). */
  label: ReactNode;
  /** The amount, for the bar's length (any scale). */
  amount: number;
  /** The amount as read ("94 s"). */
  value: ReactNode;
  /** The accent bar: the product's own result. */
  highlight?: boolean;
}

export interface CompareBarsProps extends Omit<ComponentProps<'ul'>, 'children'> {
  items: CompareBarsItem[];
}

/**
 * Two or three ways of doing one thing, each a bar as long as its amount:
 * the old way in a muted bar, the product's way in the accent (Wispr's
 * typing vs speaking). The label and the amount are text above each bar;
 * the bar repeats them, so it is aria-hidden. The bars grow from the start
 * edge, one after another, the first time the list scrolls in.
 */
export function CompareBars({ items, className, ...props }: CompareBarsProps) {
  const ref = useRef<HTMLUListElement>(null);
  const seen = useInView(ref as React.RefObject<HTMLElement>, { threshold: 0.4 });
  const max = Math.max(...items.map((i) => i.amount), 1);
  return (
    <ul ref={ref} data-slot="compare-bars" className={cn('m-0 flex list-none flex-col gap-6 p-0', className)} {...props}>
      {items.map((item, i) => (
        <li key={i} className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-4">
            <span className={cn('font-body text-body-l', item.highlight ? 'font-semibold text-[var(--color-text-text)]' : 'text-[var(--color-text-text-subtle)]')}>{item.label}</span>
            <span className={cn('shrink-0 font-heading tabular-nums', item.highlight ? 'text-heading-l font-semibold text-[var(--color-text-text)]' : 'text-heading-s text-[var(--color-text-text-subtle)]')}>{item.value}</span>
          </div>
          <div aria-hidden className="h-3 overflow-hidden rounded-full bg-[var(--color-bg-surface-bg-surface-sunken)]">
            <div
              className={cn(
                'h-full rounded-full ltr:origin-left rtl:origin-right motion-safe:transition-transform motion-safe:duration-slower motion-safe:ease-glide',
                item.highlight ? 'bg-[var(--color-bg-primary-bg-primary)]' : 'bg-[var(--color-icon-icon-subtler)]',
              )}
              // raw-ok: a stagger step between the bars, not a duration.
              style={{ width: `${Math.max(2, (item.amount / max) * 100)}%`, transform: seen ? 'scaleX(1)' : 'scaleX(0)', transitionDelay: seen ? `${i * 150}ms` : undefined }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------

export interface BeforeAfterRow {
  /** The task ("Finding a link you saved"). */
  task: ReactNode;
  before: ReactNode;
  after: ReactNode;
}

export interface BeforeAfterProps extends Omit<ComponentProps<'table'>, 'children'> {
  rows: BeforeAfterRow[];
  /** Column headings, in the page's language ("Before", "With Theya"). */
  beforeLabel: ReactNode;
  afterLabel: ReactNode;
  /** The first column's heading ("Task"). Visually hidden: the rows speak for themselves. */
  taskLabel: ReactNode;
  /** Names the table for screen readers (a visible heading above it is better: pass its id as aria-labelledby). */
  caption?: ReactNode;
}

/**
 * Before / after, task by task: a real table, so a screen reader reads
 * "Finding a link you saved, Before, 2 minutes, With Theya, 6 seconds".
 * The "after" column sits on a tonal band so the eye lands there; the
 * meaning is in the headings, not the color.
 */
export function BeforeAfter({ rows, beforeLabel, afterLabel, taskLabel, caption, className, ...props }: BeforeAfterProps) {
  const cell = 'border-0 border-t border-solid border-[var(--color-border-border-subtler)] px-3 py-4 align-baseline sm:px-6 sm:py-5';
  const after = 'bg-[var(--color-bg-primary-bg-primary-subtle)]';
  return (
    <div className="w-full overflow-x-auto rounded-[var(--size-border-radius-border-radius-4xl)] border border-solid border-[var(--color-border-border-subtle)]">
      <table data-slot="before-after" className={cn('w-full border-collapse text-start', className)} {...props}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            <th scope="col" className="px-3 py-4 text-start sm:px-6">
              <span className="sr-only">{taskLabel}</span>
            </th>
            <th scope="col" className="px-3 py-4 text-start font-body text-body-s font-semibold uppercase tracking-[0.08em] text-[var(--color-text-text-subtle)] sm:px-6">
              {beforeLabel}
            </th>
            <th scope="col" className={cn('px-3 py-4 text-start font-body text-body-s font-semibold uppercase tracking-[0.08em] text-[var(--color-text-text-link-on-tonal)] sm:px-6', after)}>
              {afterLabel}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <th scope="row" className={cn(cell, 'text-start font-body text-body-m font-medium text-[var(--color-text-text)] sm:text-body-l')}>
                {r.task}
              </th>
              <td className={cn(cell, 'font-body text-body-m tabular-nums text-[var(--color-text-text-subtle)] sm:text-body-l')}>{r.before}</td>
              <td className={cn(cell, after, 'font-heading text-heading-xs font-semibold tabular-nums text-[var(--color-text-text)] sm:text-heading-s')}>{r.after}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
