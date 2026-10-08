import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { DataTableCell } from './data-table-cell';

export const dataTableCellGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'Every cell of a DataTable: pick the kind by content — text, mono, primary, status, badge, usage, sparkline.',
    'Editable cells (input, number, select, combobox, switch…) for inline edits in a table.',
  ],
  whenNotToUse: [
    { text: 'Outside a table', instead: 'the matching component: Badge, StatusDot, TextField…' },
    { text: 'Editing many fields of one row', instead: 'a Drawer or a detail page' },
  ],
  anatomy: [
    { part: 'Box', description: <>one row height for the whole table (<C>lines</C> 1 or 2); <C>loading</C> draws the kind’s own placeholder.</> },
    { part: 'Value', description: <>by <C>kind</C>.</> },
    { part: 'Second line', description: <><C>secondary</C> under the value, <C>secondaryMono</C> for identifiers.</>, optional: true },
  ],
  doDont: [
    {
      do: {
        example: <div className="w-64"><DataTableCell kind="text" value="shop.seashell.dev" mono secondary="eu-west-1 · Pro" lines={2} /></div>,
        caption: 'The main value on top, details on the second line.',
      },
      dont: {
        example: <div className="w-64"><DataTableCell value="shop.seashell.dev · eu-west-1 · Pro · 12.4 GB" /></div>,
        caption: 'Four facts in one line truncate, and none of them can be sorted.',
      },
    },
    {
      do: { example: <div className="w-40"><DataTableCell kind="status" tone="danger" label="Error" /></div>, caption: 'Status: a dot plus a word.' },
      dont: { example: <div className="w-40"><DataTableCell value="ERR_5" /></div>, caption: 'An internal code people have to look up.' },
    },
  ],
  a11y: [
    <>Editable kinds need a <C>label</C> — usually “column, row” (“Plan, shop.seashell.dev”); it isn’t visible in the cell.</>,
    'Invalid edits show a real message linked to the field, not only a red border.',
    'Status and badge kinds always carry a word; color is never the only signal.',
  ],
};
