import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { DateTimePicker } from './date-time-picker';
import { TextField } from './text-field';

export const dateTimePickerGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A moment that needs both date and time: a scheduled send, a maintenance window, a reminder.'],
  whenNotToUse: [
    { text: 'Only the date matters', instead: 'DatePicker' },
    { text: 'A time every day (opening hours)', instead: 'TimeField or TimeRangePicker' },
  ],
  anatomy: [
    { part: 'Date', description: 'a DatePicker.' },
    { part: 'Time', description: <>a TimeField; <C>step</C> in minutes, <C>hourCycle</C> 12/24. Stays empty until a time is actually picked.</> },
    { part: 'Value', description: <>one <C>Date</C>; <C>onChange</C>’s second argument says whether the time was set.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex w-96 max-w-full flex-col gap-2">
            <span aria-hidden="true" className="font-body text-body-m font-medium text-[var(--color-text-text)]">
              Send at
            </span>
            <DateTimePicker aria-label="Send at" step={15} />
          </div>
        ),
        caption: 'Date and time picked separately, in 15-minute steps; no silent midnight.',
      },
      dont: {
        example: <TextField label="Send at" placeholder="YYYY-MM-DD HH:MM" widthSize="lg" />,
        caption: 'One text field for both: format errors, and no idea whether 3:00 is AM or PM.',
      },
    },
  ],
  a11y: [
    <>Name it with <C>aria-label</C>: the date part gets that name, the time part gets it plus “time” (“Send at time”).</>,
    'If the time is required, say so when it’s missing — don’t store 00:00.',
    'Say the time zone in the description when people in several zones use it.',
  ],
};
