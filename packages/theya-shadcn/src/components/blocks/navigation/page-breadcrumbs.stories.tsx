import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen, userEvent, within } from '@storybook/test';
import { PageBreadcrumbs } from './page-breadcrumbs';

const meta: Meta<typeof PageBreadcrumbs> = {
  title: 'Patterns: Navigation/PageBreadcrumbs',
  component: PageBreadcrumbs,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    path: [
      { label: 'Home', href: '#home' },
      { label: 'Domains', href: '#domains' },
      { label: 'seashell.shop', href: '#seashell' },
    ],
    current: 'DNS records',
  },
};
export default meta;
type Story = StoryObj<typeof PageBreadcrumbs>;

/** The hierarchy, the same however you got here. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Domains' })).toHaveAttribute('href', '#domains');
    await expect(canvas.getByText('DNS records')).toHaveAttribute('aria-current', 'page');
  },
};

/** Came from a search: the way back keeps the query, the breadcrumb stays the hierarchy. */
export const FromSearch: Story = {
  args: { back: { label: 'Back to results for “dns”', href: '#search?q=dns' } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: 'Back to results for “dns”' })).toHaveAttribute('href', '#search?q=dns');
  },
};

/** A deep path folds the middle into a menu; first and last two stay. */
export const Deep: Story = {
  args: {
    path: [
      { label: 'Home', href: '#home' },
      { label: 'Subscriptions', href: '#subs' },
      { label: 'Seashell', href: '#seashell-sub' },
      { label: 'Domains', href: '#domains' },
      { label: 'seashell.shop', href: '#seashell' },
      { label: 'Mail', href: '#mail' },
    ],
    current: 'Spam filter',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show 3 more levels' }));
    const menu = await screen.findByRole('menu');
    await expect(within(menu).getByRole('menuitem', { name: 'Subscriptions' })).toHaveAttribute('href', '#subs');
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByRole('link', { name: 'Mail' })).toBeVisible();
  },
};
