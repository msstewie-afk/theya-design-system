'use client';

import { createContext, useContext, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { ColumnPageDots, columnSwipeHandlers } from './column-page-dots';

/**
 * No library dependency — data table primitives. Header sits on a
 * subtle surface with a hairline; rows hover to a subtle fill. For
 * row-as-link, wrap the whole row in a Link or add onClick + role;
 * keep inner action buttons stopPropagation. Numeric columns: add
 * `className="text-right tabular-nums"` to head + cell.
 *
 * On a phone (below 640px) a table doesn't scroll sideways by default.
 * `mobileLayout` picks how it fits instead:
 * - `stack` (default) — each row becomes an item: the first column is
 *   its title, every other cell a label/value pair. Labels come from the
 *   column headers; set TableCell `label` to word one differently, or
 *   `label={false}` for a full-width cell. `stackAction` pins a cell (a
 *   row menu, a remove button) to the item's top end.
 * - `paged` — the first column stays and the others show
 *   `columnsPerPage` at a time, with dots (and a swipe) to page through.
 *   For comparison tables, where a row reads across the columns.
 * - `scroll` — the table as is, scrolling sideways.
 * `stickyFirstColumn` keeps the first column in place while the table
 * scrolls sideways, at any width.
 */
/** Whether the enclosing Table stacks on a phone: its parts then carry explicit ARIA roles. */
const TableStackContext = createContext(false);

type TableProps = React.ComponentProps<'table'> & {
  /**
   * Optional accessible name for the scroll container. When set, the
   * container becomes a `role="region"` landmark with this label. The
   * container is always keyboard-focusable (`tabIndex={0}`) so a
   * keyboard/switch user can scroll a table wider than the viewport —
   * WCAG 2.1.1 / axe's scrollable-region-focusable. Previously this
   * container had no tab stop at all: a table too wide for its box was
   * only scrollable by mouse drag or trackpad.
   */
  containerLabel?: string;
  /** How the table fits a phone (below 640px): `stack` rows into label/value items (default), show the columns in `paged` groups, or `scroll` sideways. */
  mobileLayout?: 'stack' | 'paged' | 'scroll';
  /** `mobileLayout="paged"`: how many columns besides the first show at a time. */
  columnsPerPage?: number;
  /** Keep the first column in place while the table scrolls sideways. */
  stickyFirstColumn?: boolean;
};

/** Text of a header cell without its screen-reader-only parts ("Remove" on an icon column is not a label). */
function visibleText(cell: Element): string {
  const copy = cell.cloneNode(true) as Element;
  copy.querySelectorAll('.sr-only').forEach((node) => node.remove());
  return (copy.textContent ?? '').replace(/\s+/g, ' ').trim();
}

/** Each cell of a row with the index of the column it starts in (colSpan counted). */
function cellsWithColumns(row: HTMLTableRowElement): [HTMLTableCellElement, number][] {
  let col = 0;
  return Array.from(row.cells, (cell) => {
    const at = col;
    col += cell.colSpan || 1;
    return [cell, at] as [HTMLTableCellElement, number];
  });
}

export function Table({ className, containerLabel, mobileLayout = 'stack', columnsPerPage = 2, stickyFirstColumn = false, ...props }: TableProps) {
  const tableRef = useRef<HTMLTableElement>(null);
  const [columnCount, setColumnCount] = useState(0);
  const [page, setPage] = useState(0);
  const perPage = Math.max(1, Math.floor(columnsPerPage));
  const pageCount = mobileLayout === 'paged' ? Math.max(1, Math.ceil(Math.max(0, columnCount - 1) / perPage)) : 1;
  const currentPage = Math.min(page, pageCount - 1);

  // After every render (rows come and go with the data): label stacked
  // cells from their column headers and mark the cells of other column
  // pages. Attributes only — CSS (styles/table.css) does the layout, and
  // only below 640px.
  useLayoutEffect(() => {
    const table = tableRef.current;
    if (!table) return;
    const headRow = table.tHead?.rows[0] ?? table.rows[0];
    const headers: string[] = [];
    let count = 0;
    if (headRow) {
      for (const [cell, col] of cellsWithColumns(headRow)) {
        headers[col] = visibleText(cell);
        count = col + (cell.colSpan || 1);
      }
    }
    if (count !== columnCount) setColumnCount(count);
    const from = 1 + currentPage * perPage;
    const to = from + perPage;
    for (const row of Array.from(table.rows)) {
      for (const [cell, col] of cellsWithColumns(row)) {
        const spans = (cell.colSpan || 1) > 1;
        if (mobileLayout === 'paged' && col > 0 && !spans && (col < from || col >= to)) cell.setAttribute('data-col-hidden', '');
        else cell.removeAttribute('data-col-hidden');
        if (cell.tagName !== 'TD' || cell.hasAttribute('data-label-own')) continue;
        const auto = mobileLayout === 'stack' && col > 0 && !spans && !cell.hasAttribute('data-stack-action') && !cell.hasAttribute('data-label-off') ? headers[col] : '';
        if (auto) cell.setAttribute('data-label', auto);
        else cell.removeAttribute('data-label');
      }
    }
  });

  const paged = mobileLayout === 'paged' && pageCount > 1;

  return (
    <TableStackContext.Provider value={mobileLayout === 'stack'}>
    <div
      data-slot="table-container"
      tabIndex={0}
      // Outer focus-ring like every other control. Not inset: an inset
      // box-shadow paints under the children, so the header row's fill
      // covered its top edge (Мария, 2026-10-02). The container's own
      // overflow doesn't clip its own shadow.
      //
      // --dt-row-h/--dt-row-h-2: same density tokens DataTable's own
      // container reads (44/56px by default, follow data-density) —
      // defined here too so a DataTableCell composed straight into a bare
      // Table (no DataTable) still gets a real row height instead of
      // silently falling through to auto (the var chain it reads is
      // otherwise undefined here).
      className="relative isolate w-full overflow-x-auto overflow-y-hidden rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] outline-none [--dt-row-h:var(--size-density-density-row)] [--dt-row-h-2:var(--size-density-density-row-2)] focus-visible:focus-ring"
      {...(containerLabel ? { role: 'region', 'aria-label': containerLabel } : {})}
      // Swipe between column pages (touch only; the dots cover the rest).
      {...(paged ? columnSwipeHandlers(currentPage, pageCount, setPage) : {})}
    >
      <table
        ref={tableRef}
        data-slot="table"
        data-mobile={mobileLayout}
        data-sticky-first={stickyFirstColumn ? '' : undefined}
        // Explicit roles: below 640px a stacked table is display:block,
        // which strips table semantics in some browsers.
        role={mobileLayout === 'stack' ? 'table' : undefined}
        className={cn('w-full border-collapse font-body text-body-m', className)}
        {...props}
      />
      {paged && <ColumnPageDots pageCount={pageCount} page={currentPage} perPage={perPage} columnCount={columnCount} onPageChange={setPage} />}
    </div>
    </TableStackContext.Provider>
  );
}

export function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  const stack = useContext(TableStackContext);
  return <thead data-slot="table-header" role={stack ? 'rowgroup' : undefined} className={className} {...props} />;
}

