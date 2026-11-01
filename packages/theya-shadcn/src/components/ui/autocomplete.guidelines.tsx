import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Autocomplete } from './autocomplete';
import { Label } from './label';

const LOCATIONS = [
  { value: 'othrys-lodge', label: 'Othrys Lodge' },
  { value: 'helios-studio', label: 'Helios Studio' },
  { value: 'studio-l4', label: 'Studio L4' },
];

export const autocompleteGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Free text where common values are worth suggesting: a shoot location, a city, a recent search.', 'Any typed value is valid — the suggestions only save typing.'],
  whenNotToUse: [
    { text: 'The value must be one of the options', instead: 'Combobox or Select' },
    { text: 'Several values', instead: 'Combobox (multiple) or TagInput' },
    { text: 'No useful suggestions', instead: 'TextField' },
  ],
  anatomy: [
    { part: 'Input', description: 'the value is whatever text is in it.' },
    { part: 'Suggestions', description: <>filtered as you type; <C>note</C> adds a secondary line; <C>disableFilter</C> when the server filters.</> },
    { part: 'Empty / loading', optional: true, description: <><C>emptyMessage</C>, <C>loading</C> — the typed text is kept either way.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex w-64 flex-col gap-2">
            <Label htmlFor="gl-ac-location">Shoot location</Label>
            <Autocomplete id="gl-ac-location" options={LOCATIONS} placeholder="Venue, city or address" />
          </div>
        ),
        caption: 'Suggests your studios, accepts any other place.',
      },
      dont: {
        example: (
          <div className="flex w-64 flex-col gap-2">
            <Label htmlFor="gl-ac-plan">Plan</Label>
            <Autocomplete id="gl-ac-plan" options={[{ value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }]} placeholder="Type a plan" />
          </div>
        ),
        caption: 'A fixed set of values in a free-text field: a typo like “Prro” instead of “Pro” is saved as the plan.',
      },
    },
  ],
  a11y: [
    'Arrows move through suggestions, Enter fills the input, Escape closes the list and keeps the text.',
    <>Label it with <C>Label</C> + <C>id</C> or <C>aria-label</C>.</>,
    'The number of suggestions is announced as they change.',
  ],
};
