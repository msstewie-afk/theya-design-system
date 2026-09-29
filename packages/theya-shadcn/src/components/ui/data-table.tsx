import { createContext, useContext, useState, useRef, useCallback, useMemo, useEffect, cloneElement, isValidElement } from 'react';
import type { ReactNode, ReactElement, ElementType, CSSProperties, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnPinningState,
  type OnChangeFn,
  type PaginationState,
  type Row,
  type RowData,
  type SortingState,
  type RowSelectionState,
  type VisibilityState,
  type Table as TanstackTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowDown, ArrowUp, NavArrowLeft, NavArrowRight, ArrowSeparateVertical, Refresh } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from './use-media-query';
import { Checkbox } from './checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { DataTableCell, DataTableCellMenuTrigger, type DataTableCellKind } from './data-table-cell';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrailing,
  ContextMenuTrigger,
} from './context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrailing,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from './pagination';

function SelectAllTooltip({ children, content }: { children: ReactElement; content: ReactNode }) {
  const [open, setOpen] = useState(false);
  const hoveredRef = useRef(false);

  return (
    <Tooltip
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && hoveredRef.current) return;
        setOpen(nextOpen);
      }}
    >
      <TooltipTrigger
        asChild
        onPointerEnter={() => {
          hoveredRef.current = true;
        }}
        onPointerLeave={() => {
          hoveredRef.current = false;
        }}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom">{content}</TooltipContent>
    </Tooltip>
  );
}

/**
 * A TanStack-react-table wrapper over the table.tsx primitives. Adds
 * column sorting, pagination, row selection, synchronized overflow/
 * context row menus, an opt-in bounded scroll body with a sticky
 * header, pinned/frozen columns, a first-load skeleton, and the
 * accessible whole-row stretched-link pattern.
 *
 * The body grows with its rows by default; bound it with `maxHeight`
 * or stretch it to the viewport with `fillViewport`. Row models run
 * client-side by default (paged at `pageSize`); opt into server-side
 * sorting/filtering/pagination with the `manual*` flags + controlled
 * state, or set `hideFooter` to render every row unpaged. Opt into
 * infinite scroll with `onLoadMore`. For very long lists set
 * `virtualized` to render only visible rows via @tanstack/react-virtual.
 *
 * Per-column behaviour is declared on `column.meta`: `primary` (the
 * cell becomes the row's stretched link), `control` (interactive cell,
 * lifted above the link overlay), `kind` (which DataTableCell kind
 * this column renders — also its loading-placeholder shape), `align`
 * ("right" for numeric columns), `hideBelow` (drop this column below
 * a breakpoint), `pin` (freeze "left"/"right" while the body scrolls,
 * md+ only — the generated rowMenu column pins right at every width).
 *
 * Every row is one box tall — `lines` picks the one/two-line height
 * for the whole table, and each cell inherits it. An editable column
 * is keyboard-workable: Enter and the arrows move down that column
 * (Shift reverses), and the focused cell is scrolled clear of frozen
 * columns and the body's edge.
 *
 * For bulk selection pair `enableSelection` with `DataTableToolbar` in
 * `toolbar` and `selectAll="toolbar"`: the select-all, count and bulk
 * actions then live in one always-present bar.
 *
 * Simplified vs the reference: no DensityToggle/compact-density system
 * exists yet in this design system, so --wp-row-h/--wp-row-h-2 default
 * to fixed comfortable values (44px / 56px) on the container instead
 * of tracking a density preference. `finalFocus` (Base UI's per-close-
 * reason focus-restore control on the row menus) is approximated with
 * Radix's onCloseAutoFocus + a keyboard-close tracking ref, rather
 * than a byte-exact port of that mechanism.
 */
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    primary?: boolean;
    control?: boolean;
    align?: 'right';
    hideBelow?: 'sm' | 'md' | 'lg';
    /** Freeze the column "left"/"right" while the body scrolls, md+ only. Declare pinned columns at the edges of `columns`. */
    pin?: 'left' | 'right';
    /** Which DataTableCell kind this column renders — declarative only; drives the first-load placeholder shape. */
    kind?: DataTableCellKind;
    headClassName?: string;
    cellClassName?: string;
  }
}

/** Controllable state: uses `value`/`onChange` when provided (server-driven), else falls back to internal state seeded with `initial`. */
function useControllableState<T>(value: T | undefined, onChange: OnChangeFn<T> | undefined, initial: T): [T, OnChangeFn<T>] {
  const [internal, setInternal] = useState<T>(initial);
  const isControlled = value !== undefined;
  const state = isControlled ? value : internal;
  const stateRef = useRef(state);
  stateRef.current = state;
  const controlledRef = useRef(isControlled);
  controlledRef.current = isControlled;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const set = useCallback<OnChangeFn<T>>((updater) => {
    const next = typeof updater === 'function' ? (updater as (old: T) => T)(stateRef.current) : updater;
    stateRef.current = next;
    if (!controlledRef.current) setInternal(next);
    onChangeRef.current?.(next);
  }, []);
  return [state, set];
}

/**
 * Sticky positioning for a pinned column (and/or a sticky-top header).
 * Left-pinned columns offset by the width of the left-pinned columns
 * before them; right-pinned by the width after them.
 */
