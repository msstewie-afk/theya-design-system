import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Calendar } from './calendar';
import { TextField } from './text-field';

export const calendarGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['The calendar is the content: picking a booking day, showing availability, choosing several days.', <>Inside your own popover or panel; <C>mode</C> single, multiple or range.</>],
  whenNotToUse: [
    { text: 'A date field in a form', instead: 'DatePicker' },
    { text: 'A range field in a form', instead: 'DateRangePicker' },
  ],
  anatomy: [
    { part: 'Caption and nav', description: <>month name with arrows, or month/year dropdowns (<C>captionLayout="dropdown"</C>).</> },
    { part: 'Grid', description: 'weekdays, then days; today is marked, outside days are dimmed.' },
    { part: 'Day states', description: <>selected, range start/middle/end, <C>disabled</C> via matchers.</> },
  ],
  doDont: [
    {
      do: {
        example: <Calendar mode="single" disabled={{ dayOfWeek: [0, 6] }} aria-label="Delivery day" labels={{ labelNav: () => 'Delivery day months' }} />,
        caption: 'Choosing the day is the main task here, so the month stays open; weekends are off.',
      },
      dont: {
        example: (
          <div className="flex flex-col gap-4">
            <TextField label="Project name" defaultValue="Spring launch" widthSize="md" />
            <div className="flex flex-col gap-2">
              <span id="gl-cal-due" className="font-body text-body-m font-medium text-[var(--color-text-text)]">
                Due date
              </span>
              <Calendar mode="single" aria-labelledby="gl-cal-due" labels={{ labelNav: () => 'Due date months' }} />
            </div>
          </div>
        ),
        caption: 'A full calendar for one form field takes the whole form — use a DatePicker.',
      },
    },
  ],
  a11y: [
    'Arrows move by day, Page Up/Down by month, Home/End to week start/end; Enter selects.',
    <>Give it a name (<C>aria-label</C>) when no heading says what the dates are for.</>,
    <>Two calendars on one page: name each one’s month navigation (<C>{'labels={{ labelNav }}'}</C>) so the landmarks differ.</>,
    'Explain disabled days in text — a grayed-out day says nothing about why.',
  ],
};
