import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { CopyButton } from './copy-button';
import { copyButtonGuidelines } from './copy-button.guidelines';

const meta: Meta<typeof CopyButton> = {
  title: 'Actions/CopyButton',
  component: CopyButton,
  tags: ['autodocs'],
  parameters: {
    guidelines: copyButtonGuidelines,
    docs: {
      description: {
        component:
          'Wraps Button. Copies `value`, swaps to a success check + "Copied" and announces it politely. Deliberately no toast of its own — wire onCopied / onCopyError to sonner at the call site (see SecretField).',
      },
    },
  },
  argTypes: {
    value: { control: 'text', description: 'Text written to the clipboard.' },
    label: { control: 'text', description: 'Visible label beside the icon. Pass null for icon-only (then set aria-label). Default "Copy".' },
    copiedLabel: { control: 'text', description: 'Label shown for resetDelay ms after a successful copy. Default "Copied".' },
    resetDelay: { control: { type: 'number', min: 0 }, description: 'ms before the button reverts from the copied state. Default 1500.' },
    onCopied: { control: false, description: 'Fires after a successful copy.' },
    onCopyError: { control: false, description: 'Fires when the clipboard write fails.' },
  },
};

export default meta;
type Story = StoryObj<typeof CopyButton>;

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

// Live regions that belong to the button, not the global sonner Toaster
// (a <section aria-live> the Storybook decorator mounts in every story).
const regions = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLElement>('[aria-live="polite"]:not(section)'));
// CopyButton's own region comes after Button's (which lives inside the button).
const live = (root: HTMLElement) => regions(root).filter((el) => !el.closest('button'))[0];

export const Playground: Story = {
  args: { value: 'npm install @theya/shadcn', resetDelay: 400, onCopied: fn(), onCopyError: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Copy' });
    const writeText = fn(async (_text: string) => {});
    await withClipboard(writeText, async () => {
      await userEvent.click(button);
      await waitFor(() => expect(writeText).toHaveBeenCalledWith('npm install @theya/shadcn'));
      await expect(args.onCopied).toHaveBeenCalledWith('npm install @theya/shadcn');
      await waitFor(() => expect(button).toHaveAccessibleName('Copied'));
      await expect(button).toHaveAttribute('data-tone', 'success');
      // One announcement: Button's live label says "Copied"; CopyButton adds
      // no second region when the label is visible.
      await expect(regions(canvasElement)).toHaveLength(1);

      // Reverts after resetDelay.
      await waitFor(() => expect(button).toHaveAccessibleName('Copy'), { timeout: 2000 });
      await expect(button).toHaveAttribute('data-tone', 'neutral');
    });

    // A failing clipboard reports the error and never shows "Copied".
    await withClipboard(
      async () => {
        throw new Error('denied');
      },
      async () => {
        await userEvent.click(button);
        await waitFor(() => expect(args.onCopyError).toHaveBeenCalled());
        await expect(button).toHaveAccessibleName('Copy');
      },
    );
  },
};

export const IconOnly: Story = {
  args: { value: 'sk-abc123...', label: null, 'aria-label': 'Copy API key' },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Copy API key' });
    await withClipboard(
      async () => {},
      async () => {
        await userEvent.click(button);
        // Icon-only keeps its name; the change is heard via the live region.
        await waitFor(() => expect(live(canvasElement).textContent).toMatch(/^Copied to clipboard/));
        await expect(button).toHaveAccessibleName('Copy API key');
        const first = live(canvasElement).textContent;
        // A second copy inside the window is announced again (new text).
        await userEvent.click(button);
        await waitFor(() => expect(live(canvasElement).textContent).not.toBe(first));
        await expect(live(canvasElement).textContent).toMatch(/^Copied to clipboard/);
      },
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <CopyButton value="npm install @theya/shadcn" size="sm" />
      <CopyButton value="npm install @theya/shadcn" size="md" />
      <CopyButton value="npm install @theya/shadcn" size="lg" />
      <CopyButton value="npm install @theya/shadcn" size="xl" />
      <CopyButton value="npm install @theya/shadcn" size="2xl" />
    </div>
  ),
};
