import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { NavArrowDown } from 'iconoir-react';
import { Button } from './button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';
import { TextField } from './text-field';

export const collapsibleGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['One optional region people expand on demand: “Advanced settings”, “Show 12 more”, technical details.'],
  whenNotToUse: [
    { text: 'Several related sections', instead: 'Accordion' },
    { text: 'Required fields', instead: 'show them' },
  ],
  anatomy: [
    { part: 'Trigger', description: <>a button whose label says what opens (“Advanced settings”); chevron turns.</> },
    { part: 'Content', description: <><C>CollapsibleContent</C>, animated height.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <Collapsible className="flex w-72 flex-col gap-3">
            <CollapsibleTrigger asChild>
              <Button appearance="ghost" tone="secondary" size="md" rightIcon={<NavArrowDown />} className="self-start">Advanced settings</Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <TextField label="Custom build flags" optional widthSize="full" />
            </CollapsibleContent>
          </Collapsible>
        ),
        caption: 'Optional, rarely used settings, one click away.',
      },
      dont: {
        example: (
          <Collapsible className="flex w-72 flex-col gap-3">
            <CollapsibleTrigger asChild>
              <Button appearance="ghost" tone="secondary" size="md" rightIcon={<NavArrowDown />} className="self-start">More</Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <TextField label="Admin email" required widthSize="full" />
            </CollapsibleContent>
          </Collapsible>
        ),
        caption: '“More” hiding a required field: vague label, and the form fails on a field nobody saw.',
      },
    },
  ],
  a11y: [
    'The trigger is a button with aria-expanded and aria-controls.',
    'Its label names the content, not just “More”/“Show”.',
  ],
};
