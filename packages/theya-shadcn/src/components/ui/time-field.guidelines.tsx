import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Label } from './label';
import { TextField } from './text-field';
import { TimeField } from './time-field';

export const timeFieldGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A time of day: a daily backup time, a meeting start, a reminder.', <>Times on a grid (<C>step</C>) with limits (<C>min</C>/<C>max</C>) — any typed time is still accepted.</>],
  whenNotToUse: [
    { text: 'Start and end', instead: 'TimeRangePicker' },
    { text: 'A date and a time', instead: 'DateTimePicker' },
    { text: 'A duration (“90 minutes”)', instead: 'NumberField with a unit' },
  ],
  anatomy: [
    { part: 'Input', description: 'type to filter or enter any time (“9:47”).' },
    { part: 'List', description: <>times from <C>min</C> to <C>max</C> every <C>step</C> minutes, shown per <C>hourCycle</C>.</> },
    { part: 'Value', description: '24-hour “HH:MM” string, whatever the display.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex w-48 flex-col gap-2">
            <Label htmlFor="gl-tf-backup">Daily backup at</Label>
            <TimeField id="gl-tf-backup" step={30} placeholder="Choose a time" />
          </div>
        ),
        caption: 'A list on a 30-minute grid, with typing for anything in between.',
      },
      dont: {
        example: <TextField label="Daily backup at" placeholder="e.g. 9:30" widthSize="md" />,
        caption: 'Free text: “9.30”, “930” and “9:30pm” all need guessing.',
      },
    },
  ],
  a11y: [
    'It’s a combobox: arrows move through times, Enter picks, typing filters.',
    <>Label it (<C>Label</C> + <C>id</C> or <C>aria-label</C>); put the time zone in the label or description if it matters.</>,
  ],
};
