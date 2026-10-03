import { useId, useMemo, useState } from 'react';
import { FilterList, List, ViewGrid, Xmark } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerBody } from '@/components/ui/drawer';
import { EmptyState } from '@/components/ui/empty-state';
import { NumberField } from '@/components/ui/number-field';
import { Radio, RadioGroup } from '@/components/ui/radio';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { TextField } from '@/components/ui/text-field';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ItemCard } from './item-card';
import type { CatalogItem } from './types';

type ListFacet = 'category' | 'vendor' | 'compatibility';
type SortKey = 'relevance' | 'rating' | 'installs' | 'price-asc' | 'newest';

const SORT_LABEL: Record<SortKey, string> = {
  relevance: 'Most relevant',
  rating: 'Highest rated',
  installs: 'Most installed',
  'price-asc': 'Price: low to high',
  newest: 'Newest',
};

const FACET_LABEL: Record<ListFacet, string> = { category: 'Category', vendor: 'Vendor', compatibility: 'Works with' };
/** Values shown before "Show N more". */
const TRUNCATE_AT = 5;
/** Facet group headings: the caps label style of table headers, so they don't blend with the options. */
const FACET_HEADING = 'mb-3 p-0 font-heading text-heading-2xs uppercase tracking-[0.07em] text-[var(--color-text-text-subtler)]';

interface Filters {
  category: string[];
  vendor: string[];
  compatibility: string[];
  pricing: ('free' | 'paid')[];
  priceRange: [number, number] | null;
  minRating: number;
}

const EMPTY: Filters = { category: [], vendor: [], compatibility: [], pricing: [], priceRange: null, minRating: 0 };

export interface FacetedListProps {
  items: CatalogItem[];
  /** Noun for the count: { one: 'extension', many: 'extensions' }. */
  noun?: { one: string; many: string };
  /** Items per "Show more". */
  pageSize?: number;
  getHref?: (item: CatalogItem) => string;
  className?: string;
}

function valuesOf(item: CatalogItem, facet: ListFacet): string[] {
  return facet === 'compatibility' ? item.compatibility : [item[facet]];
}

/** Every filter except `skip`: the base for a facet's own option counts. */
function matches(item: CatalogItem, f: Filters, skip?: keyof Filters): boolean {
  for (const facet of ['category', 'vendor', 'compatibility'] as const) {
    if (facet === skip || !f[facet].length) continue;
    if (!valuesOf(item, facet).some((v) => f[facet].includes(v))) return false;
  }
  if (skip !== 'pricing' && f.pricing.length && !f.pricing.includes(item.price === 0 ? 'free' : 'paid')) return false;
  if (skip !== 'priceRange' && f.priceRange && (item.price < f.priceRange[0] || item.price > f.priceRange[1])) return false;
  if (skip !== 'minRating' && f.minRating && item.rating < f.minRating) return false;
  return true;
}

/**
 * A browsable, filterable list. Filters apply as you pick them (no Apply
 * button), every value shows how many results it leads to, values within a
 * facet combine with OR, long facets are truncated with a search, numeric
 * ranges can be typed as well as dragged, and the applied filters sit
 * above the results as removable chips. Results load in pages with "Show
 * more" and a count — no endless scroll. Under ~900px of its own width the
 * filters move into a drawer with a sticky "Show N results".
 */
