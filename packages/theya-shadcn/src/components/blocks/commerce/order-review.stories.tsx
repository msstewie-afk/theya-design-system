import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { OrderReview } from './order-review';
import { computeTotals } from './shared';
import { DEMO_CART } from './demo-data';
import { orderReviewGuidelines } from './order-review.guidelines';

const totals = computeTotals(DEMO_CART, { taxRate: 0.2 });

const meta: Meta<typeof OrderReview> = {
  title: 'Patterns: Commerce/OrderReview',
  component: OrderReview,
  tags: ['autodocs'],
  parameters: { guidelines: orderReviewGuidelines, layout: 'padded' },
  args: {
    lines: DEMO_CART,
    totals,
    taxLabel: 'VAT (20%)',
    onPlaceOrder: fn(),
    legal: 'By paying you agree to the Terms of Service. Your plan renews yearly until you cancel; we email you 14 days before.',
    sections: [
      { id: 'account', title: 'Account', onEdit: fn(), rows: [{ term: 'Email', value: 'thea@aether.photo' }] },
      {
        id: 'options',
        title: 'Plan options',
        onEdit: fn(),
        rows: [
          { term: 'Billing', value: 'Yearly' },
          { term: 'Studio', value: 'Selene Weddings' },
          { term: 'Archive', value: 'Originals kept 1 year' },
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
};

/** `placing` puts the pay button into its loading state while the order goes through, so it can't be pressed twice. */
export const Placing: Story = {
  args: { placing: true },
  render: (args) => (
    <div className="max-w-5xl">
      <OrderReview {...args} />
    </div>
  ),
};

/** Interaction test for Default, kept out of Default so Default opens untouched. */
export const TestInteractions: Story = {
  ...Default,
  name: 'Test: interactions',
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Edit payment' }));
    await expect(args.sections[2].onEdit).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', { name: 'Pay $448.80' }));
    await expect(args.onPlaceOrder).toHaveBeenCalledTimes(1);
  },
};
