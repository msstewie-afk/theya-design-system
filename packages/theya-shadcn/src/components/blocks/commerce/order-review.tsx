import { useId } from 'react';
import type { ReactNode } from 'react';
import { Lock } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from '@/components/ui/description-list';
import { Separator } from '@/components/ui/separator';
import { OrderSummary, formatMoney, withDots, type OrderLine, type OrderTotals } from './shared';

export interface ReviewSection {
  id: string;
  title: string;
  rows: { term: string; value: ReactNode }[];
  /** "Edit" for this group — should land on exactly this information and come back here after. */
  onEdit?: () => void;
}

export interface OrderReviewProps {
  sections: ReviewSection[];
  lines: OrderLine[];
  totals: OrderTotals;
  currency?: string;
  taxLabel?: string;
  onPlaceOrder?: () => void;
  /** Spinner on the pay button while the charge runs. */
  placing?: boolean;
  /** Small print under the button: terms, renewal. */
  legal?: ReactNode;
  className?: string;
}

/**
 * Everything about the order on one screen before money moves. Each group
 * has its own "Edit", the heading and the button say this is the step that
 * charges (so nobody mistakes it for a receipt), and the button names the
 * amount: "Pay $448.80".
 */
export function OrderReview({ sections, lines, totals, currency = 'USD', taxLabel, onPlaceOrder, placing = false, legal, className }: OrderReviewProps) {
  const headingId = useId();
  return (
    <div className={cn('grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start', className)}>
      <section aria-labelledby={headingId} className="flex min-w-0 flex-col gap-6">
        <div>
          <h2 id={headingId} className="font-body text-heading-s font-semibold text-[var(--color-text-text)]">
            Review and pay
          </h2>
          <p className="mt-1 font-body text-body-s text-[var(--color-text-text-subtler)]">Check the details below. You're charged only when you press Pay.</p>
        </div>
        {/* Groups are separated by dividers, not boxed: the summary is the
            only panel on this screen. */}
        {sections.map((section, i) => (
          <section key={section.id} aria-label={section.title} className="flex flex-col gap-1">
            {i > 0 && <Separator className="mb-4" />}
            <div className="flex items-center justify-between gap-3 py-1">
              <h3 className="font-body text-body-l font-semibold text-[var(--color-text-text)]">{section.title}</h3>
              {section.onEdit && (
                <button
                  type="button"
                  onClick={section.onEdit}
                  className="shrink-0 cursor-pointer rounded-[var(--size-border-radius-border-radius-sm)] font-body text-body-s font-medium text-[var(--color-text-text-link)] underline-offset-4 outline-none hover:underline focus-visible:focus-ring"
                >
                  Edit<span className="sr-only"> {section.title.toLowerCase()}</span>
                </button>
              )}
            </div>
            <DescriptionList>
              {section.rows.map((r) => (
                <DescriptionItem key={r.term}>
                  <DescriptionTerm>{r.term}</DescriptionTerm>
                  <DescriptionDetails>{withDots(r.value)}</DescriptionDetails>
                </DescriptionItem>
              ))}
            </DescriptionList>
          </section>
        ))}
      </section>

      <OrderSummary lines={lines} totals={totals} currency={currency} taxLabel={taxLabel} className="lg:sticky lg:top-6">
        <Button appearance="filled" tone="primary" size="xl" fullWidth leftIcon={<Lock />} loading={placing} onClick={onPlaceOrder}>
          {`Pay ${formatMoney(totals.total, currency)}`}
        </Button>
        {legal && <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">{legal}</p>}
      </OrderSummary>
    </div>
  );
}
