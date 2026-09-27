import { useState, useRef, useEffect, useLayoutEffect, Fragment } from 'react';
import type { ReactNode } from 'react';
import { Xmark } from 'iconoir-react';
import { KebabIconVertical } from './kebab-icon';
import type { ColumnFiltersState, Table as TanstackTable } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from './button';
import { Checkbox } from './checkbox';
import { ConfirmDialog } from './confirm-dialog';
import { Label } from './label';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { undoToast } from './undo-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { Toolbar, ToolbarButton } from './toolbar';
import { DotSeparator } from './dot-separator';

/**
 * The strip above a DataTable, in both of its states. Idle it's a
 * surface strip: the select-all checkbox on the left (plus `idleLeft`
 * beside it), whatever the table needs on the right (`children` —
 * typically a FilterField). As soon as rows are selected the same
 * strip becomes the primary-filled bulk bar: same checkbox in the
 * same place, the count in place of its label, bulk actions where the
 * filter was. Actions collapse into a "more" DropdownMenu only once
 * the bar actually runs out of room for them.
 *
 * Both states are one component so they share a box (same padding,
 * border, min height) — the checkbox never moves and the table below
 * never jumps when the first row is picked.
 *
 * Pass the live table instance from DataTable's `toolbar` render
 * prop; pair with `selectAll="toolbar"` so the checkbox column's
 * header cell stays empty.
 *
 * Only the bulk-action cluster is a Radix Toolbar (one tab stop,
 * arrow keys between actions). The idle state is not: a filter/search
 * region is a search landmark, and a single tab stop would fight
 * those controls.
 *
 * Two "select all" strategies: `resolveAllRowIds` awaits a full id
 * list up front (fine for a bulk endpoint that wants an explicit
 * array); `selectAllScope` instead tracks "every filtered row except
 * these ids" without ever enumerating the set, for a selection too
 * large to resolve — see its own doc comment. They're mutually
 * exclusive; `selectAllScope` wins if both are passed.
 */
export interface DataTableBulkAction<TData> {
  label: string;
  icon?: ReactNode;
  /** Visual weight for the inline button. Left unset, renders as ghost re-skinned for the primary fill. */
  type?: ButtonProps['type'];
  intent?: ButtonProps['intent'];
  /**
   * Marks a destructive action. In the overflow menu this maps to
   * DropdownMenuItem's destructive variant and selects the
   * destructive ConfirmDialog. Deliberately does NOT tint an inline
   * button — destructive red on the primary fill fails contrast.
   */
  destructive?: boolean;
  onSelect?: (rows: TData[]) => void;
  /** Fire with stable selected IDs, including rows not loaded by a server-backed table. */
  onSelectIds?: (ids: string[]) => void | Promise<void>;
  /**
   * Fires for "every filtered row except these ids" — the shape a
   * server-side bulk endpoint needs to act on a filtered selection
   * without the client ever holding the full id list. Used when the
   * toolbar's `selectAllScope` strategy is active; takes priority
   * there over `onSelectIds`/`onSelect`.
   */
  onSelectAllExcept?: (excludeIds: string[]) => void | Promise<void>;
  disabled?: (rows: TData[]) => boolean;
  disabledReason?: (rows: TData[]) => ReactNode;
  /** Open a ConfirmDialog (+ optional type-to-confirm + undo) over the selection. */
  confirm?: {
    title: (count: number) => ReactNode;
    body?: (count: number) => ReactNode;
    description?: (count: number) => ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    typeToConfirm?: string;
    confirmIcon?: ReactNode;
    onConfirm?: (rows: TData[]) => void;
    undo?: {
      title: (count: number) => string;
      description?: (count: number) => string;
      icon?: ReactNode;
      onUndo?: () => void;
    };
  };
}

