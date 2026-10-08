'use client';

import { useId, useState } from 'react';
import { cn } from '../../../lib/utils';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { RatingStar } from '../../ui/rating';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Separator } from '../../ui/separator';
import { DotSeparator } from '../../ui/dot-separator';

export interface Review {
  id: string;
  author: string;
  rating: number;
  /** Formatted date ("Sep 12, 2026"). */
  date: string;
  /** ISO, for "Newest" sorting. */
  isoDate: string;
  title?: string;
  body: string;
  /** How many found it helpful — drives "Most relevant". */
  helpful?: number;
  /** The developer's public answer. */
  reply?: { author: string; body: string; date: string };
}

type ReviewSort = 'relevant' | 'newest' | 'lowest' | 'highest';
const SORT_LABEL: Record<ReviewSort, string> = { relevant: 'Most relevant', newest: 'Newest', lowest: 'Lowest rated', highest: 'Highest rated' };

export interface ReviewsProps {
  reviews: Review[];
  /** Override the computed average/count (e.g. when only a page of reviews is loaded). */
  summary?: { average: number; count: number; distribution: Record<1 | 2 | 3 | 4 | 5, number> };
  pageSize?: number;
  onWriteReview?: () => void;
  /** Overrides the heading style when Reviews is a section of a larger page. */
  headingClassName?: string;
  className?: string;
}

function Stars({ value }: { value: number }) {
  return (
    <span aria-hidden="true" className="inline-flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <RatingStar key={i} fill={Math.max(0, Math.min(1, value - i + 1))} size="sm" />
      ))}
    </span>
  );
}

/**
 * Ratings people can interrogate: the average with its count, the
 * distribution as bars that double as filters (click "1 ★" to read the
 * complaints), sorting that includes "Lowest rated", several reviews
 * before "Show more", and the developer's reply right under the review it
 * answers.
 */
export function Reviews({ reviews, summary, pageSize = 4, onWriteReview, headingClassName, className }: ReviewsProps) {
  const [star, setStar] = useState<number | null>(null);
  const [sort, setSort] = useState<ReviewSort>('relevant');
  const [visible, setVisible] = useState(pageSize);
  const headingId = useId();

  const distribution = summary?.distribution ?? ([1, 2, 3, 4, 5] as const).reduce((d, s) => ({ ...d, [s]: reviews.filter((r) => Math.round(r.rating) === s).length }), {} as Record<1 | 2 | 3 | 4 | 5, number>);
  const count = summary?.count ?? reviews.length;
  const average = summary?.average ?? (reviews.reduce((s, r) => s + r.rating, 0) / Math.max(reviews.length, 1));
  const maxBar = Math.max(...Object.values(distribution), 1);

  const list = reviews
    .filter((r) => star === null || Math.round(r.rating) === star)
    .sort((a, b) =>
      sort === 'newest' ? b.isoDate.localeCompare(a.isoDate) : sort === 'lowest' ? a.rating - b.rating : sort === 'highest' ? b.rating - a.rating : (b.helpful ?? 0) - (a.helpful ?? 0),
    );

  return (
    <section aria-labelledby={headingId} className={cn('flex flex-col gap-5 sm:gap-6', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={headingId} className={headingClassName ?? 'font-body text-body-l font-semibold text-[var(--color-text-text)]'}>
          Reviews
        </h2>
        {onWriteReview && (
          <Button appearance="outlined" tone="secondary" onClick={onWriteReview}>
            Write a review
          </Button>
        )}
      </div>

      <div className="grid gap-6 @container sm:grid-cols-[12rem_minmax(0,1fr)]">
        <div className="flex flex-col gap-1">
          <p className="font-body text-heading-l font-semibold tabular-nums text-[var(--color-text-text)]">{average.toFixed(1)}</p>
          <Stars value={average} />
          <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">{`${count.toLocaleString('en-US')} reviews`}</p>
        </div>
        {/* Each bar is a filter button. */}
        <div role="group" aria-label="Filter by rating" className="flex flex-col gap-1.5">
          {([5, 4, 3, 2, 1] as const).map((s) => {
            const n = distribution[s];
            const active = star === s;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setStar(active ? null : s);
                  setVisible(pageSize);
                }}
                className={cn(
                  'grid cursor-pointer grid-cols-[2.5rem_minmax(0,1fr)_3rem] items-center gap-3 rounded-[var(--size-border-radius-border-radius-md)] px-1.5 py-0.5 text-start outline-none',
                  'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] focus-visible:focus-ring',
                  active && 'bg-[var(--color-bg-primary-bg-primary-subtle)]',
                )}
              >
                <span className="font-body text-body-s tabular-nums text-[var(--color-text-text)]">
                  {s} <span aria-hidden="true">★</span>
                  <span className="sr-only"> stars</span>
                </span>
                <span aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-[var(--color-bg-neutral-bg-neutral-subtle)]">
                  <span className="block h-full rounded-full bg-[var(--color-icon-icon-rating)]" style={{ width: `${(n / maxBar) * 100}%` }} />
                </span>
                <span className="text-end font-body text-body-s tabular-nums text-[var(--color-text-text-subtle)]">
                  {n.toLocaleString('en-US')}
                  <span className="sr-only"> reviews</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-body text-body-m text-[var(--color-text-text-subtle)]" aria-live="polite">
          {star ? `${list.length} ${list.length === 1 ? 'review' : 'reviews'} with ${star} ★` : `${list.length} reviews`}
          {star && (
            <Button appearance="ghost" tone="secondary" size="sm" onClick={() => setStar(null)} className="ms-2">
              Show all
            </Button>
          )}
        </p>
        <Select value={sort} onValueChange={(v) => setSort(v as ReviewSort)}>
          <SelectTrigger aria-label="Sort reviews" widthSize="md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SORT_LABEL) as ReviewSort[]).map((k) => (
              <SelectItem key={k} value={k}>
                {SORT_LABEL[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ul className="flex flex-col">
        {list.slice(0, visible).map((r, i) => (
          <li key={r.id} className={cn('flex flex-col gap-2 py-5', i > 0 && 'border-t border-solid border-[var(--color-border-border-subtler)]')}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Stars value={r.rating} />
              <span className="sr-only">{`${r.rating} out of 5 stars`}</span>
              {r.title && <span className="font-body text-body-m font-semibold text-[var(--color-text-text)]">{r.title}</span>}
            </div>
            <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">
              {r.author}
              <DotSeparator />
              {r.date}
            </p>
            <p className="font-body text-body-m text-[var(--color-text-text)]">{r.body}</p>
            {r.reply && (
              <div className="mt-2 flex flex-col gap-1 border-s-2 border-solid border-[var(--color-border-border)] ps-4">
                <p className="flex items-center gap-2 font-body text-body-s font-medium text-[var(--color-text-text)]">
                  {r.reply.author}
                  <Badge tone="info">Developer</Badge>
                  <span className="font-normal text-[var(--color-text-text-subtler)]">{r.reply.date}</span>
                </p>
                <p className="font-body text-body-m text-[var(--color-text-text-subtle)]">{r.reply.body}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
      {visible < list.length && (
        <Button appearance="outlined" tone="secondary" className="self-center" onClick={() => setVisible((v) => v + pageSize)}>
          {`Show ${Math.min(pageSize, list.length - visible)} more reviews`}
        </Button>
      )}
    </section>
  );
}
