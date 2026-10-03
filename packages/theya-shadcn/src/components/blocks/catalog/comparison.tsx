import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, Minus, NavArrowLeft, Xmark } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ItemCard, formatInstalls, formatItemPrice } from './item-card';
import { ItemIcon } from './item-icon';
import type { CatalogItem } from './types';

/** Selection state for "Compare": an ordered list of ids, capped at `max`. */
export function useCompareSelection(max = 4, initial: string[] = []) {
  const [ids, setIds] = useState<string[]>(initial.slice(0, max));
  const toggle = useCallback((id: string, on: boolean) => setIds((cur) => (on ? (cur.includes(id) || cur.length >= max ? cur : [...cur, id]) : cur.filter((x) => x !== id))), [max]);
  const remove = useCallback((id: string) => setIds((cur) => cur.filter((x) => x !== id)), []);
  const clear = useCallback(() => setIds([]), []);
  return { ids, toggle, remove, clear, full: ids.length >= max, max };
}

export interface CompareBarProps {
  /** Selected items, in the order they were picked. */
  items: CatalogItem[];
  max?: number;
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
  className?: string;
}

/**
 * The tray that collects picks while browsing. It stays in view (sticky to
 * the bottom of the scroll area), shows what is in it with a way to take
 * each one out, leaves the empty slots visible so the limit is obvious, and
 * says what is missing instead of silently disabling "Compare".
 */
