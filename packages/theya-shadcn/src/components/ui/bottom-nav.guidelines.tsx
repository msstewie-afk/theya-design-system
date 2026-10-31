import { ChatBubble, HomeSimple, Search, User } from 'iconoir-react';
import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { BottomNav, BottomNavItem } from './bottom-nav';

export const bottomNavGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['The top-level destinations of a phone app: 3–5 of them, each reachable from anywhere.'],
  whenNotToUse: [
    { text: 'Two destinations', instead: 'Tabs' },
    { text: 'More than five destinations, or a desktop layout', instead: 'Sidebar' },
    { text: 'Actions (Save, Add, Delete)', instead: 'StickyActionBar or Fab' },
    { text: 'Views of one page', instead: 'Tabs' },
  ],
  anatomy: [
    { part: 'Bar', description: <>a <C>nav</C> landmark at the bottom edge, padded for the home indicator; <C>fixed</C> or <C>sticky</C>.</> },
    { part: 'Item', description: <>icon (24px) and a label; <C>href</C> makes it a link, <C>asChild</C> takes a router link.</> },
    { part: 'Current item', description: <><C>active</C>: tonal pill behind the icon and a semibold label.</> },
    { part: 'Badge', optional: true, description: <><C>badge</C>: a count (over 99 reads “99+”) or <C>true</C> for a dot; on the right of the icon, in RTL too.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="w-80">
            <BottomNav position="sticky" aria-label="Example">
              <BottomNavItem icon={<HomeSimple />} label="Home" active />
              <BottomNavItem icon={<Search />} label="Search" />
              <BottomNavItem icon={<ChatBubble />} label="Inbox" badge={3} />
              <BottomNavItem icon={<User />} label="Profile" />
            </BottomNav>
          </div>
        ),
        caption: 'Every item has a short label under its icon.',
      },
      dont: {
        example: (
          <div aria-hidden="true" className="flex w-80 justify-around border-t border-solid border-[var(--color-border-border-subtler)] bg-[var(--color-bg-surface-bg-surface)] py-4 text-[var(--color-icon-icon-subtle)] [&_svg]:size-6">
            <HomeSimple />
            <Search />
            <ChatBubble />
            <User />
          </div>
        ),
        caption: 'Icons alone make people guess, and there is no icon-only variant.',
      },
    },
  ],
  a11y: [
    <>A <C>nav</C> landmark named “Main” by default; give a second bar its own <C>aria-label</C>.</>,
    <>The current item has <C>aria-current="page"</C> and is marked by more than color: the pill and a semibold label.</>,
    'The badge count is part of the item’s name: “Inbox, 3 new”.',
    'Items are 68px tall and share the width, so targets stay large at 360px.',
    'Its height is reserved as scroll padding, so a focused field never hides under it.',
  ],
};
