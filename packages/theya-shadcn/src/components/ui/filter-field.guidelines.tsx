import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Filter } from './filter';
import { FilterField, type FilterAttribute } from './filter-field';

const ATTRS: FilterAttribute[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'status', label: 'Status', type: 'select', multiple: true, options: [
    { value: 'active', label: 'Active', tone: 'success' },
    { value: 'suspended', label: 'Suspended', tone: 'danger' },
  ] },
  { key: 'region', label: 'Region', type: 'select', options: [
    { value: 'eu', label: 'Europe' },
    { value: 'us', label: 'Americas' },
  ] },
  { key: 'created', label: 'Created', type: 'date', range: true },
  { key: 'cpu', label: 'CPU cores', type: 'number' },
];

const opts = (labels: string[]) => labels.map((l) => ({ value: l.toLowerCase(), label: l }));

export const filterFieldGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Keyword search and filtering by many attributes in one field: servers, logs, users.', 'Applied filters should stay visible and editable as chips.'],
  whenNotToUse: [
    { text: 'Two or three facets', instead: 'Filter' },
    { text: 'Nested any/all logic', instead: 'QueryBuilder' },
  ],
  anatomy: [
    { part: 'Input', description: 'free text searches; focusing it lists the attributes.' },
    { part: 'Step two', description: 'the chosen attribute’s editor: options, text with operator, date or number range.' },
    { part: 'Chips', description: 'one per applied filter; click to edit, × to remove.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="w-96 max-w-full">
            <FilterField attributes={ATTRS} defaultValue={[{ key: 'status', value: 'active' }]} aria-label="Filter servers" />
          </div>
        ),
        caption: 'Five attributes and search in one field; what’s applied is visible as chips.',
      },
      dont: {
        example: (
          <div className="flex w-96 max-w-full flex-wrap gap-2">
            <Filter label="Name" options={opts(['web-01', 'web-02'])} />
            <Filter label="Status" options={opts(['Active', 'Suspended'])} />
            <Filter label="Region" options={opts(['Europe', 'Americas'])} />
            <Filter label="Created" options={opts(['Today', 'This week'])} />
            <Filter label="CPU cores" options={opts(['2', '4'])} />
          </div>
        ),
        caption: 'A trigger per attribute: the bar wraps, and names and dates get squeezed into checkboxes.',
      },
    },
  ],
  a11y: [
    <>The input is a <C>combobox</C> named with <C>aria-label</C>; attributes are a listbox.</>,
    'Each chip is a button named “Status: Active” with a separate remove button.',
    'Focus moves into step two when it opens and back to the input when a filter is applied.',
  ],
};
