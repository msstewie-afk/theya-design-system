import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Table, TableBody, TableHead, TableHeader, TableRow } from './table';
import { TableSkeletonRows } from './table-skeleton';
import { Skeleton } from './skeleton';

export const tableSkeletonGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['First load of a hand-built Table: real headers, skeleton rows.', <>Avoiding a flash on fast loads with <C>useFirstLoad</C>.</>],
  whenNotToUse: [
    { text: 'DataTable', instead: 'its own loading state' },
    { text: 'Cards or lists', instead: 'Skeleton' },
    { text: 'Refreshing rows already on screen', instead: 'keep them and show a busy state' },
  ],
  anatomy: [
    { part: 'Header', description: 'the real column headers stay visible.' },
    { part: 'Rows', description: <><C>rows</C> placeholder rows; <C>columns</C> sets alignment, width and control-sized cells.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <Table className="w-80">
            <TableHeader><TableRow><TableHead>Domain</TableHead><TableHead className="text-right">Replicas</TableHead></TableRow></TableHeader>
            <TableBody aria-busy="true"><TableSkeletonRows rows={3} columns={[{}, { align: 'right', width: '2rem' }]} /></TableBody>
          </Table>
        ),
        caption: 'Headers are real, rows match the columns.',
      },
      dont: { example: <Skeleton className="h-32 w-80 rounded-[var(--size-border-radius-border-radius-lg)]" />, caption: 'One block instead of a table: no idea what is loading.' },
    },
  ],
  a11y: ['Rows are hidden from screen readers; set aria-busy="true" on the tbody while loading.', <><C>useFirstLoad</C> resolves at once under reduced motion.</>],
};
