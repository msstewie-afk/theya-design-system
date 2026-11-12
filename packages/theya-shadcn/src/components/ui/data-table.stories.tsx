import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import type { ColumnDef } from '@tanstack/react-table';
import { Trash, Archive, Mail } from 'iconoir-react';
import { DataTable, DataTableColumnHeader } from './data-table';
import { DataTableToolbar } from './data-table-toolbar';
import { DataTableCell } from './data-table-cell';
import type { StatusTone } from './status-dot';
import { dataTableGuidelines } from './data-table.guidelines';
import { testOnly } from '../../lib/test-only';

// Notes moved from the Docs description (the page now shows a reader-facing
// summary):
//   A TanStack-react-table wrapper — sorting, pagination, row selection,
//   synchronized overflow/context row menus, pinned columns, a first-load
//   skeleton, and the accessible whole-row stretched-link pattern. The largest
//   single build of the session, alongside DataTableCell and DataTableToolbar.
const meta: Meta<typeof DataTable> = {
  title: 'Data/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    guidelines: dataTableGuidelines,
    docs: {
      description: {
        component:
          "Records people scan, sort, filter, select and act on: galleries, client portals, invoices, users. Rows can open a detail page or carry their own actions.",
      },
    },
  },
  argTypes: {
    columns: { control: false, description: 'TanStack column definitions.', table: { category: 'Content' } },
    data: { control: false, description: 'The rows to render.', table: { category: 'Content' } },
    rowMenu: { control: false, description: 'Per-row actions, appended as the final column, pinned right at every width. "contextual" also exposes them on right-click.', table: { category: 'Content' } },
    getRowId: { control: false, description: 'Stable identity for a row, used as its selection key. Supply whenever selection is enabled and data can change under the user.', table: { category: 'Behavior' } },
    loading: { control: 'boolean', description: 'Shows the skeleton state instead of rows.', table: { category: 'State' } },
    skeletonRows: { control: { type: 'number' }, description: 'Number of skeleton rows shown while loading.', table: { category: 'State' } },
    enableSelection: { control: 'boolean', description: 'Prepend a select-all/select-row checkbox column. On a phone each stacked item gets its checkbox before the title.', table: { category: 'Behavior' } },
    pinSelection: { control: 'boolean', description: 'Pins the selection checkbox column left at every width.', table: { category: 'Appearance' } },
    selectAll: { control: 'inline-radio', options: ['header', 'toolbar', 'none'], description: 'Where the select-all control lives. Default header.', table: { category: 'Behavior' } },
    selectAllTooltip: { control: false, description: 'Tooltip on the select-all control.', table: { category: 'Content' } },
    lines: { control: 'inline-radio', options: [1, 2], description: 'Lines of text a row is sized for. Set 2 when ANY column stacks a value over a second line.', table: { category: 'Appearance' } },
    hideHeader: { control: 'boolean', description: 'Omit the header row entirely. Mutually exclusive with sorting and header select-all.', table: { category: 'Appearance' } },
    hideFooter: { control: 'boolean', description: 'Omit the footer and disable client-side pagination — every row renders.', table: { category: 'Appearance' } },
    pageSize: { control: { type: 'number' }, description: 'Rows per page for client-side pagination. Default 10.', table: { category: 'Behavior' } },
    stickyHeader: { control: 'boolean', description: 'Keeps the header row pinned while the body scrolls.', table: { category: 'Appearance' } },
    maxHeight: { control: 'text', description: 'Bounds the scroll body height (CSS length or number of px).', table: { category: 'Appearance' } },
    fillViewport: { control: 'boolean', description: 'Stretch the scroll body to the remaining viewport height. Overridden by explicit maxHeight.', table: { category: 'Appearance' } },
    getRowHref: { control: false, description: 'Makes each row a link when provided.', table: { category: 'Behavior' } },
    onRowClick: { control: false, description: 'Fires when a row is clicked.', table: { category: 'Events' } },
    linkComponent: { control: false, description: "Element for the whole-row link. Defaults to a plain <a>; pass your router's link for client-side navigation.", table: { category: 'Advanced' } },
    getRowLabel: { control: false, description: 'Accessible label for a row, used by selection and link affordances.', table: { category: 'Behavior' } },
    emptyMessage: { control: false, description: 'Plain-text message shown when there are no rows. Default "No results."', table: { category: 'Content' } },
    emptyState: { control: false, description: 'Rich empty state, rendered with the live table instance so it can branch on filter activity. Takes precedence over emptyMessage.', table: { category: 'Content' } },
    ariaLabel: { control: 'text', description: 'Accessible name for the table.', table: { category: 'Content' } },
    toolbar: { control: false, description: 'DataTableToolbar rendered above the table.', table: { category: 'Content' } },
    manualSorting: { control: 'boolean', description: 'Opt into server-side sorting — sort state is read but not applied locally.', table: { category: 'Behavior' } },
    manualFiltering: { control: 'boolean', description: 'Opt into server-side filtering.', table: { category: 'Behavior' } },
    manualPagination: { control: 'boolean', description: 'Opt into server-side pagination.', table: { category: 'Behavior' } },
    pageCount: { control: { type: 'number' }, description: 'Total page count when manualPagination is on.', table: { category: 'Behavior' } },
    rowCount: { control: { type: 'number' }, description: 'Total row count when manualPagination is on.', table: { category: 'Behavior' } },
    sorting: { control: false, description: 'Controlled sorting state.', table: { category: 'State' } },
    onSortingChange: { control: false, description: 'Fires with the new sorting state.', table: { category: 'Events' } },
    columnFilters: { control: false, description: 'Controlled column-filter state.', table: { category: 'State' } },
    onColumnFiltersChange: { control: false, description: 'Fires with the new column-filter state.', table: { category: 'Events' } },
    pagination: { control: false, description: 'Controlled pagination state.', table: { category: 'State' } },
    onPaginationChange: { control: false, description: 'Fires with the new pagination state.', table: { category: 'Events' } },
    rowSelection: { control: false, description: 'Controlled row-selection state.', table: { category: 'State' } },
    onRowSelectionChange: { control: false, description: 'Fires with the new row-selection state.', table: { category: 'Events' } },
    onLoadMore: { control: false, description: 'Switch to infinite scroll: a sentinel row calls this when it nears view. Replaces the pager.', table: { category: 'Behavior' } },
    hasMore: { control: 'boolean', description: 'Whether more rows exist beyond what is loaded (infinite scroll).', table: { category: 'State' } },
    loadingMore: { control: 'boolean', description: 'Shows a loading row and disconnects the load-more sentinel.', table: { category: 'State' } },
    virtualized: { control: 'boolean', description: 'Render only rows in view (plus overscan) via @tanstack/react-virtual. Needs a bounded scroll body.', table: { category: 'Behavior' } },
    estimateRowHeight: { control: { type: 'number' }, description: 'Estimated row height in px, used by virtualization before measuring.', table: { category: 'Behavior' } },
    overscan: { control: { type: 'number' }, description: 'Extra rows rendered beyond the viewport when virtualized.', table: { category: 'Behavior' } },
    embedded: { control: 'boolean', description: "Drop the container's own border/background chrome, round only its top corners, for nesting inside another bordered surface.", table: { category: 'Appearance' } },
    embeddedBottomRounded: { control: 'boolean', description: 'Also rounds the bottom corners while embedded.', table: { category: 'Appearance' } },
  },
};

