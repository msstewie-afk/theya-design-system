import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import type { ColumnDef } from '@tanstack/react-table';
import { Trash, Archive, Mail } from 'iconoir-react';
import { DataTable, DataTableColumnHeader } from './data-table';
import { DataTableToolbar } from './data-table-toolbar';
import { DataTableCell } from './data-table-cell';
import type { StatusTone } from './status-dot';

const meta: Meta<typeof DataTable> = {
  title: 'Data Display/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A TanStack-react-table wrapper — sorting, pagination, row selection, synchronized overflow/context row menus, pinned columns, a first-load skeleton, and the accessible whole-row stretched-link pattern. The largest single build of the session, alongside DataTableCell and DataTableToolbar.',
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
    enableSelection: { control: 'boolean', description: 'Prepend a select-all/select-row checkbox column. Auto-drops below md.', table: { category: 'Behavior' } },
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

interface Site {
  id: string;
  domain: string;
  owner: string;
  status: 'active' | 'suspended';
  region: string;
  replicas: number;
}

const STATUS: Record<Site['status'], { label: string; tone: StatusTone }> = {
  active: { label: 'Active', tone: 'success' },
  suspended: { label: 'Suspended', tone: 'warning' },
};

const DATA: Site[] = [
  { id: '1', domain: 'shop.seashell.dev', owner: 'maria@seashell.dev', status: 'active', region: 'eu-west-1', replicas: 3 },
  { id: '2', domain: 'docs.seashell.dev', owner: 'devrel@seashell.dev', status: 'active', region: 'us-east-1', replicas: 1 },
  { id: '3', domain: 'staging.seashell.dev', owner: 'ci-bot@seashell.dev', status: 'suspended', region: 'eu-west-1', replicas: 0 },
  { id: '4', domain: 'blog.seashell.dev', owner: 'content@seashell.dev', status: 'active', region: 'ap-south-1', replicas: 2 },
];

/** kind="status" (not a raw Badge) — same convention as DataTableToolbar's demo table: color is never the only signal, the label always renders. */
const columns: ColumnDef<Site, unknown>[] = [
  {
    accessorKey: 'domain',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Domain" />,
    cell: ({ row }) => <DataTableCell kind="primary" value={row.original.domain} mono />,
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
    accessorKey: 'region',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Region" />,
    cell: ({ row }) => <DataTableCell kind="mono" value={row.original.region} />,
    meta: { kind: 'mono' },
  },
  {
    accessorKey: 'replicas',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Replicas" />,
    cell: ({ row }) => <DataTableCell kind="text" value={row.original.replicas} />,
    meta: { align: 'right', kind: 'text' },
  },
];

/**
 * Same columns as `columns`, but the primary cell also carries `secondary`
 * (the owner, under the domain) — DataTableCell's own `lines` auto-detects
 * to 2 whenever `secondary` is set (see growsPastTheRow/`lines` fallback
 * in data-table-cell.tsx), so this needs `lines={2}` on the table to match:
 * the cell already wants two lines of height, and `--wp-row-h-2` (56px) is
 * what actually gives it the room, vs `--wp-row-h` (44px) for the rest of
 * this story set.
 */
const columnsTwoLine: ColumnDef<Site, unknown>[] = [
  {
    accessorKey: 'domain',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Domain" />,
    cell: ({ row }) => <DataTableCell kind="primary" value={row.original.domain} secondary={row.original.owner} mono />,
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
    accessorKey: 'region',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Region" />,
    cell: ({ row }) => <DataTableCell kind="mono" value={row.original.region} />,
    meta: { kind: 'mono' },
  },
  {
    accessorKey: 'replicas',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Replicas" />,
    cell: ({ row }) => <DataTableCell kind="text" value={row.original.replicas} />,
    meta: { align: 'right', kind: 'text' },
  },
];

export const Basic: Story = {
  render: () => <DataTable columns={columns} data={DATA} ariaLabel="Sites" />,
  // Sorting: the header button cycles asc/desc, the column header exposes
  // aria-sort, rows reorder; works from the keyboard too.
  play: async ({ canvasElement }) => {
    const table = within(canvasElement).getByRole('table', { name: 'Sites' });
    const t = within(table);
    const header = t.getByRole('columnheader', { name: /Domain/ });
    const firstDomain = () => within(t.getAllByRole('row')[1]).getAllByRole('cell')[0].textContent;
    await expect(header).toHaveAttribute('aria-sort', 'none');

    await userEvent.click(t.getByRole('button', { name: 'Domain' }));
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await expect(firstDomain()).toContain('blog.seashell.dev');

    t.getByRole('button', { name: 'Domain' }).focus();
    await userEvent.keyboard('{Enter}');
    await expect(header).toHaveAttribute('aria-sort', 'descending');
    await expect(firstDomain()).toContain('staging.seashell.dev');
  },
};

/**
 * lines={2}: every row sized off --wp-row-h-2 (56px) instead of
 * --wp-row-h (44px) — the Domain column's secondary line (owner) is what
 * actually needs the extra room. Compare against Basic directly above:
 * same data, same columns otherwise, only the row-height budget differs.
 */
export const TwoLineRows: Story = {
  name: 'Two-line rows (lines=2)',
  render: () => <DataTable columns={columnsTwoLine} data={DATA} lines={2} ariaLabel="Sites" />,
};

export const WithSelectionAndRowMenu: Story = {
  name: 'With selection and row menu',
  render: () => (
    <DataTable
      columns={columns}
      data={DATA}
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.domain}
      enableSelection
      selectAll="toolbar"
      toolbar={(table) => (
        <DataTableToolbar
          table={table}
          actions={[
            { label: 'Send email', icon: <Mail />, onSelect: (rows) => console.log(`Emailing ${rows.length} site(s)`) },
            { label: 'Archive', icon: <Archive />, onSelect: (rows) => console.log(`Archiving ${rows.length} site(s)`) },
            {
              label: 'Delete',
              icon: <Trash />,
              destructive: true,
              confirm: {
                title: (count) => `Delete ${count} site(s)?`,
                description: () => 'This action cannot be undone.',
                onConfirm: (rows) => console.log(`Deleted ${rows.length} site(s)`),
              },
            },
          ]}
        />
      )}
      rowMenu={{
        contextual: true,
        items: [
          { id: 'view', label: 'View details', onSelect: (row: Site) => console.log(row.domain) },
          { type: 'separator' },
          { id: 'delete', label: 'Delete', tone: 'danger', onSelect: (row: Site) => console.log(`Delete ${row.domain}`) },
        ],
      }}
      ariaLabel="Sites"
    />
  ),
  // Selecting a row swaps in the bulk-action bar with a live count; select
  // all and clear work; the row menu opens from its trigger. Ends with the
  // menu closed and nothing selected.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const rowBoxes = () => canvas.getAllByRole('checkbox').filter((el) => el.getAttribute('aria-label') !== 'Select all');
    // getRowLabel gives each row control its own name.
    await expect(canvas.getByRole('checkbox', { name: 'Select shop.seashell.dev' })).toBeInTheDocument();

    await userEvent.click(rowBoxes()[0]);
    await expect(rowBoxes()[0]).toHaveAttribute('aria-checked', 'true');
    await expect(canvas.getByText('selected').parentElement).toHaveTextContent('1 selected');
    await expect(canvas.getByRole('toolbar', { name: 'Bulk actions' })).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select all' }));
    await waitFor(() => expect(canvas.getByText('selected').parentElement).toHaveTextContent('4 selected'));

    await userEvent.click(canvas.getByRole('button', { name: 'Clear selection' }));
    await waitFor(() => expect(canvas.queryByRole('toolbar', { name: 'Bulk actions' })).toBeNull());
    for (const box of rowBoxes()) await expect(box).toHaveAttribute('aria-checked', 'false');

    const menuTriggers = canvas.getAllByRole('button', { name: 'Row actions' });
    await userEvent.click(menuTriggers[0]);
    await expect(await body.findByRole('menuitem', { name: 'View details' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('menu')).toBeNull());
  },
};

export const Loading: Story = {
  render: () => <DataTable columns={columns} data={[]} loading skeletonRows={4} ariaLabel="Sites" />,
};

export const EmptyState: Story = {
  name: 'Empty state',
  render: () => <DataTable columns={columns} data={[]} emptyMessage="No sites yet." ariaLabel="Sites" />,
};
