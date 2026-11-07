import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { Archive, Refresh, Search, Trash } from 'iconoir-react';
import { DataTable, DataTableColumnHeader } from './data-table';
import { DataTableToolbar, type DataTableBulkAction } from './data-table-toolbar';
import { DataTableCell } from './data-table-cell';
import { TextField } from './text-field';
import type { StatusTone } from './status-dot';
import { toast } from './sonner';
import { dataTableToolbarGuidelines } from './data-table-toolbar.guidelines';

interface Gallery {
  name: string;
  status: 'published' | 'draft' | 'expired';
  studio: string;
}

const STATUS: Record<Gallery['status'], { label: string; tone: StatusTone }> = {
  published: { label: 'Published', tone: 'success' },
  draft: { label: 'Draft', tone: 'warning' },
  expired: { label: 'Expired', tone: 'danger' },
};

const GALLERIES: Gallery[] = [
  { name: 'Golden hour', status: 'published', studio: 'Helios Studio' },
  { name: 'Blue hour', status: 'published', studio: 'Selene Weddings' },
  { name: 'First light', status: 'expired', studio: 'Eos Portraits' },
  { name: 'Moonrise over Othrys', status: 'draft', studio: 'Othrys Lodge' },
  { name: 'Wide-shining', status: 'published', studio: 'Studio L4' },
];

const columns: ColumnDef<Gallery, unknown>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Gallery" />,
    cell: ({ row }) => <DataTableCell kind="text" value={row.original.name} />,
    meta: { primary: true, kind: 'text' },
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
    accessorKey: 'studio',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Studio" />,
    cell: ({ row }) => <DataTableCell kind="text" value={row.original.studio} />,
    meta: { kind: 'text' },
  },
];

// Spies, not alert(): a native dialog blocks the page (and the tests).
const onRepublish = fn();
const onArchive = fn();
const onDelete = fn();

const ACTIONS: DataTableBulkAction<Gallery>[] = [
  { label: 'Republish', icon: <Refresh />, onSelect: (rows) => onRepublish(rows.map((r) => r.name)) },
  { label: 'Archive', icon: <Archive />, onSelect: (rows) => onArchive(rows.map((r) => r.name)) },
  {
    label: 'Delete',
    icon: <Trash />,
    tone: 'danger',
    confirm: {
      title: (count) => `Delete ${count} galleries?`,
      typeToConfirm: 'delete',
      confirmLabel: 'Delete galleries',
      confirmIcon: <Trash />,
      onConfirm: (rows) => onDelete(rows.map((r) => r.name)),
      undo: {
        title: (count) => `${count} galleries moved to trash`,
        description: () => 'Recoverable for 30 days',
      },
    },
  },
];

/** Filter control for the toolbar's idle state (its `children`). */
function GalleryFilter({ onFilter }: { onFilter: (value: string) => void }) {
  return <TextField aria-label="Filter galleries" placeholder="Filter galleries…" leftIcon={<Search />} className="sm:max-w-xs" widthSize="full" onChange={(e) => onFilter(e.target.value)} />;
}

/**
 * A selectable table whose select-all, count and bulk actions all live in
 * one always-present bar above it (`selectAll="toolbar"`). `maxVisible`
 * decides how many actions stay inline; the rest collapse into the
 * overflow menu, where the destructive action gets its red.
 */
function ToolbarDemo({ actions = ACTIONS, maxVisible, initialSelection = {} }: { actions?: DataTableBulkAction<Gallery>[]; maxVisible?: number; initialSelection?: RowSelectionState }) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(initialSelection);

  return (
    <DataTable
      columns={columns}
      data={GALLERIES}
      getRowId={(g) => g.name}
      enableSelection
      selectAll="toolbar"
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
      hideFooter
      toolbar={(table) => (
        <DataTableToolbar table={table} actions={actions} {...(maxVisible != null ? { maxVisible } : {})}>
          <GalleryFilter onFilter={(value) => table.getColumn('name')?.setFilterValue(value)} />
        </DataTableToolbar>
      )}
      ariaLabel="Galleries"
    />
  );
}

