'use client';

import { useId, useMemo, useState } from 'react';
import { Bookmark, Xmark } from 'iconoir-react';
import { cn } from '../../../lib/utils';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { EmptyState } from '../../ui/empty-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { undoToast } from '../../ui/undo-toast';

export interface SavedItem {
  id: string;
  title: string;
  subtitle?: string;
  /** Current price per month; null when it can't be bought now. */
  price: number | null;
  /** Price when it was saved — a drop is called out. */
  savedPrice?: number;
  savedAt: string;
  /** Display date for savedAt. */
  savedLabel: string;
  href: string;
  image?: string;
}

export interface SavedItemsProps {
  items: SavedItem[];
  /** The main thing to do with saved items. */
  primaryAction?: { label: string; onAction: (ids: string[]) => void };
  onRemove?: (ids: string[]) => void;
  currency?: string;
  className?: string;
}

type Sort = 'recent' | 'price-asc' | 'price-desc';

/**
 * A saved list people come back to: what changed since they saved it is
 * said on the item (price dropped, no longer available), items can be
 * acted on one by one or in bulk, and removing is undoable instead of
 * confirmed — it's cheap to redo, so it shouldn't cost a dialog.
 */
export function SavedItems({ items: initial, primaryAction, onRemove, currency = 'USD', className }: SavedItemsProps) {
  const [items, setItems] = useState(initial);
  const [selected, setSelected] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>('recent');
  const uid = useId();
  const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);

  const sorted = useMemo(() => {
    const list = [...items];
    if (sort === 'recent') return list.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    // Unavailable items sink to the bottom in both price orders.
    const p = (i: SavedItem) => i.price ?? (sort === 'price-asc' ? Infinity : -Infinity);
    return list.sort((a, b) => (sort === 'price-asc' ? p(a) - p(b) : p(b) - p(a)));
  }, [items, sort]);

  const available = items.filter((i) => i.price !== null);
  const allSelected = selected.length > 0 && selected.length === items.length;

  const remove = (ids: string[]) => {
    const removed = items.filter((i) => ids.includes(i.id));
    setItems((cur) => cur.filter((i) => !ids.includes(i.id)));
    setSelected((cur) => cur.filter((id) => !ids.includes(id)));
    undoToast({
      title: ids.length === 1 ? `Removed “${removed[0].title}”` : `Removed ${ids.length} items`,
      onUndo: () => setItems((cur) => [...cur, ...removed]),
      onCommit: () => onRemove?.(ids),
    });
  };

  if (!items.length)
    return (
      <EmptyState
        className={className}
        icon={<Bookmark />}
        title="Nothing saved yet"
        description="Save plans and add-ons to compare them later or buy them together. Saved items stay here until you remove them."
        action={
          <Button asChild appearance="outlined" tone="secondary">
            <a href="#catalog">Browse the catalog</a>
          </Button>
        }
      />
    );

  return (
    <section aria-labelledby={`${uid}-h`} className={cn('flex w-full flex-col gap-4', className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id={`${uid}-h`} className="font-body text-heading-s font-semibold text-[var(--color-text-text)]">
          {`Saved (${items.length})`}
        </h2>
        <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
          <SelectTrigger aria-label="Sort saved items" widthSize="md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently saved</SelectItem>
            <SelectItem value="price-asc">Price: low to high</SelectItem>
            <SelectItem value="price-desc">Price: high to low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk bar: always visible, so selecting has an obvious purpose. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[var(--size-border-radius-border-radius-xl)] bg-[var(--color-bg-neutral-bg-neutral-subtler)] px-3 py-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id={`${uid}-all`}
            checked={allSelected ? true : selected.length ? 'indeterminate' : false}
            onCheckedChange={(v) => setSelected(v === true ? items.map((i) => i.id) : [])}
          />
          <label htmlFor={`${uid}-all`} className="cursor-pointer font-body text-body-m text-[var(--color-text-text)]">
            {selected.length ? `${selected.length} selected` : 'Select all'}
          </label>
        </div>
        <div className="ms-auto flex flex-wrap gap-2">
          {primaryAction && (
            <Button
              appearance="filled"
              tone="primary"
              size="md"
              softDisabled={!selected.some((id) => available.some((a) => a.id === id))}
              onClick={() => {
                const ids = selected.filter((id) => available.some((a) => a.id === id));
                if (ids.length) primaryAction.onAction(ids);
              }}
            >
              {selected.length ? `${primaryAction.label} (${selected.filter((id) => available.some((a) => a.id === id)).length})` : primaryAction.label}
            </Button>
          )}
          <Button appearance="outlined" tone="secondary" size="md" softDisabled={!selected.length} onClick={() => remove(selected)}>
            {selected.length ? `Remove (${selected.length})` : 'Remove'}
          </Button>
        </div>
      </div>

      <ul className="flex flex-col divide-y divide-[var(--color-border-border-subtler)] rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]">
        {sorted.map((item) => {
          const gone = item.price === null;
          const dropped = !gone && item.savedPrice !== undefined && item.price! < item.savedPrice;
          const checkId = `${uid}-${item.id}`;
          return (
            <li key={item.id} className="flex items-start gap-3 p-4">
              <Checkbox
                id={checkId}
                className="mt-0.5"
                checked={selected.includes(item.id)}
                onCheckedChange={(v) => setSelected((cur) => (v === true ? [...cur, item.id] : cur.filter((x) => x !== item.id)))}
                aria-label={`Select ${item.title}`}
              />
              {item.image && (
                <span className="size-14 shrink-0 overflow-hidden rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] in-data-[theme=dark]:bg-[var(--color-white)]">
                  <img src={item.image} alt="" className={cn('size-full object-contain p-1.5', gone && 'opacity-60')} />
                </span>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <a
                  href={item.href}
                  className={cn(
                    'self-start rounded-[var(--size-border-radius-border-radius-sm)] font-body text-body-m font-medium underline-offset-4 outline-none hover:underline focus-visible:focus-ring',
                    gone ? 'text-[var(--color-text-text-subtle)]' : 'text-[var(--color-text-text)]',
                  )}
                >
                  {item.title}
                </a>
                {item.subtitle && <p className="font-body text-body-s text-[var(--color-text-text-subtle)]">{item.subtitle}</p>}
                {/* Price sits in the text column, under the name — read together, aligned to it. */}
                {!gone && <p className="font-body text-body-m font-semibold tabular-nums text-[var(--color-text-text)]">{`${money(item.price!)} / mo`}</p>}
                <div className="flex flex-wrap items-center gap-2">
                  {gone && <Badge tone="neutral">No longer available</Badge>}
                  {dropped && <Badge tone="success">{`Price dropped from ${money(item.savedPrice!)}`}</Badge>}
                  <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">{`Saved ${item.savedLabel}`}</span>
                </div>
              </div>
              {/* Remove in the top-right corner, where people look for it. */}
              <Button appearance="ghost" tone="secondary" size="sm" iconOnly leftIcon={<Xmark />} aria-label={`Remove ${item.title}`} onClick={() => remove([item.id])} className="-me-1 -mt-1 shrink-0" />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
