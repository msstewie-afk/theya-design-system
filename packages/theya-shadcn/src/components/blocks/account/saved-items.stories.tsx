import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { SavedItems } from './saved-items';
import { toast } from '../../ui/sonner';
import { DEMO_SAVED } from './demo-data';
import { savedItemsGuidelines } from './saved-items.guidelines';

const meta: Meta<typeof SavedItems> = {
  title: 'Patterns: Account/SavedItems',
  component: SavedItems,
  tags: ['autodocs'],
  parameters: { guidelines: savedItemsGuidelines, layout: 'padded' },
  args: { items: DEMO_SAVED, primaryAction: { label: 'Add to cart', onAction: fn() }, onRemove: fn() },
  decorators: [(Story) => <div className="max-w-3xl">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof SavedItems>;

const body = () => within(document.body);

/** Dismiss every toast and wait until none are left (keeps stories isolated). */
async function clearToasts() {
  toast.dismiss();
  await waitFor(() => expect(document.querySelectorAll('[data-sonner-toast]')).toHaveLength(0), { timeout: 3000 });
}

/** Changes since saving are on the item; bulk actions skip what can't be bought; removing is undoable. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Price dropped from $89')).toBeVisible();
    await expect(canvas.getByText('No longer available')).toBeVisible();

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select all' }));
    // The unavailable item is selected but not sent to the cart.
    await userEvent.click(canvas.getByRole('button', { name: 'Add to cart (3)' }));
    await expect(args.primaryAction!.onAction).toHaveBeenCalledWith(expect.not.arrayContaining(['s3']));

    // A row's Remove goes with its row: focus moves to the Remove button
    // of the row that takes its place (WCAG 2.4.3)...
    await userEvent.click(canvas.getByRole('button', { name: 'Remove NVMe storage add-on' }));
    await expect(canvas.queryByRole('link', { name: 'NVMe storage add-on' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('heading', { name: 'Saved (3)' })).toBeVisible();
    await waitFor(() => expect(document.activeElement).toBe(canvas.getByRole('button', { name: 'Remove Dedicated server' })));

    // ...or of the row above, when the last row goes.
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Firewall appliance (2025)' }));
    await expect(canvas.getByRole('heading', { name: 'Saved (2)' })).toBeVisible();
    await waitFor(() => expect(document.activeElement).toBe(canvas.getByRole('button', { name: 'Remove Dedicated server' })));
    await clearToasts();
  },
};

/** Removing the only item (or every item at once) leaves the empty state, which takes focus; undo puts focus back on the restored row. */
export const LastItem: Story = {
  args: { items: DEMO_SAVED.slice(0, 1) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Dedicated server' }));
    await expect(canvas.getByText('Nothing saved yet')).toBeVisible();
    await waitFor(() => expect(document.activeElement).toBe(canvasElement.querySelector('[data-slot="empty-state"]')));

    const removed = (await body().findByText('Removed “Dedicated server”', { selector: '[data-title]' })).closest('[data-sonner-toast]') as HTMLElement;
    await userEvent.click(within(removed).getByRole('button', { name: 'Undo' }));
    await waitFor(() => expect(document.activeElement).toBe(canvas.getByRole('button', { name: 'Remove Dedicated server' })));

    // Bulk Remove of everything: same landing.
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select all' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Remove (1)' }));
    await waitFor(() => expect(document.activeElement).toBe(canvasElement.querySelector('[data-slot="empty-state"]')));
    await clearToasts();
  },
};

/** Nothing saved: an empty state explains what saving is for and links to the catalog. */
export const Empty: Story = {
  args: { items: [] },
};
