import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { QueryBuilder, type QueryField } from './query-builder';

const FIELDS: QueryField[] = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'replicas', label: 'Replicas', type: 'number' },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
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
                  { id: 'c1', field: 'status', operator: 'is', value: 'active' },
                  { id: 'c2', field: 'replicas', operator: 'lt', value: 2 },
                ],
              }}
            />
          </div>
        ),
        caption: 'A rule people build once and keep: “active and fewer than 2 replicas”.',
      },
      dont: {
        example: (
          <div className="w-[34rem] max-w-full">
            <QueryBuilder
              fields={FIELDS}
              ariaLabel="Filter servers"
              defaultValue={{ match: 'all', conditions: [{ id: 'd1', field: 'status', operator: 'is', value: 'active' }] }}
            />
          </div>
        ),
        caption: 'A whole builder to show active servers — a Filter does it in one click.',
      },
    },
  ],
  a11y: [
    <>It’s a named group (<C>ariaLabel</C>); each row’s controls are named after its field (“Status condition”, “Remove Status condition”).</>,
    'Adding or removing a row keeps focus in the builder — on the new row’s field, a neighbouring remove button, or Add.',
    'Say the result in words near it when you can (“Matches 4 servers”).',
  ],
};
