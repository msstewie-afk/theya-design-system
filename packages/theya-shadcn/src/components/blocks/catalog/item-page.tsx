'use client';

import { Fragment, useId, useState } from 'react';
import type { ReactNode } from 'react';
import { Check, NavArrowLeft, NavArrowRight } from 'iconoir-react';
import { cn } from '../../../lib/utils';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../ui/breadcrumb';
import { Button } from '../../ui/button';
import { DotSeparator } from '../../ui/dot-separator';
import { RatingStar } from '../../ui/rating';
import { Separator } from '../../ui/separator';
import { ItemIcon } from './item-icon';
import { formatInstalls, formatItemPrice } from './item-card';
import { Reviews, type Review, type ReviewsProps } from './reviews';
import { SpecSheet, type SpecGroup } from './spec-sheet';
import type { CatalogItem } from './types';
import { Link } from '../../ui/link';

/**
 * Page hierarchy (patterns convention): page title text-heading-s (20px),
 * section titles text-body-l semibold (16px), subsections body-m semibold.
 */
const SECTION_TITLE = 'font-body text-body-l font-semibold text-[var(--color-text-text)]';

export interface ItemPageProps {
  item: CatalogItem;
  /** Category path, top level first; the item itself is added last. */
  breadcrumbs?: { label: string; href: string }[];
  images?: { src: string; alt: string }[];
  /** The 3–5 things that make it worth installing, shown next to the price. */
  highlights?: string[];
  description?: { title?: string; body: ReactNode }[];
  specs?: SpecGroup[];
  reviews?: Review[];
  /** Totals for all reviews when `reviews` is only the first page. */
  reviewSummary?: ReviewsProps['summary'];
  onWriteReview?: () => void;
  trialDays?: number;
  onInstall?: () => void;
  className?: string;
}

/**
 * An item's page as one scrolling column of sections, not tabs: people
 * scroll and skim, and content hidden in a tab gets missed. Up top the
 * gallery and the buying block sit side by side — price, the one primary
 * action, what it works with, the highlights. Then the description (long
 * text folds), specifications and reviews, with in-page links to each.
 */
export function ItemPage({ item, breadcrumbs = [], images = [], highlights = [], description = [], specs = [], reviews = [], reviewSummary, onWriteReview, trialDays, onInstall, className }: ItemPageProps) {
  const [showFull, setShowFull] = useState(false);
  const uid = useId();
  const ids = { overview: `${uid}-overview`, specs: `${uid}-specs`, reviews: `${uid}-reviews` };
  const longText = description.length > 2;

  return (
    <article className={cn('@container flex w-full flex-col gap-5 sm:gap-8', className)} aria-labelledby={`${uid}-title`}>
      {breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((b) => (
              // Fragment, not a wrapper element: <ol> may only contain <li>.
              <Fragment key={b.href}>
                <BreadcrumbItem>
                  <BreadcrumbLink href={b.href}>{b.label}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </Fragment>
            ))}
            <BreadcrumbItem>
              <BreadcrumbPage>{item.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="grid gap-8 @4xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Gallery images={images} name={item.name} />

        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <ItemIcon icon={item.icon} size="lg" />
            <div className="min-w-0">
              <h1 id={`${uid}-title`} className="font-body text-heading-s font-semibold text-[var(--color-text-text)]">
                {item.name}
              </h1>
              <p className="font-body text-body-m text-[var(--color-text-text-subtle)]">by {item.vendor}</p>
              <Link href={`#${ids.reviews}`} size="sm" className="mt-1 inline-flex items-center gap-1">
                <RatingStar fill={1} size="sm" />
                {`${item.rating.toFixed(1)} · ${item.reviewCount.toLocaleString('en-US')} reviews`}
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="font-body text-heading-s font-semibold tabular-nums text-[var(--color-text-text)]">{formatItemPrice(item.price)}</p>
            {trialDays && item.price > 0 && <p className="font-body text-body-s text-[var(--color-text-text-subtle)]">{`Free for ${trialDays} days, then billed monthly. Cancel anytime.`}</p>}
          </div>
          <Button appearance="filled" tone="primary" size="xl" fullWidth onClick={onInstall}>
            {item.price > 0 && trialDays ? 'Start free trial' : 'Install'}
          </Button>

          <div className="flex flex-col gap-2">
            <p className="font-body text-body-s font-medium text-[var(--color-text-text-subtle)]">Works with</p>
            <p className="font-body text-body-m text-[var(--color-text-text)]">{item.compatibility.join(', ')}</p>
          </div>
          {highlights.length > 0 && (
            <ul className="flex flex-col gap-2">
              {highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 font-body text-body-m text-[var(--color-text-text)]">
                  <Check className="mt-0.5 size-4 shrink-0 text-[var(--color-icon-icon-success)]" aria-hidden="true" />
                  {h}
                </li>
              ))}
            </ul>
          )}
          <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">
            {`${formatInstalls(item.installs)} installs`}
            <DotSeparator />
            {item.category}
          </p>
        </div>
      </div>

      <nav aria-label="On this page" className="flex flex-wrap gap-x-6 gap-y-2 border-b border-solid border-[var(--color-border-border-subtler)] pb-3">
        {[
          { id: ids.overview, label: 'Overview', show: description.length > 0 },
          { id: ids.specs, label: 'Specifications', show: specs.length > 0 },
          { id: ids.reviews, label: `Reviews (${item.reviewCount.toLocaleString('en-US')})`, show: reviews.length > 0 },
        ]
          .filter((l) => l.show)
          .map((l) => (
            <a key={l.id} href={`#${l.id}`} className="rounded-[var(--size-border-radius-border-radius-sm)] font-body text-body-m font-medium text-[var(--color-text-text-subtle)] outline-none hover:text-[var(--color-text-text)] focus-visible:focus-ring">
              {l.label}
            </a>
          ))}
      </nav>

      {description.length > 0 && (
        <section id={ids.overview} aria-labelledby={`${ids.overview}-h`} className="flex max-w-3xl scroll-mt-6 flex-col gap-4">
          <h2 id={`${ids.overview}-h`} className={SECTION_TITLE}>
            Overview
          </h2>
          <div id={`${ids.overview}-body`} className="flex flex-col gap-4">
            {(showFull || !longText ? description : description.slice(0, 2)).map((d, i) => (
              <div key={i} className="flex flex-col gap-1">
                {d.title && <h3 className="font-body text-body-m font-semibold text-[var(--color-text-text)]">{d.title}</h3>}
                <div className="font-body text-body-m text-[var(--color-text-text-subtle)]">{d.body}</div>
              </div>
            ))}
          </div>
          {longText && (
            <button
              type="button"
              onClick={() => setShowFull((s) => !s)}
              aria-expanded={showFull}
              aria-controls={`${ids.overview}-body`}
              className="self-start rounded-[var(--size-border-radius-border-radius-sm)] font-body text-body-m font-medium text-[var(--color-text-text-link)] underline-offset-4 outline-none hover:underline focus-visible:focus-ring"
            >
              {showFull ? 'Show less' : 'Read the full description'}
            </button>
          )}
        </section>
      )}

      {specs.length > 0 && (
        <>
          <Separator />
          <section id={ids.specs} aria-labelledby={`${ids.specs}-h`} className="flex max-w-3xl scroll-mt-6 flex-col gap-4">
            <h2 id={`${ids.specs}-h`} className={SECTION_TITLE}>
              Specifications
            </h2>
            <SpecSheet groups={specs} />
          </section>
        </>
      )}

      {reviews.length > 0 && (
        <>
          <Separator />
          <div id={ids.reviews} className="max-w-3xl scroll-mt-6">
            <Reviews reviews={reviews} summary={reviewSummary} onWriteReview={onWriteReview} headingClassName={SECTION_TITLE} />
          </div>
        </>
      )}
    </article>
  );
}

