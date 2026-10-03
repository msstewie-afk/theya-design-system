import { useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Button } from '@/components/ui/button';
import { PaymentMethod, type PaymentMethodHandle } from './payment-method';

const meta: Meta<typeof PaymentMethod> = {
  title: 'Patterns: Commerce/PaymentMethod',
  component: PaymentMethod,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof PaymentMethod>;

const NOW = new Date(2026, 9, 3);

function WithContinue() {
  const ref = useRef<PaymentMethodHandle>(null);
  return (
    <div className="flex max-w-lg flex-col gap-4">
      <PaymentMethod ref={ref} now={NOW} />
      <Button appearance="filled" tone="primary" className="self-end" onClick={() => ref.current?.validate()}>
        Continue
      </Button>
    </div>
  );
}

/** Card first and selected; the number formats itself, shows the brand, and a mistyped digit is caught on leaving the field. */
export const Default: Story = {
  render: () => <WithContinue />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const number = canvas.getByRole('textbox', { name: /^Card number/ });
    await userEvent.type(number, '4242424242424241');
    await expect(number).toHaveValue('4242 4242 4242 4241');
    await expect(canvas.getByText(/· Visa/)).toBeVisible();
    await userEvent.tab();
    await waitFor(() => expect(number).toHaveAccessibleDescription(/digits looks mistyped/));
    await userEvent.clear(number);
    await userEvent.type(number, '4242424242424242');
    await waitFor(() => expect(number).not.toHaveAttribute('aria-invalid', 'true'));

    // Continue with the rest empty: every error shows, focus goes to the first.
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    const name = canvas.getByRole('textbox', { name: /^Name on card/ });
    await waitFor(() => expect(name).toHaveFocus());
    await expect(name).toHaveAccessibleDescription('Enter the name as it appears on the card.');

    const expiry = canvas.getByRole('textbox', { name: /^Expiry date/ });
    await userEvent.type(expiry, '0925');
    await userEvent.tab();
    await waitFor(() => expect(expiry).toHaveAccessibleDescription('This card has expired. Use another card.'));
  },
};

/** American Express: 4-6-5 grouping and a 4-digit security code. */
export const Amex: Story = {
  render: () => <WithContinue />,
  play: async ({ canvasElement }) => {
    const number = within(canvasElement).getByRole('textbox', { name: /^Card number/ });
    await userEvent.type(number, '378282246310005');
    await expect(number).toHaveValue('3782 822463 10005');
  },
};

export const PayPal: Story = {
  args: { defaultMethod: 'paypal', now: NOW },
  render: (args) => (
    <div className="max-w-lg">
      <PaymentMethod {...args} />
    </div>
  ),
};