function stickyStyle<TData>(column: Column<TData, unknown>, opts: { header: boolean; stickyTop: boolean }): CSSProperties | undefined {
  const pinned = column.getIsPinned();
  const { header, stickyTop } = opts;
  if (!pinned && !(header && stickyTop)) return undefined;
  const style: CSSProperties = { position: 'sticky' };
  if (header && stickyTop) style.top = 0;
  if (pinned === 'left') style.left = column.getStart('left');
  else if (pinned === 'right') style.right = column.getAfter('right');
  style.zIndex = header ? 2 : 0;
  return style;
}

/** Rank for stable pinned ordering: left-pinned render first, right-pinned last. */
function pinRank(pinned: false | 'left' | 'right'): number {
  return pinned === 'left' ? 0 : pinned === 'right' ? 2 : 1;
}

/** Presentation of a body cell, derived from its COLUMN: pinned stickiness + background + overlap divider, meta.align, meta.cellClassName. */
function bodyCellAttrs<TData>(column: Column<TData, unknown>): { style: CSSProperties | undefined; className: string } {
  const meta = column.columnDef.meta;
  const pinned = column.getIsPinned();
  return {
    style: stickyStyle(column, { header: false, stickyTop: false }),
    className: cn(
      // TableCell's own px-4 py-3 is for a plain <td> used on its own;
      // every body cell here renders a DataTableCell, which already
      // supplies its own complete padding AND a fixed height off
      // --wp-row-h. Left in, TableCell's padding stacked on top of
      // that — doubling the horizontal inset (32px vs the header's
      // 16px, which is why row checkboxes sat further right than the
      // toolbar's) and inflating row height past --wp-row-h. p-0
      // makes DataTableCell the single source of truth for both.
      'p-0',
      meta?.align === 'right' && "text-right tabular-nums [&_[data-kind]]:justify-end [&_input]:text-right",
      pinned && 'transition-colors',
      pinned === 'left' &&
        'group-data-[overflow-left]/scroll:bg-[var(--color-bg-surface-bg-surface)] group-data-[overflow-left]/scroll:group-hover/row:bg-[var(--color-bg-neutral-bg-neutral-subtler)] group-data-[overflow-left]/scroll:group-data-[context-menu-open]/row:bg-[var(--color-bg-neutral-bg-neutral-subtler)] group-data-[overflow-left]/scroll:group-data-[state=selected]/row:bg-[var(--color-bg-neutral-bg-neutral-subtler)]',
      pinned === 'right' &&
        'group-data-[overflow-right]/scroll:bg-[var(--color-bg-surface-bg-surface)] group-data-[overflow-right]/scroll:group-hover/row:bg-[var(--color-bg-neutral-bg-neutral-subtler)] group-data-[overflow-right]/scroll:group-data-[context-menu-open]/row:bg-[var(--color-bg-neutral-bg-neutral-subtler)] group-data-[overflow-right]/scroll:group-data-[state=selected]/row:bg-[var(--color-bg-neutral-bg-neutral-subtler)]',
      pinned === 'left' && column.getIsLastColumn('left') && 'group-data-[overflow-left]/scroll:shadow-[inset_-1px_0_0_0_var(--color-border-border-subtle)]',
      pinned === 'right' && column.getIsFirstColumn('right') && 'group-data-[overflow-right]/scroll:shadow-[inset_1px_0_0_0_var(--color-border-border-subtle)]',
      meta?.cellClassName,
    ),
  };
}

/** Id of the column DataTable generates for `rowMenu`. */
const ROW_MENU_COLUMN_ID = '__row-menu';

/** Width of the focus ring, in px — scrolling a focused cell into view has to account for it or the ring lands under the container's edge. */
const FOCUS_RING = 4;

function DataTableColumnHeader<TData, TValue>({ column, title, className }: { column: Column<TData, TValue>; title: string; className?: string }) {
  if (!column.getCanSort()) {
    return (
      <span className={cn('block truncate text-[var(--color-text-text-subtler)]', className)} title={title}>
        {title}
      </span>
    );
  }
  const sorted = column.getIsSorted();
  const align = column.columnDef.meta?.align;
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      title={title}
      className={cn(
        'group -mx-2 inline-flex h-7 max-w-full items-center gap-1.5 rounded-[var(--size-border-radius-border-radius-sm)] px-2',
        'font-heading text-heading-2xs uppercase tracking-[0.07em] text-[var(--color-text-text-subtler)] transition-colors duration-150 ease-out motion-reduce:transition-none',
        'hover:text-[var(--color-text-text)]',
        'focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
        align === 'right' && 'flex-row-reverse',
        className,
      )}
    >
      <span className="min-w-0 truncate">{title}</span>
      {sorted === 'asc' ? (
        <ArrowDown className="size-4 shrink-0 text-[var(--color-icon-icon)]" />
      ) : sorted === 'desc' ? (
        <ArrowUp className="size-4 shrink-0 text-[var(--color-icon-icon)]" />
      ) : (
        // A subtler ICON TOKEN, not opacity on the full-strength one — the
        // same fix already applied to the row area's sort icon. Opacity
        // multiplies against whatever sits behind it, so on the header's
        // own gray fill (bg-neutral-subtle) a 40%-transparent icon reads
        // as barely-there; a dedicated subtle-but-opaque token stays
        // legible regardless of background.
        <ArrowSeparateVertical className="size-4 shrink-0 text-[var(--color-icon-icon-subtle)] group-hover:text-[var(--color-icon-icon)]" />
      )}
    </button>
  );
}

