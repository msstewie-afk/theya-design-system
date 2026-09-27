import type { Meta, StoryObj } from '@storybook/react';
import { SecretField } from './secret-field';

const meta: Meta<typeof SecretField> = {
  title: 'Forms/SecretField',
  component: SecretField,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'Masked by default: ten bullets plus the last 4 chars, value kept out of the DOM until revealed. Copy confirms via a sonner toast.' } },
  },
  argTypes: {
    copyToastTitle: { control: 'text', description: 'Title of the copy-success toast.', table: { category: 'Content' } },
  },
};

export default meta;
type Story = StoryObj<typeof SecretField>;

export const Playground: Story = {
  args: { value: 'sk_demo_51H8x9jK2L3mN4pQ7rS8tU9vW', label: 'API key' },
  render: (args) => (
    <div className="w-[420px] max-w-[92vw]">
      <SecretField {...args} />
    </div>
  ),
};

export const RevealedByDefault: Story = {
  name: 'Revealed by default',
  args: { value: 'sk_demo_51H8x9jK2L3mN4pQ7rS8tU9vW', label: 'API key', defaultRevealed: true },
  render: (args) => (
    <div className="w-[420px] max-w-[92vw]">
      <SecretField {...args} />
    </div>
  ),
};

export const NotRevealable: Story = {
  name: 'Not revealable',
  args: { value: 'sk_demo_51H8x9jK2L3mN4pQ7rS8tU9vW', label: 'API key', revealable: false },
  render: (args) => (
    <div className="w-[420px] max-w-[92vw]">
      <SecretField {...args} />
    </div>
  ),
};

/** Each state side by side: masked, revealed, and copy-only. */
export const States: Story = {
  render: () => (
    <div className="flex w-[420px] max-w-[92vw] flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <p className="text-body-s font-medium text-[var(--color-text-text)]">Masked (default)</p>
        <SecretField value="sk_demo_51H8x9jK2L3mN4pQ7rS8tU9vW" label="API key" />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-body-s font-medium text-[var(--color-text-text)]">Revealed</p>
        <SecretField value="sk_demo_51H8x9jK2L3mN4pQ7rS8tU9vW" label="API key" defaultRevealed />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-body-s font-medium text-[var(--color-text-text)]">Copy-only</p>
        <SecretField value="whsec_3aF8kLp02qZx9rTnB7mWvE" label="Webhook secret" revealable={false} />
      </div>
    </div>
  ),
};
