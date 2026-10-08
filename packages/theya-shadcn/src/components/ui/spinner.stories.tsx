import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { Spinner } from './spinner';
import { spinnerGuidelines } from './spinner.guidelines';

/**
 * Spinner — the system's loading spinner: an arc that grows and shrinks while the
 * ring turns. Button `loading`, Combobox, Autocomplete, Command and Dropzone use it.
 */
const meta = {
  title: 'Status & Feedback/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: { guidelines: spinnerGuidelines, layout: 'centered' },
  argTypes: {
    className: { control: false, description: 'Size and colour, like an icon (size-4 text-[var(--color-icon-icon-primary)]).' },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <span role="status" aria-label="Loading" className="inline-flex text-[var(--color-icon-icon-primary)]">
      <Spinner className="size-6" />
    </span>
  ),
};

/** 16, 24 and 32px. */
export const Sizes: Story = {
  render: () => (
    <span role="status" aria-label="Loading" className="inline-flex items-center gap-6 text-[var(--color-icon-icon-primary)]">
      <Spinner className="size-4" />
      <Spinner className="size-6" />
      <Spinner className="size-8" />
    </span>
  ),
};

/** Inherits the text colour: on a filled button it is the label colour. */
export const InButton: Story = {
  name: 'In a Button',
  render: () => <Button loading>Save changes</Button>,
};