export default meta;
type Story = StoryObj<typeof DataTable>;

interface Gallery {
  id: string;
  name: string;
  photographer: string;
  status: 'active' | 'paused';
  studio: string;
  photos: number;
}

const STATUS: Record<Gallery['status'], { label: string; tone: StatusTone }> = {
  active: { label: 'Active', tone: 'success' },
  paused: { label: 'Paused', tone: 'warning' },
};

// Sorted by name: Blue hour, First light, Golden hour, Moonrise over Othrys.
const DATA: Gallery[] = [
  { id: '1', name: 'Golden hour', photographer: 'thea@aether.photo', status: 'active', studio: 'Helios Studio', photos: 248 },
  { id: '2', name: 'First light', photographer: 'elio@aether.photo', status: 'active', studio: 'Eos Portraits', photos: 132 },
  { id: '3', name: 'Moonrise over Othrys', photographer: 'mina@aether.photo', status: 'paused', studio: 'Othrys Lodge', photos: 74 },
  { id: '4', name: 'Blue hour', photographer: 'selin@aether.photo', status: 'active', studio: 'Selene Weddings', photos: 186 },
];

/** kind="status" (not a raw Badge) — same convention as DataTableToolbar's demo table: color is never the only signal, the label always renders. */
const columns: ColumnDef<Gallery, unknown>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Gallery" />,
    cell: ({ row }) => <DataTableCell kind="primary" value={row.original.name} />,
    meta: { primary: true, kind: 'primary' },
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
  {
    accessorKey: 'photos',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Photos" />,
    cell: ({ row }) => <DataTableCell kind="text" value={row.original.photos} />,
    meta: { align: 'right', kind: 'text' },
  },
];

