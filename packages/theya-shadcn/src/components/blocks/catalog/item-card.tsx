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
  /**
   * Product picture. Grid: full width above the content. List: a square
   * thumbnail on the left. Replaces the icon tile. `alt` defaults to empty —
   * the name is already the card link's name; pass it only when the picture
   * says something the text doesn't (a colour, a variant).
   */
  image?: { src: string; alt?: string };
  /** Grid only. Fixed ratio, so pictures in a row are the same height. Default 4/3. */
  imageAspect?: '1/1' | '4/3' | '3/4';
  /** `cover` fills and crops (screenshots, covers); `contain` shows the whole object on a neutral backdrop (product shots). */
  imageFit?: 'cover' | 'contain';
  className?: string;
}

const ASPECT = { '1/1': 'aspect-square', '4/3': 'aspect-[4/3]', '3/4': 'aspect-[3/4]' } as const;

/**
 * One catalog entry. The whole card is the link (its visible edge is the
 * hit area), with the essentials people compare on in every item, in the
 * same order: what it is, who makes it, rating with review count, reach,
 * what it works with, and the price. Grid for browsing, list for scanning.
 */
export function ItemCard({ item, layout = 'grid', href = '#', compare, image, imageAspect = '4/3', imageFit = 'cover', className }: ItemCardProps) {
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
    </p>
  );
  // Own line: appended to the line above it wrapped mid-list and left a
  // dangling dot at the start of the second line.
  const works = <p className="font-body text-body-s text-[var(--color-text-text-subtle)]">{`Works with ${item.compatibility.join(', ')}`}</p>;
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

  const picture = (cls: string) =>
    image && (
      // contain: product shots are shot on white. Light theme multiplies the
      // white into the neutral backdrop; dark theme keeps a white plate
      // instead (a white photo inside a dark frame reads as a hole).
      <div className={cn('shrink-0 overflow-hidden bg-[var(--color-bg-neutral-bg-neutral-subtle)]', imageFit === 'contain' && 'in-data-[theme=dark]:bg-[var(--color-white)]', cls)}>
        <img src={image.src} alt={image.alt ?? ''} loading="lazy" className={cn('size-full', imageFit === 'contain' ? 'object-contain p-4 mix-blend-multiply in-data-[theme=dark]:mix-blend-normal' : 'object-cover')} />
      </div>
    );

  return (
    <Card action={{ type: 'link', href, ariaLabel: `${item.name} by ${item.vendor}` }} className={cn('flex h-full flex-col', className)}>
      {/* Full-bleed on top; the radius is the card's minus its 1px border. */}
      {layout === 'grid' && picture(cn('w-full rounded-t-[calc(var(--size-border-radius-border-radius-2xl)-1px)]', ASPECT[imageAspect]))}
      <CardContent className={cn('flex flex-1 gap-3', layout === 'grid' ? 'flex-col' : 'flex-col sm:flex-row sm:items-center')}>
        <div className={cn('flex min-w-0 items-start gap-3', layout === 'list' && 'sm:flex-1')}>
          {image ? layout === 'list' && picture(cn('size-24 rounded-[var(--size-border-radius-border-radius-xl)]', imageFit === 'contain' && '[&_img]:p-2')) : <ItemIcon icon={item.icon} />}
          <div className="min-w-0">
            <p className="font-body text-body-l font-semibold text-[var(--color-text-text)]">{item.name}</p>
            <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">{item.vendor}</p>
            {layout === 'list' && <p className="mt-1 font-body text-body-m text-[var(--color-text-text-subtle)]">{item.summary}</p>}
            {layout === 'list' && (
              <div className="mt-1 flex flex-col gap-1">
                {works}
                {meta}
              </div>
            )}
          </div>
        </div>
        {layout === 'grid' && (
          <>
            {/* flex-1: the summary absorbs the height difference, so the
                facts + price block sits at the bottom and lines up across
                cards in a row. pt-2 opens the gap above that block (20px in
                all); inside it the two lines stay close (4px) to read as one. */}
            <p className="flex-1 font-body text-body-m text-[var(--color-text-text-subtle)]">{item.summary}</p>
            <div className="flex flex-col gap-1 pt-2">
              {/* Works-with first: it's the only line that can wrap, and the
                  block is bottom-aligned, so rating and price stay level. */}
              {works}
              {meta}
              <div className="flex items-center justify-between gap-3">
                {price}
                {compareBox}
              </div>
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
