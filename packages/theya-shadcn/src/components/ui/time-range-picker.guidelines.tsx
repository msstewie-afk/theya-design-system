import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Label } from './label';
import { TimeField } from './time-field';
import { TimeRangePicker } from './time-range-picker';

export const timeRangePickerGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A start and end time within one day: opening hours, a maintenance window, quiet hours.'],
  whenNotToUse: [
    { text: 'Spans across days', instead: 'DateRangePicker or two DateTimePickers' },
    { text: 'A single time', instead: 'TimeField' },
  ],
  anatomy: [
    { part: 'Start and End', description: <>two TimeFields with “to” between; <C>startLabel</C>/<C>endLabel</C> name them.</> },
    { part: 'Linked limits', description: 'the end list starts after the chosen start.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex w-80 flex-col gap-2">
            <span id="gl-trp-quiet" className="font-body text-body-m font-medium text-[var(--color-text-text)]">
              Quiet hours
            </span>
            <TimeRangePicker aria-labelledby="gl-trp-quiet" step={30} defaultValue={{ start: '22:00', end: '23:30' }} />
          </div>
        ),
        caption: 'One control: the end can’t be set before the start.',
      },
      dont: {
        example: (
          <div className="flex items-end gap-2">
            <div className="flex w-36 flex-col gap-2">
              <Label htmlFor="gl-trp-from">From</Label>
              <TimeField id="gl-trp-from" step={30} defaultValue="22:00" />
            </div>
            <div className="flex w-36 flex-col gap-2">
              <Label htmlFor="gl-trp-to">To</Label>
              <TimeField id="gl-trp-to" step={30} defaultValue="09:00" />
            </div>
          </div>
        ),
        caption: 'Two unlinked fields: “to 09:00” — the next morning, or a mistake?',
      },
    },
  ],
  a11y: [
    <>Name the pair (<C>aria-label</C> or <C>aria-labelledby</C>); each field is named Start/End within it.</>,
    'If an overnight range is allowed, say so in the description.',
  ],
};
