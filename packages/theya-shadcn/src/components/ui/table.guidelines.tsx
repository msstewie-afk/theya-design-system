import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './table';

const ROWS = [
  ['shop.seashell.dev', '12.4 GB'],
  ['blog.seashell.dev', '860 MB'],
];

export const tableGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'Static tabular data with a few rows and no sorting, paging or selection: a price breakdown, DNS records, a spec sheet.',
    'Building something custom where DataTable doesn’t fit.',
  ],
  whenNotToUse: [
    { text: 'Sorting, paging, selection, row menus', instead: 'DataTable' },
    { text: 'Label / value pairs about one object', instead: 'DescriptionList' },
    { text: 'Laying out a form or a page', instead: 'CSS grid / flex' },
    { text: 'Rows with one main item and an action', instead: 'ListItem' },
  ],
  anatomy: [
    { part: 'Container', description: <>scrolls horizontally; with <C>containerLabel</C> it becomes a named region.</> },
    { part: 'Caption', description: 'what the table shows; can be sr-only.', optional: true },
    { part: 'Header', description: 'column names on a subtle surface.' },
    { part: 'Rows and cells', description: <>numbers right-aligned with <C>text-right tabular-nums</C> on head and cell.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <Table className="w-72">
            <TableCaption className="sr-only">Disk usage by site</TableCaption>
            <TableHeader><TableRow><TableHead>Site</TableHead><TableHead className="text-right">Disk</TableHead></TableRow></TableHeader>
            <TableBody>{ROWS.map(([s, d]) => <TableRow key={s}><TableCell>{s}</TableCell><TableCell className="text-right tabular-nums">{d}</TableCell></TableRow>)}</TableBody>
          </Table>
        ),
        caption: 'Numbers right-aligned, the table has a caption.',
      },
      dont: {
        example: (
          <Table className="w-72">
            <TableHeader><TableRow><TableHead>Site</TableHead><TableHead>Disk</TableHead></TableRow></TableHeader>
            <TableBody>{ROWS.map(([s, d]) => <TableRow key={s}><TableCell>{s}</TableCell><TableCell>{d}</TableCell></TableRow>)}</TableBody>
          </Table>
        ),
        caption: 'Left-aligned numbers are hard to compare by magnitude.',
      },
    },
  ],
  a11y: [
    'Real table markup: header cells are announced with every cell.',
    <>Name the table — a <C>TableCaption</C> (visible or sr-only) or <C>containerLabel</C>.</>,
    'A scrolling table must be reachable by keyboard; the named container is a region screen-reader users can jump to.',
    'Don’t make a row clickable by itself — use DataTable’s row link, which is a real link.',
  ],
};
