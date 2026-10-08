'use client';

import { cn } from '../../lib/utils';
import { Badge } from './badge';
import { useTheyaI18n } from '../../lib/i18n';

/**
 * A money amount with the pieces commerce screens keep re-building: the
 * billing period ("/mo"), a "from" prefix, the previous price struck
 * through, a discount badge, and "Free" for zero.
 *
 * Formatting is Intl.NumberFormat (currency symbol, position, separators
 * per locale); whole amounts drop ".00". At `lg`/`xl` the currency symbol
 * and cents are a bit smaller, on the same baseline, so the number leads —
 * the SaaS pricing-page convention, and it holds for locales that put the
 * symbol after the number ("1.299,50 €"). `superscript` raises them
 * instead, retail price-tag style ("$19⁹⁹"), for storefront-like screens.
 *
 * Screen readers get one plain sentence ("From €19.99 per month, was
 * €24.99") instead of fragments like "slash mo" or an unannounced
 * strikethrough — the visual markup is hidden from them.
 */
export type PriceSize = 'sm' | 'md' | 'lg' | 'xl';

export function formatPrice(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const SIZE_CLASS: Record<PriceSize, string> = {
  sm: 'text-body-s',
  md: 'text-body-m font-medium',
  lg: 'font-heading text-heading-m',
  xl: 'font-heading text-heading-xl',
};
const PERIOD_CLASS: Record<PriceSize, string> = {
  sm: 'text-body-s',
  md: 'text-body-s',
  lg: 'text-body-m',
  xl: 'text-body-m',
};


export interface PriceProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  amount: number;
  /** ISO 4217 code. Default USD. */
  currency?: string;
  locale?: string;
  /** Short billing period shown after the amount: "mo", "year", "user"… Read out as "per month" etc. */
  period?: string;
  /** Previous price, shown struck through before the current one. */
  compareAt?: number;
  /** Show "−20%" next to a discounted price. */
  showDiscount?: boolean;
  /** Prefix "From" — for a starting price. */
  from?: boolean;
  /** lg/xl only: raise the currency symbol and cents (retail price-tag style) instead of keeping them on the baseline. */
  superscript?: boolean;
  /** Text for a zero amount. Pass null to show "$0" instead. */
  freeLabel?: string | null;
  size?: PriceSize;
}

export function Price({
  amount,
  currency = 'USD',
  locale: localeProp,
  period,
  compareAt,
  showDiscount = false,
  from = false,
  freeLabel,
  superscript = false,
  size = 'md',
  className,
  ...props
}: PriceProps) {
  const { t, locale: i18nLocale } = useTheyaI18n();
  // Number format follows the app's locale unless this price sets its own.
  const locale = localeProp ?? i18nLocale;
  if (freeLabel === undefined) freeLabel = t.price.free;
  const free = amount === 0 && freeLabel !== null;
  const discounted = compareAt !== undefined && compareAt > amount;
  const percent = discounted ? Math.round((1 - amount / compareAt) * 100) : 0;
  const big = size === 'lg' || size === 'xl';

  const parts = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).formatToParts(amount);

  const spoken = [
    from ? t.price.from : '',
    free ? freeLabel : formatPrice(amount, currency, locale),
    period && !free ? t.price.per(period) : '',
    discounted ? `${t.price.was(formatPrice(compareAt, currency, locale))}${showDiscount ? t.price.off(percent) : ''}` : '',
  ]
    .filter(Boolean)
    .join(' ')
    .replace(' ,', ',');

  return (
    <span data-slot="price" className={cn('inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[var(--color-text-text)]', className)} {...props}>
      <span className="sr-only">{spoken}</span>
      {discounted && (
        <s aria-hidden="true" className={cn('tabular-nums text-[var(--color-text-text-subtler)]', PERIOD_CLASS[size])}>
          {formatPrice(compareAt, currency, locale)}
        </s>
      )}
      <span aria-hidden="true" className={cn('inline-flex items-baseline gap-1 whitespace-nowrap tabular-nums', SIZE_CLASS[size])}>
        {from && <span className={cn('font-body font-normal text-[var(--color-text-text-subtler)]', PERIOD_CLASS[size])}>{t.price.from}</span>}
        {free ? (
          <span>{freeLabel}</span>
        ) : (
          <span>
            {parts.map((p, i) =>
              big && (p.type === 'currency' || p.type === 'fraction' || p.type === 'decimal') ? (
                <span key={i} className={superscript ? 'align-[0.35em] text-[0.6em]' : 'text-[0.75em]'}>
                  {p.value}
                </span>
              ) : (
                <span key={i}>{p.value}</span>
              ),
            )}
          </span>
        )}
        {period && !free && <span className={cn('font-body font-normal text-[var(--color-text-text-subtler)]', PERIOD_CLASS[size])}>/{period}</span>}
      </span>
      {discounted && showDiscount && (
        <Badge
          aria-hidden="true"
          tone="success"
          // lg/xl: raised to the top of the line next to the big number.
          // sm/md live inside text rows, where a raised badge would push the
          // line height — centered there.
          className={big ? 'self-start' : 'self-center'}
        >
          −{percent}%
        </Badge>
      )}
    </span>
  );
}