export function FacetedList({ items, noun = { one: 'extension', many: 'extensions' }, pageSize = 9, getHref, className }: FacetedListProps) {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [sort, setSort] = useState<SortKey>('relevance');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [visible, setVisible] = useState(pageSize);
  const headingId = useId();

  const maxPrice = Math.max(...items.map((i) => i.price), 1);
  const results = useMemo(() => {
    const filtered = items.filter((i) => matches(i, filters));
    const sorted = [...filtered];
    if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating);
    if (sort === 'installs') sorted.sort((a, b) => b.installs - a.installs);
    if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    if (sort === 'newest') sorted.sort((a, b) => b.added.localeCompare(a.added));
    return sorted;
  }, [items, filters, sort]);

  const update = (next: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...next }));
    setVisible(pageSize);
  };
  const toggle = (facet: ListFacet | 'pricing', value: string) => {
    const list = filters[facet] as string[];
    update({ [facet]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] } as Partial<Filters>);
  };

  const chips: { key: string; label: string; remove: () => void }[] = [
    ...(['category', 'vendor', 'compatibility'] as const).flatMap((facet) => filters[facet].map((v) => ({ key: `${facet}-${v}`, label: v, remove: () => toggle(facet, v) }))),
    ...filters.pricing.map((v) => ({ key: `pricing-${v}`, label: v === 'free' ? 'Free' : 'Paid', remove: () => toggle('pricing', v) })),
    ...(filters.priceRange ? [{ key: 'range', label: `$${filters.priceRange[0]}–$${filters.priceRange[1]} / mo`, remove: () => update({ priceRange: null }) }] : []),
    ...(filters.minRating ? [{ key: 'rating', label: `${filters.minRating}★ & up`, remove: () => update({ minRating: 0 }) }] : []),
  ];
  const clearAll = () => update(EMPTY);

  const panel = (
    <FilterPanel items={items} filters={filters} toggle={toggle} update={update} maxPrice={maxPrice} />
  );

  return (
    <section aria-labelledby={headingId} className={cn('@container w-full', className)}>
      <h2 id={headingId} className="sr-only">
        {`${noun.many[0].toUpperCase()}${noun.many.slice(1)}`}
      </h2>
      <div className="flex gap-8">
        <aside aria-label="Filters" className="hidden w-64 shrink-0 @4xl:block">
          {panel}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-body text-body-m text-[var(--color-text-text-subtle)]" aria-live="polite" aria-atomic="true">
              <span className="font-semibold tabular-nums text-[var(--color-text-text)]">{results.length}</span> {results.length === 1 ? noun.one : noun.many}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Drawer direction="right">
                <DrawerTrigger asChild>
                  <Button appearance="outlined" tone="secondary" size="md" leftIcon={<FilterList />} className="@4xl:hidden">
                    {chips.length ? `Filters (${chips.length})` : 'Filters'}
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Filters</DrawerTitle>
                    <DrawerDescription>Results update as you choose.</DrawerDescription>
                  </DrawerHeader>
                  <DrawerBody>{panel}</DrawerBody>
                  {/* Sticky: always one tap from the results, with the live count. */}
                  <DrawerFooter className="sticky bottom-0 border-t border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]">
                    <DrawerTrigger asChild>
                      <Button appearance="filled" tone="primary" size="xl" fullWidth>
                        {`Show ${results.length} ${results.length === 1 ? noun.one : noun.many}`}
                      </Button>
                    </DrawerTrigger>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger aria-label="Sort by" widthSize="md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {SORT_LABEL[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ToggleGroup type="single" appearance="outlined" value={layout} onValueChange={(v) => v && setLayout(v as 'grid' | 'list')} aria-label="Layout">
                <ToggleGroupItem value="grid" aria-label="Grid">
                  <ViewGrid />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="List">
                  <List />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2" aria-label="Applied filters" role="group">
              {chips.map((c) => (
                <Button key={c.key} appearance="tonal" tone="secondary" size="sm" rightIcon={<Xmark />} onClick={c.remove} aria-label={`Remove filter: ${c.label}`}>
                  {c.label}
                </Button>
              ))}
              <Button appearance="ghost" tone="secondary" size="sm" onClick={clearAll}>
                Clear all
              </Button>
            </div>
          )}

          {results.length === 0 ? (
            <EmptyState
              title={`No ${noun.many} match`}
              description="Remove a filter or two to see more."
              action={
                <Button appearance="outlined" tone="secondary" onClick={clearAll}>
                  Clear all filters
                </Button>
              }
            />
          ) : (
            <>
              <ul className={cn('grid gap-4', layout === 'grid' ? '@xl:grid-cols-2 @5xl:grid-cols-3' : 'grid-cols-1')}>
                {results.slice(0, visible).map((item) => (
                  <li key={item.id}>
                    <ItemCard item={item} layout={layout} href={getHref?.(item)} />
                  </li>
                ))}
              </ul>
              <div className="flex flex-col items-center gap-2 pt-2">
                <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">{`Showing ${Math.min(visible, results.length)} of ${results.length}`}</p>
                {visible < results.length && (
                  <Button appearance="outlined" tone="secondary" onClick={() => setVisible((v) => v + pageSize)}>
                    {`Show ${Math.min(pageSize, results.length - visible)} more`}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function FilterPanel({ items, filters, toggle, update, maxPrice }: { items: CatalogItem[]; filters: Filters; toggle: (facet: ListFacet | 'pricing', value: string) => void; update: (f: Partial<Filters>) => void; maxPrice: number }) {
  const ratingId = useId();
  return (
    <div className="flex flex-col gap-5">
      {(['category', 'vendor', 'compatibility'] as const).map((facet, i) => (
        <div key={facet} className="flex flex-col gap-5">
          {i > 0 && <Separator />}
          <ListFacetGroup facet={facet} items={items} filters={filters} toggle={toggle} />
        </div>
      ))}
      <Separator />
      <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
        <legend className={FACET_HEADING}>Price</legend>
        {(['free', 'paid'] as const).map((p) => {
          const count = items.filter((i) => matches(i, { ...filters, pricing: [p] }, undefined)).length;
          return <FacetOption key={p} label={p === 'free' ? 'Free' : 'Paid'} count={count} checked={filters.pricing.includes(p)} onChange={() => toggle('pricing', p)} />;
        })}
        <PriceRange max={maxPrice} value={filters.priceRange} onChange={(r) => update({ priceRange: r })} />
      </fieldset>
      <Separator />
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend id={ratingId} className={FACET_HEADING}>
          Rating
        </legend>
        <RadioGroup aria-labelledby={ratingId} value={String(filters.minRating)} onValueChange={(v) => update({ minRating: Number(v) })}>
          {[0, 4.5, 4, 3].map((r) => (
            <Radio key={r} value={String(r)} label={r === 0 ? 'Any rating' : `${r} ★ & up`} />
          ))}
        </RadioGroup>
      </fieldset>
    </div>
  );
}

function ListFacetGroup({ facet, items, filters, toggle }: { facet: ListFacet; items: CatalogItem[]; filters: Filters; toggle: (facet: ListFacet, value: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const searchId = useId();
  const base = items.filter((i) => matches(i, filters, facet));
  // Options sorted by how many results they lead to (most useful first),
  // selected ones always kept visible.
  const options = [...new Set(items.flatMap((i) => valuesOf(i, facet)))]
    .map((value) => ({ value, count: base.filter((i) => valuesOf(i, facet).includes(value)).length }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
  const searchable = options.length > 8;
  const filtered = query ? options.filter((o) => o.value.toLowerCase().includes(query.toLowerCase())) : options;
  const shown = expanded || query ? filtered : filtered.filter((o, i) => i < TRUNCATE_AT || filters[facet].includes(o.value));
  const hidden = filtered.length - shown.length;

  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
      <legend className={FACET_HEADING}>{FACET_LABEL[facet]}</legend>
      {searchable && (
        <TextField
          id={searchId}
          aria-label={`Search ${FACET_LABEL[facet].toLowerCase()}`}
          placeholder={`Search ${options.length} ${FACET_LABEL[facet].toLowerCase()}s`}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          heightSize="sm"
          widthSize="full"
          className="mb-1"
        />
      )}
      {shown.map((o) => (
        <FacetOption key={o.value} label={o.value} count={o.count} checked={filters[facet].includes(o.value)} onChange={() => toggle(facet, o.value)} />
      ))}
      {query && !filtered.length && <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">No matches.</p>}
      {(hidden > 0 || (expanded && !query && options.length > TRUNCATE_AT)) && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="self-start rounded-[var(--size-border-radius-border-radius-sm)] font-body text-body-s font-medium text-[var(--color-text-text-link)] underline-offset-4 outline-none hover:underline focus-visible:focus-ring"
        >
          {expanded ? 'Show less' : `Show ${hidden} more`}
        </button>
      )}
    </fieldset>
  );
}

function FacetOption({ label, count, checked, onChange }: { label: string; count: number; checked: boolean; onChange: () => void }) {
  const id = useId();
  const empty = count === 0 && !checked;
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <Checkbox id={id} checked={checked} onCheckedChange={onChange} disabled={empty} aria-describedby={`${id}-count`} />
        <label htmlFor={id} className={cn('min-w-0 cursor-pointer truncate font-body text-body-m', empty ? 'text-[var(--color-text-text-disabled)]' : 'text-[var(--color-text-text)]')}>
          {label}
        </label>
      </div>
      <span id={`${id}-count`} className="shrink-0 font-body text-body-s tabular-nums text-[var(--color-text-text-subtler)]">
        <span className="sr-only">{count === 1 ? '1 result' : `${count} results`}</span>
        <span aria-hidden="true">{count}</span>
      </span>
    </div>
  );
}

/** Slider plus typed inputs: dragging is imprecise, typing an exact bound is not. */
function PriceRange({ max, value, onChange }: { max: number; value: [number, number] | null; onChange: (r: [number, number] | null) => void }) {
  const current = value ?? [0, max];
  const set = (r: [number, number]) => onChange(r[0] === 0 && r[1] === max ? null : r);
  return (
    <div className="mt-2 flex flex-col gap-3">
      <Slider min={0} max={max} step={1} value={current} onValueChange={(v) => set([v[0], v[1]] as [number, number])} aria-label="Price per month" formatValue={(v) => `$${v}`} />
      <div className="flex items-center gap-2">
        <NumberField aria-label="Minimum price per month" value={current[0]} min={0} max={current[1]} onValueChange={(v) => set([v, current[1]])} heightSize="sm" widthSize="full" />
        <span aria-hidden="true" className="text-[var(--color-text-text-subtler)]">–</span>
        <NumberField aria-label="Maximum price per month" value={current[1]} min={current[0]} max={max} onValueChange={(v) => set([current[0], v])} heightSize="sm" widthSize="full" />
      </div>
    </div>
  );
}
