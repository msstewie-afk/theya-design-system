import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { OptionCard, OptionCardGroup } from '@/components/ui/option-card';
import { formatMoney } from './shared';

export interface PricedOption {
  value: string;
  title: string;
  /** What you get: term, delivery date, retention… */
  description?: string;
  /** Extra cost of this option; 0 shows as "Included". */
  price: number;
  /** Unit after the price: "/ mo", "/ year", "once". */
  priceUnit?: string;
}

export interface PricedOptionsProps {
  legend: ReactNode;
  /** Helper under the legend. */
  description?: ReactNode;
  options: PricedOption[];
  value?: string;
  /** Uncontrolled start value. Defaults to the cheapest option. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  currency?: string;
  /**
   * `extra` (default): prices are add-ons — "+$4 / mo", and 0 reads
   * "Included". `total`: prices are the full cost of each option — "$30 / mo".
   */
  priceMode?: 'extra' | 'total';
  /** Grid columns from sm up. Default 1 (a stacked list). */
  columns?: 1 | 2 | 3;
  className?: string;
}

/**
 * A choice where every option carries its cost (and what it gets you) on
 * the card itself — period, region, backup retention, support level. No
 * option hides its price behind a click, and the cheapest is selected by
 * default so nobody pays more by not looking.
 */
export function PricedOptions({ legend, description, options, value, defaultValue, onValueChange, currency = 'USD', priceMode = 'extra', columns = 1, className }: PricedOptionsProps) {
  const cheapest = options.reduce((a, b) => (b.price < a.price ? b : a), options[0])?.value;
  const [inner, setInner] = useState(defaultValue ?? cheapest);
  const selected = value ?? inner;
  const legendId = useId();
  const descriptionId = useId();

  return (
    <fieldset className={cn('m-0 min-w-0 border-0 p-0', className)} aria-describedby={description ? descriptionId : undefined}>
      <legend id={legendId} className="mb-1 p-0 font-body text-body-m font-medium text-[var(--color-text-text)]">
        {legend}
      </legend>
      {description && (
        <p id={descriptionId} className="mb-3 font-body text-body-s text-[var(--color-text-text-subtler)]">
          {description}
        </p>
      )}
      <OptionCardGroup
        aria-labelledby={legendId}
        value={selected}
        onValueChange={(v) => {
          setInner(v);
          onValueChange?.(v);
        }}
        className={cn(!description && 'mt-2', columns === 1 ? 'sm:grid-cols-1' : columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3')}
      >
        {options.map((o) => {
          const amount = `${formatMoney(o.price, currency)}${o.priceUnit ? ` ${o.priceUnit}` : ''}`;
          const priceText = priceMode === 'total' ? amount : o.price === 0 ? 'Included' : `+${amount}`;
          return (
            <OptionCard
              key={o.value}
              value={o.value}
              title={o.title}
              description={o.description}
              aside={priceText}
            />
          );
        })}
      </OptionCardGroup>
    </fieldset>
  );
}
