import { useState, useId, Fragment } from 'react';
import type { ReactNode } from 'react';
import type { ColumnDef, Table as TanstackTable } from '@tanstack/react-table';
import { Search } from 'iconoir-react';
import { KebabIconVertical } from '../ui/kebab-icon';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { DataTableToolbar, type DataTableBulkAction } from '@/components/ui/data-table-toolbar';
import { DataTableCell } from '@/components/ui/data-table-cell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { FilterField, type FilterAttribute, type AppliedFilter } from '@/components/ui/filter-field';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { undoToast } from '@/components/ui/undo-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusDot } from '@/components/ui/status-dot';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

/**
 * A reusable list/index screen: DataTable + DataTableToolbar wired to
 * a search box, faceted filters (via FilterField) and optional bulk
 * actions, plus an optional per-row actions menu with confirm +
 * undo. Pass `columns`/`data` for a real dataset; with neither, it
 * renders a seeded "Team users" list standalone.
 *
 * Simplified vs the reference given this session's remaining budget:
 * only the FilterField-based faceted-search mode is ported (the
 * reference's parallel plain-search + MultiSelect-row mode, and its
 * dismissible FilterChip strip, are not) — FilterField is the more
 * complete of the two and already covers select/text/number/date
 * facets in one control.
 *
 *   <ListScreen columns={cols} data={rows} primaryKey="name"
 *     facets={[{ key: "status", label: "Status", type: "select", options: [...] }]}
 *     bulkActions={[...]} rowActions={(row) => [...]} />
 */
export type ListFacet =
  | { key: string; label: string; type: 'select'; options: { value: string; label: string }[]; searchable?: boolean; icon?: ReactNode }
  | { key: string; label: string; type: 'text'; placeholder?: string; icon?: ReactNode }
  | { key: string; label: string; type: 'number'; icon?: ReactNode }
  | { key: string; label: string; type: 'date'; range?: boolean; icon?: ReactNode };

export interface ListRowAction<Row> {
  label: string;
  icon?: ReactNode;
  destructive?: boolean;
  separatorBefore?: boolean;
  onSelect?: (row: Row) => void;
  confirm?: {
    title: (row: Row) => ReactNode;
    description?: (row: Row) => ReactNode;
    typeToConfirm?: (row: Row) => string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmIcon?: ReactNode;
    onConfirm?: (row: Row) => void;
    undo?: { title: (row: Row) => string; description?: (row: Row) => string; icon?: ReactNode; onUndo?: (row: Row) => void };
  };
}

export interface ListScreenProps<Row> {
  columns?: ColumnDef<Row, unknown>[];
  data?: Row[];
  /** Column id the free-text search box filters on. */
  primaryKey?: string;
  searchPlaceholder?: string;
  facets?: ListFacet[];
  bulkActions?: DataTableBulkAction<Row>[];
  rowActions?: ListRowAction<Row>[] | ((row: Row) => ListRowAction<Row>[]);
  getRowId?: (row: Row) => string;
  getRowLabel?: (row: Row) => string;
  noun?: { one: string; many: string };
  loading?: boolean;
  emptyMessage?: ReactNode;
  ariaLabel?: string;
  getRowHref?: (row: Row) => string;
}

function runConfirmUndo<Row>(action: ListRowAction<Row>, row: Row) {
  const confirm = action.confirm;
  if (!confirm) return;
  confirm.onConfirm?.(row);
  if (confirm.undo) {
    undoToast({
      title: confirm.undo.title(row),
      description: confirm.undo.description?.(row),
      ...(confirm.undo.icon !== undefined ? { icon: confirm.undo.icon } : {}),
      onUndo: () => confirm.undo!.onUndo?.(row),
    });
  }
}

