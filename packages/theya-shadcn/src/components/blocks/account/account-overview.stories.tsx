import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { AccountOverview } from './account-overview';
import { DEMO_AREAS, DEMO_ATTENTION, DEMO_USER } from './demo-data';

const meta: Meta<typeof AccountOverview> = {
  title: 'Patterns: Account/AccountOverview',
  component: AccountOverview,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { user: DEMO_USER, attention: DEMO_ATTENTION, areas: DEMO_AREAS },
  decorators: [(Story) => <div className="max-w-6xl">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof AccountOverview>;

/** What needs action first, then every area with its current state and its tasks by name. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Needs your attention (2)' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Update card' })).toHaveAttribute('href', '#billing/cards');
    await expect(canvas.getByRole('heading', { name: 'Sign-in and security' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Change password' })).toHaveAttribute('href', '#security/password');
  },
};

export const NothingToDo: Story = {
  args: { attention: [] },
};