function pageRange(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 1) return [1];
  const out: (number | 'ellipsis')[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) out.push('ellipsis');
  for (let i = left; i <= right; i++) out.push(i);
  if (right < total - 1) out.push('ellipsis');
  out.push(total);
  return out;
}

/** A decorative trailing row that calls `onLoadMore` when it scrolls into view. Disconnected while `loadingMore`. */
function LoadMoreRow({ colSpan, onLoadMore, hasMore, loadingMore, rootRef }: { colSpan: number; onLoadMore: () => void; hasMore: boolean; loadingMore: boolean; rootRef: React.RefObject<HTMLDivElement | null> }) {
  const targetRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hasMore || loadingMore) return;
    const el = targetRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { root: rootRef.current ?? null, rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadingMore, onLoadMore, rootRef]);

  return (
    <tr aria-hidden="true">
      <td colSpan={colSpan} className="p-0">
        <div ref={targetRef} className="flex h-12 items-center justify-center gap-2 font-body text-body-s text-[var(--color-text-text-subtler)]">
          {loadingMore && (
            <>
              <Refresh className="size-4 shrink-0 animate-spin" aria-hidden="true" />
              Loading more…
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export type DataTableRowMenuItem<TData> =
  | { type: 'content'; id: string; content: ReactNode }
  | {
      type?: 'item';
      id: string;
      label: ReactNode;
      icon?: ReactNode;
      /** Content pinned to the item's right edge. Stop propagation on its own click handling or it also fires the item's onSelect. */
      trailing?: ReactNode;
      tone?: 'neutral' | 'danger';
      disabled?: boolean | ((row: TData) => boolean);
      onSelect: (row: TData) => void;
    }
  | { type: 'submenu'; id: string; label: ReactNode; disabled?: boolean | ((row: TData) => boolean); items: DataTableRowMenuItem<TData>[] }
  | { type: 'group'; id: string; label: ReactNode; items: DataTableRowMenuItem<TData>[] }
  | { type: 'separator' };

export interface DataTableRowMenu<TData> {
  /** Also open these actions by right-clicking (or long-pressing) a row. */
  contextual?: boolean;
  label?: string | ((row: TData) => string);
  items: DataTableRowMenuItem<TData>[] | ((row: TData) => DataTableRowMenuItem<TData>[]);
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  /** Per-row actions, appended as the final column, pinned right at every width. `contextual` also exposes them on right-click. */
  rowMenu?: DataTableRowMenu<TData>;
  /** Stable identity for a row, used as its selection key. Supply whenever selection is enabled and `data` can change under the user. */
  getRowId?: (row: TData) => string;
  loading?: boolean;
  skeletonRows?: number;
  /** Prepend a select-all/select-row checkbox column. Auto-drops below md. */
  enableSelection?: boolean;
  pinSelection?: boolean;
  /** Where the select-all control lives: "header" (default), "toolbar" (pair with DataTableToolbar), or "none". */
  selectAll?: 'header' | 'toolbar' | 'none';
  selectAllTooltip?: ReactNode;
  /** Lines of text a row is sized for. Set 2 when ANY column stacks a value over a second line. */
  lines?: 1 | 2;
  /** Omit the header row entirely. Mutually exclusive with sorting and header select-all. */
  hideHeader?: boolean;
  /** Omit the footer and disable client-side pagination — every row renders. */
  hideFooter?: boolean;
  pageSize?: number;
  stickyHeader?: boolean;
  maxHeight?: number | string;
  /** Stretch the scroll body to the remaining viewport height. Overridden by explicit `maxHeight`. */
  fillViewport?: boolean;
  getRowHref?: (row: TData) => string;
  onRowClick?: (row: TData) => void;
  /** Element for the whole-row link. Defaults to a plain `<a>`; pass your router's link for client-side navigation. */
  linkComponent?: ElementType;
  getRowLabel?: (row: TData) => string;
  emptyMessage?: ReactNode;
  /** Rich empty state, rendered with the live table instance so it can branch on filter activity. Takes precedence over `emptyMessage`. */
  emptyState?: (table: TanstackTable<TData>) => ReactNode;
  ariaLabel?: string;
  toolbar?: (table: TanstackTable<TData>) => ReactNode;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  manualPagination?: boolean;
  pageCount?: number;
  rowCount?: number;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  /** Switch to infinite scroll: a sentinel row calls this when it nears view. Replaces the pager. */
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  /** Render only rows in view (plus overscan) via @tanstack/react-virtual. Needs a bounded scroll body. */
  virtualized?: boolean;
  estimateRowHeight?: number;
  overscan?: number;
  /** Drop the container's own border/background chrome, round only its top corners, for nesting inside another bordered surface. */
  embedded?: boolean;
  embeddedBottomRounded?: boolean;
  className?: string;
}

function resolveRowMenuItems<TData>(menu: DataTableRowMenu<TData>, row: TData) {
  return typeof menu.items === 'function' ? menu.items(row) : menu.items;
}

function resolveRowMenuLabel<TData>(menu: DataTableRowMenu<TData>, row: TData) {
  return typeof menu.label === 'function' ? menu.label(row) : (menu.label ?? 'Row actions');
}

function DataTableRowMenuContent({ children }: { children: ReactNode }) {
  return (
    <div role="presentation" className="flex min-h-9 items-center px-2.5 py-2 text-[var(--color-text-text-subtler)]/70 [&_svg]:size-4 [&_svg]:shrink-0">
      {children}
    </div>
  );
}

function renderDropdownMenuItems<TData>(items: DataTableRowMenuItem<TData>[], row: TData) {
  return items.map((item, index) =>
    item.type === 'separator' ? (
      <DropdownMenuSeparator key={`separator-${index}`} />
    ) : item.type === 'content' ? (
      <DataTableRowMenuContent key={item.id}>{item.content}</DataTableRowMenuContent>
    ) : item.type === 'submenu' ? (
      <DropdownMenuSub key={item.id}>
        <DropdownMenuSubTrigger disabled={typeof item.disabled === 'function' ? item.disabled(row) : item.disabled}>{item.label}</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>{renderDropdownMenuItems(item.items, row)}</DropdownMenuSubContent>
      </DropdownMenuSub>
    ) : item.type === 'group' ? (
      <DropdownMenuGroup key={item.id}>
        <DropdownMenuLabel>{item.label}</DropdownMenuLabel>
        {renderDropdownMenuItems(item.items, row)}
      </DropdownMenuGroup>
    ) : (
      <DropdownMenuItem key={item.id} tone={item.tone} disabled={typeof item.disabled === 'function' ? item.disabled(row) : item.disabled} onSelect={() => item.onSelect(row)}>
        {item.icon}
        {item.trailing ? (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            <DropdownMenuTrailing>{item.trailing}</DropdownMenuTrailing>
          </>
        ) : (
          item.label
        )}
      </DropdownMenuItem>
    ),
  );
}

function renderContextMenuItems<TData>(items: DataTableRowMenuItem<TData>[], row: TData) {
  return items.map((item, index) =>
    item.type === 'separator' ? (
      <ContextMenuSeparator key={`separator-${index}`} />
    ) : item.type === 'content' ? (
      <DataTableRowMenuContent key={item.id}>{item.content}</DataTableRowMenuContent>
    ) : item.type === 'submenu' ? (
      <ContextMenuSub key={item.id}>
        <ContextMenuSubTrigger disabled={typeof item.disabled === 'function' ? item.disabled(row) : item.disabled}>{item.label}</ContextMenuSubTrigger>
        <ContextMenuSubContent>{renderContextMenuItems(item.items, row)}</ContextMenuSubContent>
      </ContextMenuSub>
    ) : item.type === 'group' ? (
      <ContextMenuGroup key={item.id}>
        <ContextMenuLabel>{item.label}</ContextMenuLabel>
        {renderContextMenuItems(item.items, row)}
      </ContextMenuGroup>
    ) : (
      <ContextMenuItem key={item.id} tone={item.tone} disabled={typeof item.disabled === 'function' ? item.disabled(row) : item.disabled} onSelect={() => item.onSelect(row)}>
        {item.icon}
        {item.trailing ? (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            <ContextMenuTrailing>{item.trailing}</ContextMenuTrailing>
          </>
        ) : (
          item.label
        )}
      </ContextMenuItem>
    ),
  );
}

/** Lets a row's context menu reach the overflow menu in the same row, so a right-click doesn't leave both open at once. */
const RowMenuCoordination = createContext<{ register: (close: () => void) => void } | null>(null);

function RowDropdownMenu<TData>({ menu, row }: { menu: DataTableRowMenu<TData>; row: TData }) {
  const items = resolveRowMenuItems(menu, row);
  const [open, setOpen] = useState(false);
  const coordination = useContext(RowMenuCoordination);
  useEffect(() => {
    coordination?.register(() => setOpen(false));
  }, [coordination]);
  // Approximates Base UI's per-close-reason finalFocus: a pointer close must
  // not restore focus to the trigger, or revealOnHover's focus-within stays
  // open forever; a keyboard close (Escape while the menu holds focus) keeps
  // the restore so a keyboard user doesn't lose their place.
  const closedByKeyboardRef = useRef(false);
  return (
    <DataTableCell kind="menu" revealOnHover>
      <DropdownMenu
        open={open}
        onOpenChange={(next) => {
          if (next) closedByKeyboardRef.current = false;
          setOpen(next);
        }}
      >
        <DropdownMenuTrigger asChild>
          <DataTableCellMenuTrigger
            label={resolveRowMenuLabel(menu, row)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') closedByKeyboardRef.current = true;
            }}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onCloseAutoFocus={(event) => {
            if (!closedByKeyboardRef.current) event.preventDefault();
          }}
        >
          {renderDropdownMenuItems(items, row)}
        </DropdownMenuContent>
      </DropdownMenu>
    </DataTableCell>
  );
}

function RowContextMenu<TData>({ menu, row, children }: { menu: DataTableRowMenu<TData>; row: TData; children: ReactElement }) {
  const [open, setOpen] = useState(false);
  const items = resolveRowMenuItems(menu, row);
  const closeDropdown = useRef<(() => void) | undefined>(undefined);
  const closedByKeyboardRef = useRef(false);
  const coordination = useMemo(() => ({ register: (close: () => void) => (closeDropdown.current = close) }), []);
  return (
    <RowMenuCoordination.Provider value={coordination}>
      <ContextMenu
        open={open}
        onOpenChange={(next) => {
          if (next) {
            closeDropdown.current?.();
            closedByKeyboardRef.current = false;
          }
          setOpen(next);
        }}
      >
        <ContextMenuTrigger asChild>
          {isValidElement(children)
            ? cloneElement(children as ReactElement<Record<string, unknown>>, {
                'data-context-menu-open': open ? '' : undefined,
                onKeyDownCapture: (event: ReactKeyboardEvent) => {
                  if (event.key === 'Escape') closedByKeyboardRef.current = true;
                },
                // A right-click inside the field being edited belongs to the
                // field (copy/paste/undo live there) — only while it holds
                // focus; otherwise it's a right-click on the row.
                onContextMenuCapture: (event: ReactMouseEvent) => {
                  const target = event.target as HTMLElement | null;
                  const field = target?.closest?.('input, textarea, [contenteditable]');
                  if (field && field === document.activeElement) event.stopPropagation();
                },
              })
            : children}
        </ContextMenuTrigger>
        <ContextMenuContent
          onCloseAutoFocus={(event) => {
            if (!closedByKeyboardRef.current) event.preventDefault();
          }}
        >
          {renderContextMenuItems(items, row)}
        </ContextMenuContent>
      </ContextMenu>
    </RowMenuCoordination.Provider>
  );
}

export function DataTable<TData>({
  columns,
  data,
  rowMenu,
  loading = false,
  skeletonRows,
  enableSelection = false,
  pinSelection = false,
  selectAll = 'header',
  selectAllTooltip = 'Select All',
  lines = 1,
  hideHeader = false,
  hideFooter = false,
  pageSize = 10,
  stickyHeader = true,
  maxHeight,
  fillViewport = false,
  getRowId,
  getRowHref,
  onRowClick,
  linkComponent,
  getRowLabel,
  emptyMessage = 'No results.',
  emptyState,
  ariaLabel,
  toolbar,
  manualSorting = false,
  manualFiltering = false,
  manualPagination = false,
  pageCount,
  rowCount,
  sorting: sortingProp,
  onSortingChange,
  columnFilters: columnFiltersProp,
  onColumnFiltersChange,
  pagination: paginationProp,
  onPaginationChange,
  rowSelection: rowSelectionProp,
  onRowSelectionChange,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
  virtualized = false,
  estimateRowHeight = 48,
  overscan = 8,
  embedded = false,
  embeddedBottomRounded = false,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useControllableState<SortingState>(sortingProp, onSortingChange, []);
  const [columnFilters, setColumnFilters] = useControllableState<ColumnFiltersState>(columnFiltersProp, onColumnFiltersChange, []);
  const [rowSelection, setRowSelection] = useControllableState<RowSelectionState>(rowSelectionProp, onRowSelectionChange, {});
  const [pagination, setPagination] = useControllableState<PaginationState>(paginationProp, onPaginationChange, { pageIndex: 0, pageSize });
  const rootRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [fillHeight, setFillHeight] = useState<number>();
  const effectiveMaxHeight = maxHeight ?? (fillViewport ? fillHeight : undefined);
  const infinite = !!onLoadMore;
  const virtualActive = virtualized && !!effectiveMaxHeight;

  // Without getRowLabel every row checkbox is named "Select row" and every
  // clickable row "View details for row", so a screen reader can't tell
  // rows apart. Warn in development, like Button's iconOnly check.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || getRowLabel) return;
    if (enableSelection || onRowClick) {
      console.warn(
        '[DataTable] Pass `getRowLabel` when enableSelection or onRowClick is set — ' +
          'otherwise every row control gets the same generic accessible name ("Select row").',
      );
    }
  }, [enableSelection, onRowClick, getRowLabel]);

  useEffect(() => {
    if (!fillViewport || maxHeight !== undefined) return;
    const root = rootRef.current;
    const container = containerRef.current;
    if (!root || !container) return;

    const recompute = () => {
      const footerHeight = footerRef.current?.getBoundingClientRect().height ?? 0;
      const rootGap = Number.parseFloat(window.getComputedStyle(root).rowGap) || 0;
      let bottomGutter = 0;
      let ancestor = root.parentElement;
      while (ancestor && ancestor !== document.body) {
        const paddingBottom = Number.parseFloat(window.getComputedStyle(ancestor).paddingBottom);
        if (paddingBottom > 0) {
          bottomGutter = paddingBottom;
          break;
        }
        ancestor = ancestor.parentElement;
      }
      const remaining = window.innerHeight - container.getBoundingClientRect().top;
      setFillHeight(Math.max(160, Math.floor(remaining - footerHeight - rootGap - bottomGutter)));
    };

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(root);
    window.addEventListener('resize', recompute);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', recompute);
    };
  }, [fillViewport, maxHeight]);

  const belowSm = useMediaQuery('(max-width: 639.98px)');
  const belowMd = useMediaQuery('(max-width: 767.98px)');
  const belowLg = useMediaQuery('(max-width: 1023.98px)');

  const selectionActive = enableSelection && !belowMd;

  useEffect(() => {
    if (!selectionActive) setRowSelection({});
  }, [selectionActive, setRowSelection]);

  const columnVisibility = useMemo<VisibilityState>(() => {
    const vis: VisibilityState = {};
    for (const col of columns) {
      const hb = col.meta?.hideBelow;
      if (!hb) continue;
      const anyCol = col as { id?: string; accessorKey?: string };
      const id = anyCol.id ?? anyCol.accessorKey;
      if (!id) continue;
      if ((hb === 'sm' && belowSm) || (hb === 'md' && belowMd) || (hb === 'lg' && belowLg)) vis[id] = false;
    }
    return vis;
  }, [columns, belowSm, belowMd, belowLg]);

  const tableColumns = useMemo<ColumnDef<TData, unknown>[]>(() => {
    const resolved: ColumnDef<TData, unknown>[] = [...columns];
    if (rowMenu) {
      resolved.push({
        id: ROW_MENU_COLUMN_ID,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => <RowDropdownMenu menu={rowMenu} row={row.original} />,
        size: 56,
        minSize: 56,
        maxSize: 56,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        meta: { control: true, pin: 'right', kind: 'menu' },
      });
    }
    if (!selectionActive) return resolved;
    const selectColumn: ColumnDef<TData, unknown> = {
      id: 'select',
      enableSorting: false,
      enableHiding: false,
      size: 44,
      meta: { control: true, kind: 'selector', pin: pinSelection ? 'left' : undefined },
      header:
        selectAll === 'header'
          ? ({ table }) => (
              <SelectAllTooltip content={selectAllTooltip}>
                <Checkbox
                  checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? 'indeterminate' : false}
                  onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                  aria-label="Select all rows on this page"
                />
              </SelectAllTooltip>
            )
          : () => <span className="sr-only">Select</span>,
      cell: ({ row }) => (
        <DataTableCell
          kind="selector"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(value) => row.toggleSelected(value)}
          label={getRowLabel ? `Select ${getRowLabel(row.original)}` : 'Select row'}
        />
      ),
    };
    return [selectColumn, ...resolved];
  }, [columns, rowMenu, selectionActive, selectAll, selectAllTooltip, getRowLabel, pinSelection]);

  const pinningActive = !belowMd;
  const columnPinning = useMemo<ColumnPinningState>(() => {
    const rowMenuRight = rowMenu ? [ROW_MENU_COLUMN_ID] : [];
    if (!pinningActive) return { left: [], right: rowMenuRight };
    const left: string[] = [];
    const right: string[] = [];
    for (const col of tableColumns) {
      const pin = col.meta?.pin;
      if (!pin) continue;
      const anyCol = col as { id?: string; accessorKey?: string };
      const id = anyCol.id ?? anyCol.accessorKey;
      if (!id) continue;
      (pin === 'left' ? left : right).push(id);
    }
    if (selectionActive && left.length && !left.includes('select')) left.unshift('select');
    return { left, right };
  }, [tableColumns, pinningActive, selectionActive, rowMenu]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting, columnFilters, rowSelection, columnVisibility, columnPinning, pagination },
    enableRowSelection: selectionActive,
    sortDescFirst: false,
    manualSorting,
    manualFiltering,
    manualPagination,
    ...(manualPagination && pageCount != null ? { pageCount } : {}),
    ...(manualPagination && rowCount != null ? { rowCount } : {}),
    ...(getRowId ? { getRowId: (row: TData) => getRowId(row) } : {}),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
    getPaginationRowModel: manualPagination || virtualActive || hideFooter ? undefined : getPaginationRowModel(),
  });

  const orderedLeafColumns = [...table.getVisibleLeafColumns()].sort((a, b) => pinRank(a.getIsPinned()) - pinRank(b.getIsPinned()));
  const colCount = orderedLeafColumns.length;
  const rows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: virtualActive ? rows.length : 0,
    getScrollElement: () => containerRef.current,
    estimateSize: () => estimateRowHeight,
    overscan,
    getItemKey: (index) => rows[index]?.id ?? index,
  });
  const virtualItems = virtualActive ? rowVirtualizer.getVirtualItems() : [];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const sync = () => {
      const hiddenRight = el.scrollWidth - el.clientWidth - el.scrollLeft;
      const hiddenBottom = el.scrollHeight - el.clientHeight - el.scrollTop;
      el.toggleAttribute('data-overflow-left', el.scrollLeft > 1);
      el.toggleAttribute('data-overflow-right', hiddenRight > 1);
      el.toggleAttribute('data-overflow-y', el.scrollTop > 1 || hiddenBottom > 1);
    };
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    const tableEl = el.querySelector('table');
    if (tableEl) observer.observe(tableEl);
    return () => {
      el.removeEventListener('scroll', sync);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const cell = target.closest('td');
      const row = cell?.parentElement;
      if (!cell || !row) return;
      const view = el.getBoundingClientRect();
      let leftCover = 0;
      let rightCover = 0;
      for (const sibling of row.children) {
        if (sibling === cell || !(sibling instanceof HTMLElement)) continue;
        const style = window.getComputedStyle(sibling);
        if (style.position !== 'sticky') continue;
        const rect = sibling.getBoundingClientRect();
        if (style.left !== 'auto') leftCover = Math.max(leftCover, rect.right - view.left);
        if (style.right !== 'auto') rightCover = Math.max(rightCover, view.right - rect.left);
      }
      const rect = cell.getBoundingClientRect();
      const hiddenLeft = view.left + leftCover - (rect.left - FOCUS_RING);
      const hiddenRight = rect.right + FOCUS_RING - (view.right - rightCover);
      if (hiddenLeft > 0) el.scrollBy({ left: -hiddenLeft });
      else if (hiddenRight > 0) el.scrollBy({ left: hiddenRight });
      if (el.scrollHeight > el.clientHeight) {
        const above = view.top - (rect.top - FOCUS_RING);
        const below = rect.bottom + FOCUS_RING - view.bottom;
        if (above > 0) el.scrollBy({ top: -above });
        else if (below > 0) el.scrollBy({ top: below });
      }
    };
    el.addEventListener('focusin', onFocusIn);
    return () => el.removeEventListener('focusin', onFocusIn);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.altKey || event.metaKey || event.ctrlKey) return;
      const dir = event.key === 'Enter' ? (event.shiftKey ? -1 : 1) : event.shiftKey ? 0 : event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
      if (!dir) return;
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.getAttribute('role') === 'combobox' || target.hasAttribute('aria-expanded')) return;
      if (event.key !== 'Enter' && target.closest('[data-number-field-group]')) return;
      const cell = target.closest('td');
      const row = cell?.parentElement;
      if (!cell || !row) return;
      const column = Array.prototype.indexOf.call(row.children, cell);
      let next = dir > 0 ? row.nextElementSibling : row.previousElementSibling;
      while (next && next.children.length !== row.children.length) {
        next = dir > 0 ? next.nextElementSibling : next.previousElementSibling;
      }
      const field = next?.children[column]?.querySelector<HTMLElement>('input:not([type=hidden]):not(:disabled), textarea:not(:disabled)');
      if (!field) return;
      event.preventDefault();
      field.focus();
    };
    el.addEventListener('keydown', onKeyDown);
    return () => el.removeEventListener('keydown', onKeyDown);
  }, []);

  const paddingTop = virtualItems.length ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length ? rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end : 0;

  const { pageIndex } = table.getState().pagination;
  const resolvedPageCount = table.getPageCount();
  const items = pageRange(pageIndex + 1, resolvedPageCount);
  const showPager = !infinite && !virtualActive && !loading && resolvedPageCount > 1;

  const RowLink: ElementType = linkComponent ?? 'a';
  const renderRow = (row: Row<TData>, virtualIndex?: number) => {
    const href = getRowHref?.(row.original);
    const clickable = Boolean(onRowClick);
    const tableRow = (
      <TableRow
        key={row.id}
        ref={virtualIndex !== undefined ? rowVirtualizer.measureElement : undefined}
        data-index={virtualIndex}
        data-state={selectionActive && row.getIsSelected() ? 'selected' : undefined}
        className={cn(
          'group/row cursor-pointer shadow-[inset_0_-1px_0_0_var(--color-border-border-subtle)] data-[context-menu-open]:bg-[var(--color-bg-neutral-bg-neutral-subtler)] has-[[data-state=open]]:bg-[var(--color-bg-neutral-bg-neutral-subtler)]',
          'data-[state=selected]:bg-[var(--color-bg-primary-bg-primary-subtle)] data-[state=selected]:hover:bg-[var(--color-bg-primary-bg-primary-subtler)]',
          href && 'relative',
        )}
        aria-label={clickable ? `View details for ${getRowLabel?.(row.original) ?? 'row'}` : undefined}
        onClick={(event) => {
          if (!onRowClick) return;
          const target = event.target as HTMLElement;
          if (target.closest("a, button, input, select, textarea, [role='button'], [role='checkbox'], [role='menuitem'], [role='switch']")) return;
          onRowClick(row.original);
        }}
        onKeyDown={(event) => {
          if (!onRowClick || event.target !== event.currentTarget) return;
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          onRowClick(row.original);
        }}
      >
        {[...row.getVisibleCells()]
          .sort((a, b) => pinRank(a.column.getIsPinned()) - pinRank(b.column.getIsPinned()))
          .map((cell) => {
            const meta = cell.column.columnDef.meta;
            const content = flexRender(cell.column.columnDef.cell, cell.getContext());
            const isPrimary = meta?.primary && href;
            return (
              <TableCell key={cell.id} {...bodyCellAttrs(cell.column)}>
                {isPrimary ? (
                  <RowLink
                    href={href}
                    className="block max-w-full truncate rounded-[var(--size-border-radius-border-radius-sm)] font-medium outline-none after:absolute after:inset-0 after:content-[''] hover:text-[var(--color-text-text-link)] focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]"
                  >
                    {content}
                  </RowLink>
                ) : (
                  content
                )}
              </TableCell>
            );
          })}
      </TableRow>
    );
    return rowMenu?.contextual ? (
      <RowContextMenu key={row.id} menu={rowMenu} row={row.original}>
        {tableRow}
      </RowContextMenu>
    ) : (
      tableRow
    );
  };

  return (
    <div ref={rootRef} className={cn('flex flex-col gap-3', className)}>
      {toolbar?.(table)}

      <div
        className={cn(
          'w-full rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]',
          embedded
            ? cn('rounded-t-[calc(var(--size-border-radius-border-radius-2xl)-1px)] border-0', embeddedBottomRounded ? 'rounded-b-[calc(var(--size-border-radius-border-radius-2xl)-1px)]' : 'rounded-b-none')
            : 'overflow-hidden',
        )}
      >
        <div
          ref={containerRef}
          aria-busy={loading || undefined}
          className={cn(
            'group/scroll relative isolate w-full',
            embedded && 'overflow-visible',
            // No DensityToggle system exists yet — fixed comfortable defaults.
            '[--wp-row-h:2.75rem] [--wp-row-h-2:3.5rem]',
            lines === 2 && '[--wp-cell-h:var(--wp-row-h-2)]',
            !embedded && (effectiveMaxHeight ? 'overflow-auto' : 'overflow-x-auto overflow-y-hidden'),
          )}
          style={effectiveMaxHeight ? { height: effectiveMaxHeight, maxHeight: effectiveMaxHeight } : undefined}
        >
          <table
            aria-label={ariaLabel}
            className={cn('w-full table-fixed font-body text-body-m', embedded ? 'border-separate border-spacing-0' : 'border-collapse')}
          >
            <colgroup>
              {orderedLeafColumns.map((col) => (
                <col key={col.id} style={col.columnDef.meta?.primary ? undefined : { width: `${col.getSize()}px` }} />
              ))}
            </colgroup>
            {!hideHeader && (
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent">
                    {[...headerGroup.headers]
                      .sort((a, b) => pinRank(a.column.getIsPinned()) - pinRank(b.column.getIsPinned()))
                      .map((header) => {
                        const meta = header.column.columnDef.meta;
                        const sorted = header.column.getIsSorted();
                        const pinned = header.column.getIsPinned();
                        return (
                          <TableHead
                            key={header.id}
                            scope="col"
                            aria-sort={header.column.getCanSort() ? (sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none') : undefined}
                            style={stickyStyle(header.column, { header: true, stickyTop: !!(stickyHeader && effectiveMaxHeight) })}
                            className={cn(
                              'overflow-visible border-[var(--color-border-border-subtle)]',
                              'group-data-[overflow-y]/scroll:first:rounded-tl-none group-data-[overflow-y]/scroll:last:rounded-tr-none',
                              meta?.align === 'right' && 'text-right',
                              pinned === 'left' && header.column.getIsLastColumn('left') && 'group-data-[overflow-left]/scroll:shadow-[inset_-1px_0_0_0_var(--color-border-border-subtle)]',
                              pinned === 'right' && header.column.getIsFirstColumn('right') && 'group-data-[overflow-right]/scroll:shadow-[inset_1px_0_0_0_var(--color-border-border-subtle)]',
                              meta?.headClassName,
                            )}
                          >
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        );
                      })}
                  </TableRow>
                ))}
              </TableHeader>
            )}
            <TableBody>
              {loading ? (
                Array.from({ length: skeletonRows ?? pageSize }).map((_, r) => (
                  <TableRow key={`skeleton-${r}`} aria-hidden="true" className="shadow-[inset_0_-1px_0_0_var(--color-border-border-subtle)] hover:bg-transparent">
                    {orderedLeafColumns.map((col) => {
                      const meta = col.columnDef.meta;
                      return (
                        <TableCell key={col.id} {...bodyCellAttrs(col)}>
                          <DataTableCell kind={meta?.kind ?? (meta?.control ? 'selector' : 'text')} loading />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : rows.length ? (
                virtualActive ? (
                  <>
                    {paddingTop > 0 && (
                      <tr aria-hidden="true">
                        <td colSpan={colCount} style={{ height: paddingTop }} />
                      </tr>
                    )}
                    {virtualItems.map((vi) => renderRow(rows[vi.index], vi.index))}
                    {paddingBottom > 0 && (
                      <tr aria-hidden="true">
                        <td colSpan={colCount} style={{ height: paddingBottom }} />
                      </tr>
                    )}
                  </>
                ) : (
                  rows.map((row) => renderRow(row))
                )
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={colCount} className={cn(emptyState ? 'p-0' : 'h-32 text-center text-[var(--color-text-text-subtler)]')}>
                    {emptyState ? emptyState(table) : emptyMessage}
                  </TableCell>
                </TableRow>
              )}
              {infinite && !loading && rows.length > 0 && hasMore && <LoadMoreRow colSpan={colCount} onLoadMore={onLoadMore} hasMore={hasMore} loadingMore={loadingMore} rootRef={containerRef} />}
            </TableBody>
          </table>
        </div>
      </div>

      {!hideFooter && showPager && (
        <div ref={footerRef} className="flex flex-wrap items-center justify-between gap-3 px-1">
          <Pagination className="ml-auto w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious asChild>
                  <button type="button" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                    <NavArrowLeft />
                    <span className="max-sm:sr-only">Previous</span>
                  </button>
                </PaginationPrevious>
              </PaginationItem>
              {items.map((item, i) => (
                <PaginationItem key={`${item}-${i}`}>
                  {item === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink asChild isActive={item === pageIndex + 1}>
                      <button type="button" onClick={() => table.setPageIndex(item - 1)} aria-label={`Go to page ${item}`}>
                        {item}
                      </button>
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext asChild>
                  <button type="button" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                    <span className="max-sm:sr-only">Next</span>
                    <NavArrowRight />
                  </button>
                </PaginationNext>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

export { DataTableColumnHeader };
