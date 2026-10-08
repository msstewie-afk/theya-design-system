import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { Checkout } from './checkout';

const meta: Meta<typeof Checkout> = {
  title: 'Patterns: Commerce/Checkout',
  component: Checkout,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { onExit: fn(), onComplete: fn(), chargeDelay: 300 },
};
export default meta;
type Story = StoryObj<typeof Checkout>;

/** Options → Payment → Review → done. The summary follows every choice; completed steps link back. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const total = () => within(canvasElement).getByText('Total').closest('div')!;
    // Pro yearly 288 + domain 14 = 302, +20% = 362.40
    await expect(total()).toHaveTextContent('$362.40');
    await userEvent.click(canvas.getByRole('radio', { name: 'Daily' }));
    await waitFor(() => expect(total()).toHaveTextContent('$420')); // + 48 backups

    await userEvent.click(canvas.getByRole('button', { name: 'Continue to payment' }));
    await userEvent.type(canvas.getByRole('textbox', { name: /^Name on card/ }), 'Dana Ivanova');
    await userEvent.type(canvas.getByRole('textbox', { name: /^Card number/ }), '4242424242424242');
    await userEvent.type(canvas.getByRole('textbox', { name: /^Expiry date/ }), '0829');
    await userEvent.type(canvas.getByRole('textbox', { name: /^Security code/ }), '123');
    await userEvent.click(canvas.getByRole('button', { name: 'Review order' }));

    await expect(await canvas.findByText('Visa ending 4242')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Edit options' }));
    await expect(canvas.getByRole('radio', { name: 'Daily' })).toBeChecked();
    // Back through the steps: what was entered is still there.
    await userEvent.click(canvas.getByRole('button', { name: 'Continue to payment' }));
    await expect(canvas.getByRole('textbox', { name: /^Card number/ })).toHaveValue('4242 4242 4242 4242');
    await userEvent.click(canvas.getByRole('button', { name: 'Review order' }));

    await userEvent.click(await canvas.findByRole('button', { name: 'Pay $420' }));
    await expect(await canvas.findByRole('heading', { name: "You're all set" })).toBeVisible();
    await expect(args.onComplete).toHaveBeenCalledTimes(1);
  },
};
