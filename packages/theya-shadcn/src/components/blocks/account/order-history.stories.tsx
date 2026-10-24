import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { OrderHistory } from './order-history';
import { DEMO_ORDERS } from './demo-data';
import { orderHistoryGuidelines } from './order-history.guidelines';

const meta: Meta<typeof OrderHistory> = {
  title: 'Patterns: Account/OrderHistory',
  component: OrderHistory,
  tags: ['autodocs'],
  parameters: { guidelines: orderHistoryGuidelines, layout: 'padded' },
  args: { orders: DEMO_ORDERS, onReorder: fn() },
  decorators: [(Story) => <div className="max-w-4xl">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof OrderHistory>;

/** What was bought, total and status per row; details, invoice and "Buy again" in place; search by number or item. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const details = canvas.getByRole('button', { name: 'Details for order TH-23990' });
    await userEvent.click(details);
    await expect(details).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('link', { name: 'Invoice (PDF) for order TH-23990' })).toHaveAttribute('href', '#invoice/TH-23990.pdf');
    await userEvent.click(canvas.getByRole('button', { name: 'Buy again order TH-23990' }));
    await expect(args.onReorder).toHaveBeenCalledWith(expect.objectContaining({ number: 'TH-23990' }));

    const search = canvas.getByRole('searchbox', { name: 'Search orders' });
    await userEvent.type(search, 'security key');
    await expect(canvas.getByText('1 order')).toBeVisible();
    await userEvent.clear(search);
    await userEvent.type(search, 'zzz');
    // "Show all orders" goes with the empty state: focus moves to the
    // first order shown (WCAG 2.4.3).
    await userEvent.click(canvas.getByRole('button', { name: 'Show all orders' }));
    await expect(canvas.getByText('7 orders')).toBeVisible();
    await waitFor(() => expect(document.activeElement).toBe(canvas.getByRole('button', { name: 'Details for order TH-24817' })));

    // The last "Show N more" goes away: focus moves to the first order it revealed.
    await userEvent.click(canvas.getByRole('button', { name: 'Show 2 more' }));
    await expect(canvas.queryByRole('button', { name: /^Show \d+ more$/ })).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(canvas.getByRole('button', { name: 'Details for order TH-22011' })));
  },
};
