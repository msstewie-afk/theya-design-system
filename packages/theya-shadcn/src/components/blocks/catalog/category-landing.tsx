'use client';

import { useId } from 'react';
import type { ReactNode } from 'react';
import { NavArrowRight } from 'iconoir-react';
import { cn } from '../../../lib/utils';
import { Card, CardContent } from '../../ui/card';
import { ItemCard } from './item-card';
import { ItemIcon } from './item-icon';
import type { CatalogIconKey, CatalogItem } from './types';
import { Link } from '../../ui/link';

export interface CategoryTile {
  id: string;
  label: string;
  icon: CatalogIconKey;
  count: number;
  href: string;
}

export interface CuratedPick {
  item: CatalogItem;
  /** Why it was picked, in one or two sentences. */
  note: string;
}

export interface CategoryLandingProps {
  title: string;
  description?: ReactNode;
  /** Total in the whole catalog — for "View all N". */
  total: number;
  allHref: string;
  categories: CategoryTile[];
  /** A short shelf of the most popular items in one category. */
  popular?: { category: string; items: CatalogItem[]; total: number; href: string };
  picks?: CuratedPick[];
  getHref?: (item: CatalogItem) => string;
  noun?: { one: string; many: string };
  className?: string;
}

const linkClass =
  'inline-flex items-center gap-1 font-medium [&_svg]:size-4';

/**
 * The entry to a catalog: every category up front with how much is in it
 * (so people pick a path, not guess), a shelf of what's popular, a few
 * curated picks with the reason they were picked, and a way to see
 * everything at once. Shelves are short and end in a "View all" — the full
 * list lives on the list page with filters.
 */
export function CategoryLanding({ title, description, total, allHref, categories, popular, picks = [], getHref, noun = { one: 'extension', many: 'extensions' }, className }: CategoryLandingProps) {
  const uid = useId();
  const count = (n: number) => `${n.toLocaleString('en-US')} ${n === 1 ? noun.one : noun.many}`;

  return (
    <div className={cn('@container flex w-full flex-col gap-10', className)}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex max-w-2xl flex-col gap-1">
          <h1 className="font-body text-heading-s font-semibold text-[var(--color-text-text)]">{title}</h1>
          {description && <p className="font-body text-body-m text-[var(--color-text-text-subtle)]">{description}</p>}
        </div>
        <Link href={allHref} size="md" className={linkClass}>
          {`View all ${count(total)}`}
          <NavArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
        </Link>
      </header>

      <section aria-labelledby={`${uid}-cat`} className="flex flex-col gap-4">
        <h2 id={`${uid}-cat`} className="font-body text-body-l font-semibold text-[var(--color-text-text)]">
          Browse by category
        </h2>
        <ul className="grid grid-cols-1 gap-3 @md:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-6">
          {categories.map((c) => (
            <li key={c.id}>
              <Card size="md" action={{ type: 'link', href: c.href, ariaLabel: `${c.label}, ${count(c.count)}` }} className="h-full">
                <CardContent className="flex h-full items-center gap-3 @5xl:flex-col @5xl:items-start">
                  <ItemIcon icon={c.icon} size="sm" />
                  <div className="min-w-0">
                    <p className="font-body text-body-m font-semibold text-[var(--color-text-text)]">{c.label}</p>
                    <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">{count(c.count)}</p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {popular && popular.items.length > 0 && (
        <section aria-labelledby={`${uid}-pop`} className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id={`${uid}-pop`} className="font-body text-body-l font-semibold text-[var(--color-text-text)]">
              {`Popular in ${popular.category}`}
            </h2>
            <Link href={popular.href} size="md" className={linkClass}>
              {`View all ${popular.total}`}
              <span className="sr-only">{` ${popular.category} ${popular.total === 1 ? noun.one : noun.many}`}</span>
              <NavArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
            </Link>
          </div>
          <ul className="grid gap-4 @xl:grid-cols-2 @5xl:grid-cols-4">
            {popular.items.map((item) => (
              <li key={item.id}>
                <ItemCard item={item} href={getHref?.(item)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {picks.length > 0 && (
        <section aria-labelledby={`${uid}-picks`} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 id={`${uid}-picks`} className="font-body text-body-l font-semibold text-[var(--color-text-text)]">
              Editor's picks
            </h2>
            <p className="font-body text-body-m text-[var(--color-text-text-subtle)]">Chosen by our team. Not paid placements.</p>
          </div>
          <ul className="grid gap-4 @3xl:grid-cols-3">
            {picks.map(({ item, note }) => (
              <li key={item.id}>
                <Card size="lg" action={{ type: 'link', href: getHref?.(item) ?? '#', ariaLabel: `${item.name} by ${item.vendor}` }} className="h-full">
                  <CardContent className="flex h-full flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <ItemIcon icon={item.icon} />
                      <div className="min-w-0">
                        <p className="font-body text-body-l font-semibold text-[var(--color-text-text)]">{item.name}</p>
                        <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">{`${item.vendor} · ${item.category}`}</p>
                      </div>
                    </div>
                    <p className="font-body text-body-m text-[var(--color-text-text)]">{note}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
