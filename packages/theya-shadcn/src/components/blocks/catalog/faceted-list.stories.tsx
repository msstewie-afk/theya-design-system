import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen, userEvent, waitFor, within } from '@storybook/test';
import { FacetedList } from './faceted-list';
import { DEMO_ITEMS } from './demo-data';

const meta: Meta<typeof FacetedList> = {
  title: 'Patterns: Catalog/FacetedList',
  component: FacetedList,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { items: DEMO_ITEMS, getHref: (i) => `#${i.id}` },
};
export default meta;
type Story = StoryObj<typeof FacetedList>;

const count = (el: HTMLElement) => within(el).getByText(/^\d+$/, { selector: 'p[aria-live] > span' }).closest('p')!;

/** Filters in a sidebar; every value shows its count and applies at once; applied filters become chips. */
export const Default: Story = {
  render: (args) => (
    // Wide enough for the sidebar layout regardless of the viewport.
    <div className="min-w-[64rem]">
      <FacetedList {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(count(canvasElement)).toHaveTextContent('24 extensions');

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Security' }));
    await waitFor(() => expect(count(canvasElement)).toHaveTextContent('6 extensions'));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Free' }));
    await waitFor(() => expect(count(canvasElement)).toHaveTextContent('4 extensions'));

    const applied = canvas.getByRole('group', { name: 'Applied filters' });
    await userEvent.click(within(applied).getByRole('button', { name: 'Remove filter: Free' }));
    await waitFor(() => expect(count(canvasElement)).toHaveTextContent('6 extensions'));
    await userEvent.click(within(applied).getByRole('button', { name: 'Clear all' }));
    await waitFor(() => expect(count(canvasElement)).toHaveTextContent('24 extensions'));

    await userEvent.click(canvas.getByRole('button', { name: 'Show 9 more' }));
    await expect(canvas.getByText('Showing 18 of 24')).toBeVisible();
  },
};

/** Narrow: filters move into a drawer whose footer says how many results you'll get. */
export const Narrow: Story = {
  render: (args) => (
    <div className="max-w-xl">
      <FacetedList {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Filters' }));
    const drawer = await screen.findByRole('dialog', { name: 'Filters' });
    await userEvent.click(within(drawer).getByRole('checkbox', { name: 'Backups' }));
    await userEvent.click(within(drawer).getByRole('button', { name: 'Show 4 extensions' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByRole('button', { name: 'Filters (1)' })).toBeVisible();
  },
};

/** Nothing matches: say so and offer the way out. */
export const NoResults: Story = {
  args: { items: [] },
};
