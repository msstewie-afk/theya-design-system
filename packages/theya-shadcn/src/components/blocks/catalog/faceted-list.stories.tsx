import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen, userEvent, waitFor, within } from '@storybook/test';
import { FacetedList } from './faceted-list';
import { DEMO_ITEMS } from './demo-data';
import { facetedListGuidelines } from './faceted-list.guidelines';

const meta: Meta<typeof FacetedList> = {
  title: 'Patterns: Catalog/FacetedList',
  component: FacetedList,
  tags: ['autodocs'],
  parameters: {
    guidelines: facetedListGuidelines,
    layout: 'padded',
  },
  args: { items: DEMO_ITEMS, getHref: (i) => `#${i.id}` },
};
export default meta;
type Story = StoryObj<typeof FacetedList>;

const count = (el: HTMLElement) => within(el).getByText(/^\d+$/, { selector: 'p[aria-live] > span' }).closest('p')!;

/** Filters in a sidebar; every value shows its count and applies at once; applied filters become chips. */
export const Default: Story = {

  render: (args) => (
    // Wide enough for the sidebar layout regardless of the viewport.
    <div className="md:min-w-[64rem]">
      <FacetedList {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Phone (below md): the filters live in a drawer behind "Filters"; results update
    // while it is open, and closing it returns focus to the button.
    const phone = window.matchMedia('(max-width: 767.98px)').matches;
    if (phone) {
      const c = within(canvasElement);
      await expect(count(canvasElement)).toHaveTextContent('24 extensions');
      const open = c.getByRole('button', { name: 'Filters' });
      await userEvent.click(open);
      const drawer = await screen.findByRole('dialog', { name: 'Filters' });
      await userEvent.click(within(drawer).getByRole('checkbox', { name: 'Security' }));
      await waitFor(() => expect(count(canvasElement)).toHaveTextContent('6 extensions'));
      await userEvent.click(within(drawer).getByRole('checkbox', { name: 'Security' }));
      await waitFor(() => expect(count(canvasElement)).toHaveTextContent('24 extensions'));
      await userEvent.keyboard('{Escape}');
      // vaul keeps the drawer mounted through its exit animation (~500ms).
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 2500 });
      await waitFor(() => expect(open).toHaveFocus(), { timeout: 2500 });
      await userEvent.click(c.getByRole('button', { name: 'Show 9 more' }));
      await expect(c.getByText('Showing 18 of 24')).toBeVisible();
      return;
    }

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

/**
 * Removing a chip moves focus to the next chip, or the previous one when it
 * was the last; when no chips are left ("Clear all", the last chip) focus
 * goes to the section heading instead of <body>.
 */
export const ChipFocus: Story = {
  name: 'Test: chip focus',
  // Drives the sidebar, which is a drawer at phone widths.
  tags: ['desktop-play'],
  render: (args) => (
    <div className="md:min-w-[64rem]">
      <FacetedList {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', { name: 'Extensions' });
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Security' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Backups' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Free' }));
    const applied = canvas.getByRole('group', { name: 'Applied filters' });

    // Middle chip: focus moves to the next chip.
    await userEvent.click(within(applied).getByRole('button', { name: 'Remove filter: Backups' }));
    await waitFor(() => expect(within(applied).getByRole('button', { name: 'Remove filter: Free' })).toHaveFocus());

    // Last chip, by keyboard: focus moves to the previous chip.
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(within(applied).getByRole('button', { name: 'Remove filter: Security' })).toHaveFocus());

    // Only chip: the group goes away, focus lands on the heading.
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.queryByRole('group', { name: 'Applied filters' })).not.toBeInTheDocument());
    await waitFor(() => expect(heading).toHaveFocus());

    // "Clear all" removes the group too.
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Security' }));
    await userEvent.click(within(canvas.getByRole('group', { name: 'Applied filters' })).getByRole('button', { name: 'Clear all' }));
    await waitFor(() => expect(count(canvasElement)).toHaveTextContent('24 extensions'));
    await waitFor(() => expect(heading).toHaveFocus());
  },
};

/** The empty state's "Clear all filters" goes away with the filters; focus goes to the heading. */
export const EmptyStateClearFocus: Story = {
  name: 'Test: empty state clear focus',
  tags: ['desktop-play'],
  render: (args) => (
    <div className="md:min-w-[64rem]">
      <FacetedList {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Both Fjord items are rated under 4.5: nothing matches.
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Fjord' }));
    await userEvent.click(canvas.getByRole('radio', { name: '4.5 ★ & up' }));
    await waitFor(() => expect(count(canvasElement)).toHaveTextContent('0 extensions'));
    await userEvent.click(canvas.getByRole('button', { name: 'Clear all filters' }));
    await waitFor(() => expect(count(canvasElement)).toHaveTextContent('24 extensions'));
    await waitFor(() => expect(canvas.getByRole('heading', { name: 'Extensions' })).toHaveFocus());
  },
};

/** The last "Show N more" goes away; focus moves to the first result it revealed. */
export const ShowMoreFocus: Story = {
  name: 'Test: show more focus',
  render: (args) => (
    <div className="md:min-w-[64rem]">
      <FacetedList {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 24 items, 9 per page: the button stays after the first click (focus stays on it)…
    const more = canvas.getByRole('button', { name: 'Show 9 more' });
    await userEvent.click(more);
    await expect(canvas.getByText('Showing 18 of 24')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Show 6 more' })).toHaveFocus();
    // …and disappears after the second: focus goes to result 19 (Node Toolkit, in relevance order).
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('Showing 24 of 24')).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Show 6 more' })).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.getByRole('link', { name: 'Node Toolkit by Forge' })).toHaveFocus());
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
