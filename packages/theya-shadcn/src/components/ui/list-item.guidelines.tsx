import { Bell, Lock, NavArrowRight } from 'iconoir-react';
import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { ListItem } from './list-item';

export const listItemGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'Lists lighter than a table: settings sections, notifications, a resource picker.',
    <>A whole row that navigates (<C>href</C>) or toggles selection (<C>interactive</C>).</>,
  ],
  whenNotToUse: [
    { text: 'Several comparable columns', instead: 'DataTable' },
    { text: 'Menu commands', instead: 'DropdownMenu' },
    { text: 'Picking one of a few options', instead: 'OptionCard or Radio' },
  ],
  anatomy: [
    { part: 'Leading', description: 'icon, avatar or thumbnail.', optional: true },
    { part: 'Title', description: 'the item.' },
    { part: 'Description', description: 'one line of detail.', optional: true },
    { part: 'Trailing', description: 'value, badge, switch or chevron — outside the clickable area.', optional: true },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex w-80 flex-col">
            <ListItem href="#" leading={<Lock />} title="Security" description="Password, 2FA, sessions" trailing={<NavArrowRight />} />
            <ListItem href="#" leading={<Bell />} title="Notifications" description="Email and in-app" trailing={<NavArrowRight />} />
          </div>
        ),
        caption: 'Short title, one line of detail, the whole row is the link.',
      },
      dont: {
        example: (
          <div className="flex w-80 flex-col">
            <ListItem href="#" title="Security settings" description="Here you can manage your password, two-factor authentication, active sessions, API tokens and recovery codes for your account." />
          </div>
        ),
        caption: 'A paragraph as description: the list stops being scannable.',
      },
    },
  ],
  a11y: [
    'The row is one real link or button; the description is attached as its description.',
    <>Selected state is announced (<C>aria-pressed</C> / <C>aria-current</C>).</>,
    'A control in trailing is its own tab stop and needs its own label.',
  ],
};
