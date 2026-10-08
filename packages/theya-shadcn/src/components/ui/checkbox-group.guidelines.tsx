import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Checkbox } from './checkbox';
import { CheckboxGroup, CheckboxGroupItem } from './checkbox-group';

export const checkboxGroupGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Several related yes/no choices that form one value (“Notify me by: Email, SMS”).', 'Up to about 8 options people should see at once.'],
  whenNotToUse: [
    { text: 'Exactly one option', instead: 'RadioGroup' },
    { text: 'Long or searchable lists', instead: 'Combobox (multiple)' },
    { text: 'Unrelated settings that only share a page', instead: 'separate Checkbox or Switch' },
  ],
  anatomy: [
    { part: 'Legend', description: <><C>label</C> — rendered as the fieldset legend.</> },
    { part: 'Items', description: <><C>CheckboxGroupItem</C>; its <C>name</C> is what lands in the value array.</> },
    { part: 'Size', description: <><C>size</C> sm/md flows to every item and sets the gap.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <CheckboxGroup label="Notify me by" defaultValue={['email']}>
            <CheckboxGroupItem name="email" label="Email" />
            <CheckboxGroupItem name="sms" label="SMS" />
            <CheckboxGroupItem name="push" label="Push notifications" />
          </CheckboxGroup>
        ),
        caption: 'One legend, one value; the question is asked once.',
      },
      dont: {
        example: (
          <div className="flex flex-col gap-3">
            <Checkbox label="Notify me by email" defaultChecked />
            <Checkbox label="Notify me by SMS" />
            <Checkbox label="Notify me by push" />
          </div>
        ),
        caption: 'Loose boxes repeat the question in every label and lose the group name for screen readers.',
      },
    },
  ],
  a11y: [
    'The legend is read with each option — keep it short and question-like.',
    'Each item is its own tab stop; Space toggles.',
    <>An error for the whole group goes under the group and is linked with <C>aria-describedby</C>, not on one box.</>,
  ],
};
