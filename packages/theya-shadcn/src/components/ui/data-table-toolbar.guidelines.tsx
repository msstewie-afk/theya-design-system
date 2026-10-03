import { useState } from 'react';
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { Archive, Trash } from 'iconoir-react';
import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { DataTable } from './data-table';
import { DataTableCell } from './data-table-cell';
import { DataTableToolbar, type DataTableBulkAction } from './data-table-toolbar';
import { Button } from './button';

interface Site { domain: string }
const SITES: Site[] = [{ domain: 'shop.seashell.dev' }, { domain: 'blog.seashell.dev' }, { domain: 'api.seashell.dev' }];
const columns: ColumnDef<Site, unknown>[] = [
  { accessorKey: 'domain', header: 'Domain', cell: ({ row }) => <DataTableCell kind="mono" value={row.original.domain} />, meta: { kind: 'mono' } },
];
const ACTIONS: DataTableBulkAction<Site>[] = [
  { label: 'Archive', icon: <Archive />, onSelect: () => {} },
  { label: 'Delete', icon: <Trash />, destructive: true, confirm: { title: (n) => `Delete ${n} sites?`, confirmLabel: 'Delete sites', onConfirm: () => {} } },
];

function Demo() {
  const [sel, setSel] = useState<RowSelectionState>({ 'shop.seashell.dev': true, 'api.seashell.dev': true });
  return (
    <div className="w-[26rem]">
      <DataTable
        columns={columns}
        data={SITES}
        getRowId={(s) => s.domain}
        enableSelection
        selectAll="toolbar"
        rowSelection={sel}
        onRowSelectionChange={setSel}
        hideFooter
        ariaLabel="Sites"
        toolbar={(table) => <DataTableToolbar table={table} actions={ACTIONS} />}
      />
    </div>
  );
}

export const dataTableToolbarGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Above a selectable DataTable: filter / search when idle, bulk actions when rows are selected — in the same strip.'],
  whenNotToUse: [
    { text: 'Page-level actions (Create, Import)', instead: 'PageHeader actions' },
    { text: 'A table without selection or filters', instead: 'nothing — skip the strip' },
    { text: 'Actions on one row', instead: 'the row menu' },
  ],
  anatomy: [
    { part: 'Select all', description: 'checkbox on the left, never moves between states.' },
    { part: 'Idle content', description: <><C>idleLeft</C> (a count) and <C>children</C> (FilterField) on the right.</> },
    { part: 'Selection count', description: 'replaces the select-all label once rows are picked.' },
    { part: 'Bulk actions', description: <>verbs with icons; overflow to “More” when out of room; <C>destructive</C> + <C>confirm</C> for deletes.</> },
    { part: 'Clear', description: 'drops the selection.' },
  ],
  doDont: [
    {
      do: { example: <Demo />, caption: 'Actions appear with the selection, say how many rows, and Delete asks first.' },
      dont: {
        example: (
          <div className="flex w-[26rem] gap-2">
            <Button appearance="outlined" tone="secondary" disabled>Archive selected</Button>
            <Button appearance="outlined" tone="danger" disabled>Delete selected</Button>
          </div>
        ),
        caption: 'Always-there disabled buttons: no count, no context, easy to miss when they wake up.',
      },
    },
  ],
  a11y: [
    'The selection count is a polite live region.',
    'Bulk actions are one Toolbar: a single tab stop, arrows between actions.',
    'Clear returns focus to the select-all checkbox.',
    <>Disabled actions explain why (<C>disabledReason</C>) in a tooltip.</>,
  ],
};
