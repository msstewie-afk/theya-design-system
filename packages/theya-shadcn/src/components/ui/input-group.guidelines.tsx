import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { InputGroup, InputGroupAddon, InputGroupInput } from './input-group';
import { Label } from './label';
import { TextField } from './text-field';

export const inputGroupGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A fixed prefix or suffix that is part of the value’s format: https://, .theya.app, /mo, GB.', 'A button that belongs to the field, inside its border.'],
  whenNotToUse: [
    { text: 'Just an icon', instead: 'TextField leftIcon / rightIcon' },
    { text: 'A unit people can change', instead: 'TextField + Select next to it' },
    { text: 'Search with suggestions', instead: 'Autocomplete' },
  ],
  anatomy: [
    { part: 'Container', description: 'one border and one focus ring for the whole group.' },
    { part: 'Addon', description: <><C>position</C> start/end, optional <C>divider</C>.</> },
    { part: 'Input', description: 'borderless; the container draws the border.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex w-64 flex-col gap-2">
            <Label htmlFor="gl-ig-sub">Subdomain</Label>
            <InputGroup>
              <InputGroupInput id="gl-ig-sub" defaultValue="shop" />
              <InputGroupAddon position="end">.theya.app</InputGroupAddon>
            </InputGroup>
          </div>
        ),
        caption: 'The fixed part is shown, not typed.',
      },
      dont: { example: <TextField label="Subdomain" defaultValue="shop.theya.app" widthSize="md" description="Must end with .theya.app" />, caption: 'Asking people to type the fixed part invites typos.' },
    },
  ],
  a11y: [
    'Label the input itself (htmlFor its id). The addon is visible text, not part of the name — repeat it in the description if it matters.',
    'Errors go on the input (aria-invalid + described message) — the group shows them together.',
  ],
};
