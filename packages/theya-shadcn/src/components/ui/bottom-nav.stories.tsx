import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Bell, Calendar, ChatBubble, HomeSimple, Search, User } from 'iconoir-react';
import { BottomNav, BottomNavItem } from './bottom-nav';
import { bottomNavGuidelines } from './bottom-nav.guidelines';
import { resetFocus, tabTo } from '../../test/keyboard';

/**
 * BottomNav — the tab bar of a phone screen: 3–5 destinations, each an icon
 * with a label. The current one has `aria-current="page"`, a semibold label
 * and a tonal pill; `badge` puts a count or a dot on the icon.
 *
 * Demo frames use `transform`, so `position="fixed"` pins to the frame
 * instead of the Storybook canvas.
 */
const meta = {
  title: 'Navigation/BottomNav',
  component: BottomNav,
  subcomponents: { BottomNavItem },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'The tab bar at the bottom of a phone app: 3–5 top-level destinations, each with an icon and a label.',
      },
    },
    guidelines: bottomNavGuidelines,
    layout: 'centered',
  },
  argTypes: {
    position: { control: 'inline-radio', options: ['fixed', 'sticky'], description: '`fixed` pins it to the viewport; `sticky` to the bottom of its scroll container.' },
    'aria-label': { control: 'text', description: 'Landmark name. Default "Main".' },
    className: { control: false, description: 'Class on the nav element.' },
  },
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A phone-sized frame; `transform` makes it the containing block for `position: fixed`. */
function Phone({ children, dir }: { children: ReactNode; dir?: 'rtl' }) {
  return (
    <div
      dir={dir}
      className="relative h-[480px] w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[var(--size-border-radius-border-radius-3xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface-sunken)] [transform:translateZ(0)]"
    >
      <div className="p-4 font-body text-body-m text-[var(--color-text-text-subtler)]">Screen content</div>
      {children}
    </div>
  );
}

const ITEMS = [
  { id: 'home', label: 'Home', icon: <HomeSimple /> },
  { id: 'search', label: 'Search', icon: <Search /> },
  { id: 'inbox', label: 'Inbox', icon: <ChatBubble />, badge: 3 },
  { id: 'profile', label: 'Profile', icon: <User /> },
];

function Demo({ items = ITEMS, dir }: { items?: typeof ITEMS; dir?: 'rtl' }) {
  const [current, setCurrent] = useState(items[0].id);
  return (
    <Phone dir={dir}>
      <BottomNav>
        {items.map((it) => (
          <BottomNavItem
            key={it.id}
            icon={it.icon}
            label={it.label}
            badge={it.badge}
            active={current === it.id}
            onClick={() => setCurrent(it.id)}
          />
        ))}
      </BottomNav>
    </Phone>
  );
}

/**
 * Four destinations, the first current. Click an item to move the current
 * marker; Inbox carries a count, folded into its name ("Inbox, 3 new").
 */
export const Default: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'Main' });
    await expect(nav).toBeInTheDocument();
    const home = canvas.getByRole('button', { name: 'Home' });
    await expect(home).toHaveAttribute('aria-current', 'page');
    const inbox = canvas.getByRole('button', { name: /^Inbox\s*, 3 new$/ });
    await expect(inbox).not.toHaveAttribute('aria-current');

    // Keyboard: Tab reaches the items in order, Enter activates.
    resetFocus();
    await tabTo(home);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Search' })).toHaveFocus();
    await userEvent.tab();
    await expect(inbox).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(inbox).toHaveAttribute('aria-current', 'page');
    await expect(home).not.toHaveAttribute('aria-current');
  },
};

/**
 * Links: with `href` each item is an `<a>`. For a router link pass it with
 * `asChild` — Theya adds the icon, label and badge inside it.
 */
export const Links: Story = {
  render: () => (
    <Phone>
      <BottomNav>
        <BottomNavItem href="#home" icon={<HomeSimple />} label="Home" />
        <BottomNavItem href="#calendar" icon={<Calendar />} label="Plan" active />
        <BottomNavItem asChild icon={<Bell />} label="Alerts" badge>
          <a href="#alerts" />
        </BottomNavItem>
      </BottomNav>
    </Phone>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Plan' })).toHaveAttribute('aria-current', 'page');
    const alerts = canvas.getByRole('link', { name: /^Alerts\s*, new$/ });
    await expect(alerts).toHaveAttribute('href', '#alerts');
  },
};

/**
 * Five items — the most a bar holds; labels stay one line and truncate if a
 * translation runs long. A count over 99 shows "99+", the name keeps the number.
 */
export const FiveItems: Story = {
  render: () => (
    <Demo
      items={[
        { id: 'home', label: 'Home', icon: <HomeSimple /> },
        { id: 'plan', label: 'Meal plan', icon: <Calendar /> },
        { id: 'search', label: 'Search', icon: <Search /> },
        { id: 'inbox', label: 'Messages', icon: <ChatBubble />, badge: 128 },
        { id: 'profile', label: 'Profile', icon: <User /> },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('listitem')).toHaveLength(5);
    await expect(canvas.getByRole('button', { name: /^Messages\s*, 128 new$/ })).toBeInTheDocument();
    await expect(canvas.getByText('99+')).toBeInTheDocument();
  },
};

/** Right-to-left: the order of the items mirrors; the badge stays on the right of the icon. */
export const RightToLeft: Story = {
  render: () => <Demo dir="rtl" />,
};
