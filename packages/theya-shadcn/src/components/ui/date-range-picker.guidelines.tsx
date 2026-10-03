import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { DatePicker } from './date-picker';
import { DateRangePicker } from './date-range-picker';
import { Label } from './label';

export const dateRangePickerGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A start and end date picked together: a report period, a booking, a filter.', 'People need to see the length of the span while choosing.'],
  whenNotToUse: [
    { text: 'Fixed periods (Last 7 days, This month)', instead: 'Select or ToggleGroup — add a Custom option that opens this' },
    { text: 'A single date', instead: 'DatePicker' },
    { text: 'A time span within a day', instead: 'TimeRangePicker' },
  ],
  anatomy: [
    { part: 'Trigger', description: 'same field as DatePicker; shows “Jun 3 – Jun 17, 2026”.' },
    { part: 'Calendar', description: <><C>numberOfMonths</C> (2 by default, stacked below md); stays open until both ends are picked.</> },
    { part: 'Clear', optional: true, description: <><C>showClear</C>.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex w-72 flex-col gap-2">
            <Label htmlFor="gl-drp-period">Report period</Label>
            <DateRangePicker id="gl-drp-period" placeholder="Pick a period" />
          </div>
        ),
        caption: 'One field, one calendar: the span is drawn as you pick it.',
      },
      dont: {
        example: (
          <div className="flex w-72 flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="gl-drp-from">From</Label>
              <DatePicker id="gl-drp-from" placeholder="Pick a date" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="gl-drp-to">To</Label>
              <DatePicker id="gl-drp-to" placeholder="Pick a date" />
            </div>
          </div>
        ),
        caption: 'Two separate pickers: two popovers, and “To” can end up before “From”.',
      },
    },
  ],
  a11y: [
    'The trigger is named by the label; the chosen range is its description.',
    'Keyboard works as in DatePicker; the first Enter sets the start, the second the end.',
    'After clearing, focus returns to the trigger.',
  ],
};
