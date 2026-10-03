import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { SecretField } from './secret-field';
import { secretFieldGuidelines } from './secret-field.guidelines';

const meta: Meta<typeof SecretField> = {
  title: 'Text Input/SecretField',
  component: SecretField,
  tags: ['autodocs'],
  parameters: {
    guidelines: secretFieldGuidelines,
    docs: { description: { component: 'Masked by default: ten bullets plus the last 4 chars, value kept out of the DOM until revealed. Copy confirms via a sonner toast.' } },
  },
  argTypes: {
    copyToastTitle: { control: 'text', description: 'Title of the copy-success toast.', table: { category: 'Content' } },
  },
};

export default meta;
type Story = StoryObj<typeof SecretField>;

const KEY = 'sk_demo_51H8x9jK2L3mN4pQ7rS8tU9vW';

/** Swaps navigator.clipboard for a stub for the duration of `run`. */
async function withClipboard(writeText: (text: string) => Promise<void>, run: () => Promise<void>) {
  const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  try {
    await run();
  } finally {
    if (original) Object.defineProperty(navigator, 'clipboard', original);
    else delete (navigator as { clipboard?: unknown }).clipboard;
  }
}

export const Playground: Story = {
  args: { value: KEY, label: 'API key' },
  render: (args) => (
    <div className="w-[420px] max-w-[92vw]">
      <SecretField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Masked: the value isn't in the DOM, the visible tail is announced.
    await expect(canvasElement).not.toHaveTextContent(KEY);
    await expect(canvas.getByText('API key hidden, ends in U9vW')).toBeInTheDocument();

    const toggle = canvas.getByRole('button', { name: 'Show API key' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(toggle);
    await expect(canvas.getByText(KEY)).toBeInTheDocument();
    // Same name, state flips — not a renamed button.
    await expect(canvas.getByRole('button', { name: 'Show API key' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(toggle);
    await expect(canvasElement).not.toHaveTextContent(KEY);

    // Copy writes the full value even while masked, and confirms politely.
    const writeText = fn(async (_text: string) => {});
    await withClipboard(writeText, async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Copy API key' }));
      await waitFor(() => expect(writeText).toHaveBeenCalledWith(KEY));
      await waitFor(() => expect(canvas.getByText('Copied to clipboard')).toBeInTheDocument());
    });
  },
};

export const RevealedByDefault: Story = {
  name: 'Revealed by default',
  args: { value: KEY, label: 'API key', defaultRevealed: true },
  render: (args) => (
    <div className="w-[420px] max-w-[92vw]">
      <SecretField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(KEY)).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Show API key' })).toHaveAttribute('aria-pressed', 'true');
  },
};

export const NotRevealable: Story = {
  name: 'Not revealable',
  args: { value: KEY, label: 'API key', revealable: false },
  render: (args) => (
    <div className="w-[420px] max-w-[92vw]">
      <SecretField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: 'Show API key' })).not.toBeInTheDocument();
    // A blocked clipboard can't reveal a non-revealable value.
    await withClipboard(
      async () => {
        throw new Error('denied');
      },
      async () => {
        await userEvent.click(canvas.getByRole('button', { name: 'Copy API key' }));
        await new Promise((r) => setTimeout(r, 50));
        await expect(canvasElement).not.toHaveTextContent(KEY);
      },
    );
  },
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Copy buttons are told apart by their field's label.
    await expect(canvas.getAllByRole('button', { name: 'Copy API key' })).toHaveLength(2);
    await expect(canvas.getByRole('button', { name: 'Copy Webhook secret' })).toBeInTheDocument();

    // Blocked clipboard on a revealable field reveals it for manual copy.
    const masked = canvas.getAllByRole('button', { name: 'Show API key' })[0];
    await expect(masked).toHaveAttribute('aria-pressed', 'false');
    await withClipboard(
      async () => {
        throw new Error('denied');
      },
      async () => {
        await userEvent.click(canvas.getAllByRole('button', { name: 'Copy API key' })[0]);
        await waitFor(() => expect(masked).toHaveAttribute('aria-pressed', 'true'));
      },
    );
  },
};
