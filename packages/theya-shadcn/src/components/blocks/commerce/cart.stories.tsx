import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { Cart } from './cart';
import { DEMO_CART, DEMO_SAVED } from './demo-data';
import { cartGuidelines } from './cart.guidelines';

const meta: Meta<typeof Cart> = {
  title: 'Patterns: Commerce/Cart',
  component: Cart,
  tags: ['autodocs'],
  parameters: { guidelines: cartGuidelines, layout: 'padded' },
  args: { lines: DEMO_CART, saved: DEMO_SAVED, taxRate: 0.2, taxLabel: 'VAT (20%)', onCheckout: fn(), onBrowse: fn() },
};
export default meta;
type Story = StoryObj<typeof Cart>;

const total = (el: HTMLElement) => within(el).getByText('Total').closest('div')!;
const promoStatus = (el: HTMLElement) => el.querySelector<HTMLElement>('[data-slot="cart-promo-status"]')!;

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
    // The status region is mounted (and empty) before the code is applied,
    // so the message is a change a screen reader announces.
    const status = promoStatus(canvasElement);
    await expect(status).toHaveAttribute('role', 'status');
    await expect(status).toHaveTextContent(/^$/);
    await userEvent.type(code, 'welcome10{Enter}');
    await expect(canvas.getByText('WELCOME10')).toBeVisible();
    await waitFor(() => expect(status).toHaveTextContent('Code WELCOME10 applied'));
    // The field and Apply button are gone: focus moves to the control in their place.
    const removeCode = canvas.getByRole('button', { name: 'Remove code' });
    await waitFor(() => expect(removeCode).toHaveFocus());
    await userEvent.click(removeCode);
    await waitFor(() => expect(status).toHaveTextContent('Code WELCOME10 removed'));
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Have a promo code?' })).toHaveFocus());

    await userEvent.click(canvas.getByRole('button', { name: 'Continue to checkout' }));
    await expect(args.onCheckout).toHaveBeenCalledTimes(1);
  },
};

/**
 * Focus never drops to <body> when a row leaves a list: it moves to the same
 * control on the next row, else the previous one, else the cart heading —
 * and to the empty state once the cart is empty. The undo toast still shows.
 */
export const RemoveKeepsFocus: Story = {
  args: { saved: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // First row removed → the next row's Remove.
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Pro plan' }));
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Remove seashell.shop' })).toHaveFocus());
    await expect(await within(document.body).findByText('Pro plan removed')).toBeVisible();
    // Last row removed → the previous row's Remove.
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Dedicated IPv4 address' }));
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Remove seashell.shop' })).toHaveFocus());
    // Only row parked → the cart heading (focusable via tabIndex -1).
    await userEvent.click(canvas.getByRole('button', { name: 'Save seashell.shop for later' }));
    const heading = canvas.getByRole('heading', { name: 'Cart (0)' });
    await waitFor(() => expect(heading).toHaveFocus());
    await expect(heading).toHaveAttribute('tabindex', '-1');
    // Only saved row moved back → the cart heading again.
    await userEvent.click(canvas.getByRole('button', { name: 'Move seashell.shop to cart' }));
    await waitFor(() => expect(canvas.getByRole('heading', { name: 'Cart (1)' })).toHaveFocus());
    // Last line removed, nothing saved → the empty state.
    await userEvent.click(canvas.getByRole('button', { name: 'Remove seashell.shop' }));
    await waitFor(() => expect(canvas.getByText('Your cart is empty').closest('[data-slot="empty-state"]')).toHaveFocus());
  },
};

/** Quantity stepped down to 0 removes the line; focus moves to the next row's matching control. */
export const QuantityZeroKeepsFocus: Story = {
  args: { lines: [DEMO_CART[2], { ...DEMO_CART[2], id: 'ipv4-b', name: 'Second IPv4 address', quantity: 1 }], saved: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Fewer Dedicated IPv4 address' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Fewer Dedicated IPv4 address' }));
    await waitFor(() => expect(canvas.queryByText('Dedicated IPv4 address')).toBeNull());
    await waitFor(() => expect(canvas.getByRole('spinbutton', { name: 'Qty' })).toHaveFocus());
  },
};

/** No lines and nothing saved for later: an empty state with a Browse plans button. */
export const Empty: Story = {
  args: { lines: [], saved: [] },
};