// Notes moved from the Docs description (the page now shows a reader-facing
// summary):
//   The strip above a DataTable: idle it holds the select-all + filter/search;
//   once rows are selected it becomes the primary-filled bulk-action bar.
const meta: Meta<typeof DataTableToolbar> = {
  title: 'Data/DataTableToolbar',
  component: DataTableToolbar,
  tags: ['autodocs'],
  parameters: {
    guidelines: dataTableToolbarGuidelines,
    layout: 'padded',
    docs: {
      description: {
        component: "The strip above a DataTable: search and filters when nothing is selected, bulk actions once rows are selected.",
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
      <div className="w-full max-w-[760px] max-w-full">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ToolbarDemo>;

const selectAll = (root: HTMLElement) => within(root).getByRole('checkbox', { name: 'Select all' });
const bar = (root: HTMLElement) => root.querySelector('[data-slot="data-table-toolbar"]') as HTMLElement;

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

  render: () => <ToolbarDemo initialSelection={{ 'Golden hour': true, 'First light': true }} />,
  play: async ({ canvasElement }) => {
    // Phone (below md): selection is off, so a preselection is dropped — no bulk bar.
    const phone = window.matchMedia('(max-width: 767.98px)').matches;
    if (phone) {
      await waitFor(() => expect(bar(canvasElement)).toHaveAttribute('data-state', 'default'));
      await expect(within(canvasElement).queryByRole('toolbar', { name: 'Bulk actions' })).toBeNull();
      await expect(within(canvasElement).queryAllByRole('checkbox')).toHaveLength(0);
      return;
    }

    const canvas = within(canvasElement);
    await expect(bar(canvasElement)).toHaveTextContent('2 selected');
    await expect(selectAll(canvasElement)).toHaveAttribute('aria-checked', 'mixed');
    // Bulk actions are one toolbar (one tab stop, arrows between).
    const actions = canvas.getByRole('toolbar', { name: 'Bulk actions' });
    await expect(within(actions).getByRole('button', { name: 'Archive' })).toBeInTheDocument();

    onArchive.mockClear();
    await userEvent.click(within(actions).getByRole('button', { name: 'Archive' }));
    await expect(onArchive).toHaveBeenCalledWith(['Golden hour', 'First light']);
    // The action clears the selection; focus lands on select-all, not <body>.
    await waitFor(() => expect(bar(canvasElement)).toHaveAttribute('data-state', 'default'));
    await waitFor(() => expect(selectAll(canvasElement)).toHaveFocus());
  },
};

/**
 * Overflow: with `maxVisible={2}` the remaining action collapses into the
 * "more" menu, so a long action list never widens or wraps the bar.
 * Destructive actions belong here — red on the primary fill would not pass
 * contrast inline.
 */
export const Overflow: Story = {

  render: () => <ToolbarDemo maxVisible={2} initialSelection={{ 'Golden hour': true, 'First light': true, 'Wide-shining': true }} />,
  play: async ({ canvasElement }) => {
    // Phone (below md): selection is off, so a preselection is dropped — no bulk bar.
    const phone = window.matchMedia('(max-width: 767.98px)').matches;
    if (phone) {
      await waitFor(() => expect(bar(canvasElement)).toHaveAttribute('data-state', 'default'));
      await expect(within(canvasElement).queryByRole('toolbar', { name: 'Bulk actions' })).toBeNull();
      await expect(within(canvasElement).queryAllByRole('checkbox')).toHaveLength(0);
      return;
    }

    const canvas = within(canvasElement);
    const page = within(document.body);
    await expect(bar(canvasElement)).toHaveTextContent('3 selected');
    // maxVisible=2: Delete lives in the overflow menu, in red.
    await expect(canvas.queryByRole('button', { name: 'Delete' })).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'More bulk actions' }));
    await userEvent.click(await page.findByRole('menuitem', { name: 'Delete' }));

    // Type-to-confirm, then an undo toast; the selection clears.
    const dialog = await page.findByRole('alertdialog');
    await expect(dialog).toHaveTextContent('Delete 3 galleries?');
    const confirm = within(dialog).getByRole('button', { name: 'Delete galleries' });
    await expect(confirm).toBeDisabled();
    await userEvent.type(within(dialog).getByRole('textbox'), 'delete');
    onDelete.mockClear();
    await userEvent.click(confirm);
    await expect(onDelete).toHaveBeenCalledWith(['Golden hour', 'First light', 'Wide-shining']);
    await expect(await page.findByText('3 galleries moved to trash')).toBeInTheDocument();
    await waitFor(() => expect(bar(canvasElement)).toHaveAttribute('data-state', 'default'));
    toast.dismiss();
    await waitFor(() => expect(document.querySelectorAll('[data-sonner-toast]')).toHaveLength(0), { timeout: 3000 });
  },
};