/**
 * Same columns as `columns`, but the primary cell also carries `secondary`
 * (the photographer, under the gallery name) — DataTableCell's own `lines` auto-detects
 * to 2 whenever `secondary` is set (see growsPastTheRow/`lines` fallback
 * in data-table-cell.tsx), so this needs `lines={2}` on the table to match:
 * the cell already wants two lines of height, and `--dt-row-h-2` (56px) is
 * what actually gives it the room, vs `--dt-row-h` (44px) for the rest of
 * this story set.
 */
const columnsTwoLine: ColumnDef<Gallery, unknown>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Gallery" />,
    cell: ({ row }) => <DataTableCell kind="primary" value={row.original.name} secondary={row.original.photographer} secondaryMono />,
    meta: { primary: true, kind: 'primary' },
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
  {
    accessorKey: 'photos',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Photos" />,
    cell: ({ row }) => <DataTableCell kind="text" value={row.original.photos} />,
    meta: { align: 'right', kind: 'text' },
  },
];

/** Sortable columns: click a header, or focus it and press Enter, to sort. On a phone the rows stack into items with label/value pairs. */
export const Basic: Story = {
  render: () => <DataTable columns={columns} data={DATA} ariaLabel="Galleries" />,

  play: testOnly(async ({ canvasElement }) => {
    // Phone (below 640px): rows stack into list items with label/value pairs; there is
    // no header row, so nothing to sort from.
    const phone = window.matchMedia('(max-width: 639.98px)').matches;
    if (phone) {
      const list = within(canvasElement).getByRole('list', { name: 'Galleries' });
      const items = within(list).getAllByRole('listitem');
      await expect(items).toHaveLength(4);
      await expect(items[0]).toHaveTextContent('Golden hour');
      // Each field keeps its column name as a label.
      await expect(within(items[0]).getByText('Studio')).toBeInTheDocument();
      await expect(items[0]).toHaveTextContent('Helios Studio');
      await expect(within(canvasElement).queryByRole('columnheader')).toBeNull();
      return;
    }

    const table = within(canvasElement).getByRole('table', { name: 'Galleries' });
    const t = within(table);
    const header = t.getByRole('columnheader', { name: /Gallery/ });
    const firstName = () => within(t.getAllByRole('row')[1]).getAllByRole('cell')[0].textContent;
    await expect(header).toHaveAttribute('aria-sort', 'none');

    await userEvent.click(t.getByRole('button', { name: 'Gallery' }));
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await expect(firstName()).toContain('Blue hour');

    t.getByRole('button', { name: 'Gallery' }).focus();
    await userEvent.keyboard('{Enter}');
    await expect(header).toHaveAttribute('aria-sort', 'descending');
    await expect(firstName()).toContain('Moonrise over Othrys');
  }),
};

/**
 * `onRowClick`: the whole row opens the item. Rows are Tab stops and open
 * with Enter or Space too; `getRowLabel` names each one for screen readers.
 */
export const ClickableRows: Story = {
  name: 'Clickable rows',
  render: function Render() {
    const [opened, setOpened] = useState('');
    return (
      <div className="flex flex-col gap-3">
        <DataTable columns={columns} data={DATA} ariaLabel="Galleries" onRowClick={(gallery) => setOpened(gallery.name)} getRowLabel={(gallery) => gallery.name} />
        {opened && <p className="m-0 font-body text-body-s text-[var(--color-text-text-subtle)]">Opened {opened}</p>}
      </div>
    );
  },
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const phone = window.matchMedia('(max-width: 639.98px)').matches;
    const row = canvas.getByRole(phone ? 'listitem' : 'row', { name: 'View details for First light' });
    await userEvent.click(row);
    await expect(canvas.getByText('Opened First light')).toBeInTheDocument();
    // Keyboard: the row is a Tab stop and Enter opens it.
    const next = canvas.getByRole(phone ? 'listitem' : 'row', { name: 'View details for Moonrise over Othrys' });
    next.focus();
    await expect(next).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('Opened Moonrise over Othrys')).toBeInTheDocument();
  }),
};

/**
 * lines={2}: every row sized off --dt-row-h-2 (56px) instead of
 * --dt-row-h (44px) — the Gallery column's secondary line (photographer) is what
 * actually needs the extra room. Compare against Basic directly above:
 * same data, same columns otherwise, only the row-height budget differs.
 */
export const TwoLineRows: Story = {
  name: 'Two-line rows (lines=2)',
  render: () => <DataTable columns={columnsTwoLine} data={DATA} lines={2} ariaLabel="Galleries" />,
};

