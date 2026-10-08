'use client';

import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Skeleton } from './skeleton';
import { TableRow, TableCell } from './table';

/**
 * First-load skeleton helpers for hand-built Table tables. `useFirstLoad`
 * returns true on first mount, then flips to false after a brief delay
 * — resolving immediately under prefers-reduced-motion. Mark the
 * loading tbody/region aria-busy so the load is conveyed (the rows
 * themselves are aria-hidden).
 */
export function useFirstLoad(delay = 600): boolean {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setLoading(false);
      return;
    }
    const t = window.setTimeout(() => setLoading(false), delay);
    return () => window.clearTimeout(t);
  }, [delay]);
  return loading;
}

export interface SkeletonCol {
  align?: 'right';
  width?: string;
  control?: boolean;
}

const DEFAULT_WIDTHS = ['62%', '40%', '54%', '34%', '48%', '30%', '58%', '38%', '44%'];

export function TableSkeletonRows({ rows = 6, columns }: { rows?: number; columns: number | SkeletonCol[] }) {
  const specs: SkeletonCol[] = typeof columns === 'number' ? Array.from({ length: columns }, () => ({})) : columns;
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r} aria-hidden="true" className="hover:bg-transparent">
          {specs.map((s, c) => (
            <TableCell key={c} className={cn(s.align === 'right' && 'text-end')}>
              <Skeleton
                className={cn('h-4', s.control && 'size-4', s.align === 'right' && 'ms-auto')}
                style={s.control ? undefined : { width: s.width ?? DEFAULT_WIDTHS[(c + r) % DEFAULT_WIDTHS.length] }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
