import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Link } from './link';
import { linkGuidelines } from './link.guidelines';

/**
 * Link — inline navigation text. Inherits the surrounding type by default;
 * `size` sets it for a standalone link. Underlined on hover, or always with
 * `underline` (links in running text). `inverse` for dark surfaces.
 */
const meta = {
  title: 'Navigation/Link',
  component: Link,
  tags: ['autodocs'],
  parameters: { guidelines: linkGuidelines, layout: 'centered' },
  argTypes: {
    size: {
      control: 'select',
      options: [undefined, 'xs', 'sm', 'md', 'lg'],
      description: 'Type step for a standalone link (body-xs … body-l). Omit inside text to inherit the surrounding size.',
    },
    underline: { control: 'boolean', description: 'Always underlined. Off: underline on hover only.' },
    inverse: { control: 'boolean', description: 'Link colors and focus ring for a dark or primary surface.' },
    asChild: { control: false, description: 'Render onto a router link instead of an <a>.' },
    href: { control: 'text' },
    children: { control: 'text' },
  },
  args: { href: '#', children: 'View invoices', size: 'md', underline: false, inverse: false },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** The four standalone steps; without `size` the link takes the parent's type. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-3">
      <Link {...args} size="xs">Link · xs</Link>
      <Link {...args} size="sm">Link · sm</Link>
      <Link {...args} size="md">Link · md</Link>
      <Link {...args} size="lg">Link · lg</Link>
    </div>
  ),
};

/** Inside a sentence: no `size` (inherits), `underline` on, so color is not the only cue. */
export const InText: Story = {
  render: () => (
    <p className="max-w-md font-body text-body-m text-[var(--color-text-text)]">
      Your plan renews on 1 November. You can change the payment method or{' '}
      <Link href="#" underline data-testid="in-text">
        download past invoices
      </Link>{' '}
      at any time.
    </p>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'download past invoices' });
    await expect(link).toHaveAttribute('href', '#');
    // Inherits the paragraph's type and stays underlined at rest.
    await expect(getComputedStyle(link).fontSize).toBe(getComputedStyle(link.parentElement as HTMLElement).fontSize);
    await expect(getComputedStyle(link).textDecorationLine).toContain('underline');
    await userEvent.tab();
    await expect(link).toHaveFocus();
  },
};

/** On a dark surface: the -on-dark colors and the white focus ring. */
export const Inverse: Story = {
  args: { inverse: true },
  render: (args) => (
    <div className="rounded-[var(--size-border-radius-border-radius-xl)] bg-[var(--color-bg-surface-bg-surface-overlay-dark)] p-6">
      <p className="font-body text-body-s text-[var(--color-text-text-on-dark)]">
        Trial ends in 3 days. <Link {...args} underline>Choose a plan</Link>
      </p>
    </div>
  ),
};

/** Onto a router link: the router's component stays in charge of navigation. */
export const AsChild: Story = {
  render: (args) => (
    <Link {...args} asChild>
      <a href="/settings/billing">Billing settings</a>
    </Link>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Billing settings' });
    await expect(link).toHaveAttribute('data-slot', 'link');
    await expect(link).toHaveAttribute('href', '/settings/billing');
  },
};
