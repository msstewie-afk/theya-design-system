import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Filter } from './filter';
import { FilterField, type FilterAttribute } from './filter-field';

const ATTRS: FilterAttribute[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'status', label: 'Status', type: 'select', multiple: true, options: [
    { value: 'published', label: 'Published', tone: 'success' },
    { value: 'expired', label: 'Expired', tone: 'danger' },
  ] },
  { key: 'studio', label: 'Studio', type: 'select', options: [
    { value: 'helios', label: 'Helios Studio' },
    { value: 'selene', label: 'Selene Weddings' },
  ] },
  { key: 'created', label: 'Created', type: 'date', range: true },
  { key: 'photos', label: 'Photos', type: 'number' },
];

const opts = (labels: string[]) => labels.map((l) => ({ value: l.toLowerCase(), label: l }));

export const filterFieldGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Keyword search and filtering by many attributes in one field: galleries, logs, clients.', 'Applied filters should stay visible and editable as chips.'],
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
            <FilterField attributes={ATTRS} defaultValue={[{ key: 'status', value: 'published' }]} aria-label="Filter galleries" />
          </div>
        ),
        caption: 'Five attributes and search in one field; what’s applied is visible as chips.',
      },
      dont: {
        example: (
          <div className="flex w-96 max-w-full flex-wrap gap-2">
            <Filter label="Name" options={opts(['Golden hour', 'Blue hour'])} />
            <Filter label="Status" options={opts(['Published', 'Expired'])} />
            <Filter label="Studio" options={opts(['Helios Studio', 'Selene Weddings'])} />
            <Filter label="Created" options={opts(['Today', 'This week'])} />
            <Filter label="Photos" options={opts(['Under 100', '100+'])} />
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
