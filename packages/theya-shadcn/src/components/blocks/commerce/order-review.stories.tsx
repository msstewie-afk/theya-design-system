import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { OrderReview } from './order-review';
import { computeTotals } from './shared';
import { DEMO_CART } from './demo-data';

const totals = computeTotals(DEMO_CART, { taxRate: 0.2 });

const meta: Meta<typeof OrderReview> = {
  title: 'Patterns: Commerce/OrderReview',
  component: OrderReview,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    lines: DEMO_CART,
    totals,
    taxLabel: 'VAT (20%)',
    onPlaceOrder: fn(),
    legal: 'By paying you agree to the Terms of Service. Your plan renews yearly until you cancel; we email you 14 days before.',
    sections: [
      { id: 'account', title: 'Account', onEdit: fn(), rows: [{ term: 'Email', value: 'dana@seashell.dev' }] },
      {
        id: 'options',
        title: 'Plan options',
        onEdit: fn(),
        rows: [
          { term: 'Billing', value: 'Yearly' },
          { term: 'Region', value: 'Frankfurt' },
          { term: 'Backups', value: 'Daily, kept 30 days' },
        ],
      },
      { id: 'payment', title: 'Payment', onEdit: fn(), rows: [{ term: 'Card', value: 'Visa ending 4242, expires 08 / 29' }] },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof OrderReview>;

/** Each group has its own Edit; the button names the amount it charges. */
export const Default: Story = {
  render: (args) => (
    <div className="max-w-5xl">
      <OrderReview {...args} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Edit payment' }));
    await expect(args.sections[2].onEdit).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', { name: 'Pay $448.80' }));
    await expect(args.onPlaceOrder).toHaveBeenCalledTimes(1);
  },
};

export const Placing: Story = {
  args: { placing: true },
  render: (args) => (
    <div className="max-w-5xl">
      <OrderReview {...args} />
    </div>
  ),
};
