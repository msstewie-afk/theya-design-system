import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Filter } from './filter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

const STATUS = [
  { value: 'active', label: 'Active', count: 24 },
  { value: 'suspended', label: 'Suspended', count: 3 },
  { value: 'pending', label: 'Pending', count: 7 },
];
const REGION = [
  { value: 'eu', label: 'Europe', count: 18 },
  { value: 'us', label: 'Americas', count: 11 },
  { value: 'ap', label: 'Asia Pacific', count: 5 },
];

export const filterGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Narrowing a list or table by a few facets: status, region, owner.', 'Several values per facet, with counts per option.'],
  whenNotToUse: [
    { text: 'Many attributes plus keyword search', instead: 'FilterField' },
    { text: 'Arbitrary conditions (greater than, between, any/all)', instead: 'QueryBuilder' },
    { text: 'A value in a form', instead: 'Select, CheckboxGroup or Combobox' },
  ],
  anatomy: [
    { part: 'Trigger', description: <>facet name; with a selection shows the count (“Status, 2”); <C>heightSize</C> sm/md/lg.</> },
    { part: 'Popover', description: <>checkbox options with counts; <C>searchable</C> for long lists.</> },
    { part: 'Clear', description: 'back to “no filter”.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex flex-wrap gap-2">
            <Filter label="Status" options={STATUS} defaultValue={['active']} />
            <Filter label="Region" options={REGION} />
          </div>
        ),
        caption: 'One trigger per facet; several values each; counts say how many match.',
      },
      dont: {
        example: (
          <Select defaultValue="all">
            <SelectTrigger widthSize="md" aria-label="Status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        ),
        caption: 'A select as a filter: one status at a time and a fake “All” option.',
      },
    },
  ],
  a11y: [
    'The trigger is a button whose name includes the selection count (“Status, 1 selected”).',
    'Options are a named checkbox group; Space toggles.',
    'Announce the new result count on the page when filters change.',
  ],
};
