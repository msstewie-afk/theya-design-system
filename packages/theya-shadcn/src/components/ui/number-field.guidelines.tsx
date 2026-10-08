import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Label } from './label';
import { NumberField } from './number-field';
import { TextField } from './text-field';

export const numberFieldGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A count or amount people adjust in small steps: quantity, seats, retention days, CPU cores.', <>With <C>min</C>/<C>max</C> when the range is known.</>],
  whenNotToUse: [
    { text: 'Numbers that aren’t amounts: card, phone, postcode', instead: 'TextField / MaskedInput / PhoneField' },
    { text: 'A range of two values', instead: 'RangeField' },
    { text: 'Rough values where precision doesn’t matter', instead: 'Slider' },
  ],
  anatomy: [
    { part: 'Label', description: 'outside, via Label.' },
    { part: 'Input', description: 'typed value commits on blur/Enter, then clamps.' },
    { part: '− / + buttons', description: <>step by <C>step</C>; Shift+arrows ×10.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex flex-col items-start gap-2">
            <Label htmlFor="gl-nf-seats">Seats</Label>
            <NumberField id="gl-nf-seats" defaultValue={5} min={1} max={50} />
          </div>
        ),
        caption: 'Default width (sm, 128px) and limits — the width says “a small number”. full only inside a fixed-width cell or column.',
      },
      dont: { example: <TextField label="Seats" defaultValue="5" description="Enter a number from 1 to 50" widthSize="full" />, caption: 'A plain text field for a count: no stepping, no limits, any text accepted.' },
    },
  ],
  a11y: [
    <>It’s a spinbutton: <C>aria-valuenow/min/max</C> are set, arrows change the value.</>,
    'Name the − / + buttons if “Decrease/Increase” isn’t clear enough (decrementLabel / incrementLabel).',
    'Say the unit in the label (“Retention, days”).',
  ],
};
