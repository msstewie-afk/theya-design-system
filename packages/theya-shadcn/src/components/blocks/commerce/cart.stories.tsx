import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { Cart } from './cart';
import { DEMO_CART, DEMO_SAVED } from './demo-data';

const meta: Meta<typeof Cart> = {
  title: 'Patterns: Commerce/Cart',
  component: Cart,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { lines: DEMO_CART, saved: DEMO_SAVED, taxRate: 0.2, taxLabel: 'VAT (20%)', onCheckout: fn(), onBrowse: fn() },
};
export default meta;
type Story = StoryObj<typeof Cart>;

const total = (el: HTMLElement) => within(el).getByText('Total').closest('div')!;

/** Quantity updates the total at once; Save for later parks a line; the promo code waits behind a link. */
export const Default: Story = {
  render: (args) => (
    <div className="max-w-5xl">
      <Cart {...args} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // 288 + 14 + 2 × 36 = 374, +20% = 448.80
    await expect(total(canvasElement)).toHaveTextContent('$448.80');
    await userEvent.click(canvas.getByRole('button', { name: 'More Dedicated IPv4 address' }));
    await waitFor(() => expect(total(canvasElement)).toHaveTextContent('$492'));

    await userEvent.click(canvas.getByRole('button', { name: 'Save seashell.shop for later' }));
    await expect(canvas.getByRole('button', { name: 'Move seashell.shop to cart' })).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Have a promo code?' }));
    const code = canvas.getByRole('textbox', { name: 'Promo code' });
    await waitFor(() => expect(code).toHaveFocus());
    await userEvent.type(code, 'NOPE{Enter}');
    await expect(code).toHaveAccessibleDescription(/isn't a valid code/);
    await userEvent.clear(code);
    await userEvent.type(code, 'welcome10{Enter}');
    await expect(canvas.getByText('WELCOME10')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Continue to checkout' }));
    await expect(args.onCheckout).toHaveBeenCalledTimes(1);
  },
};

export const Empty: Story = {
  args: { lines: [], saved: [] },
};
