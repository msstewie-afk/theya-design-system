import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { Trash, Mail } from 'iconoir-react';
import { toast } from '../ui/sonner';
import { ListView } from './list-view';

const meta: Meta<typeof ListView> = {
  title: 'Patterns/ListView',
  component: ListView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A reusable list/index screen: DataTable + DataTableToolbar wired to search, FilterField-based facets and bulk actions, plus a per-row actions menu.',
      },
    },
  },
  argTypes: {
    columns: { control: false, description: 'TanStack column definitions for the underlying DataTable.', table: { category: 'Content' } },
    data: { control: false, description: 'The rows to render.', table: { category: 'Content' } },
    primaryKey: { control: 'text', description: 'Column id the free-text search box filters on.', table: { category: 'Behavior' } },
    searchPlaceholder: { control: 'text', description: 'Placeholder for the free-text search box.', table: { category: 'Content' } },
    facets: { control: false, description: 'FilterField-based facets shown in the toolbar.', table: { category: 'Content' } },
    bulkActions: { control: false, description: 'Actions shown in the toolbar when rows are selected.', table: { category: 'Content' } },
    rowActions: { control: false, description: 'Per-row actions menu — a static list, or a function of the row.', table: { category: 'Content' } },
    getRowId: { control: false, description: 'Stable identity for a row, used as its selection key.', table: { category: 'Behavior' } },
    getRowLabel: { control: false, description: 'Accessible label for a row, used by selection and link affordances.', table: { category: 'Behavior' } },
    noun: { control: false, description: '{ one, many } noun used in empty/selection copy.', table: { category: 'Content' } },
    loading: { control: 'boolean', description: 'Shows the DataTable skeleton state instead of rows.', table: { category: 'State' } },
    emptyMessage: { control: 'text', description: 'Message shown when there are no rows.', table: { category: 'Content' } },
    ariaLabel: { control: 'text', description: 'Accessible name for the underlying table.', table: { category: 'Content' } },
    getRowHref: { control: false, description: 'Makes each row a link when provided.', table: { category: 'Behavior' } },
  },
};

export default meta;
type Story = StoryObj<typeof ListView>;

const body = () => within(document.body);
const ALL = ['Alex Morgan', 'Jordan Kim', 'Priya Nair', 'Sam Okoro', 'Dana Okafor'];

/** Seeded names currently rendered as rows, in order. */
const visibleNames = (canvasElement: HTMLElement) =>
  // Table rows on desktop, list items once the table stacks on a phone.
  (within(canvasElement).queryAllByRole('row').length ? within(canvasElement).getAllByRole('row') : within(canvasElement).getAllByRole('listitem'))
    .map((row) => ALL.find((n) => row.textContent?.includes(n)))
    .filter(Boolean);

const count = (canvasElement: HTMLElement) => canvasElement.querySelector('[data-slot="data-table-toolbar"] p[aria-live="polite"]') as HTMLElement;

async function clearToasts() {
  toast.dismiss();
  await waitFor(() => expect(document.querySelectorAll('[data-sonner-toast]')).toHaveLength(0), { timeout: 3000 });
}