export function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  const stack = useContext(TableStackContext);
  return <tbody data-slot="table-body" role={stack ? 'rowgroup' : undefined} className={className} {...props} />;
}

export function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  const stack = useContext(TableStackContext);
  return (
    <tr
      data-slot="table-row"
      role={stack ? 'row' : undefined}
      className={cn(
        // Named so the last row's cells can round their outer corners.
        'group/row',
        // Inset shadow, not a border: border-collapse resolves a real
        // border into the shared grid rather than painting it as part
        // of this row's own hoverable box.
        'shadow-[inset_0_-1px_0_0_var(--color-border-border-subtler)] transition-colors duration-standard ease-enter motion-reduce:transition-none',
        'last:shadow-none hover:bg-[var(--color-bg-neutral-bg-neutral-subtler)]',
        // Selected: same treatment as DataTable's rows (primary tint, lighter
        // tint on hover). Was neutral-subtler for both hover and selected, so
        // a selected row under the pointer looked exactly like an unselected
        // hovered one (2026-09-27).
        'data-[state=selected]:bg-[var(--color-bg-primary-bg-primary-subtle)] data-[state=selected]:hover:bg-[var(--color-bg-primary-bg-primary-subtler)]',
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  const stack = useContext(TableStackContext);
  return (
    <th
      data-slot="table-head"
      role={stack ? 'columnheader' : undefined}
      className={cn(
        'h-auto truncate border-b border-solid border-[var(--color-border-border-subtler)] bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        'px-4 py-2.5 text-start align-middle font-heading text-heading-2xs uppercase tracking-[0.07em] text-[var(--color-text-text-subtler)]',
        'first:rounded-ss-[calc(var(--size-border-radius-border-radius-2xl)-1px)] last:rounded-se-[calc(var(--size-border-radius-border-radius-2xl)-1px)]',
        className,
      )}
      {...props}
    />
  );
}

type TableCellProps = React.ComponentProps<'td'> & {
  /** Label beside the value when the Table stacks on a phone. Defaults to the column header's text; `false` makes the cell run full width (another title line). */
  label?: string | false;
  /** In a stacked Table, pin this cell (a row menu, a remove button) to the item's top end. */
  stackAction?: boolean;
};

export function TableCell({ className, label, stackAction, ...props }: TableCellProps) {
  const stack = useContext(TableStackContext);
  return (
    <td
      data-slot="table-cell"
      role={stack ? 'cell' : undefined}
      // An own label is marked so Table's header-derived labels leave it alone.
      data-label={label || undefined}
      data-label-own={label ? '' : undefined}
      data-label-off={label === false ? '' : undefined}
      data-stack-action={stackAction ? '' : undefined}
      className={cn(
        // (row height - one 20px line) / 2: 12px by default, so a one-line
        // row is 44px and follows data-density like DataTable's rows.
        'px-4 py-[calc((var(--size-density-density-row)_-_1.25rem)_/_2)] align-middle text-[var(--color-text-text)]',
        'group-last/row:first:rounded-es-[calc(var(--size-border-radius-border-radius-2xl)-1px)] group-last/row:last:rounded-ee-[calc(var(--size-border-radius-border-radius-2xl)-1px)]',
        className,
      )}
      {...props}
    />
  );
}

export function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return <caption data-slot="table-caption" className={cn('mt-3 font-body text-body-s text-[var(--color-text-text-subtler)]', className)} {...props} />;
}
