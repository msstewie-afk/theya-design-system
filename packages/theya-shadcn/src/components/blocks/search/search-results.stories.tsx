import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { SearchResults } from './search-results';
import { DEMO_INDEX, DEMO_POPULAR } from './demo-data';
import { searchResultsGuidelines } from './search-results.guidelines';

const meta: Meta<typeof SearchResults> = {
  title: 'Patterns: Search/SearchResults',
  component: SearchResults,
  tags: ['autodocs'],
  parameters: { guidelines: searchResultsGuidelines, layout: 'padded' },
  args: { index: DEMO_INDEX, popular: DEMO_POPULAR, onSearch: fn() },
  decorators: [(Story) => <div className="max-w-4xl">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof SearchResults>;

/** Grouped by type with counts; "View all" narrows to one type; the query stays in the field. */
export const Default: Story = {
  args: { defaultQuery: 'selene', groupSize: 2 },
};

/** Interaction test for Default, kept out of Default so it opens untouched. */
export const TestInteractions: Story = {
  ...Default,
  name: 'Test: interactions',
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('results for “selene”');
    await expect(canvas.getByRole('searchbox', { name: 'Search' })).toHaveValue('selene');
    await expect(canvas.getByRole('heading', { name: 'Galleries' })).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'View all 3 galleries' }));
    await expect(canvas.getByRole('tab', { name: 'Galleries 3' })).toHaveAttribute('aria-selected', 'true');
    // "View all" goes with the "All" view: focus moves to the new view's
    // panel, named after its tab (WCAG 2.4.3).
    await waitFor(() => expect(document.activeElement).toBe(canvas.getByRole('tabpanel', { name: 'Galleries 3' })));
    await expect(canvas.getByRole('link', { name: /Wide-shining/ })).toBeVisible();

    const field = canvas.getByRole('searchbox', { name: 'Search' });
    await userEvent.clear(field);
    await userEvent.type(field, 'proof{Enter}');
    await expect(args.onSearch).toHaveBeenCalledWith('proof');
    await waitFor(() => expect(canvas.getByRole('heading', { level: 1 })).toHaveFocus());
  },
};

/** One type: a flat list with "Show more"; when the last page is shown, focus moves to the first result it revealed. */
export const OneType: Story = {
  args: { defaultQuery: 'selene', defaultScope: 'gallery', pageSize: 2 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('tab', { name: 'Galleries 3' })).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByText('Showing 2 of 3')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Show 1 more' }));
    await expect(canvas.queryByRole('button', { name: 'Show 1 more' })).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(canvas.getByRole('link', { name: /Wide-shining/ })));
  },
};

/** An obvious typo is corrected, with a notice and a way to search the original. */
export const Corrected: Story = {
  args: { defaultQuery: 'archve' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('for “archive”');
    await userEvent.click(canvas.getByRole('button', { name: 'Search only for “archve”' }));
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('No results for “archve”');
    await userEvent.click(canvas.getByRole('button', { name: 'archive' }));
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('for “archive”');
  },
};

/** Nothing matches and nothing is close: tips and popular pages instead of a blank page. */
export const NoResults: Story = {
  args: { defaultQuery: 'invoice' },
};
