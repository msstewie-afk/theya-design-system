import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { AppShell } from './app-shell';

const meta: Meta<typeof AppShell> = {
  title: 'Patterns/AppShell',
  component: AppShell,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    brand: { control: 'text', description: 'Product/workspace name shown in the sidebar header.', table: { category: 'Content' } },
    nav: { control: false, description: 'Sidebar nav groups.', table: { category: 'Content' } },
    breadcrumbs: { control: false, description: 'Topbar breadcrumb trail; the last crumb is the current page.', table: { category: 'Content' } },
    showBreadcrumbs: { control: 'boolean', description: 'Shows the breadcrumb trail in the topbar.', table: { category: 'Appearance' } },
    actions: { control: false, description: 'Extra topbar actions rendered before Notifications/Help/theme controls.', table: { category: 'Content' } },
    user: { control: false, description: 'Current user, shown in the topbar account menu.', table: { category: 'Content' } },
    searchPlaceholder: { control: 'text', description: 'Placeholder for the topbar search input.', table: { category: 'Content' } },
    onSearch: { control: false, description: 'Wire the topbar search to a command palette (⌘K).', table: { category: 'Events' } },
    onOpenNotifications: { control: false, description: 'Shows the Notifications button and fires when it is pressed.', table: { category: 'Events' } },
    unreadNotifications: { control: 'boolean', description: 'Red dot + "unread" in the button name. Default false.', table: { category: 'State' } },
    onOpenHelp: { control: false, description: 'Shows the Help button and fires when it is pressed.', table: { category: 'Events' } },
    defaultCollapsed: { control: 'boolean', description: 'Uncontrolled initial collapsed state of the sidebar.', table: { category: 'State' } },
    children: { control: false, description: 'Page content rendered in the main area.', table: { category: 'Content' } },
  },
};

export default meta;
type Story = StoryObj<typeof AppShell>;

/** Skip link, nav selection, collapse/expand, and the topbar actions. */
export const Default: Story = {
  args: { onSearch: fn(), onOpenNotifications: fn(), onOpenHelp: fn(), unreadNotifications: true },
  render: (args) => (
    <AppShell onSearch={args.onSearch} onOpenNotifications={args.onOpenNotifications} onOpenHelp={args.onOpenHelp} unreadNotifications={args.unreadNotifications}>
      <div className="px-4 py-6 md:px-6">
        <h2 className="font-body text-heading-s font-semibold text-[var(--color-text-text)]">Dashboard</h2>
        <p className="mt-2 font-body text-body-s text-[var(--color-text-text-subtler)]">Page content goes here.</p>
      </div>
    </AppShell>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Skip link: first Tab stop, jumps focus into <main>.
    await userEvent.tab();
    const skip = canvas.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByRole('main')).toHaveFocus());

    // Nav: one current page at a time.
    const nav = within(canvas.getByRole('navigation', { name: /./ }));
    await expect(nav.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(nav.getByRole('link', { name: 'Databases' }));
    await expect(nav.getByRole('link', { name: 'Databases' })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current');

    // Collapse and expand; focus stays on the toggle.
    await userEvent.click(canvas.getByRole('button', { name: 'Collapse sidebar' }));
    const expand = await canvas.findByRole('button', { name: 'Expand sidebar' });
    await waitFor(() => expect(expand).toHaveFocus());
    await userEvent.click(expand);
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Collapse sidebar' })).toHaveFocus());

    // Topbar actions are wired; "unread" follows the prop.
    await userEvent.click(canvas.getByRole('button', { name: 'Notifications, unread' }));
    await expect(args.onOpenNotifications).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', { name: 'Help' }));
    await expect(args.onOpenHelp).toHaveBeenCalledTimes(1);
  },
};

/** No handlers: no dead Notifications/Help buttons; with a handler and no unread, no "unread" claim. */
export const MinimalTopbar: Story = {
  render: () => (
    <AppShell>
      <div className="px-4 py-6 md:px-6">
        <p className="font-body text-body-s">Content.</p>
      </div>
    </AppShell>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: /^Notifications/ })).toBeNull();
    await expect(canvas.queryByRole('button', { name: 'Help' })).toBeNull();
  },
};

export const Collapsed: Story = {
  render: () => (
    <AppShell defaultCollapsed>
      <div className="px-4 py-6 md:px-6">
        <h2 className="font-body text-heading-s font-semibold text-[var(--color-text-text)]">Dashboard</h2>
        <p className="mt-2 font-body text-body-s text-[var(--color-text-text-subtler)]">Page content goes here.</p>
      </div>
    </AppShell>
  ),
};