function RowMenu<Row>({ row, actions, rowLabel }: { row: Row; actions: ListRowAction<Row>[]; rowLabel: string }) {
  const [confirmIdx, setConfirmIdx] = useState<number | null>(null);
  const active = confirmIdx != null ? actions[confirmIdx] : null;

  return (
    <DataTableCell kind="menu">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button appearance="ghost" iconOnly size="md" aria-label={`Actions for ${rowLabel}`} className="max-md:size-11" leftIcon={<KebabIconVertical />} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((a, i) => (
            <Fragment key={i}>
              {a.separatorBefore && <DropdownMenuSeparator />}
              <DropdownMenuItem
                tone={a.destructive ? 'danger' : 'neutral'}
                onSelect={a.confirm ? () => setTimeout(() => setConfirmIdx(i), 0) : () => a.onSelect?.(row)}
              >
                {a.icon}
                {a.label}
              </DropdownMenuItem>
            </Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {active?.confirm && (
        <ConfirmDialog
          open={confirmIdx != null}
          onOpenChange={(o) => !o && setConfirmIdx(null)}
          tone={active.destructive ? 'danger' : 'neutral'}
          title={active.confirm.title(row)}
          description={active.confirm.description?.(row)}
          confirmValue={active.confirm.typeToConfirm?.(row)}
          confirmLabel={active.confirm.confirmLabel}
          cancelLabel={active.confirm.cancelLabel}
          confirmIcon={active.confirm.confirmIcon}
          onConfirm={() => runConfirmUndo(active, row)}
        />
      )}
    </DataTableCell>
  );
}

function isSelectFacet(f: ListFacet): f is Extract<ListFacet, { type: 'select' }> {
  return f.type === 'select';
}

function ListToolbar<Row>({ table, primaryKey, searchPlaceholder, facets, bulkActions, noun, loading }: { table: TanstackTable<Row>; primaryKey: string; searchPlaceholder: string; facets: ListFacet[]; bulkActions?: DataTableBulkAction<Row>[]; noun: { one: string; many: string }; loading?: boolean }) {
  const searchId = useId();
  const searchCol = table.getColumn(primaryKey);
  const query = (searchCol?.getFilterValue() as string | undefined) ?? '';
  const resultCount = table.getFilteredRowModel().rows.length;

  const hasFacets = facets.length > 0;

  const attributes: FilterAttribute[] = facets.map((facet) =>
    isSelectFacet(facet)
      ? { key: facet.key, label: facet.label, type: 'select', multiple: true, options: facet.options, ...(facet.searchable !== undefined ? { searchable: facet.searchable } : {}) }
      : facet.type === 'text'
        ? { key: facet.key, label: facet.label, type: 'text', placeholder: facet.placeholder }
        : facet.type === 'number'
          ? { key: facet.key, label: facet.label, type: 'number' }
          : { key: facet.key, label: facet.label, type: 'date', range: facet.range },
  );

  const applied: AppliedFilter[] = [];
  for (const facet of facets) {
    const raw = table.getColumn(facet.key)?.getFilterValue();
    if (raw == null || raw === '') continue;
    if (Array.isArray(raw)) for (const v of raw) applied.push({ key: facet.key, value: String(v) });
    else applied.push({ key: facet.key, value: String(raw) });
  }

  const applyFilters = (next: AppliedFilter[]) => {
    const facetKeys = new Set(facets.map((f) => f.key));
    table.setColumnFilters((prev) => [
      ...prev.filter((f) => !facetKeys.has(f.id)),
      ...facets.flatMap((facet) => {
        const values = next.filter((f) => f.key === facet.key).map((f) => f.value);
        if (!values.length) return [];
        return [{ id: facet.key, value: isSelectFacet(facet) ? values : values[0] }];
      }),
    ]);
  };

  const resultCountNode = (
    <p className="font-body text-body-m text-[var(--color-text-text-subtler)]" aria-live="polite" aria-atomic="true">
      {!loading && (
        <>
          <span className="font-semibold tabular-nums text-[var(--color-text-text)]">{resultCount}</span> {resultCount === 1 ? noun.one : noun.many}
        </>
      )}
    </p>
  );

  return (
    <DataTableToolbar table={table} actions={bulkActions ?? []} idleLeft={resultCountNode}>
      <div className="flex flex-wrap items-center gap-2.5">
        {hasFacets ? (
          <FilterField
            attributes={attributes}
            value={applied}
            onValueChange={applyFilters}
            query={query}
            onQueryChange={(next) => searchCol?.setFilterValue(next)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
        ) : (
          <div className="w-full min-w-0 sm:w-[16.25rem]">
            <Label htmlFor={searchId} className="sr-only">
              {searchPlaceholder}
            </Label>
            <InputGroup>
              <InputGroupAddon position="start" divider={false}>
                <Search />
              </InputGroupAddon>
              <InputGroupInput id={searchId} type="search" placeholder={searchPlaceholder} autoCapitalize="none" autoCorrect="off" spellCheck={false} value={query} onChange={(e) => searchCol?.setFilterValue(e.target.value)} />
            </InputGroup>
          </div>
        )}
      </div>
    </DataTableToolbar>
  );
}

/* Seeded default: a "Team users" list, so <ListScreen/> renders standalone. */

interface SeededUser {
  [key: string]: unknown;
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'suspended' | 'invited';
}

const SEEDED_USERS: SeededUser[] = [
  { id: 'u-1', name: 'Alex Morgan', email: 'alex@seashell.dev', role: 'Owner', status: 'active' },
  { id: 'u-2', name: 'Jordan Kim', email: 'jordan@seashell.dev', role: 'Admin', status: 'active' },
  { id: 'u-3', name: 'Priya Nair', email: 'priya@seashell.dev', role: 'Member', status: 'active' },
  { id: 'u-4', name: 'Sam Okoro', email: 'sam@seashell.dev', role: 'Billing', status: 'suspended' },
  { id: 'u-5', name: 'Dana Okafor', email: 'dana@contractor.dev', role: 'Member', status: 'invited' },
];

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
}

const STATUS_TONE = { active: 'success', suspended: 'danger', invited: 'warning' } as const;

const SEEDED_COLUMNS: ColumnDef<SeededUser, unknown>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <DataTableCell
        kind="primary"
        leading={
          <Avatar className="size-8">
            <AvatarFallback>{initials(row.original.name)}</AvatarFallback>
          </Avatar>
        }
        value={row.original.name}
        secondary={row.original.email}
        secondaryMono
      />
    ),
    meta: { primary: true, kind: 'primary' },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => <DataTableCell value={row.original.role} />,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <DataTableCell kind="status" tone={STATUS_TONE[row.original.status]} label={row.original.status[0].toUpperCase() + row.original.status.slice(1)} />
    ),
    meta: { kind: 'badge' },
  },
];

