import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Button } from './button';
import { Label } from './label';
import { NumberField } from './number-field';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { TextField } from './text-field';

export const popoverGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A small panel tied to a control: a quick setting, a filter, a picker, extra details on tap.', 'Content people can dismiss without losing work.'],
  whenNotToUse: [
    { text: 'A short label for an icon', instead: 'Tooltip' },
    { text: 'A list of actions', instead: 'DropdownMenu' },
    { text: 'Forms with required fields, or a decision', instead: 'Dialog' },
  ],
  anatomy: [
    { part: 'Trigger', description: 'a button; aria-expanded is set.' },
    { part: 'Content', description: <>anchored panel; <C>side</C>, <C>align</C>; closes on Escape or a click outside.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <Popover>
            <PopoverTrigger asChild><Button appearance="outlined" tone="secondary" size="md">Limits</Button></PopoverTrigger>
            <PopoverContent align="start" className="w-64">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="gl-po-cpu">CPU cores</Label>
                <NumberField id="gl-po-cpu" defaultValue={2} min={1} max={8} />
              </div>
            </PopoverContent>
          </Popover>
        ),
        caption: 'One quick setting right next to what it affects.',
      },
      dont: {
        example: (
          <Popover>
            <PopoverTrigger asChild><Button appearance="outlined" tone="secondary" size="md">Billing details</Button></PopoverTrigger>
            <PopoverContent align="start" className="w-72">
              <div className="flex flex-col gap-3">
                <TextField label="Company" required widthSize="full" />
                <TextField label="VAT number" required widthSize="full" />
                <TextField label="Address" required widthSize="full" />
              </div>
            </PopoverContent>
          </Popover>
        ),
        caption: 'A required form in a popover: one click outside and it’s gone.',
      },
    },
  ],
  a11y: [
    'Focus moves into the panel on open and back to the trigger on close; Escape closes.',
    'Not modal: the page stays interactive — keep the content light.',
  ],
};
