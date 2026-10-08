import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Label } from './label';
import { MaskedInput } from './masked-input';
import { TextField } from './text-field';

export const maskedInputGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['A value with one fixed format people type character by character: a card number, an IPv4 address, a date in a fixed form.'],
  whenNotToUse: [
    { text: 'Phone numbers (formats differ by country)', instead: 'PhoneField' },
    { text: 'Dates people may pick', instead: 'DatePicker' },
    { text: 'Free text, names, emails', instead: 'TextField' },
  ],
  anatomy: [
    { part: 'Field', description: 'TextField’s input and chrome; label it with a Label (htmlFor) or aria-label.' },
    { part: 'Mask', description: <><C>mask</C> template with placeholder chars; <C>showMask</C> shows it while empty.</> },
  ],
  doDont: [
    {
      do: { example: (
          <div className="flex w-64 flex-col gap-2">
            <Label htmlFor="gl-mi-card">Card number</Label>
            <MaskedInput id="gl-mi-card" mask="____ ____ ____ ____" />
          </div>
        ), caption: 'Groups appear as you type; separators aren’t typed.' },
      dont: { example: <TextField label="Card number" placeholder="Enter 16 digits without spaces" widthSize="md" />, caption: 'Making people strip spaces themselves.' },
    },
  ],
  a11y: [
    'The format goes in the description too (“16 digits”) — the mask alone isn’t read out.',
    <>Known limitation: editing in the middle can move the caret to the end.</>,
    <>Read the raw value with <C>onUnmaskedChange</C>, not by stripping on your side.</>,
  ],
};