/** Free-text search and the Status facet narrow the list; the count follows. */
export const Default: Story = {
  render: () => (
    <div className="px-4 py-6 md:px-6">
      <ListView />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(visibleNames(canvasElement)).toEqual(ALL);
    await expect(count(canvasElement)).toHaveTextContent('5 results');

    const input = canvas.getByRole('combobox', { name: 'Search…' });
    await userEvent.type(input, 'pri');
    await waitFor(() => expect(visibleNames(canvasElement)).toEqual(['Priya Nair']));
    await expect(count(canvasElement)).toHaveTextContent('1 result');
    await userEvent.clear(input);
    await waitFor(() => expect(visibleNames(canvasElement)).toEqual(ALL));
    await userEvent.keyboard('{Escape}');

    // Facet: Status = Suspended.
    await userEvent.click(input);
    await userEvent.click(await body().findByRole('option', { name: 'Status' }));
    // Searchable facet: its values replace the attribute list in the same popup.
    await userEvent.click(await body().findByRole('option', { name: /Suspended/ }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(visibleNames(canvasElement)).toEqual(['Sam Okoro']));
    await expect(canvas.getByRole('button', { name: 'Status: Suspended' })).toBeInTheDocument();
  },
};

const onEmail = fn();
const onBulkRemove = fn();
const onView = fn();
const onRemove = fn();
const onUndoRemove = fn();

/** Bulk actions over a selection, and a per-row menu with confirm + undo. */
export const WithBulkAndRowActions: Story = {

  name: 'With bulk and row actions',
  render: () => (
    <div className="px-4 py-6 md:px-6">
      <ListView
        noun={{ one: 'user', many: 'users' }}
        bulkActions={[
          { label: 'Email', icon: <Mail />, onSelect: (rows) => onEmail(rows.map((r) => (r as { name: string }).name)) },
          {
            label: 'Remove',
            icon: <Trash />,
            tone: 'danger',
            confirm: {
              title: (n) => `Remove ${n} ${n === 1 ? 'user' : 'users'}?`,
              confirmLabel: 'Remove',
              onConfirm: (rows) => onBulkRemove(rows.map((r) => (r as { name: string }).name)),
            },
          },
        ]}
        rowActions={[
          { label: 'View profile', onSelect: (row) => onView((row as { name: string }).name) },
          {
            label: 'Remove',
            tone: 'danger',
            separatorBefore: true,
            confirm: {
              title: (row) => `Remove ${(row as { name: string }).name}?`,
              confirmLabel: 'Remove',
              onConfirm: (row) => onRemove((row as { name: string }).name),
              undo: { title: (row) => `${(row as { name: string }).name} removed`, onUndo: (row) => onUndoRemove((row as { name: string }).name) },
            },
          },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Phone (below md): no bulk selection; each person keeps the row menu.
    const phone = window.matchMedia('(max-width: 767.98px)').matches;
    if (phone) {
      const c = within(canvasElement);
      for (const spy of [onEmail, onBulkRemove, onView, onRemove, onUndoRemove]) spy.mockClear();
      await expect(count(canvasElement)).toHaveTextContent('5 users');
      await expect(c.queryAllByRole('checkbox')).toHaveLength(0);
      await userEvent.click(c.getByRole('button', { name: 'Actions for Priya Nair' }));
      await userEvent.click(await body().findByRole('menuitem', { name: 'View profile' }));
      await expect(onView).toHaveBeenCalledWith('Priya Nair');
      return;
    }

    const canvas = within(canvasElement);
    for (const spy of [onEmail, onBulkRemove, onView, onRemove, onUndoRemove]) spy.mockClear();
    await expect(count(canvasElement)).toHaveTextContent('5 users');

    // Row menu: a plain action, then a confirmed one with undo.
    await userEvent.click(canvas.getByRole('button', { name: 'Actions for Priya Nair' }));
    await userEvent.click(await body().findByRole('menuitem', { name: 'View profile' }));
    await expect(onView).toHaveBeenCalledWith('Priya Nair');

    await userEvent.click(canvas.getByRole('button', { name: 'Actions for Sam Okoro' }));
    await userEvent.click(await body().findByRole('menuitem', { name: 'Remove' }));
    const confirm = await body().findByRole('alertdialog', { name: 'Remove Sam Okoro?' });
    await userEvent.click(within(confirm).getByRole('button', { name: 'Remove' }));
    await expect(onRemove).toHaveBeenCalledWith('Sam Okoro');
    const undoToastEl = (await body().findByText('Sam Okoro removed', { selector: '[data-title]' })).closest('[data-sonner-toast]') as HTMLElement;
    await userEvent.click(within(undoToastEl).getByRole('button', { name: 'Undo' }));
    await expect(onUndoRemove).toHaveBeenCalledWith('Sam Okoro');
    await clearToasts();

    // Bulk: select two rows, the bar re-skins, the action gets exactly those rows.
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select Jordan Kim' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select Dana Okafor' }));
    const bar = canvasElement.querySelector('[data-slot="data-table-toolbar"]') as HTMLElement;
    await waitFor(() => expect(bar).toHaveAttribute('data-state', 'selected'));
    await expect(bar).toHaveTextContent('2 selected');
    const bulk = canvas.getByRole('toolbar', { name: 'Bulk actions' });
    await userEvent.click(within(bulk).getByRole('button', { name: 'Email' }));
    await expect(onEmail).toHaveBeenCalledWith(['Jordan Kim', 'Dana Okafor']);
  },
};

export const Loading: Story = {
  render: () => (
    <div className="px-4 py-6 md:px-6">
      <ListView loading />
    </div>
  ),
};
