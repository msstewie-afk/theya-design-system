import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen, userEvent, within } from '@storybook/test';
import { PageBreadcrumbs } from './page-breadcrumbs';
import { pageBreadcrumbsGuidelines } from './page-breadcrumbs.guidelines';
import { testOnly } from '../../../lib/test-only';

const meta: Meta<typeof PageBreadcrumbs> = {
  title: 'Patterns: Navigation/PageBreadcrumbs',
  component: PageBreadcrumbs,
  tags: ['autodocs'],
  parameters: {
    guidelines: pageBreadcrumbsGuidelines,
    layout: 'padded',
  },
  args: {
    path: [
      { label: 'Home', href: '#home' },
      { label: 'Galleries', href: '#galleries' },
      { label: 'Selene Weddings', href: '#selene' },
    ],
    current: 'Golden hour',
  },
};
export default meta;
type Story = StoryObj<typeof PageBreadcrumbs>;

/** The hierarchy, the same however you got here. */
export const Default: Story = {

  play: async ({ canvasElement }) => {
    // Phone (below md): only a back link to the parent level.
    const phone = window.matchMedia('(max-width: 767.98px)').matches;
    if (phone) {
      const c = within(canvasElement);
      await expect(c.getByRole('link', { name: 'Selene Weddings' })).toHaveAttribute('href', '#selene');
      await expect(c.queryByRole('link', { name: 'Galleries' })).toBeNull();
      return;
    }

    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Galleries' })).toHaveAttribute('href', '#galleries');
    await expect(canvas.getByText('Golden hour')).toHaveAttribute('aria-current', 'page');
  },
};

/** Came from a search: the way back keeps the query, the breadcrumb stays the hierarchy. */
export const FromSearch: Story = {
  args: { back: { label: 'Back to results for “golden”', href: '#search?q=golden' } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: 'Back to results for “golden”' })).toHaveAttribute('href', '#search?q=golden');
  },
};

/** A deep path folds the middle into a menu; first and last two stay. */
export const Deep: Story = {

  args: {
    path: [
      { label: 'Home', href: '#home' },
      { label: 'Studios', href: '#studios' },
      { label: 'Selene Weddings', href: '#selene' },
      { label: 'Galleries', href: '#galleries' },
      { label: 'Golden hour', href: '#golden-hour' },
      { label: 'Client portal', href: '#portal' },
    ],
    current: 'Download settings',
  },
  play: testOnly(async ({ canvasElement }) => {
    // Phone (below md): only a back link to the parent level, however deep the path.
    const phone = window.matchMedia('(max-width: 767.98px)').matches;
    if (phone) {
      const c = within(canvasElement);
      await expect(c.getByRole('link', { name: 'Client portal' })).toHaveAttribute('href', '#portal');
      await expect(c.queryByRole('button', { name: /Show \d+ more levels/ })).toBeNull();
      return;
    }

    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show 3 more levels' }));
    const menu = await screen.findByRole('menu');
    await expect(within(menu).getByRole('menuitem', { name: 'Studios' })).toHaveAttribute('href', '#studios');
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByRole('link', { name: 'Client portal' })).toBeVisible();
  }),
};
