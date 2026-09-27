import type { Meta, StoryObj } from '@storybook/react';
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
    defaultCollapsed: { control: 'boolean', description: 'Uncontrolled initial collapsed state of the sidebar.', table: { category: 'State' } },
    children: { control: false, description: 'Page content rendered in the main area.', table: { category: 'Content' } },
  },
};

export default meta;
type Story = StoryObj<typeof AppShell>;

export const Default: Story = {
  render: () => (
    <AppShell>
      <div className="px-4 py-6 md:px-6">
        <h2 className="font-body text-heading-s font-semibold text-[var(--color-text-text)]">Dashboard</h2>
        <p className="mt-2 font-body text-body-s text-[var(--color-text-text-subtler)]">Page content goes here.</p>
      </div>
    </AppShell>
  ),
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
