import { type ComponentGuidelines } from '@/docs/guidelines';
import { Button } from './button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card';

const LINK = 'font-mono text-body-m text-[var(--color-text-text-link)] underline-offset-4 hover:underline';

export const hoverCardGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A quick preview of what a link points to — a user, a site, a ticket — that people could also get by clicking.'],
  whenNotToUse: [
    { text: 'Anything people must reach on touch', instead: 'Popover' },
    { text: 'A short label for an icon', instead: 'Tooltip' },
    { text: 'Actions or forms', instead: 'Popover or DropdownMenu' },
  ],
  anatomy: [
    { part: 'Trigger', description: 'a real link or button whose own action works without the card.' },
    { part: 'Content', description: 'a small read-only card, shown after a delay on hover or focus.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <HoverCard>
            <HoverCardTrigger asChild><a href="#gl-hc" className={LINK}>shop.seashell.dev</a></HoverCardTrigger>
            <HoverCardContent>
              <p className="font-mono text-body-m font-medium text-[var(--color-text-text)]">shop.seashell.dev</p>
              <p className="mt-1 font-body text-body-s text-[var(--color-text-text-subtler)]">Running · eu-west-1 · 184,320 requests today</p>
            </HoverCardContent>
          </HoverCard>
        ),
        caption: 'Hover or focus the link for a preview; clicking still opens the site.',
      },
      dont: {
        example: (
          <HoverCard>
            <HoverCardTrigger asChild><a href="#gl-hc" className={LINK}>api.seashell.dev</a></HoverCardTrigger>
            <HoverCardContent>
              <div className="flex gap-2">
                <Button appearance="outlined" tone="secondary" size="sm">Restart</Button>
                <Button appearance="outlined" tone="danger" size="sm">Stop</Button>
              </div>
            </HoverCardContent>
          </HoverCard>
        ),
        caption: 'Actions that appear only on hover: unreachable on touch, and gone as the pointer moves.',
      },
    },
  ],
  a11y: [
    'Opens on keyboard focus too, but screen readers don’t announce it — nothing in it may be missing elsewhere.',
    'Keep it read-only: no buttons, inputs or links inside.',
  ],
};
