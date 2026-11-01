import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Combobox } from './combobox';
import { Label } from './label';

const STUDIOS = [
  { value: 'helios', label: 'Helios Studio' },
  { value: 'selene', label: 'Selene Weddings' },
  { value: 'eos', label: 'Eos Portraits' },
  { value: 'phoebe', label: 'Phoebe Light Lab' },
];

export const comboboxGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Picking from a long list people search rather than scroll: studios, people, client portals.', <><C>multiple</C>: several values shown as chips — tags, recipients, labels.</>, <><C>allowCreate</C>: a list people can add to (new tag).</>],
  whenNotToUse: [
    { text: 'Up to 15 known options', instead: 'Select (6–15) or RadioGroup (up to 5)' },
    { text: 'Free text where suggestions only help', instead: 'Autocomplete' },
    { text: 'Searching content, not choosing a value', instead: 'SearchBox (Patterns: Search)' },
  ],
  anatomy: [
    { part: 'Input', description: 'typing filters the list (label and keywords).' },
    { part: 'Chips', optional: true, description: <>in <C>multiple</C> mode; Backspace removes the last.</> },
    { part: 'Clear / chevron buttons', optional: true, description: <><C>showClear</C>, <C>showChevron</C>.</> },
    { part: 'List', description: <>options, an empty message, a loading state, and the “Create …” row with <C>allowCreate</C>.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex w-64 flex-col gap-2">
            <Label htmlFor="gl-cbx-studio">Studio</Label>
            <Combobox id="gl-cbx-studio" options={STUDIOS} placeholder="Search studios" />
          </div>
        ),
        caption: 'Many options with long names — people type “selene” instead of scanning.',
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
