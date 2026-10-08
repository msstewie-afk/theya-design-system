import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { SavedItems } from './saved-items';
import { DEMO_SAVED } from './demo-data';

const meta: Meta<typeof SavedItems> = {
  title: 'Patterns: Account/SavedItems',
  component: SavedItems,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { items: DEMO_SAVED, primaryAction: { label: 'Add to cart', onAction: fn() }, onRemove: fn() },
  decorators: [(Story) => <div className="max-w-3xl">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof SavedItems>;

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

    await userEvent.click(canvas.getByRole('button', { name: 'Remove NVMe storage add-on' }));
    await expect(canvas.queryByRole('link', { name: 'NVMe storage add-on' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('heading', { name: 'Saved (3)' })).toBeVisible();
  },
};

export const Empty: Story = {
  args: { items: [] },
};
