import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { Separator } from './separator';

const meta: Meta<typeof Separator> = {
  title: 'Layout/Separator',
  component: Separator,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Axis the divider runs along.',
    },
    emphasis: {
      control: 'inline-radio',
      options: ['subtle', 'strong'],
      description: 'Line weight. `subtle` (default, border-subtler) stays below interactive borders; `strong` (border-subtle) matches a form-field border.',
    },
    decorative: {
      control: 'boolean',
      description: 'When true (default) the rule is aria-hidden; set false to expose role="separator".',
    },
    className: { control: false, description: 'Class on the root element.' },
  },
  args: { orientation: 'horizontal', decorative: true, emphasis: 'subtle' },
};

export default meta;
type Story = StoryObj<typeof Separator>;

/** A horizontal hairline between two stacked sections. */
export const Default: Story = {
  render: (args) => (
    <div className="w-full max-w-sm">
      <p className="font-body text-body-m font-medium text-[var(--color-text-text)]">Account</p>
      <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">Profile, email, password</p>
      <Separator {...args} className="my-4" />
      <p className="font-body text-body-m font-medium text-[var(--color-text-text)]">Billing</p>
      <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">Plan, invoices, payment method</p>
    </div>
  ),
};

/** Vertical orientation needs a sized parent — it stretches to full height. Here
 * a `h-5` toolbar row separates inline metadata segments. */
export const Vertical: Story = {
  parameters: { controls: { exclude: ['orientation'] } },
  args: { orientation: 'vertical' },
  render: (args) => (
    <div className="flex h-5 items-center gap-3 font-body text-body-s text-[var(--color-text-text-subtler)]">
      <span>Draft</span>
      <Separator {...args} />
      <span className="font-mono">v2.4.0</span>
      <Separator {...args} />
      <span>Edited 2m ago</span>
    </div>
  ),
};

/** Dividing stacked list rows in a card surface — each region stays visually
 * grouped without extra chrome. */
export const InCard: Story = {
  parameters: { controls: { exclude: ['orientation'] } },
  args: { orientation: 'horizontal' },
  render: (args) => (
    <div className="w-full max-w-sm rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] shadow-elevation-xs">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="font-mono text-body-m text-[var(--color-text-text)]">shop.seashell.dev</span>
        <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">eu-west-1</span>
      </div>
      <Separator {...args} />
      <div className="flex items-center justify-between px-4 py-3">
        <span className="font-mono text-body-m text-[var(--color-text-text)]">api.seashell.dev</span>
        <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">us-east-1</span>
      </div>
      <Separator {...args} />
      <div className="flex items-center justify-between px-4 py-3">
        <span className="font-mono text-body-m text-[var(--color-text-text)]">docs.seashell.dev</span>
        <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">eu-west-1</span>
      </div>
    </div>
  ),
};

/** Semantic mode: `decorative={false}` exposes `role="separator"` with
 * `aria-orientation`, conveying a real structural boundary to assistive tech.
 * Use this when the rule separates distinct regions rather than just adding a
 * visual flourish. */
export const Semantic: Story = {
  parameters: { controls: { exclude: ['decorative'] } },
  args: { decorative: false },
  render: (args) => (
    <div className="w-full max-w-sm">
      <section>
        <h3 className="font-body text-body-m font-medium text-[var(--color-text-text)]">General</h3>
        <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">Region, runtime, scaling</p>
      </section>
      <Separator {...args} className="my-4" />
      <section>
        <h3 className="font-body text-body-m font-medium text-[var(--color-text-text)]">Danger zone</h3>
        <p className="font-body text-body-s text-[var(--color-text-text-danger)]">Delete or suspend this site</p>
      </section>
    </div>
  ),
};

/**
 * Two weights. `subtle` is the default everywhere — dividers stay quieter
 * than the borders of things you can interact with. Reach for `strong`
 * when a divider separates major regions and has to hold its own.
 */
export const Emphasis: Story = {
  parameters: { controls: { exclude: ['emphasis', 'orientation'] } },
  render: () => (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div>
        <p className="mb-2 font-body text-body-s text-[var(--color-text-text-subtler)]">subtle (default)</p>
        <Separator data-testid="subtle" />
      </div>
      <div>
        <p className="mb-2 font-body text-body-s text-[var(--color-text-text-subtler)]">strong</p>
        <Separator data-testid="strong" emphasis="strong" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const color = (el: HTMLElement) => getComputedStyle(el).backgroundColor;
    const token = (name: string) => {
      const probe = document.createElement('div');
      probe.style.backgroundColor = `var(${name})`;
      canvasElement.appendChild(probe);
      const value = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return value;
    };
    await expect(color(canvas.getByTestId('subtle'))).toBe(token('--color-border-border-subtler'));
    await expect(color(canvas.getByTestId('strong'))).toBe(token('--color-border-border-subtle'));
    await expect(color(canvas.getByTestId('subtle'))).not.toBe(color(canvas.getByTestId('strong')));
  },
};
