import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { QueryBuilder, type QueryField } from './query-builder';

const FIELDS: QueryField[] = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'photos', label: 'Photos', type: 'number' },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'published', label: 'Published' },
    { value: 'expired', label: 'Expired' },
  ] },
];

export const queryBuilderGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Saved segments, alert rules, automation triggers — conditions people compose and come back to.', 'Operators beyond “is”: greater than, between, contains, is empty.'],
  whenNotToUse: [
    { text: 'Filtering a list on the spot', instead: 'Filter or FilterField' },
    { text: 'One or two fixed conditions', instead: 'a form with plain fields' },
  ],
  anatomy: [
    { part: 'Match', description: <>all (AND) or any (OR) of the conditions.</> },
    { part: 'Condition row', description: 'field → operator (by field type) → value editor of the right kind.' },
    { part: 'Add / remove', description: <><C>addLabel</C>, <C>maxConditions</C>; an empty state when there are none.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="w-[34rem] max-w-full">
            <QueryBuilder
              fields={FIELDS}
              ariaLabel="Alert rule"
              defaultValue={{
                match: 'all',
                conditions: [
                  { id: 'c1', field: 'status', operator: 'is', value: 'published' },
                  { id: 'c2', field: 'photos', operator: 'lt', value: 20 },
                ],
              }}
            />
          </div>
        ),
        caption: 'A rule people build once and keep: “published and fewer than 20 photos”.',
      },
      dont: {
        example: (
          <div className="w-[34rem] max-w-full">
            <QueryBuilder
              fields={FIELDS}
              ariaLabel="Filter galleries"
              defaultValue={{ match: 'all', conditions: [{ id: 'd1', field: 'status', operator: 'is', value: 'published' }] }}
            />
          </div>
        ),
        caption: 'A whole builder to show published galleries — a Filter does it in one click.',
      },
    },
  ],
  a11y: [
    <>It’s a named group (<C>ariaLabel</C>); each row’s controls are named after its field (“Status condition”, “Remove Status condition”).</>,
    'Adding or removing a row keeps focus in the builder — on the new row’s field, a neighbouring remove button, or Add.',
    'Say the result in words near it when you can (“Matches 4 galleries”).',
  ],
};
