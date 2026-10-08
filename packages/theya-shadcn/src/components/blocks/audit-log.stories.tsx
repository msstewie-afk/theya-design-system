import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { AuditLog } from './audit-log';

const meta: Meta<typeof AuditLog> = {
  title: 'Patterns/AuditLog',
  component: AuditLog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    title: { control: 'text', description: 'Section heading.', table: { category: 'Content' } },
    description: { control: 'text', description: 'Supporting copy under the title.', table: { category: 'Content' } },
    events: { control: false, description: 'The events, newest first. Defaults to a seeded feed.', table: { category: 'Content' } },
    categories: { control: false, description: 'Category facet options for the filter.', table: { category: 'Content' } },
    loading: { control: 'boolean', description: 'Shows a loading skeleton instead of the event list.', table: { category: 'State' } },
    searchPlaceholder: { control: 'text', description: 'Placeholder for the search input.', table: { category: 'Content' } },
  },
};

export default meta;
type Story = StoryObj<typeof AuditLog>;

const body = () => within(document.body);

/** Event actions in table order. */
const actions = (canvasElement: HTMLElement) =>
  within(canvasElement)
    .getAllByRole('row')
    .slice(1)
    .map((row) => row.querySelector('.font-medium')?.textContent);

const status = (canvasElement: HTMLElement) => canvasElement.querySelector('p[aria-live="polite"]') as HTMLElement;

/** Search, category facet and date range narrow the feed together; clearing returns focus to search. */
export const Default: Story = {
  render: () => (
    <div className="p-6">
      <AuditLog />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole('searchbox', { name: 'Search events by actor, action or target' });
    await expect(actions(canvasElement)).toHaveLength(8);
    await expect(status(canvasElement)).toHaveTextContent('8 events');

    // Search matches actor, action, target and category label.
    await userEvent.type(search, 'alex');
    await waitFor(() => expect(actions(canvasElement)).toEqual(['Signed in', 'Updated payment method', 'Revoked API key', 'Updated account settings']));
    await expect(status(canvasElement)).toHaveTextContent('4 events match your filters');

    // + category facet: only Security.
    const category = canvas.getByRole('combobox', { name: 'Filter by category' });
    await userEvent.click(category);
    await userEvent.type(category, 'secu');
    await userEvent.keyboard('{Enter}{Escape}');
    await waitFor(() => expect(actions(canvasElement)).toEqual(['Revoked API key']));
    await expect(status(canvasElement)).toHaveTextContent('1 event matches your filters');

    // Clearing from the toolbar: the button disappears, focus goes to search.
    await userEvent.click(canvas.getByRole('button', { name: 'Clear filters' }));
    await waitFor(() => expect(actions(canvasElement)).toHaveLength(8));
    await expect(search).toHaveValue('');
    await expect(canvas.queryByRole('button', { name: 'Remove Security' })).toBeNull();
    await expect(search).toHaveFocus();

    // No matches: the filtered empty state offers its own clear.
    await userEvent.type(search, 'zzz');
    await expect(await canvas.findByRole('heading', { name: 'No events match your filters' })).toBeInTheDocument();
    await expect(status(canvasElement)).toHaveTextContent('0 events match your filters');
    const clears = canvas.getAllByRole('button', { name: 'Clear filters' });
    await userEvent.click(clears[clears.length - 1]);
    await waitFor(() => expect(actions(canvasElement)).toHaveLength(8));
    await expect(search).toHaveFocus();

    // Date range Jul 13–14 (events are stored and shown in UTC).
    await userEvent.click(canvas.getByRole('button', { name: 'Filter by date range' }));
    await body().findAllByRole('grid');
    for (let i = 0; i < 36 && !body().queryByRole('grid', { name: 'July 2026' }); i++) {
      await userEvent.click(body().getByRole('button', { name: /previous month/i }));
    }
    const july = body().getByRole('grid', { name: 'July 2026' });
    await userEvent.click(within(july).getByRole('button', { name: /July 13th/ }));
    await userEvent.click(within(july).getByRole('button', { name: /July 14th/ }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(actions(canvasElement)).toEqual(['Signed in', 'Deployed site', 'Changed member role', 'Updated payment method', 'Revoked API key']));
    await expect(status(canvasElement)).toHaveTextContent('5 events match your filters');
  },
};

export const Loading: Story = {
  render: () => (
    <div className="p-6">
      <AuditLog loading />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('tbody')).toHaveAttribute('aria-busy', 'true');
    await expect(status(canvasElement)).toHaveTextContent('Loading events…');
  },
};

/** Zero events: the "nothing yet" state, not the "no matches" one, and no clear button. */
export const Empty: Story = {
  render: () => (
    <div className="p-6">
      <AuditLog events={[]} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'No activity yet' })).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Clear filters' })).toBeNull();
    // No categories present -> no category facet.
    await expect(canvas.queryByRole('combobox', { name: 'Filter by category' })).toBeNull();
    await expect(status(canvasElement)).toHaveTextContent('0 events');
  },
};
