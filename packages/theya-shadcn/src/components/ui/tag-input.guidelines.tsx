import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { TagInput } from './tag-input';
import { TextField } from './text-field';

export const tagInputGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['Several free-form values of one kind: email recipients, domains, IP ranges, tags.'],
  whenNotToUse: [
    { text: 'Picking several from a known list', instead: 'Combobox multiple or CheckboxGroup' },
    { text: 'One value', instead: 'TextField' },
  ],
  anatomy: [
    { part: 'Field', description: 'chips and the input in one border.' },
    { part: 'Chip', description: <>one value, removable; invalid ones turn danger and stay (<C>validate</C>).</> },
    { part: 'Description / errors', description: 'what to type, then which values are wrong.' },
  ],
  doDont: [
    {
      do: { example: <div className="w-80"><TagInput aria-label="Recipients" defaultValue={['dana@seashell.shop', 'ops@seashell.shop']} /></div>, caption: 'Each value is a chip — easy to check and remove.' },
      dont: { example: <TextField label="Recipients" defaultValue="dana@seashell.shop, ops@seashell.shop" description="Separate with commas" widthSize="lg" />, caption: 'A comma list in one field hides which value is wrong.' },
    },
  ],
  a11y: ['Additions and removals are announced.', 'Backspace in the empty input removes the last chip; each chip’s remove button is named.', <>Invalid values stay visible with their reason — never dropped silently.</>],
};
