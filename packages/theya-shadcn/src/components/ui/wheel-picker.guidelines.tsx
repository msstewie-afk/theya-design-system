import { type ComponentGuidelines } from '../../docs/guidelines';
import { WheelPicker } from './wheel-picker';

const INTERVALS = ['15 minutes', '30 minutes', '1 hour', '2 hours', '6 hours'].map((label) => ({ value: label, label }));

export const wheelPickerGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'Picking one value from a short ordered scale — an interval, a duration, a size — where nudging up or down is the natural gesture.',
  ],
  whenNotToUse: [
    { text: 'Up to five options that should all be visible', instead: 'RadioGroup' },
    { text: 'A long or unordered list', instead: 'Select' },
    { text: 'Any number', instead: 'NumberField' },
  ],
  anatomy: [
    { part: 'Wheel', description: 'the options, rolled so the chosen one sits in the middle.' },
    { part: 'Band', description: 'the raised row that marks the chosen option.' },
  ],
  doDont: [
    {
      do: { example: <WheelPicker aria-label="Backup interval" options={INTERVALS} defaultValue="1 hour" />, caption: 'An ordered scale, labelled.' },
      dont: {
        example: <WheelPicker aria-label="Country" options={['Bulgaria', 'Germany', 'Spain'].map((label) => ({ value: label, label }))} />,
        caption: 'An unordered list — there is no “next” to roll to; use Select.',
      },
    },
  ],
  a11y: [
    'A listbox: ↑ ↓ move one option, Page Up / Page Down a screen, Home / End to the ends.',
    'Always give it a name (aria-label or aria-labelledby).',
    'With reduced motion the wheel jumps to the option instead of rolling.',
  ],
};