/**
 * Narrow bar, no `maxVisible`: actions that don't fit collapse into the
 * "more" menu by measured width. This silently never happened before —
 * Toolbar dropped the ref the measurement reads, so only maxVisible capped.
 */
export const NarrowOverflow: Story = {

  render: () => (
    <div style={{ width: '100%', maxWidth: 360 }}>
      <ToolbarDemo initialSelection={{ 'Golden hour': true }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Phone (below md): selection is off, so a preselection is dropped — no bulk bar.
    const phone = window.matchMedia('(max-width: 767.98px)').matches;
    if (phone) {
      await waitFor(() => expect(bar(canvasElement)).toHaveAttribute('data-state', 'default'));
      await expect(within(canvasElement).queryByRole('toolbar', { name: 'Bulk actions' })).toBeNull();
      await expect(within(canvasElement).queryAllByRole('checkbox')).toHaveLength(0);
      return;
    }

    const canvas = within(canvasElement);
    await expect(bar(canvasElement)).toHaveAttribute('data-state', 'selected');
    await waitFor(() => expect(canvas.getByRole('button', { name: 'More bulk actions' })).toBeInTheDocument());
    await expect(canvas.queryByRole('button', { name: 'Delete' })).toBeNull();
  },
};

/** Interaction test for Default, kept out of Default so Default opens untouched. */
export const TestInteractions: Story = {
  ...Default,
  name: 'Test: interactions',
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    // Phone (below md): no row selection — the table stacks into items, the bar keeps
    // its default state, and the filter still narrows the list.
    const phone = window.matchMedia('(max-width: 767.98px)').matches;
    if (phone) {
      const c = within(canvasElement);
      await expect(bar(canvasElement)).toHaveAttribute('data-state', 'default');
      await expect(c.queryByRole('checkbox', { name: 'Select all' })).toBeNull();
      await userEvent.type(c.getByRole('textbox', { name: 'Filter galleries' }), 'Golden');
      await waitFor(() => expect(c.getAllByRole('listitem')).toHaveLength(1));
      await expect(c.getByRole('listitem')).toHaveTextContent('Golden hour');
      return;
    }

    const canvas = within(canvasElement);
    await expect(bar(canvasElement)).toHaveAttribute('data-state', 'default');

    // Keyboard select-all flips the bar; focus follows to the new checkbox.
    selectAll(canvasElement).focus();
    await userEvent.keyboard(' ');
    await waitFor(() => expect(bar(canvasElement)).toHaveAttribute('data-state', 'selected'));
    await expect(bar(canvasElement)).toHaveTextContent('5 selected');
    await waitFor(() => expect(selectAll(canvasElement)).toHaveFocus());

    // Clear flips it back, focus stays in the toolbar.
    await userEvent.click(canvas.getByRole('button', { name: 'Clear selection' }));
    await waitFor(() => expect(bar(canvasElement)).toHaveAttribute('data-state', 'default'));
    await waitFor(() => expect(selectAll(canvasElement)).toHaveFocus());

    // Select all respects the filter.
    await userEvent.type(canvas.getByRole('textbox', { name: 'Filter galleries' }), 'Golden');
    await userEvent.click(selectAll(canvasElement));
    await waitFor(() => expect(bar(canvasElement)).toHaveTextContent('1 selected'));
    await userEvent.click(canvas.getByRole('button', { name: 'Clear selection' }));
  },
};
