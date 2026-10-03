import { useId } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

/**
 * Pieces shared by the Commerce patterns (Cart, Checkout, OrderReview…):
 * money formatting and the order summary column.
 */

export function formatMoney(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: amount % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 }).format(amount);
}

export interface OrderLine {
  id: string;
  name: string;
  /** Secondary line: term, domain, region… */
  detail?: string;
  /** Price for one unit, for the whole term. */
  unitPrice: number;
  quantity: number;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export function computeTotals(lines: OrderLine[], { taxRate = 0, discount = 0 }: { taxRate?: number; discount?: number } = {}): OrderTotals {
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const discounted = Math.max(subtotal - discount, 0);
  const tax = Math.round(discounted * taxRate * 100) / 100;
  return { subtotal, discount: Math.min(discount, subtotal), tax, total: discounted + tax };
}

export interface OrderSummaryProps extends Omit<React.ComponentProps<'section'>, 'title'> {
  lines: OrderLine[];
  totals: OrderTotals;
  currency?: string;
  title?: string;
  /** Label for the tax row, e.g. "VAT (20%)". */
  taxLabel?: string;
  /** Hide the per-line list (e.g. when the lines are already on screen, as in the Cart). */
  hideLines?: boolean;
  /** Under the total: the main action and any reassurance copy. */
  children?: ReactNode;
}

/**
 * The full cost, upfront: every line, discount, tax and the total, so
 * nobody has to reach the last step to find out what they'll pay. Sits in
 * the side column of Cart and Checkout; sticky on wide screens.
 */
export function OrderSummary({ lines, totals, currency = 'USD', title = 'Order summary', taxLabel = 'Tax', hideLines = false, className, children, ...props }: OrderSummaryProps) {
  const headingId = useId();
  const money = (n: number) => formatMoney(n, currency);
  return (
    <section
      aria-labelledby={headingId}
      className={cn('flex flex-col gap-4 rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-5', className)}
      {...props}
    >
      <h2 id={headingId} className="font-body text-body-l font-semibold text-[var(--color-text-text)]">
        {title}
      </h2>
      {!hideLines && lines.length > 0 && (
        <ul className="flex flex-col gap-3">
          {lines.map((l) => (
            <li key={l.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-body text-body-m text-[var(--color-text-text)]">
                  {l.name}
                  {l.quantity > 1 && <span className="text-[var(--color-text-text-subtler)]"> × {l.quantity}</span>}
                </p>
                {l.detail && <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">{l.detail}</p>}
              </div>
              <span className="shrink-0 font-body text-body-m tabular-nums text-[var(--color-text-text)]">{money(l.unitPrice * l.quantity)}</span>
            </li>
          ))}
        </ul>
      )}
      {!hideLines && lines.length > 0 && <Separator />}
      <dl className="flex flex-col gap-2 font-body text-body-m">
        <SummaryRow term="Subtotal" value={money(totals.subtotal)} />
        {totals.discount > 0 && <SummaryRow term="Discount" value={`−${money(totals.discount)}`} valueClassName="text-[var(--color-text-text-success)]" />}
        <SummaryRow term={taxLabel} value={money(totals.tax)} />
        <Separator className="my-1" />
        <SummaryRow term="Total" value={money(totals.total)} strong />
      </dl>
      {children}
    </section>
  );
}

function SummaryRow({ term, value, strong, valueClassName }: { term: ReactNode; value: ReactNode; strong?: boolean; valueClassName?: string }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-3 text-[var(--color-text-text)]', strong && 'text-body-l font-semibold')}>
      <dt className={strong ? undefined : 'text-[var(--color-text-text-subtle)]'}>{term}</dt>
      <dd className={cn('m-0 tabular-nums', valueClassName)}>{value}</dd>
    </div>
  );
}