export interface DataTableToolbarProps<TData> extends Omit<React.ComponentProps<'div'>, 'children'> {
  table: TanstackTable<TData>;
  actions?: DataTableBulkAction<TData>[];
  /** Hard ceiling on inline actions, even when the bar has room for more. Unset: no ceiling. */
  maxVisible?: number;
  selectAllLabel?: ReactNode;
  selectAllTooltip?: ReactNode;
  /** Floor, in px, the idle bar's trailing slot needs before select-all label gives way to a bare checkbox. */
  minTrailingWidth?: number;
  clearLabel?: string;
  /** Extra idle-state left-hand content (e.g. a result count). */
  idleLeft?: ReactNode;
  /** Right-hand side of the idle state — usually a FilterField. */
  children?: ReactNode;
  /** Flush treatment for a toolbar embedded at the bottom of a card. */
  embedded?: boolean;
  /**
   * Resolve IDs for every server-side row matching the table's current
   * filters. The original "select all" strategy for a server-backed
   * table: the toolbar awaits this (disabling the checkbox meanwhile)
   * and writes every returned id into `rowSelection`. Fine for a
   * selection a bulk endpoint expects as an explicit id array; for one
   * large enough that enumerating it is itself expensive, use
   * `selectAllScope` instead — the two are mutually exclusive
   * strategies, and `selectAllScope` wins if both are passed.
   */
  resolveAllRowIds?: (filters: ColumnFiltersState) => Promise<string[]>;
  /**
   * Total rows matching the table's current server-side filters.
   * Paired with `selectAllScope`/`onSelectAllScopeChange` to turn
   * "select all" into "every filtered row" without resolving a single
   * id — most paginated list endpoints already return this count
   * alongside `items`/`total`. Ignored unless `selectAllScope` is also
   * passed (even as `null`).
   */
  allRowsCount?: number;
  /**
   * Selection strategy: "every filtered row except these ids", kept by
   * the caller rather than resolved from a fetch. Passing this prop at
   * all (even `null`) opts the table into the strategy; `null` means
   * it's off, `{ excludeIds }` on with those rows carved out. The
   * toolbar keeps `table`'s own `rowSelection` filled in for whichever
   * rows are loaded — so DataTable's generated per-row checkboxes read
   * correctly under "select all" — and reports a loaded row's manual
   * check/uncheck back through `onSelectAllScopeChange`. The caller
   * owns clearing it (e.g. on a filter change); the toolbar never
   * resets it on its own.
   */
  selectAllScope?: { excludeIds: string[] } | null;
  onSelectAllScopeChange?: (scope: { excludeIds: string[] } | null) => void;
}

/** The id DataTable gives its generated checkbox column. */
export const SELECT_COLUMN_ID = 'select';

/**
 * The floor has to clear the tallest *real* content in either state or
 * min-height stops being load-bearing — content simply pushes the box
 * taller than it in whichever state needs more room, and the two states
 * end up different heights. Budget: border (1px × 2 = 2px) + py-2
 * (8px × 2 = 16px) + tallest inner control. Idle's right-hand slot is
 * usually a default-size TextField at 40px
 * (--size-size-control-size-control-2xl) — taller than the selected
 * bar's default ToolbarButton (36px) — so 40px is the one to clear:
 * 40 + 16 + 2 = 58px. The old min-h-14 (56px) sat 2px under that, so
 * idle alone got pushed taller than its own floor while selected (36px
 * content, under the floor) stayed pinned at it — a real 2px jump on
 * every idle<->selected transition, independent of border color.
 */
/**
 * overflow-x-auto lives here, not on just the idle bar's own className —
 * it used to be idle-only, which meant idle could grow a real horizontal
 * scrollbar (reserving ~15-17px of height on non-overlay-scrollbar
 * platforms) that the selected bar never could, since it never had
 * overflow-x-auto at all. Both states now reserve the same scrollbar
 * gutter, whether or not it's ever actually needed.
 */
const shell = 'rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid py-2 px-4 min-h-[58px] overflow-x-auto';

/**
 * Ghost controls re-skinned for the primary fill (plain ghost reads as
 * muted there) — the real -on-primary tokens now, not ad-hoc rgba/white
 * values: text stays full white, icon dims slightly to white-a800 (per
 * the on-primary spec), hover/press get their own dedicated wash tokens
 * instead of a flat white/15, and the focus ring uses
 * --color-focus-focus-ring-on-primary instead of a hardcoded rgba.
 */
