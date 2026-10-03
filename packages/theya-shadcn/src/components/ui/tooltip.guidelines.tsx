import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Copy, InfoCircle } from 'iconoir-react';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

export const tooltipGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Naming an icon-only control (“Copy API key”) or adding a short hint to something focusable.', 'A shortcut next to the name: “Search  /”.'],
  whenNotToUse: [
    { text: 'Information people need to complete a task', instead: 'text on the page or a field description' },
    { text: 'Links, buttons or anything interactive', instead: 'Popover' },
    { text: 'Previews of linked content', instead: 'HoverCard' },
  ],
  anatomy: [
    { part: 'Trigger', description: 'a focusable element — a Button, not a bare icon.' },
    { part: 'Content', description: <>a few words; <C>tone</C> success/danger for feedback (“Copied”).</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button appearance="ghost" tone="secondary" size="md" iconOnly leftIcon={<Copy />} aria-label="Copy API key" />
            </TooltipTrigger>
            <TooltipContent>Copy API key</TooltipContent>
          </Tooltip>
        ),
        caption: 'Hover or focus: two words that name the icon.',
      },
      dont: {
        example: (
          <div className="flex items-center gap-1.5 font-body text-body-m text-[var(--color-text-text)]">
            Password
            <Tooltip>
              <TooltipTrigger asChild>
                <Button appearance="ghost" tone="secondary" size="sm" iconOnly leftIcon={<InfoCircle />} aria-label="Password rules" />
              </TooltipTrigger>
              <TooltipContent>At least 12 characters, one number, one symbol, no spaces, different from your last 5 passwords.</TooltipContent>
            </Tooltip>
          </div>
        ),
        caption: 'Rules people need while typing, hidden in a tooltip — put them under the field.',
      },
    },
  ],
  a11y: [
    'Shows on hover and keyboard focus, hides on Escape; it describes the trigger and doesn’t replace its name.',
    'Not reachable on touch — never the only place for important information.',
  ],
};
