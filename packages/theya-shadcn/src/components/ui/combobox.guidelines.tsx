import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Combobox } from './combobox';
import { Label } from './label';

const REGIONS = [
  { value: 'eu-west-1', label: 'EU (Ireland)' },
  { value: 'eu-central-1', label: 'EU (Frankfurt)' },
  { value: 'us-east-1', label: 'US East (Virginia)' },
  { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)' },
];

export const comboboxGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Picking from a long list people search rather than scroll: regions, users, domains.', <><C>multiple</C>: several values shown as chips — tags, recipients, labels.</>, <><C>allowCreate</C>: a list people can add to (new tag).</>],
  whenNotToUse: [
    { text: 'Up to 15 known options', instead: 'Select (6–15) or RadioGroup (up to 5)' },
    { text: 'Free text where suggestions only help', instead: 'Autocomplete' },
    { text: 'Searching content, not choosing a value', instead: 'SearchBox' },
  ],
  anatomy: [
    { part: 'Input', description: 'typing filters the list (label and keywords).' },
    { part: 'Chips', optional: true, description: <>in <C>multiple</C> mode; Backspace removes the last.</> },
    { part: 'Clear / trigger buttons', optional: true, description: <><C>showClear</C>, <C>showTrigger</C>.</> },
    { part: 'List', description: <>options, an empty message, a loading state, and the “Create …” row with <C>allowCreate</C>.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex w-64 flex-col gap-2">
            <Label htmlFor="gl-cbx-region">Region</Label>
            <Combobox id="gl-cbx-region" options={REGIONS} placeholder="Search regions" />
          </div>
        ),
        caption: 'Many options with long names — people type “frank” instead of scanning.',
      },
      dont: {
        example: (
          <div className="flex w-64 flex-col gap-2">
            <Label htmlFor="gl-cbx-sort">Sort by</Label>
            <Combobox id="gl-cbx-sort" options={[{ value: 'new', label: 'Newest' }, { value: 'old', label: 'Oldest' }]} placeholder="Search" />
          </div>
        ),
        caption: 'Two options behind a search field — a Select or segmented control is faster.',
      },
    },
  ],
  a11y: [
    <>Input is a <C>combobox</C>; arrows move through options, Enter picks, Escape closes.</>,
    <>Label it with <C>Label</C> + <C>id</C> or <C>aria-label</C> — the placeholder isn’t a label.</>,
    'Chips are announced with their remove buttons (“Remove EU (Ireland)”).',
  ],
};
