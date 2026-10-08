'use client';

import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';

/**
 * Dots that page a phone-width table through its columns — Table and
 * DataTable with `mobileLayout="paged"`. Shown below 640px only. Same
 * look, hit area and contrast as CarouselIndicators (see the notes
 * there); each dot is named by the columns it shows, counted with the
 * first, always-visible column as 1.
 */
export function ColumnPageDots({
  pageCount,
  page,
  perPage,
  columnCount,
  onPageChange,
  className,
}: {
  pageCount: number;
  page: number;
  perPage: number;
  /** All columns, the fixed first one included. */
  columnCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  const { t } = useTheyaI18n();
  if (pageCount < 2) return null;
  return (
    <div data-slot="column-page-dots" role="group" aria-label={t.table.columnPages} className={cn('flex items-center justify-center py-1 sm:hidden', className)}>
      {Array.from({ length: pageCount }, (_, i) => {
        const active = i === page;
        const from = 2 + i * perPage;
        const to = Math.min(columnCount, from + perPage - 1);
        return (
          <button
            key={i}
            type="button"
            aria-current={active || undefined}
            aria-label={t.table.showColumns(from, to, columnCount)}
            onClick={() => onPageChange(i)}
            className="group flex h-6 min-w-6 cursor-pointer items-center justify-center rounded-full px-2 outline-none focus-visible:focus-ring"
          >
            <span
              aria-hidden="true"
              className={cn(
                'h-2 rounded-full transition-[width,background-color] duration-moderate ease-enter motion-reduce:transition-none',
                active
                  ? 'w-6 bg-[var(--color-icon-icon-primary)]'
                  : 'w-2 bg-[var(--color-icon-icon-subtler)] group-hover:bg-[var(--color-icon-icon-subtle)] [[data-theme=dark]_&]:bg-[var(--color-border-border)]',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

/** Touch handlers that turn a horizontal swipe into the next / previous column page (mirrored in right-to-left). */
export function columnSwipeHandlers(page: number, pageCount: number, setPage: (page: number) => void) {
  let start: number | null = null;
  return {
    onTouchStart: (event: React.TouchEvent) => {
      start = event.touches[0]?.clientX ?? null;
    },
    onTouchEnd: (event: React.TouchEvent) => {
      const end = event.changedTouches[0]?.clientX;
      const from = start;
      start = null;
      if (from == null || end == null || Math.abs(end - from) < 40) return;
      const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
      const forward = rtl ? end > from : end < from;
      setPage(Math.max(0, Math.min(pageCount - 1, page + (forward ? 1 : -1))));
    },
  };
}
