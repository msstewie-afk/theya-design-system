import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { TextField } from './text-field';

export const labelGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Naming any form control that doesn’t draw its own label — Select, Combobox, DatePicker, NumberField, custom controls.', <>Marking required (<C>required</C>, red *) and optional (<C>optional</C>, “(optional)”) fields.</>],
  whenNotToUse: [
    { text: 'TextField and TextArea — they take a label prop', instead: 'TextField label' },
    { text: 'A group of controls', instead: 'Fieldset legend' },
    { text: 'Plain text that names nothing', instead: 'a heading or text' },
  ],
  anatomy: [
    { part: 'Text', description: 'short, a noun (“Domain”), not an instruction (“Enter your domain”).' },
    { part: 'Required mark', optional: true, description: 'red *, hidden from screen readers — the control carries required itself.' },
    { part: 'Optional mark', optional: true, description: '“(optional)” in subtler text.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex w-72 flex-col gap-4">
            <TextField label="Email" required widthSize="full" />
            <TextField label="Company" optional widthSize="full" />
          </div>
        ),
        caption: 'Both kinds marked: required with *, optional with “(optional)”.',
      },
      dont: {
        example: (
          <div className="flex w-72 flex-col gap-4">
            <TextField label="Email" widthSize="full" />
            <TextField label="Company" widthSize="full" />
          </div>
        ),
        caption: 'No marks in a long form: people find out what’s required from the errors.',
      },
    },
  ],
  a11y: [
    <>Connect it: <C>htmlFor</C> on the label, the same <C>id</C> on the control. Clicking the label focuses the control.</>,
    <>Radix controls that render a button (Switch, Checkbox) may also need <C>aria-label</C> — check the name in the a11y panel.</>,
    'Short all-required forms (sign-in) can skip both marks.',
  ],
};
