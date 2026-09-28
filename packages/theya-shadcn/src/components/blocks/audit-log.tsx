import { useState, useMemo, useId } from 'react';
import type { ReactNode } from 'react';
import { type DateRange } from 'react-day-picker';
import { Search, Activity, LogIn, CloudUpload, CreditCard, ShieldCheck, UserPlus, Database, Settings } from 'iconoir-react';
import { Button } from '@/components/ui/button';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Combobox } from '@/components/ui/combobox';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { EmptyState } from '@/components/ui/empty-state';
import { DotSeparator } from '@/components/ui/dot-separator';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { TableSkeletonRows } from '@/components/ui/table-skeleton';

/**
 * A reusable, filterable audit-log/activity-feed screen. Each event
 * pairs an actor + an action + an optional target with a mono
 * absolute timestamp; a category icon chip and a category Badge
 * carry the type (never color-alone). A toolbar gives search, a
 * category multi-select facet, and a date-range filter; loading
 * shows skeleton rows and the empty state branches filtered-vs-zero.
 *
 * Timestamps are formatted with a fixed locale + UTC so server and
 * client render identically. Every prop is optional and defaults to
 * a realistic seeded feed, so `<AuditLog/>` renders standalone.
 *
 * Simplified vs the reference: no dedicated MultiSelect component
 * exists here — the category facet is built on Combobox in multiple
 * mode instead.
 */
export interface AuditEvent {
  id: string;
  /** ISO datetime; shown as a mono absolute time. */
  at: string;
  action: string;
  /** Matches a `categories` option (drives the icon + badge). */
  category: string;
  actor: string;
  /** The affected resource (domain, email, resource name, etc). */
  target?: string;
  ip?: string;
}

export interface AuditCategoryMeta {
  value: string;
  label: string;
  badge?: BadgeTone;
  icon?: ReactNode;
}

const DEFAULT_CATEGORIES: AuditCategoryMeta[] = [
  { value: 'auth', label: 'Authentication', badge: 'neutral', icon: <LogIn /> },
  { value: 'deploy', label: 'Deploys', badge: 'primary', icon: <CloudUpload /> },
  { value: 'billing', label: 'Billing', badge: 'info', icon: <CreditCard /> },
  { value: 'security', label: 'Security', badge: 'warning', icon: <ShieldCheck /> },
  { value: 'member', label: 'Members', badge: 'neutral', icon: <UserPlus /> },
  { value: 'data', label: 'Data', badge: 'neutral', icon: <Database /> },
  { value: 'settings', label: 'Settings', badge: 'neutral', icon: <Settings /> },
];

const SEEDED_EVENTS: AuditEvent[] = [
  { id: 'ev-1', at: '2026-07-14T14:32:00Z', action: 'Signed in', category: 'auth', actor: 'Alex Morgan', ip: '203.0.113.9' },
  { id: 'ev-2', at: '2026-07-14T13:58:00Z', action: 'Deployed site', category: 'deploy', actor: 'Automation', target: 'shop.seashell.dev', ip: '198.51.100.7' },
  { id: 'ev-3', at: '2026-07-14T11:10:00Z', action: 'Changed member role', category: 'member', actor: 'Jordan Kim', target: 'priya@seashell.dev', ip: '203.0.113.24' },
  { id: 'ev-4', at: '2026-07-13T18:04:00Z', action: 'Updated payment method', category: 'billing', actor: 'Alex Morgan', ip: '203.0.113.24' },
  { id: 'ev-5', at: '2026-07-13T09:41:00Z', action: 'Revoked API key', category: 'security', actor: 'Alex Morgan', target: 'legacy-script', ip: '203.0.113.24' },
  { id: 'ev-6', at: '2026-07-12T22:15:00Z', action: 'Created database', category: 'data', actor: 'Priya Nair', target: 'acme_prod', ip: '198.51.100.20' },
  { id: 'ev-7', at: '2026-07-12T16:47:00Z', action: 'Invited teammate', category: 'member', actor: 'Jordan Kim', target: 'dana@contractor.dev', ip: '203.0.113.24' },
  { id: 'ev-8', at: '2026-07-11T08:03:00Z', action: 'Updated account settings', category: 'settings', actor: 'Alex Morgan', ip: '203.0.113.9' },
];

function formatAt(iso: string): string {
  return new Date(iso).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' });
}

