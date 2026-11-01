import type { ColumnDef } from '@tanstack/react-table';
import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { DataTable } from './data-table';
import { DataTableCell } from './data-table-cell';

interface Portal { address: string; status: 'active' | 'error'; downloads: string }
const PORTALS: Portal[] = [
  { address: 'helios.aether.photo', status: 'active', downloads: '1,284' },
  { address: 'selene-weddings.aether.photo', status: 'error', downloads: '312' },
];

const good: ColumnDef<Portal, unknown>[] = [
  { accessorKey: 'address', header: 'Client portal', cell: ({ row }) => <DataTableCell kind="mono" value={row.original.address} />, meta: { kind: 'mono' } },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <DataTableCell kind="status" tone={row.original.status === 'active' ? 'success' : 'danger'} label={row.original.status === 'active' ? 'Active' : 'Error'} />,
    meta: { kind: 'status' },
  },
  { accessorKey: 'downloads', header: 'Downloads', cell: ({ row }) => <DataTableCell value={row.original.downloads} />, meta: { align: 'right' } },
];

const bad: ColumnDef<Portal, unknown>[] = [
  { accessorKey: 'address', header: 'Client portal', cell: ({ row }) => <DataTableCell value={row.original.address} /> },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <DataTableCell value={row.original.status} /> },
  { accessorKey: 'downloads', header: 'Downloads', cell: ({ row }) => <DataTableCell value={row.original.downloads} /> },
];

export const dataTableGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'Lists of records people scan, sort, filter, select and act on: galleries, client portals, invoices, users.',
    'Rows that open a detail page (whole-row link) or carry per-row actions.',
  ],
  whenNotToUse: [
    { text: 'A handful of static rows', instead: 'Table' },
    { text: 'Details of one object', instead: 'DescriptionList' },
    { text: 'Cards with images or rich content', instead: 'a card grid' },
    { text: 'Hierarchy', instead: 'Tree' },
  ],
  anatomy: [
    { part: 'Toolbar', description: <>filter / search, then bulk actions when rows are selected (<C>toolbar</C> + DataTableToolbar).</>, optional: true },
    { part: 'Header', description: <>sortable column headers (<C>DataTableColumnHeader</C>), optional select-all.</> },
    { part: 'Rows', description: <>one or two lines (<C>lines</C>); cells are DataTableCell kinds; <C>meta.primary</C> makes the row a link.</> },
    { part: 'Row menu', description: <>per-row actions pinned right (<C>rowMenu</C>), also on right-click with <C>contextual</C>.</>, optional: true },
    { part: 'Footer', description: <>pagination, or infinite scroll with <C>onLoadMore</C>.</>, optional: true },
    { part: 'Loading / empty', description: <>skeleton rows while <C>loading</C>; <C>emptyState</C> for none or no matches.</> },
    { part: 'Phone layout', description: <>below 640px rows stack into items (<C>mobileLayout="stack"</C>, default; labels from <C>meta.label</C>). <C>paged</C> keeps the primary column and pages the rest; <C>scroll</C> keeps the table, with <C>meta.pin</C> columns frozen.</> },
  ],
  doDont: [
    {
      do: { example: <div className="w-[26rem]"><DataTable columns={good} data={PORTALS} hideFooter ariaLabel="Client portals" /></div>, caption: 'Each column uses its kind: mono for portal addresses, status with a dot, numbers on the right.' },
      dont: { example: <div className="w-[26rem]"><DataTable columns={bad} data={PORTALS} hideFooter ariaLabel="Client portals, plain" /></div>, caption: 'Everything as plain text: raw status values, numbers that don’t line up.' },
    },
  ],
  a11y: [
    <>Name the table with <C>ariaLabel</C>; give rows a <C>getRowLabel</C> so links, checkboxes and menus say which row they act on.</>,
    'The whole-row link is a real link on the primary cell; controls in cells stay separately focusable.',
    'Sort state is announced on the column header; selection count is announced in the toolbar.',
    <>Set <C>getRowId</C> whenever selection is on and the data can change.</>,
  ],
};