// hover:not-disabled: (not bare hover:) matches the exact modifier chain
// Button's own ghost compoundVariant uses for its hover background
// (hover:not-disabled:bg-[...]). tailwind-merge only dedupes same-property
// utilities when their modifier stack matches textually — hover:bg-* here
// (without not-disabled) was a DIFFERENT group from the base's
// hover:not-disabled:bg-*, so both stayed in the class list and it came
// down to Tailwind's generated stylesheet order — effectively random —
// which one actually painted. active:not-disabled: already matched the
// base exactly, which is why pressed worked but hover didn't.
const onFilled =
  'text-[var(--color-text-text-on-primary)] [&_svg]:text-[var(--color-icon-icon-on-primary)] ' +
  'hover:not-disabled:bg-[var(--color-bg-primary-on-primary-hover)] hover:text-[var(--color-text-text-on-primary)] ' +
  'active:not-disabled:bg-[var(--color-bg-primary-on-primary-pressed)] ' +
  'focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring-on-primary)]';

function SelectAllTooltip({ children, content }: { children: React.ReactElement; content: ReactNode }) {
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
 * Measures each action's true rendered width (off-screen) against the
 * Toolbar's real clientWidth (reacting to resize via ResizeObserver),
 * so only the actions that would not fit — alongside the kebab
 * trigger and clear button — move into the overflow menu.
 */
function useVisibleActionCount<TData>(actions: DataTableBulkAction<TData>[], maxVisible: number | undefined, hasSelection: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const clearRef = useRef<HTMLButtonElement>(null);
  const [measuredCount, setMeasuredCount] = useState(actions.length);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const mirror = mirrorRef.current;
    const clearButton = clearRef.current;
    if (!container || !mirror || !clearButton) return;

    const KEBAB_WIDTH = 36;

    const recalc = () => {
      const available = container.clientWidth;
      const gap = parseFloat(getComputedStyle(container).columnGap) || 0;
      const clearWidth = clearButton.offsetWidth;
      const widths = Array.from(mirror.children).map((child) => (child as HTMLElement).offsetWidth);

      const everythingInlineWidth = widths.reduce((sum, width) => sum + width, 0) + clearWidth + gap * widths.length;
      if (everythingInlineWidth <= available) {
        setMeasuredCount(widths.length);
        return;
      }

      let used = KEBAB_WIDTH + clearWidth + gap * 2;
      let count = 0;
      for (const width of widths) {
        if (used + width + gap > available) break;
        used += width + gap;
        count += 1;
      }
      setMeasuredCount(count);
    };

    recalc();
    const observer = new ResizeObserver(recalc);
    observer.observe(container);
    return () => observer.disconnect();
  }, [actions, hasSelection]);

  return {
    visibleCount: maxVisible != null ? Math.min(measuredCount, maxVisible) : measuredCount,
    containerRef,
    mirrorRef,
    clearRef,
  };
}

const IDLE_ROW_GAP = 16;
const MIN_TRAILING_WIDTH = 160;

/**
 * The select-all label is the first thing the idle bar's left slot
 * gives up once there isn't room for both it and whatever sits on
 * the right. Decides ahead of the squeeze from the bar's clientWidth
 * against the label's natural width, read off an always-mounted
 * off-screen mirror (measuring the live label would be circular).
 */
function useSelectAllFits(label: ReactNode, minTrailingWidth: number) {
  const barRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const [fits, setFits] = useState(true);

  useLayoutEffect(() => {
    const bar = barRef.current;
    const mirror = mirrorRef.current;
    if (!bar || !mirror) return;

    const recalc = () => {
      const remaining = bar.clientWidth - mirror.offsetWidth - IDLE_ROW_GAP;
      setFits(remaining >= minTrailingWidth);
    };

    recalc();
    const observer = new ResizeObserver(recalc);
    observer.observe(bar);
    window.addEventListener('resize', recalc);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', recalc);
    };
  }, [label, minTrailingWidth]);

  return { barRef, mirrorRef, fits };
}

