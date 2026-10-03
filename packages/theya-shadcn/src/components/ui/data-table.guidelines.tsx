import type { ColumnDef } from '@tanstack/react-table';
import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { DataTable } from './data-table';
import { DataTableCell } from './data-table-cell';

interface Site { domain: string; status: 'running' | 'error'; disk: string }
const SITES: Site[] = [
  { domain: 'shop.seashell.dev', status: 'running', disk: '12.4 GB' },
  { domain: 'api.seashell.dev', status: 'error', disk: '860 MB' },
];

const good: ColumnDef<Site, unknown>[] = [
  { accessorKey: 'domain', header: 'Domain', cell: ({ row }) => <DataTableCell kind="mono" value={row.original.domain} />, meta: { kind: 'mono' } },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <DataTableCell kind="status" tone={row.original.status === 'running' ? 'success' : 'danger'} label={row.original.status === 'running' ? 'Running' : 'Error'} />,
    meta: { kind: 'status' },
  },
  { accessorKey: 'disk', header: 'Disk', cell: ({ row }) => <DataTableCell value={row.original.disk} />, meta: { align: 'right' } },
];

const bad: ColumnDef<Site, unknown>[] = [
  { accessorKey: 'domain', header: 'Domain', cell: ({ row }) => <DataTableCell value={row.original.domain} /> },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <DataTableCell value={row.original.status} /> },
  { accessorKey: 'disk', header: 'Disk', cell: ({ row }) => <DataTableCell value={row.original.disk} /> },
];

export const dataTableGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'Lists of records people scan, sort, filter, select and act on: sites, domains, invoices, users.',
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
  ],
  doDont: [
    {
      do: { example: <div className="w-[26rem]"><DataTable columns={good} data={SITES} hideFooter ariaLabel="Sites" /></div>, caption: 'Each column uses its kind: mono for domains, status with a dot, numbers on the right.' },
      dont: { example: <div className="w-[26rem]"><DataTable columns={bad} data={SITES} hideFooter ariaLabel="Sites, plain" /></div>, caption: 'Everything as plain text: raw status values, numbers that don’t line up.' },
    },
  ],
  a11y: [
    <>Name the table with <C>ariaLabel</C>; give rows a <C>getRowLabel</C> so links, checkboxes and menus say which row they act on.</>,
    'The whole-row link is a real link on the primary cell; controls in cells stay separately focusable.',
    'Sort state is announced on the column header; selection count is announced in the toolbar.',
    <>Set <C>getRowId</C> whenever selection is on and the data can change.</>,
  ],
};
