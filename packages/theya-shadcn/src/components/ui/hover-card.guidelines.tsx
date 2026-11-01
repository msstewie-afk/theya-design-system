import { type ComponentGuidelines } from '../../docs/guidelines';
import { Button } from './button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card';
import { Link } from './link';


export const hoverCardGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A quick preview of what a link points to — a user, a gallery, a client portal — that people could also get by clicking.'],
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
            <HoverCardTrigger asChild><Link href="#gl-hc" size="md" className="font-mono">selene-weddings.aether.photo</Link></HoverCardTrigger>
            <HoverCardContent>
              <p className="font-mono text-body-m font-medium text-[var(--color-text-text)]">selene-weddings.aether.photo</p>
              <p className="mt-1 font-body text-body-s text-[var(--color-text-text-subtler)]">Online · Selene Weddings · 1,284 views today</p>
            </HoverCardContent>
          </HoverCard>
        ),
        caption: 'Hover or focus the link for a preview; clicking still opens the portal.',
      },
      dont: {
        example: (
          <HoverCard>
            <HoverCardTrigger asChild><Link href="#gl-hc" size="md" className="font-mono">eos-portraits.aether.photo</Link></HoverCardTrigger>
            <HoverCardContent>
              <div className="flex gap-2">
                <Button appearance="outlined" tone="secondary" size="sm">Re-sync</Button>
                <Button appearance="outlined" tone="danger" size="sm">Unpublish</Button>
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