export function ListScreen<Row extends Record<string, unknown> = SeededUser>(props: ListScreenProps<Row> = {}) {
  const useDefault = props.columns == null && props.data == null;
  const columns = (useDefault ? SEEDED_COLUMNS : props.columns) as ColumnDef<Row, unknown>[];
  const data = (useDefault ? SEEDED_USERS : props.data) as Row[];
  const primaryKey = props.primaryKey ?? 'name';
  const searchPlaceholder = props.searchPlaceholder ?? 'Search…';
  const facets: ListFacet[] = useDefault
    ? [
        {
          key: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { value: 'active', label: 'Active' },
            { value: 'suspended', label: 'Suspended' },
            { value: 'invited', label: 'Invited' },
          ],
        },
      ]
    : (props.facets ?? []);
  const noun = props.noun ?? { one: 'result', many: 'results' };
  const getRowLabel = props.getRowLabel ?? ((row: Row) => String((row as { name?: unknown }).name ?? 'row'));

  const rowMenuColumns: ColumnDef<Row, unknown>[] = props.rowActions
    ? [
        ...columns,
        {
          id: '__row-actions',
          header: () => <span className="sr-only">Actions</span>,
          cell: ({ row }) => {
            const actions = typeof props.rowActions === 'function' ? props.rowActions(row.original) : props.rowActions!;
            return <RowMenu row={row.original} actions={actions} rowLabel={getRowLabel(row.original)} />;
          },
          size: 56,
          enableSorting: false,
          meta: { control: true, pin: 'right', kind: 'menu' },
        },
      ]
    : columns;

  return (
    <DataTable
      columns={rowMenuColumns}
      data={data}
      getRowId={props.getRowId as ((row: Row) => string) | undefined}
      // Was computed for the row menu only and never handed to DataTable, so
      // every selection checkbox was just "Select row".
      getRowLabel={getRowLabel}
      getRowHref={props.getRowHref}
      loading={props.loading}
      emptyMessage={props.emptyMessage ?? 'No results.'}
      ariaLabel={props.ariaLabel ?? 'List'}
      enableSelection={Boolean(props.bulkActions?.length)}
      selectAll="toolbar"
      toolbar={(table) => <ListToolbar table={table} primaryKey={primaryKey} searchPlaceholder={searchPlaceholder} facets={facets} bulkActions={props.bulkActions} noun={noun} loading={props.loading} />}
    />
  );
}
