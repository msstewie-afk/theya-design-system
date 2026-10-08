'use client';

import { useId, useMemo, useState } from 'react';
import { Download, NavArrowDown, Refresh, Search } from 'iconoir-react';
import { cn } from '../../../lib/utils';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { EmptyState } from '../../ui/empty-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { TextField } from '../../ui/text-field';
import type { StatusTone } from '../../ui/status-dot';

export type OrderStatus = 'completed' | 'processing' | 'failed' | 'refunded' | 'cancelled';

export interface Order {
  id: string;
  number: string;
  /** ISO date. */
  date: string;
  dateLabel: string;
  lines: { name: string; detail?: string; amount: number }[];
  total: number;
  status: OrderStatus;
  /** Payment method shown in the details. */
  payment: string;
  invoiceHref?: string;
  /** Link to live status for orders still in progress. */
  trackHref?: string;
}

export interface OrderHistoryProps {
  orders: Order[];
  pageSize?: number;
  onReorder?: (order: Order) => void;
  currency?: string;
  className?: string;
}

const STATUS: Record<OrderStatus, { label: string; tone: StatusTone }> = {
  completed: { label: 'Completed', tone: 'success' },
  processing: { label: 'In progress', tone: 'info' },
  failed: { label: 'Payment failed', tone: 'danger' },
  refunded: { label: 'Refunded', tone: 'neutral' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

/**
 * Past orders people look up for a reason: to get an invoice, check what
 * they paid for, see what's still in progress or buy the same again. So
 * each row says what was bought (not just a number), the total and the
 * status in words; details open in place; the invoice and "Buy again" are
 * on the row; search covers order numbers and item names.
 */
export function OrderHistory({ orders, pageSize = 5, onReorder, currency = 'USD', className }: OrderHistoryProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const [open, setOpen] = useState<string[]>([]);
  const [visible, setVisible] = useState(pageSize);
  const uid = useId();
  const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...orders]
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter((o) => status === 'all' || o.status === status)
      .filter((o) => !q || o.number.toLowerCase().includes(q) || o.lines.some((l) => l.name.toLowerCase().includes(q)));
  }, [orders, query, status]);

  return (
    <section aria-labelledby={`${uid}-h`} className={cn('@container flex w-full flex-col gap-4', className)}>
      <h2 id={`${uid}-h`} className="font-body text-heading-s font-semibold text-[var(--color-text-text)]">
        Orders
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        <TextField
          type="search"
          aria-label="Search orders"
          placeholder="Order number or item"
          leftIcon={<Search />}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(pageSize);
          }}
          widthSize="lg"
          className="[&::-webkit-search-cancel-button]:hidden"
        />
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as OrderStatus | 'all');
            setVisible(pageSize);
          }}
        >
          <SelectTrigger aria-label="Status" widthSize="md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(Object.keys(STATUS) as OrderStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p aria-live="polite" className="ms-auto font-body text-body-s text-[var(--color-text-text-subtler)]">
          {`${filtered.length} ${filtered.length === 1 ? 'order' : 'orders'}`}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No orders match"
          description={query ? `Nothing found for “${query}”. Check the order number, or search by an item name.` : 'No orders with this status.'}
          action={
            <Button
              appearance="outlined"
              tone="secondary"
              onClick={() => {
                setQuery('');
                setStatus('all');
              }}
            >
              Show all orders
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col divide-y divide-[var(--color-border-border-subtler)] rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]">
          {filtered.slice(0, visible).map((o) => {
            const isOpen = open.includes(o.id);
            const detailsId = `${uid}-${o.id}`;
            const summary = o.lines.length > 1 ? `${o.lines[0].name} + ${o.lines.length - 1} more` : o.lines[0].name;
            return (
              <li key={o.id} className="flex flex-col">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 p-4 @2xl:grid-cols-[minmax(0,1fr)_7rem_9rem_auto]">
                  <div className="min-w-0">
                    <p className="truncate font-body text-body-m font-medium text-[var(--color-text-text)]">{summary}</p>
                    <p className="font-body text-body-s text-[var(--color-text-text-subtle)]">
                      <span className="font-mono">{o.number}</span>
                      {` · ${o.dateLabel}`}
                    </p>
                  </div>
                  <p className="text-end font-body text-body-m font-semibold tabular-nums text-[var(--color-text-text)] @2xl:order-none">{money(o.total)}</p>
                  <div className="@2xl:justify-self-start">
                    <Badge tone={STATUS[o.status].tone}>{STATUS[o.status].label}</Badge>
                  </div>
                  <Button
                    appearance="ghost"
                    tone="secondary"
                    size="md"
                    rightIcon={<NavArrowDown className={cn('transition-transform duration-standard ease-enter motion-reduce:transition-none', isOpen && 'rotate-180')} />}
                    aria-expanded={isOpen}
                    aria-controls={detailsId}
                    onClick={() => setOpen((cur) => (isOpen ? cur.filter((x) => x !== o.id) : [...cur, o.id]))}
                    className="justify-self-end"
                  >
                    Details
                    <span className="sr-only">{` for order ${o.number}`}</span>
                  </Button>
                </div>
                <div id={detailsId} hidden={!isOpen} className="border-t border-solid border-[var(--color-border-border-subtler)] bg-[var(--color-bg-neutral-bg-neutral-subtler)] px-4 py-4">
                  <div className="flex flex-col gap-4 @2xl:flex-row @2xl:items-start @2xl:justify-between">
                    <dl className="flex min-w-0 max-w-xl flex-1 flex-col gap-2">
                      {o.lines.map((l, i) => (
                        <div key={i} className="flex items-baseline justify-between gap-4">
                          <dt className="min-w-0 font-body text-body-m text-[var(--color-text-text)]">
                            {l.name}
                            {l.detail && <span className="block font-body text-body-s text-[var(--color-text-text-subtle)]">{l.detail}</span>}
                          </dt>
                          <dd className="m-0 font-body text-body-m tabular-nums text-[var(--color-text-text)]">{money(l.amount)}</dd>
                        </div>
                      ))}
                      <div className="flex items-baseline justify-between gap-4 border-t border-solid border-[var(--color-border-border-subtle)] pt-2">
                        <dt className="font-body text-body-m font-semibold text-[var(--color-text-text)]">Total</dt>
                        <dd className="m-0 font-body text-body-m font-semibold tabular-nums text-[var(--color-text-text)]">{money(o.total)}</dd>
                      </div>
                      <div className="flex items-baseline justify-between gap-4">
                        <dt className="font-body text-body-s text-[var(--color-text-text-subtle)]">Paid with</dt>
                        <dd className="m-0 font-body text-body-s text-[var(--color-text-text-subtle)]">{o.payment}</dd>
                      </div>
                    </dl>
                    <div className="flex flex-wrap gap-2">
                      {o.trackHref && (
                        <Button asChild appearance="filled" tone="primary" size="md">
                          <a href={o.trackHref}>Track progress</a>
                        </Button>
                      )}
                      {o.invoiceHref && (
                        <Button asChild appearance="outlined" tone="secondary" size="md">
                          {/* asChild ignores leftIcon: the icon goes inside the link. */}
                          <a href={o.invoiceHref} download>
                            <Download aria-hidden="true" />
                            Invoice (PDF)
                          </a>
                        </Button>
                      )}
                      {onReorder && o.status !== 'processing' && (
                        <Button appearance="outlined" tone="secondary" size="md" leftIcon={<Refresh />} onClick={() => onReorder(o)}>
                          Buy again
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {visible < filtered.length && (
        <div className="flex flex-col items-center gap-2">
          <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">{`Showing ${visible} of ${filtered.length}`}</p>
          <Button appearance="outlined" tone="secondary" onClick={() => setVisible((v) => v + pageSize)}>
            {`Show ${Math.min(pageSize, filtered.length - visible)} more`}
          </Button>
        </div>
      )}
    </section>
  );
}