function utcDay(iso: string): number {
  const d = new Date(iso);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function inRange(iso: string, range: DateRange | undefined): boolean {
  if (!range?.from) return true;
  const day = utcDay(iso);
  const from = Date.UTC(range.from.getFullYear(), range.from.getMonth(), range.from.getDate());
  const to = range.to ? Date.UTC(range.to.getFullYear(), range.to.getMonth(), range.to.getDate()) : from;
  return day >= from && day <= to;
}

export interface AuditLogProps {
  title?: string;
  description?: ReactNode;
  /** The events, newest first. Defaults to a seeded feed. */
  events?: AuditEvent[];
  categories?: AuditCategoryMeta[];
  loading?: boolean;
  searchPlaceholder?: string;
}

export function AuditLog({
  title = 'Audit log',
  description = 'Every action taken on this account. Filter by category or date, or search by actor, action or target.',
  events: eventsProp,
  categories = DEFAULT_CATEGORIES,
  loading = false,
  searchPlaceholder = 'Search events',
}: AuditLogProps) {
  const events = eventsProp ?? SEEDED_EVENTS;
  const [query, setQuery] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const searchId = useId();

  const catMap = useMemo(() => {
    const map = new Map<string, AuditCategoryMeta>();
    for (const c of categories) map.set(c.value, c);
    return map;
  }, [categories]);
  const catOf = (value: string): AuditCategoryMeta => catMap.get(value) ?? { value, label: value, badge: 'neutral' };

  const catOptions = useMemo(() => {
    const present = new Set(events.map((e) => e.category));
    return categories.filter((c) => present.has(c.value)).map((c) => ({ value: c.value, label: c.label }));
  }, [categories, events]);

  const q = query.trim().toLowerCase();
  const filtered = events.filter((e) => {
    if (selectedCats.length && !selectedCats.includes(e.category)) return false;
    if (!inRange(e.at, range)) return false;
    if (!q) return true;
    return e.action.toLowerCase().includes(q) || e.actor.toLowerCase().includes(q) || (e.target?.toLowerCase().includes(q) ?? false) || catOf(e.category).label.toLowerCase().includes(q);
  });

  const hasFilters = q.length > 0 || selectedCats.length > 0 || !!range?.from;
  const clearFilters = () => {
    setQuery('');
    setSelectedCats([]);
    setRange(undefined);
  };

  return (
    <section className="flex flex-col gap-4">
      {(title || description) && (
        <header className="min-w-0">
          {title && <h2 className="font-body text-heading-s font-semibold text-[var(--color-text-text)]">{title}</h2>}
          {description && <p className="mt-1 max-w-2xl font-body text-body-s text-[var(--color-text-text-subtler)]">{description}</p>}
        </header>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1 sm:max-w-[17.5rem]">
            <Label htmlFor={searchId} className="sr-only">
              Search events by actor, action or target
            </Label>
            <InputGroup>
              <InputGroupAddon position="start" divider={false}>
                <Search />
              </InputGroupAddon>
              <InputGroupInput id={searchId} type="search" placeholder={searchPlaceholder} autoCapitalize="none" autoCorrect="off" spellCheck={false} value={query} onChange={(e) => setQuery(e.target.value)} />
            </InputGroup>
          </div>
          {catOptions.length > 0 && (
            <div className="w-full sm:w-56">
              <Combobox multiple options={catOptions} value={selectedCats} onValueChange={(v) => setSelectedCats(v as string[])} placeholder="All categories" aria-label="Filter by category" />
            </div>
          )}
          <div className="w-full sm:w-auto">
            <DateRangePicker value={range} onChange={setRange} placeholder="Any date" aria-label="Filter by date range" />
          </div>
          {hasFilters && (
            <Button appearance="ghost" onClick={clearFilters} className="max-md:h-11">
              Clear filters
            </Button>
          )}
        </div>

        <Table aria-label={title || 'Audit log'}>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[10.75rem]">When</TableHead>
                <TableHead>Event</TableHead>
                <TableHead className="hidden sm:table-cell">Actor</TableHead>
                <TableHead className="hidden font-normal md:table-cell">Source IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody aria-busy={loading || undefined}>
              {loading ? (
                <TableSkeletonRows rows={6} columns={4} />
              ) : filtered.length ? (
                filtered.map((ev) => <EventRow key={ev.id} event={ev} category={catOf(ev.category)} />)
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="p-0">
                    {events.length === 0 ? (
                      <EmptyState icon={<Activity />} title="No activity yet" titleAs="h3" description="Actions taken on this account will appear here." />
                    ) : (
                      <EmptyState
                        icon={<Search />}
                        title="No events match your filters"
                        titleAs="h3"
                        description="Try a different search, category or date range."
                        action={
                          <Button appearance="outlined" tone="secondary" onClick={clearFilters}>
                            Clear filters
                          </Button>
                        }
                      />
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
        </Table>

        <p className="font-body text-body-s text-[var(--color-text-text-subtler)]" aria-live="polite" aria-atomic="true">
          {loading ? (
            'Loading events…'
          ) : (
            <>
              <span className="tabular-nums">{filtered.length}</span> {filtered.length === 1 ? 'event' : 'events'}
              {hasFilters ? ' match your filters' : ''}
            </>
          )}
        </p>
      </div>
    </section>
  );
}

function EventRow({ event, category }: { event: AuditEvent; category: AuditCategoryMeta }) {
  return (
    // Real data row — unlike the header/empty-state rows above, this one
    // should hover (Мария: "должны ховериться строки в таблице"). It had
    // the same `hover:bg-transparent` override as those two, apparently
    // copy-pasted along with them rather than intentionally disabling
    // hover on actual events — removed so it falls back to TableRow's own
    // default hover fill.
    <TableRow>
      <TableCell className="whitespace-nowrap align-top text-body-m text-[var(--color-text-text-subtler)]">{formatAt(event.at)}</TableCell>
      <TableCell className="align-top">
        <span className="flex items-start gap-3">
          <span aria-hidden="true" className="mt-0.5 grid size-7 shrink-0 place-content-center rounded-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-[var(--color-icon-icon-subtle)] [&_svg]:size-4">
            {category.icon ?? <Activity />}
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{event.action}</span>
              <Badge tone={category.badge ?? 'neutral'}>{category.label}</Badge>
            </span>
            {event.target && <span className="truncate text-body-s text-[var(--color-text-text-subtler)]">{event.target}</span>}
            <span className="flex flex-wrap items-center gap-x-2 font-body text-body-xs text-[var(--color-text-text-subtler)] sm:hidden">
              <span>{event.actor}</span>
              {event.ip && (
                <>
                  <DotSeparator className="mx-0" />
                  <span className="font-mono">{event.ip}</span>
                </>
              )}
            </span>
          </span>
        </span>
      </TableCell>
      <TableCell className="hidden align-top sm:table-cell">{event.actor}</TableCell>
      <TableCell className="hidden align-top font-mono text-[var(--color-text-text-subtler)] md:table-cell">{event.ip ?? '-'}</TableCell>
    </TableRow>
  );
}
