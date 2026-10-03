import { Bell } from 'iconoir-react';
import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { BadgeIndicator } from './badge-indicator';
import { Button } from './button';

function BellWith({ value, label }: { value: string; label: string }) {
  return (
    <span className="relative inline-flex">
      <Button appearance="ghost" tone="neutral" iconOnly leftIcon={<Bell />} aria-label={label} />
      <BadgeIndicator value={value} tone="danger" className="pointer-events-none absolute -top-1 -right-1" />
    </span>
  );
}

export const badgeIndicatorGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'A count or a “something new” dot on an icon, avatar or nav item: unread notifications, pending invites.',
    'A tiny status mark where a Badge with a word doesn’t fit.',
  ],
  whenNotToUse: [
    { text: 'A status that needs a word (“Active”, “Expired”)', instead: 'Badge' },
    { text: 'Live status next to a text label in a list', instead: 'StatusDot' },
    { text: 'A number people need to read precisely', instead: 'Stat or plain text' },
  ],
  anatomy: [
    { part: 'Container', description: <>16 / 20px (<C>size</C>), <C>circle</C> or <C>square</C>, <C>filled</C> or <C>outlined</C>, <C>tone</C>.</> },
    { part: 'Content', description: <>a short <C>value</C>, an <C>icon</C>, or nothing with <C>dot</C>.</> },
  ],
  doDont: [
    {
      do: { example: <BellWith value="9+" label="Notifications, more than 9 unread" />, caption: 'Cap long counts (“9+”, “99+”) — the exact number lives in the list.' },
      dont: { example: <BellWith value="1284" label="Notifications" />, caption: 'A four-digit count overflows the badge and says nothing more.' },
    },
  ],
  a11y: [
    'The indicator is visual: put its meaning into the name of what it sits on (“Notifications, 3 unread”).',
    <>A <C>dot</C> is hidden from screen readers — the parent’s label must say “new” or “unread”.</>,
    'Not focusable and not clickable; the icon button under it is the target.',
  ],
};