/** `enableSelection` with `selectAll="toolbar"`: selecting rows swaps in a bulk-action bar with a live count, and `rowMenu` gives every row an actions menu, also on right-click. */
export const WithSelectionAndRowMenu: Story = {

  name: 'With selection and row menu',
  render: () => (
    <DataTable
      columns={columns}
      data={DATA}
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.name}
      enableSelection
      selectAll="toolbar"
      toolbar={(table) => (
        <DataTableToolbar
          table={table}
          actions={[
            { label: 'Email clients', icon: <Mail />, onSelect: (rows) => console.log(`Emailing clients of ${rows.length} selected`) },
            { label: 'Archive', icon: <Archive />, onSelect: (rows) => console.log(`Archiving ${rows.length} selected`) },
            {
              label: 'Delete',
              icon: <Trash />,
              tone: 'danger',
              confirm: {
                title: (count) => `Delete ${count} ${count === 1 ? 'gallery' : 'galleries'}?`,
                description: () => 'This action cannot be undone.',
                onConfirm: (rows) => console.log(`Deleted ${rows.length} selected`),
              },
            },
          ]}
        />
      )}
      rowMenu={{
        contextual: true,
        items: [
          { id: 'view', label: 'View details', onSelect: (row: Gallery) => console.log(row.name) },
          { type: 'separator' },
          { id: 'delete', label: 'Delete', tone: 'danger', onSelect: (row: Gallery) => console.log(`Delete ${row.name}`) },
        ],
      }}
      ariaLabel="Galleries"
    />
  ),
  // Selecting a row swaps in the bulk-action bar with a live count; select
  // all and clear work; the row menu opens from its trigger. Ends with the
  // menu closed and nothing selected.
  play: testOnly(async ({ canvasElement }) => {

    const canvas = within(canvasElement);
    const body = within(document.body);
    const rowBoxes = () => canvas.getAllByRole('checkbox').filter((el) => el.getAttribute('aria-label') !== 'Select all');
    // getRowLabel gives each row control its own name.
    await expect(canvas.getByRole('checkbox', { name: 'Select Golden hour' })).toBeInTheDocument();

    await userEvent.click(rowBoxes()[0]);
    await expect(rowBoxes()[0]).toHaveAttribute('aria-checked', 'true');
    await expect(canvas.getByText('selected').parentElement).toHaveTextContent('1 selected');
    await expect(canvas.getByRole('toolbar', { name: 'Bulk actions' })).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select all' }));
    await waitFor(() => expect(canvas.getByText('selected').parentElement).toHaveTextContent('4 selected'));

    await userEvent.click(canvas.getByRole('button', { name: 'Clear selection' }));
    await waitFor(() => expect(canvas.queryByRole('toolbar', { name: 'Bulk actions' })).toBeNull());
    for (const box of rowBoxes()) await expect(box).toHaveAttribute('aria-checked', 'false');

    const menuTriggers = canvas.getAllByRole('button', { name: /^(Row actions|Actions for .+)$/ });
    await userEvent.click(menuTriggers[0]);
    await expect(await body.findByRole('menuitem', { name: 'View details' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('menu')).toBeNull());
    // A keyboard close puts focus back on the trigger (it fell to <body>).
    await waitFor(() => expect(menuTriggers[0]).toHaveFocus());
  }),
};

/**
 * Narrow the viewport to see it. Where Basic stacks its rows into items,
 * `mobileLayout="paged"` keeps the table, with the primary column fixed and the rest shown
 * `columnsPerPage` at a time — for comparisons, where a row is read
 * across its columns. Dots and a swipe page through them.
 */
export const PagedColumns: Story = {
  name: 'Paged columns on a phone',
  render: () => <DataTable columns={columns} data={DATA} ariaLabel="Galleries" mobileLayout="paged" />,
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    if (window.innerWidth >= 640) {
      await expect(canvas.queryByRole('group', { name: 'Table columns' })).toBeNull();
      return;
    }
    await expect(canvas.queryByRole('columnheader', { name: /Photos/ })).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Show column 4 of 4' }));
    await expect(canvas.getByRole('columnheader', { name: /Photos/ })).toBeInTheDocument();
    await expect(canvas.getByRole('columnheader', { name: /Gallery/ })).toBeInTheDocument();
  }),
};

/** `loading` shows `skeletonRows` placeholder rows under the real headers while the data loads. */
export const Loading: Story = {
  render: () => <DataTable columns={columns} data={[]} loading skeletonRows={4} ariaLabel="Galleries" />,
};

/** No rows: the `emptyMessage` takes their place. */
export const EmptyState: Story = {
  name: 'Empty state',
  render: () => <DataTable columns={columns} data={[]} emptyMessage="No galleries yet." ariaLabel="Galleries" />,
};
