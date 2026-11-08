import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { SearchNoResults } from './no-results';
import { DEMO_POPULAR } from './demo-data';
import { noResultsGuidelines } from './no-results.guidelines';
import { testOnly } from '../../../lib/test-only';

const meta: Meta<typeof SearchNoResults> = {
  title: 'Patterns: Search/NoResults',
  component: SearchNoResults,
  tags: ['autodocs'],
  parameters: { guidelines: noResultsGuidelines, layout: 'padded' },
  args: { query: 'invoice', popular: DEMO_POPULAR, onSearch: fn(), onScopeChange: fn() },
};
export default meta;
type Story = StoryObj<typeof SearchNoResults>;

/** Nothing matched the query: the message repeats what was searched, then lists tips and a few popular pages to go to instead. */
export const Default: Story = {};

/** A close spelling exists: offered first. */
export const DidYouMean: Story = {
  args: { query: 'portriats', didYouMean: 'portraits' },
  play: testOnly(async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'portraits' }));
    await expect(args.onSearch).toHaveBeenCalledWith('portraits');
  }),
};

/** Empty in one scope, hits elsewhere: the way out is the other scopes. */
export const EmptyScope: Story = {
  args: {
    query: 'moonrise',
    scope: 'client',
    elsewhere: [
      { type: 'gallery', count: 1 },
      { type: 'photo', count: 1 },
      { type: 'license', count: 1 },
    ],
  },
  play: testOnly(async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('No clients match “moonrise”')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'photos (1)' }));
    await expect(args.onScopeChange).toHaveBeenCalledWith('photo');
    await userEvent.click(canvas.getByRole('button', { name: 'Search everything' }));
    await expect(args.onScopeChange).toHaveBeenLastCalledWith('all');
  }),
};
