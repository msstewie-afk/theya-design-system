import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { SearchNoResults } from './no-results';
import { DEMO_POPULAR } from './demo-data';

const meta: Meta<typeof SearchNoResults> = {
  title: 'Patterns: Search/NoResults',
  component: SearchNoResults,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { query: 'invoice', popular: DEMO_POPULAR, onSearch: fn(), onScopeChange: fn() },
};
export default meta;
type Story = StoryObj<typeof SearchNoResults>;

export const Default: Story = {};

/** A close spelling exists: offered first. */
export const DidYouMean: Story = {
  args: { query: 'certificat', didYouMean: 'certificates' },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'certificates' }));
    await expect(args.onSearch).toHaveBeenCalledWith('certificates');
  },
};

/** Empty in one scope, hits elsewhere: the way out is the other scopes. */
export const EmptyScope: Story = {
  args: {
    query: 'backup',
    scope: 'domain',
    elsewhere: [
      { type: 'setting', count: 2 },
      { type: 'article', count: 3 },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('No domains match “backup”')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'help articles (3)' }));
    await expect(args.onScopeChange).toHaveBeenCalledWith('article');
    await userEvent.click(canvas.getByRole('button', { name: 'Search everything' }));
    await expect(args.onScopeChange).toHaveBeenLastCalledWith('all');
  },
};
