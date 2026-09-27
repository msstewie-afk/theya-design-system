import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { Archive, Refresh, Search, Trash } from 'iconoir-react';
import { DataTable, DataTableColumnHeader } from './data-table';
import { DataTableToolbar, type DataTableBulkAction } from './data-table-toolbar';
import { DataTableCell } from './data-table-cell';
import { TextField } from './text-field';
import type { StatusTone } from './status-dot';

interface Site {
  domain: string;
  status: 'running' | 'suspended' | 'error';
  plan: string;
}

const STATUS: Record<Site['status'], { label: string; tone: StatusTone }> = {
  running: { label: 'Running', tone: 'success' },
  suspended: { label: 'Suspended', tone: 'warning' },
  error: { label: 'Error', tone: 'danger' },
};

const SITES: Site[] = [
  { domain: 'shop.seashell.dev', status: 'running', plan: 'Pro' },
  { domain: 'blog.seashell.dev', status: 'running', plan: 'Starter' },
  { domain: 'api.seashell.dev', status: 'error', plan: 'Scale' },
  { domain: 'staging.seashell.dev', status: 'suspended', plan: 'Pro' },
  { domain: 'docs.seashell.dev', status: 'running', plan: 'Starter' },
];

const columns: ColumnDef<Site, unknown>[] = [
  {
    accessorKey: 'domain',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Domain" />,
    cell: ({ row }) => <DataTableCell kind="mono" value={row.original.domain} />,
    meta: { primary: true, kind: 'mono' },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const s = STATUS[row.original.status];
      return <DataTableCell kind="status" tone={s.tone} label={s.label} />;
    },
    meta: { kind: 'status' },
  },
  {
    accessorKey: 'plan',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Plan" />,
    cell: ({ row }) => <DataTableCell kind="text" value={row.original.plan} />,
    meta: { kind: 'text' },
  },
];

const ACTIONS: DataTableBulkAction<Site>[] = [
  { label: 'Reissue', icon: <Refresh />, onSelect: (rows) => alert(`Reissue queued for ${rows.length} sites`) },
  { label: 'Archive', icon: <Archive />, onSelect: (rows) => alert(`Archived ${rows.length} sites`) },
  {
    label: 'Delete',
    icon: <Trash />,
    destructive: true,
    confirm: {
      title: (count) => `Delete ${count} sites?`,
      typeToConfirm: 'delete',
      confirmLabel: 'Delete sites',
      confirmIcon: <Trash />,
      undo: {
        title: (count) => `${count} sites moved to trash`,
        description: () => 'Recoverable for 30 days',
      },
    },
  },
];

/** Filter control for the toolbar's idle state (its `children`). */
function DomainFilter({ onFilter }: { onFilter: (value: string) => void }) {
  return <TextField aria-label="Filter domains" placeholder="Filter domains…" leftIcon={<Search />} className="sm:max-w-xs" widthSize="full" onChange={(e) => onFilter(e.target.value)} />;
}

/**
 * A selectable table whose select-all, count and bulk actions all live in
 * one always-present bar above it (`selectAll="toolbar"`). `maxVisible`
 * decides how many actions stay inline; the rest collapse into the
 * overflow menu, where the destructive action gets its red.
 */
function ToolbarDemo({ actions = ACTIONS, maxVisible, initialSelection = {} }: { actions?: DataTableBulkAction<Site>[]; maxVisible?: number; initialSelection?: RowSelectionState }) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(initialSelection);

  return (
    <DataTable
      columns={columns}
      data={SITES}
      getRowId={(s) => s.domain}
      enableSelection
      selectAll="toolbar"
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
      hideFooter
      toolbar={(table) => (
        <DataTableToolbar table={table} actions={actions} {...(maxVisible != null ? { maxVisible } : {})}>
          <DomainFilter onFilter={(value) => table.getColumn('domain')?.setFilterValue(value)} />
        </DataTableToolbar>
      )}
      ariaLabel="Sites"
    />
  );
}

const meta: Meta<typeof DataTableToolbar> = {
  title: 'Data Display/DataTableToolbar',
  component: DataTableToolbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'The strip above a DataTable: idle it holds the select-all + filter/search; once rows are selected it becomes the primary-filled bulk-action bar.',
      },
    },
  },
  argTypes: {
    table: { control: false, description: 'The TanStack table instance driving selection/filters (pass the same instance DataTable exposes).', table: { category: 'Behavior' } },
    actions: { control: false, description: 'Bulk actions shown once rows are selected.', table: { category: 'Content' } },
    maxVisible: { control: { type: 'number', min: 0 }, description: 'Hard ceiling on inline actions, even when the bar has room for more. Unset: no ceiling.', table: { category: 'Appearance' } },
    selectAllLabel: { control: 'text', description: 'Label for the select-all control in the idle state.', table: { category: 'Content' } },
    selectAllTooltip: { control: false, description: 'Tooltip on the select-all control.', table: { category: 'Content' } },
    minTrailingWidth: { control: { type: 'number' }, description: "Floor, in px, the idle bar's trailing slot needs before select-all label gives way to a bare checkbox.", table: { category: 'Appearance' } },
    clearLabel: { control: 'text', description: 'Label for the clear-selection control.', table: { category: 'Content' } },
    idleLeft: { control: false, description: 'Extra idle-state left-hand content (e.g. a result count).', table: { category: 'Content' } },
    children: { control: false, description: 'Right-hand side of the idle state — usually a FilterField.', table: { category: 'Content' } },
    embedded: { control: 'boolean', description: 'Flush treatment for a toolbar embedded at the bottom of a card.', table: { category: 'Appearance' } },
    resolveAllRowIds: { control: false, description: 'Server-side "select all": resolve every matching row id for the current filters. Mutually exclusive with selectAllScope.', table: { category: 'Behavior' } },
    allRowsCount: { control: { type: 'number' }, description: 'Total rows matching the current server-side filters, paired with selectAllScope.', table: { category: 'Behavior' } },
    selectAllScope: { control: false, description: 'Selection strategy: "every filtered row except these ids", kept by the caller. Passing it (even null) opts in.', table: { category: 'Behavior' } },
    onSelectAllScopeChange: { control: false, description: 'Fires when the select-all scope changes.', table: { category: 'Events' } },
  },
  decorators: [
    (Story) => (
      <div className="w-[760px] max-w-full">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ToolbarDemo>;

/** Idle: the select-all checkbox on the left, the table's filter on the right. */
export const Default: Story = {
  render: () => <ToolbarDemo />,
};

/**
 * Selected: the same box, re-skinned. The checkbox has not moved and the
 * table has not shifted — only the bar's contents changed (count + actions
 * in place of the label + filter).
 */
export const Selected: Story = {
  render: () => <ToolbarDemo initialSelection={{ 'shop.seashell.dev': true, 'api.seashell.dev': true }} />,
};

/**
 * Overflow: with `maxVisible={2}` the remaining action collapses into the
 * "more" menu, so a long action list never widens or wraps the bar.
 * Destructive actions belong here — red on the primary fill would not pass
 * contrast inline.
 */
export const Overflow: Story = {
  render: () => <ToolbarDemo maxVisible={2} initialSelection={{ 'shop.seashell.dev': true, 'api.seashell.dev': true, 'docs.seashell.dev': true }} />,
};