export function CompareBar({ items, max = 4, onRemove, onClear, onCompare, className }: CompareBarProps) {
  const hintId = useId();
  const ready = items.length >= 2;
  const hint = !ready ? 'Pick at least 2 to compare.' : items.length >= max ? `That's the maximum of ${max}. Remove one to add another.` : `You can add up to ${max}.`;
  if (!items.length) return null;
  return (
    <section
      aria-label="Comparison"
      className={cn(
        'sticky bottom-4 z-10 flex flex-col gap-3 rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-3 shadow-elevation-lg @3xl:flex-row @3xl:items-center',
        className,
      )}
    >
      <ul className="grid min-w-0 flex-1 grid-cols-2 gap-2 @3xl:grid-cols-4">
        {Array.from({ length: max }, (_, i) => {
          const item = items[i];
          if (!item)
            return (
              <li key={`empty-${i}`} aria-hidden="true" className="hidden h-10 items-center justify-center rounded-[var(--size-border-radius-border-radius-lg)] border border-dashed border-[var(--color-border-border-subtle)] font-body text-body-s text-[var(--color-text-text-subtler)] @3xl:flex">
                Empty slot
              </li>
            );
          return (
            <li key={item.id} className="flex h-10 min-w-0 items-center gap-2 rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] pl-1 pr-0.5">
              <ItemIcon icon={item.icon} size="sm" />
              <span className="min-w-0 flex-1 truncate font-body text-body-s font-medium text-[var(--color-text-text)]">{item.name}</span>
              <Button appearance="ghost" tone="secondary" size="sm" iconOnly leftIcon={<Xmark />} aria-label={`Remove ${item.name} from comparison`} onClick={() => onRemove(item.id)} />
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <p id={hintId} className="font-body text-body-s text-[var(--color-text-text-subtle)]">
          {hint}
        </p>
        <Button appearance="ghost" tone="secondary" size="md" onClick={onClear}>
          Clear
        </Button>
        {/* softDisabled, not disabled: it stays focusable and the hint tells why. */}
        <Button data-compare-button="" appearance="filled" tone="primary" size="md" softDisabled={!ready} aria-describedby={hintId} onClick={onCompare}>
          {`Compare (${items.length})`}
        </Button>
      </div>
      <p role="status" className="sr-only">{`${items.length} of ${max} selected for comparison`}</p>
    </section>
  );
}

interface CompareRow {
  id: string;
  label: string;
  /** Plain value per item, used for "is it different?" */
  key: (item: CatalogItem) => string;
  render: (item: CatalogItem) => React.ReactNode;
  group?: string;
}

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function buildRows(items: CatalogItem[]): CompareRow[] {
  const platforms = [...new Set(items.flatMap((i) => i.compatibility))].sort();
  return [
    { id: 'price', label: 'Price', key: (i) => String(i.price), render: (i) => formatItemPrice(i.price) },
    { id: 'rating', label: 'Rating', key: (i) => String(i.rating), render: (i) => `${i.rating.toFixed(1)} of 5 (${i.reviewCount.toLocaleString('en-US')} reviews)` },
    { id: 'installs', label: 'Installs', key: (i) => String(i.installs), render: (i) => formatInstalls(i.installs) },
    { id: 'category', label: 'Category', key: (i) => i.category, render: (i) => i.category },
    { id: 'vendor', label: 'Developer', key: (i) => i.vendor, render: (i) => i.vendor },
    { id: 'added', label: 'Added', key: (i) => i.added, render: (i) => dateFmt.format(new Date(i.added)) },
    ...platforms.map<CompareRow>((p) => ({
      id: `works-${p}`,
      label: p,
      group: 'Works with',
      key: (i) => String(i.compatibility.includes(p)),
      render: (i) => <Supported on={i.compatibility.includes(p)} />,
    })),
  ];
}

function Supported({ on }: { on: boolean }) {
  return on ? (
    <span className="inline-flex text-[var(--color-icon-icon-success)]">
      <Check className="size-5" aria-hidden="true" />
      <span className="sr-only">Yes</span>
    </span>
  ) : (
    <span className="inline-flex text-[var(--color-icon-icon-subtler)]">
      <Minus className="size-5" aria-hidden="true" />
      <span className="sr-only">No</span>
    </span>
  );
}

export interface ComparisonTableProps {
  items: CatalogItem[];
  getHref?: (item: CatalogItem) => string;
  onRemove?: (id: string) => void;
  className?: string;
}

/**
 * Items side by side, one column each, attributes as rows in the same order
 * as on the cards. Rows where the items differ are emphasised and "Only
 * differences" hides the rest. The attribute column stays pinned while the
 * columns scroll sideways on narrow screens.
 */
export function ComparisonTable({ items, getHref, onRemove, className }: ComparisonTableProps) {
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const diffId = useId();
  const rows = useMemo(() => buildRows(items), [items]);
  const differs = (r: CompareRow) => new Set(items.map(r.key)).size > 1;
  const shown = rows.filter((r) => !onlyDifferences || differs(r));
  const firstGroupRow = shown.find((r) => r.group)?.id;

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center justify-end gap-2">
        <Switch id={diffId} checked={onlyDifferences} onCheckedChange={setOnlyDifferences} />
        <label htmlFor={diffId} className="cursor-pointer font-body text-body-m text-[var(--color-text-text)]">
          Only differences
        </label>
      </div>
      {/* Focusable scroll region (keyboard users can scroll it); the ring sits on its frame. */}
      <div role="region" aria-label="Comparison table" tabIndex={0} className="overflow-x-auto rounded-[var(--size-border-radius-border-radius-lg)] outline-none focus-visible:focus-ring">
        <table className="w-full table-fixed border-collapse font-body" style={{ minWidth: `${10 + items.length * 13}rem` }}>
          <caption className="sr-only">{`Comparing ${items.map((i) => i.name).join(', ')}`}</caption>
          <colgroup>
            <col className="w-40" />
            {items.map((i) => (
              <col key={i.id} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <td className="sticky left-0 z-[1] bg-[var(--color-bg-surface-bg-surface-base)] p-0" />
              {items.map((item) => (
                <th key={item.id} scope="col" className="px-4 pb-4 text-left align-top font-normal">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <ItemIcon icon={item.icon} />
                      {onRemove && <Button appearance="ghost" tone="secondary" size="sm" iconOnly leftIcon={<Xmark />} aria-label={`Remove ${item.name} from comparison`} onClick={() => onRemove(item.id)} />}
                    </div>
                    <div>
                      <a
                        href={getHref?.(item) ?? '#'}
                        className="rounded-[var(--size-border-radius-border-radius-sm)] text-body-l font-semibold text-[var(--color-text-text)] underline-offset-4 outline-none hover:text-[var(--color-text-text-link)] hover:underline focus-visible:focus-ring"
                      >
                        {item.name}
                      </a>
                      <p className="text-body-s text-[var(--color-text-text-subtler)]">{item.vendor}</p>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => {
              const different = differs(r);
              return (
                <tr key={r.id}>
                  <th scope="row" className="sticky left-0 z-[1] border-t border-solid border-[var(--color-border-border-subtler)] bg-[var(--color-bg-surface-bg-surface-base)] py-3 pr-4 text-left align-top font-normal">
                    {r.id === firstGroupRow && <span className="mb-1 block text-body-s font-medium text-[var(--color-text-text-subtle)]">{r.group}</span>}
                    <span className="text-body-m text-[var(--color-text-text)]">
                      {r.group && <span className="sr-only">{`${r.group}: `}</span>}
                      {r.label}
                    </span>
                  </th>
                  {items.map((item) => (
                    <td
                      key={item.id}
                      className={cn(
                        'border-t border-solid border-[var(--color-border-border-subtler)] px-4 py-3 text-body-m tabular-nums',
                        r.id === firstGroupRow ? 'align-bottom' : 'align-top',
                        different ? 'font-medium text-[var(--color-text-text)]' : 'text-[var(--color-text-text-subtle)]',
                      )}
                    >
                      {r.render(item)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {onlyDifferences && shown.length === 0 && <p className="font-body text-body-m text-[var(--color-text-text-subtle)]">These items match on every attribute.</p>}
    </div>
  );
}

export interface CompareFlowProps {
  items: CatalogItem[];
  max?: number;
  /** Ids picked from the start (demos). */
  initialSelection?: string[];
  getHref?: (item: CatalogItem) => string;
  className?: string;
}

/**
 * The whole compare loop: tick "Compare" on cards, the tray collects them,
 * "Compare (n)" opens the side-by-side table, "Back to results" returns
 * with the picks intact. Focus moves to the table heading and back to the
 * Compare button so keyboard and screen-reader users don't lose their place.
 */
export function CompareFlow({ items, max = 4, initialSelection, getHref, className }: CompareFlowProps) {
  const sel = useCompareSelection(max, initialSelection);
  const [view, setView] = useState<'browse' | 'compare'>('browse');
  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const returning = useRef(false);
  const selected = sel.ids.map((id) => items.find((i) => i.id === id)).filter((i): i is CatalogItem => !!i);

  useEffect(() => {
    if (view === 'compare') headingRef.current?.focus();
    else if (returning.current) {
      returning.current = false;
      rootRef.current?.querySelector<HTMLElement>('[data-compare-button]')?.focus();
    }
  }, [view]);

  // Fewer than two left in the table: nothing to compare, go back.
  useEffect(() => {
    if (view === 'compare' && selected.length < 2) {
      returning.current = true;
      setView('browse');
    }
  }, [view, selected.length]);

  return (
    <div ref={rootRef} className={cn('@container flex w-full flex-col gap-5', className)}>
      {view === 'browse' ? (
        <>
          <ul className="grid gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
            {items.map((item) => {
              const checked = sel.ids.includes(item.id);
              return (
                <li key={item.id}>
                  <ItemCard item={item} href={getHref?.(item)} compare={{ checked, disabled: !checked && sel.full, onChange: (on) => sel.toggle(item.id, on) }} />
                </li>
              );
            })}
          </ul>
          <CompareBar items={selected} max={max} onRemove={sel.remove} onClear={sel.clear} onCompare={() => setView('compare')} />
        </>
      ) : (
        <>
          <div className="flex flex-col items-start gap-3">
            <Button
              appearance="ghost"
              tone="secondary"
              size="md"
              leftIcon={<NavArrowLeft />}
              onClick={() => {
                returning.current = true;
                setView('browse');
              }}
            >
              Back to results
            </Button>
            <h2 ref={headingRef} tabIndex={-1} className="rounded-[var(--size-border-radius-border-radius-sm)] font-body text-heading-s font-semibold text-[var(--color-text-text)] outline-none">
              {`Comparing ${selected.length} extensions`}
            </h2>
          </div>
          <ComparisonTable items={selected} getHref={getHref} onRemove={sel.remove} />
        </>
      )}
    </div>
  );
}
