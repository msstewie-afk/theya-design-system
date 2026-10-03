import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { DatePicker } from './date-picker';
import { Label } from './label';
import { MaskedInput } from './masked-input';

export const datePickerGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['One date near today that people pick by looking at a month: a start date, a due date, a delivery day.', <>Dates with rules — past days, weekends — disabled through <C>calendarProps</C>.</>],
  whenNotToUse: [
    { text: 'A date people know by heart, far from today (birth date, card expiry)', instead: 'MaskedInput' },
    { text: 'A start and end', instead: 'DateRangePicker' },
    { text: 'A date with a time', instead: 'DateTimePicker' },
  ],
  anatomy: [
    { part: 'Trigger', description: 'looks like a Select: calendar icon, the date or a placeholder, chevron.' },
    { part: 'Clear', optional: true, description: <><C>showClear</C> for optional dates.</> },
    { part: 'Calendar popover', description: <>opens on the selected month; rules via <C>calendarProps</C> (<C>disabled</C>, <C>startMonth</C>…).</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex w-64 flex-col gap-2">
            <Label htmlFor="gl-dp-start">Start date</Label>
            <DatePicker id="gl-dp-start" placeholder="Pick a date" calendarProps={{ disabled: { before: new Date() } }} />
          </div>
        ),
        caption: 'A date close to today; days in the past can’t be picked.',
      },
      dont: {
        example: (
          <div className="flex w-64 flex-col gap-2">
            <Label htmlFor="gl-dp-birth">Date of birth</Label>
            <DatePicker id="gl-dp-birth" placeholder="Pick a date" />
          </div>
        ),
        caption: 'A birth date in a calendar: 30 years of “previous month” clicks for something people can type.',
      },
    },
    {
      do: {
        example: (
          <div className="flex w-64 flex-col gap-2">
            <Label htmlFor="gl-dp-birth2">Date of birth (DD.MM.YYYY)</Label>
            <MaskedInput id="gl-dp-birth2" mask="__.__.____" />
          </div>
        ),
        caption: 'A known date far from today: typed, with the format in the label.',
      },
      dont: {
        example: (
          <div className="flex w-64 flex-col gap-2">
            <Label htmlFor="gl-dp-due">Due date</Label>
            <DatePicker id="gl-dp-due" defaultValue={new Date(2020, 0, 1)} />
          </div>
        ),
        caption: 'A due date that allows the past — and opens years away from today.',
      },
    },
  ],
  a11y: [
    <>The trigger is named by its label (<C>Label</C> + <C>id</C> or <C>aria-label</C>); the chosen date is its description.</>,
    'In the calendar: arrows move by day, Page Up/Down by month, Enter picks, Escape closes and returns focus.',
    'Say the rule in text too (“From today”) — a disabled day isn’t explained by itself.',
  ],
};
