import { type ComponentGuidelines } from '../../docs/guidelines';
import { DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from './description-list';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

const PAIRS = [
  ['Client portal', 'helios.aether.photo'],
  ['Studio', 'Helios Studio'],
  ['Plan', 'Pro'],
];

export const descriptionListGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Properties of one object: gallery details, an invoice header, a license.', 'A read-only summary before confirming (review step).'],
  whenNotToUse: [
    { text: 'Several objects with the same fields', instead: 'Table or DataTable' },
    { text: 'Editable properties', instead: 'a form, or InlineEdit / PropertyGrid' },
    { text: 'Two or three big numbers', instead: 'Stat or Metric' },
  ],
  anatomy: [
    { part: 'List', description: 'stacks on mobile, two columns from sm.' },
    { part: 'Item', description: 'one pair.' },
    { part: 'Term', description: 'the label.' },
    { part: 'Details', description: 'the value; mono for identifiers. Long values wrap.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <DescriptionList className="w-80">
            {PAIRS.map(([t, d]) => (
              <DescriptionItem key={t}><DescriptionTerm>{t}</DescriptionTerm><DescriptionDetails className={t === 'Client portal' ? 'font-code' : undefined}>{d}</DescriptionDetails></DescriptionItem>
            ))}
          </DescriptionList>
        ),
        caption: 'Label and value, read top to bottom.',
      },
      dont: {
        example: (
          <Table className="w-80">
            <TableHeader><TableRow><TableHead>Field</TableHead><TableHead>Value</TableHead></TableRow></TableHeader>
            <TableBody>{PAIRS.map(([t, d]) => <TableRow key={t}><TableCell>{t}</TableCell><TableCell>{d}</TableCell></TableRow>)}</TableBody>
          </Table>
        ),
        caption: 'A “Field / Value” table for one object adds headers that say nothing.',
      },
    },
  ],
  a11y: ['Real dl / dt / dd: screen readers pair each term with its value.', 'Empty values say so (“Not set”), not a blank or a dash alone.'],
};