export function DataTableToolbar<TData>({
  table,
  actions = [],
  maxVisible,
  selectAllLabel = 'Select all',
  selectAllTooltip = 'Select All',
  minTrailingWidth = MIN_TRAILING_WIDTH,
  clearLabel = 'Clear selection',
  idleLeft,
  children,
  embedded = false,
  resolveAllRowIds,
  allRowsCount,
  selectAllScope,
  onSelectAllScopeChange,
  className,
  ...props
}: DataTableToolbarProps<TData>) {
  const [confirmIdx, setConfirmIdx] = useState<number | null>(null);
  const [resolvedAllIds, setResolvedAllIds] = useState<string[]>([]);
  const [resolvingAll, setResolvingAll] = useState(false);
  // Passing the prop at all — even `null` — opts a table into this
  // strategy; leaving it out keeps the `resolveAllRowIds` / plain-toggle
  // behavior below.
  const usesSelectAllScope = selectAllScope !== undefined;

  const selectable = table.getAllColumns().some((column) => column.id === SELECT_COLUMN_ID);
  const selectedRows = table.getFilteredSelectedRowModel().rows.map((r) => r.original);
  const selectedIds = selectable
    ? Object.entries(table.getState().rowSelection)
        .filter(([, selected]) => selected)
        .map(([id]) => id)
    : [];
  const count = usesSelectAllScope
    ? selectAllScope
      ? Math.max((allRowsCount ?? 0) - selectAllScope.excludeIds.length, 0)
      : selectedRows.length
    : resolveAllRowIds
      ? selectedIds.length
      : selectable
        ? selectedRows.length
        : 0;
  const clear = () => {
    setResolvedAllIds([]);
    if (usesSelectAllScope) onSelectAllScopeChange?.(null);
    table.resetRowSelection();
  };

  // selectAllScope: keep `rowSelection` filled in for whichever rows are
  // loaded, so DataTable's generated per-row checkboxes (driven by
  // `row.getIsSelected()`) read correctly under "select all" without this
  // toolbar — or the caller — ever enumerating the full filtered set. Only
  // fills rows with no entry yet (a freshly loaded page): it never
  // overwrites a row the user already toggled explicitly, loaded or not.
  const loadedRowCount = table.getRowModel().rows.length;
  useEffect(() => {
    if (!usesSelectAllScope || !selectAllScope) return;
    const current = table.getState().rowSelection;
    const excluded = new Set(selectAllScope.excludeIds);
    const additions: Record<string, boolean> = {};
    let changed = false;
    for (const row of table.getRowModel().rows) {
      if (!(row.id in current)) {
        additions[row.id] = !excluded.has(row.id);
        changed = true;
      }
    }
    if (changed) table.setRowSelection({ ...current, ...additions });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usesSelectAllScope, selectAllScope, loadedRowCount]);

  // The reverse direction: a loaded row unchecked (or re-checked) through
  // DataTable's own per-row checkbox flips its entry in `rowSelection` —
  // surface that back to the caller as an exclusion (or the removal of one).
  const rowSelectionState = table.getState().rowSelection;
  useEffect(() => {
    if (!usesSelectAllScope || !selectAllScope) return;
    const excludedNow = Object.entries(rowSelectionState)
      .filter(([, isSelected]) => isSelected === false)
      .map(([id]) => id);
    const unchanged =
      excludedNow.length === selectAllScope.excludeIds.length &&
      excludedNow.every((id) => selectAllScope.excludeIds.includes(id));
    if (!unchanged) onSelectAllScopeChange?.({ excludeIds: excludedNow });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usesSelectAllScope, rowSelectionState]);

  const active = confirmIdx != null ? actions[confirmIdx] : null;
  const { visibleCount, containerRef, mirrorRef, clearRef } = useVisibleActionCount(actions, maxVisible, count > 0);
  const visible = actions.slice(0, visibleCount);
  const overflow = actions.slice(visibleCount);
  const { barRef: idleBarRef, mirrorRef: selectAllMirrorRef, fits: selectAllFits } = useSelectAllFits(selectAllLabel, minTrailingWidth);

  if (!selectable && !idleLeft && !children) return null;

  const run = (action: DataTableBulkAction<TData>, index: number) => {
    if (action.disabled?.(selectedRows)) return;
    if (action.confirm) {
      setConfirmIdx(index);
      return;
    }
    if (usesSelectAllScope && selectAllScope && action.onSelectAllExcept) void action.onSelectAllExcept(selectAllScope.excludeIds);
    else if (resolveAllRowIds && action.onSelectIds) void action.onSelectIds(selectedIds);
    else action.onSelect?.(selectedRows);
    setTimeout(clear, 0);
  };

  // Selected-bar look now comes for free from Checkbox's own
  // data-surface="primary" handling (set on the wrapping bar below)
  // instead of an ad-hoc white-override className here.
  const selectAllCheckbox = (
    <Checkbox
      checked={
        usesSelectAllScope
          ? selectAllScope
            ? true
            : selectedIds.length > 0
              ? 'indeterminate'
              : false
          : resolveAllRowIds
            ? resolvedAllIds.length > 0 && selectedIds.length === new Set(resolvedAllIds).size
              ? true
              : selectedIds.length > 0
                ? 'indeterminate'
                : false
            : table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? 'indeterminate'
                : false
      }
      disabled={resolvingAll}
      onCheckedChange={async (value) => {
        if (usesSelectAllScope) {
          if (!value) {
            clear();
            return;
          }
          table.toggleAllPageRowsSelected(true);
          onSelectAllScopeChange?.({ excludeIds: [] });
          return;
        }
        if (!resolveAllRowIds) {
          table.toggleAllPageRowsSelected(!!value);
          return;
        }
        if (!value) {
          clear();
          return;
        }
        setResolvingAll(true);
        try {
          const ids = await resolveAllRowIds(table.getState().columnFilters);
          setResolvedAllIds(ids);
          table.setRowSelection(Object.fromEntries(ids.map((id) => [id, true])));
        } finally {
          setResolvingAll(false);
        }
      }}
      aria-label={typeof selectAllLabel === 'string' ? selectAllLabel : undefined}
    />
  );
  const selectAllCheckboxWithTooltip = <SelectAllTooltip content={selectAllTooltip}>{selectAllCheckbox}</SelectAllTooltip>;

  const bar =
    count > 0 ? (
      <div
        data-slot="data-table-toolbar"
        data-state="selected"
        data-surface="primary"
        className={cn(
          shell,
          'flex items-center gap-2 border-transparent bg-[var(--color-bg-primary-bg-primary)] text-[var(--color-icon-icon-on-dark)] shadow-md',
          embedded && 'rounded-none border-x-0 border-b-0 border-t border-[var(--color-border-border-subtle)] shadow-none',
          className,
        )}
        {...props}
      >
        <Label className="flex w-fit cursor-pointer items-center gap-2 font-body text-body-m text-[var(--color-icon-icon-on-dark)]">
          {selectAllCheckboxWithTooltip}
          <span className="inline-block min-w-[10ch] whitespace-nowrap" aria-live="polite">
            <span className="tabular-nums">{count}</span> selected
          </span>
        </Label>

        {/* Off-screen twin of every action, used only to measure width — see useVisibleActionCount. */}
        <div ref={mirrorRef} aria-hidden="true" className="pointer-events-none invisible fixed top-0 left-0 flex gap-1">
          {actions.map((action) => (
            <Button key={action.label} type={action.type ?? 'ghost'} intent={action.intent} leftIcon={action.icon} className="whitespace-nowrap">
              {action.label}
            </Button>
          ))}
        </div>

        {/* justify-end: the actions themselves (Reissue/Archive/Delete) were
            only ever flow-left inside this flex-1 container — only the
            Clear button got pushed right, via its own conditional ml-auto.
            justify-end pushes the whole cluster (actions + overflow kebab +
            Clear) flush to the bar's right edge together. */}
        <Toolbar ref={containerRef} aria-label="Bulk actions" className="flex min-w-0 flex-1 items-center justify-end gap-1">
          {/* No more per-item ml-auto here (pushesClusterRight) — that was
              the old way of nudging the cluster right before the Toolbar
              container itself had justify-end. margin-left:auto on one
              item soaks up ALL the row's free space at that one boundary,
              which fights justify-end rather than cooperating with it
              (everything before the auto-margined item just packs left
              instead of joining the flush-right group). justify-end alone
              on <Toolbar> now positions the whole cluster consistently,
              with or without overflow. */}
          {visible.map((action, index) => {
            const isDisabled = action.disabled?.(selectedRows) ?? false;
            const button = (
              <ToolbarButton disabled={isDisabled} className={cn('whitespace-nowrap', !action.type && onFilled)} onClick={() => run(action, index)}>
                {action.icon}
                {action.label}
              </ToolbarButton>
            );
            if (!isDisabled || !action.disabledReason) {
              return <Fragment key={action.label}>{button}</Fragment>;
            }
            return (
              <Tooltip key={action.label}>
                <TooltipTrigger asChild>
                  <span className="inline-flex">{button}</span>
                </TooltipTrigger>
                <TooltipContent>{action.disabledReason(selectedRows)}</TooltipContent>
              </Tooltip>
            );
          })}

          {overflow.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ToolbarButton aria-label="More bulk actions" iconOnly className={cn('[&_svg]:text-[var(--color-text-text)]', onFilled)}>
                  <KebabIconVertical />
                </ToolbarButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="bottom">
                {overflow.map((action, index) => {
                  const isDisabled = action.disabled?.(selectedRows) ?? false;
                  return (
                    <DropdownMenuItem
                      key={action.label}
                      variant={action.destructive ? 'destructive' : 'default'}
                      disabled={isDisabled}
                      title={isDisabled ? action.disabledReason?.(selectedRows)?.toString() : undefined}
                      onSelect={() => run(action, visibleCount + index)}
                    >
                      {action.icon}
                      {action.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <ToolbarButton ref={clearRef} aria-label={clearLabel} iconOnly className={onFilled} onClick={clear}>
            <Xmark aria-hidden="true" />
          </ToolbarButton>
        </Toolbar>
      </div>
    ) : (
      <div
        ref={idleBarRef}
        data-slot="data-table-toolbar"
        data-state="default"
        data-select-all-label-hidden={selectable && !selectAllFits ? 'true' : undefined}
        className={cn(
          shell,
          'flex flex-row flex-nowrap items-center justify-between gap-4 border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]',
          embedded && 'rounded-none border-x-0 border-b-0 border-t shadow-none',
          className,
        )}
        {...props}
      >
        {selectable && (
          <div ref={selectAllMirrorRef} aria-hidden="true" className="pointer-events-none invisible fixed top-0 left-0 flex items-center gap-2 font-body text-body-m font-medium whitespace-nowrap">
            <span className="size-4 shrink-0" />
            {selectAllLabel}
          </div>
        )}
        {(selectable || idleLeft) && (
          <div className="flex w-fit shrink-0 flex-wrap items-center gap-3">
            {selectable && (selectAllFits ? <Label className="flex w-fit shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap font-body text-body-m">{selectAllCheckboxWithTooltip}{selectAllLabel}</Label> : selectAllCheckboxWithTooltip)}
            {selectable && idleLeft && <DotSeparator className="mx-0" />}
            {idleLeft}
          </div>
        )}
        {/* ml-auto in addition to the row's own justify-between — belt and
            suspenders so the right-hand slot (filter/search, a button
            group, whatever gets passed) is flush against the bar's right
            edge (pr-4) no matter what width or internal wrapper the
            passed-in content itself renders with. */}
        <div className="ml-auto flex shrink items-center gap-2">{children}</div>
      </div>
    );

  return (
    <>
      {bar}
      {active?.confirm && (
        <ConfirmDialog
          open={confirmIdx != null}
          onOpenChange={(o) => {
            if (!o) setConfirmIdx(null);
          }}
          variant={active.destructive ? 'destructive' : 'default'}
          title={active.confirm.title(count)}
          description={active.confirm.description?.(count)}
          confirmValue={active.confirm.typeToConfirm}
          confirmLabel={active.confirm.confirmLabel}
          cancelLabel={active.confirm.cancelLabel}
          confirmIcon={active.confirm.confirmIcon}
          onConfirm={() => {
            const c = active.confirm!;
            c.onConfirm?.(selectedRows);
            if (c.undo) {
              undoToast({
                title: c.undo.title(count),
                description: c.undo.description?.(count),
                ...(c.undo.icon !== undefined ? { icon: c.undo.icon } : {}),
                onUndo: () => c.undo!.onUndo?.(),
              });
            }
            setTimeout(clear, 0);
          }}
        >
          {active.confirm.body?.(count)}
        </ConfirmDialog>
      )}
    </>
  );
}
