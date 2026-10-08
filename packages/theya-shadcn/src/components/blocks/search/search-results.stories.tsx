import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { SearchResults } from './search-results';
import { DEMO_INDEX, DEMO_POPULAR } from './demo-data';

const meta: Meta<typeof SearchResults> = {
  title: 'Patterns: Search/SearchResults',
  component: SearchResults,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { index: DEMO_INDEX, popular: DEMO_POPULAR, onSearch: fn() },
  decorators: [(Story) => <div className="max-w-4xl">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof SearchResults>;

/** Grouped by type with counts; "View all" narrows to one type; the query stays in the field. */
export const Default: Story = {
  args: { defaultQuery: 'seashell', groupSize: 2 },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('results for “seashell”');
    await expect(canvas.getByRole('searchbox', { name: 'Search' })).toHaveValue('seashell');
    await expect(canvas.getByRole('heading', { name: 'Domains' })).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'View all 3 domains' }));
    await expect(canvas.getByRole('tab', { name: 'Domains 3' })).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('link', { name: /seashell-blog\.com/ })).toBeVisible();

    const field = canvas.getByRole('searchbox', { name: 'Search' });
    await userEvent.clear(field);
    await userEvent.type(field, 'env{Enter}');
    await expect(args.onSearch).toHaveBeenCalledWith('env');
    await waitFor(() => expect(canvas.getByRole('heading', { level: 1 })).toHaveFocus());
  },
};

/** An obvious typo is corrected, with a notice and a way to search the original. */
export const Corrected: Story = {
  args: { defaultQuery: 'bakup' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('for “backup”');
    await userEvent.click(canvas.getByRole('button', { name: 'Search only for “bakup”' }));
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('No results for “bakup”');
    await userEvent.click(canvas.getByRole('button', { name: 'backup' }));
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('for “backup”');
  },
};

/** Nothing matches and nothing is close: tips and popular pages instead of a blank page. */
export const NoResults: Story = {
  args: { defaultQuery: 'invoice' },
};