/** Large image with a row of thumbnails — every extra image is visible as a thumbnail, never only behind dots. */
function Gallery({ images, name }: { images: { src: string; alt: string }[]; name: string }) {
  const [index, setIndex] = useState(0);
  if (!images.length) return <div aria-hidden="true" className="aspect-video rounded-[var(--size-border-radius-border-radius-3xl)] bg-[var(--color-bg-neutral-bg-neutral-subtle)]" />;
  const go = (i: number) => setIndex((i + images.length) % images.length);
  return (
    <div className="flex min-w-0 flex-col gap-3" role="group" aria-roledescription="gallery" aria-label={`${name} screenshots`}>
      <div className="relative overflow-hidden rounded-[var(--size-border-radius-border-radius-3xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-neutral-bg-neutral-subtle)]">
        <img src={images[index].src} alt={images[index].alt} className="aspect-video w-full object-cover" />
        {images.length > 1 && (
          <>
            <Button appearance="tonal" tone="secondary" iconOnly size="md" aria-label="Previous screenshot" leftIcon={<NavArrowLeft className="rtl:-scale-x-100" />} onClick={() => go(index - 1)} className="absolute start-3 top-1/2 -translate-y-1/2" />
            <Button appearance="tonal" tone="secondary" iconOnly size="md" aria-label="Next screenshot" leftIcon={<NavArrowRight className="rtl:-scale-x-100" />} onClick={() => go(index + 1)} className="absolute end-3 top-1/2 -translate-y-1/2" />
          </>
        )}
        <p aria-live="polite" className="sr-only">{`Screenshot ${index + 1} of ${images.length}: ${images[index].alt}`}</p>
      </div>
      {images.length > 1 && (
        <div className="relative flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.src + i}
              type="button"
              aria-label={`Screenshot ${i + 1}: ${img.alt}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => setIndex(i)}
              className={cn(
                'shrink-0 cursor-pointer overflow-hidden rounded-[var(--size-border-radius-border-radius-xl)] border-2 border-solid outline-none focus-visible:focus-ring',
                i === index ? 'border-[var(--color-border-border-primary)]' : 'border-transparent opacity-80 hover:opacity-100',
              )}
            >
              <img src={img.src} alt="" className="aspect-video w-24 object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
