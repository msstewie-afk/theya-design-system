import type { Meta, StoryObj } from '@storybook/react';
import { CopyButton } from './copy-button';

const meta: Meta<typeof CopyButton> = {
  title: 'Actions/CopyButton',
  component: CopyButton,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'Wraps Button. No toast integration in this draft (deferred).' } },
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

export const Playground: Story = {
  args: { value: 'npm install @theya/shadcn' },
};

export const IconOnly: Story = {
  args: { value: 'sk-abc123...', label: null, 'aria-label': 'Copy API key' },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <CopyButton value="npm install @theya/shadcn" size="sm" />
      <CopyButton value="npm install @theya/shadcn" size="md" />
      <CopyButton value="npm install @theya/shadcn" size="lg" />
      <CopyButton value="npm install @theya/shadcn" size="xl" />
      <CopyButton value="npm install @theya/shadcn" size="2xl" />
    </div>
  ),
};
