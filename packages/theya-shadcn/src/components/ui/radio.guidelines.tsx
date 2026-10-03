import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Checkbox } from './checkbox';
import { Radio, RadioGroup } from './radio';

export const radioGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Exactly one of 2–5 options, all visible so people can compare them.', 'A choice where the difference needs a line of explanation (description under each option).'],
  whenNotToUse: [
    { text: 'More than 5 options', instead: 'Select (6–15) or Combobox (over 15)' },
    { text: 'Several options at once', instead: 'CheckboxGroup' },
    { text: 'Options that need a picture, price or several lines', instead: 'OptionCard' },
    { text: 'A single on/off', instead: 'Switch or Checkbox' },
  ],
  anatomy: [
    { part: 'Group', description: <>vertical with a 12px gap; <C>orientation="horizontal"</C> for 2–3 short options.</> },
    { part: 'Radio', description: <>dot plus <C>label</C>.</> },
    { part: 'Description', optional: true, description: 'a line under the label.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <RadioGroup defaultValue="daily" aria-label="Backup frequency">
            <Radio value="daily" label="Daily" description="Kept for 7 days" />
            <Radio value="weekly" label="Weekly" description="Kept for 4 weeks" />
            <Radio value="off" label="Off" />
          </RadioGroup>
        ),
        caption: 'A sensible default is selected, and “Off” is an option rather than an empty group.',
      },
      dont: {
        example: (
          <div className="flex flex-col gap-3">
            <Checkbox label="Daily" />
            <Checkbox label="Weekly" />
          </div>
        ),
        caption: 'Checkboxes for a one-of choice let people pick both or none.',
      },
    },
  ],
  a11y: [
    <>Name the group: <C>aria-label</C>, or put it in a <C>FormSection</C>/fieldset with a legend.</>,
    'Tab enters the group once; arrows move and select. Don’t make each radio a separate tab stop.',
    'Pre-select a default when one is safe — a group with nothing selected can’t be reset by keyboard.',
  ],
};
