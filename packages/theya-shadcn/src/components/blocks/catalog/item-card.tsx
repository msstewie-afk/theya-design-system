import { useId } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RatingStar } from '@/components/ui/rating';
import { DotSeparator } from '@/components/ui/dot-separator';
import { ItemIcon } from './item-icon';
import type { CatalogItem } from './types';

export function formatInstalls(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);
}

export function formatItemPrice(price: number): string {
  return price === 0 ? 'Free' : `$${price} / mo`;
}

export interface ItemCardProps {
  item: CatalogItem;
  layout?: 'grid' | 'list';
  href?: string;
  /** Shows a "Compare" checkbox (for the Comparison pattern). */
  compare?: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean };
  className?: string;
}

/**
 * One catalog entry. The whole card is the link (its visible edge is the
 * hit area), with the essentials people compare on in every item, in the
 * same order: what it is, who makes it, rating with review count, reach,
 * what it works with, and the price. Grid for browsing, list for scanning.
 */
export function ItemCard({ item, layout = 'grid', href = '#', compare, className }: ItemCardProps) {
  const compareId = useId();
  const rating = (
    <span className="inline-flex items-center gap-1">
      <RatingStar fill={1} size="sm" />
      <span className="font-medium text-[var(--color-text-text)]">{item.rating.toFixed(1)}</span>
      <span>({item.reviewCount.toLocaleString('en-US')})</span>
    </span>
  );
  const meta = (
    <p className="flex flex-wrap items-center font-body text-body-s text-[var(--color-text-text-subtle)]">
      <span className="sr-only">{`Rated ${item.rating.toFixed(1)} out of 5 from ${item.reviewCount} reviews. `}</span>
      <span aria-hidden="true" className="inline-flex items-center">
        {rating}
      </span>
      <DotSeparator />
      {`${formatInstalls(item.installs)} installs`}
      <DotSeparator />
      {item.compatibility.join(', ')}
    </p>
  );
  const price = <span className="shrink-0 font-body text-body-m font-semibold tabular-nums text-[var(--color-text-text)]">{formatItemPrice(item.price)}</span>;
  const compareBox = compare && (
    // relative z-[1]: above the card's stretched link, so it gets the click.
    <div className="relative z-[1] flex items-center gap-2">
      <Checkbox id={compareId} checked={compare.checked} disabled={compare.disabled} onCheckedChange={(v) => compare.onChange(v === true)} aria-label={`Compare ${item.name}`} />
      <label htmlFor={compareId} className="cursor-pointer font-body text-body-s text-[var(--color-text-text-subtle)]" aria-hidden="true">
        Compare
      </label>
    </div>
  );

  return (
    <Card action={{ type: 'link', href, ariaLabel: `${item.name} by ${item.vendor}` }} className={cn('h-full', className)}>
      <CardContent className={cn('flex h-full gap-3', layout === 'grid' ? 'flex-col' : 'flex-col sm:flex-row sm:items-center')}>
        <div className={cn('flex min-w-0 items-start gap-3', layout === 'list' && 'sm:flex-1')}>
          <ItemIcon icon={item.icon} />
          <div className="min-w-0">
            <p className="font-body text-body-l font-semibold text-[var(--color-text-text)]">{item.name}</p>
            <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">{item.vendor}</p>
            {layout === 'list' && <p className="mt-1 font-body text-body-m text-[var(--color-text-text-subtle)]">{item.summary}</p>}
            {layout === 'list' && <div className="mt-1">{meta}</div>}
          </div>
        </div>
        {layout === 'grid' && (
          <>
            <p className="font-body text-body-m text-[var(--color-text-text-subtle)]">{item.summary}</p>
            {meta}
            <div className="mt-auto flex items-center justify-between gap-3 pt-1">
              {price}
              {compareBox}
            </div>
          </>
        )}
        {layout === 'list' && (
          <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end">
            {price}
            {compareBox}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
