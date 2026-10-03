import type { Meta, StoryObj } from '@storybook/react';
import { Sparkline } from './sparkline';

/**
 * Sparkline — a tiny, axis-less inline trend for a table cell, Stat card, or
 * list row. No grid, axes, or tooltip: it carries the SHAPE while the
 * precise number lives in the surrounding text. Tones map to semantic
 * tokens. Always pass a short `ariaLabel` and keep the value in text beside
 * it (the sparkline is one `role="img"` with no other read).
 */
const meta: Meta<typeof Sparkline> = {
  title: 'Charts/Sparkline',
  component: Sparkline,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    data: { control: false, description: 'Ordered values to plot.' },
    tone: {
      control: 'inline-radio',
      options: ['brand', 'success', 'warning', 'danger', 'info', 'muted'],
      description: 'Maps stroke/fill to a semantic token.',
    },
    area: { control: 'boolean', description: 'Soft gradient area fill under the line.' },
    showLast: { control: 'boolean', description: 'Dot on the latest point.' },
    height: { control: { type: 'number' }, description: 'SVG height in px.' },
    width: { control: { type: 'number' }, description: 'Fixed width in px (omit for fluid).' },
    ariaLabel: { control: 'text', description: 'Short accessible summary of the trend.' },
    className: { control: false, description: 'Class on the root element.' },
  },
  args: {
    data: [3, 5, 4, 6, 5, 7, 9],
    tone: 'brand',
    area: false,
    showLast: true,
    height: 32,
    width: 140,
    ariaLabel: 'Requests trending up over the last 7 days.',
  },
};

export default meta;
// StoryObj<typeof Sparkline>, not <typeof meta>: meta is annotated as
// Meta<typeof Sparkline>, so typeof meta loses the props and render's args
// resolved to {} (TS2741, required `data`).
type Story = StoryObj<typeof Sparkline>;

/** A plain brand-tone line with a dot on the latest point. */
export const Default: Story = {};

/** Success tone with a soft area fill — an uptime trend. */
export const SuccessArea: Story = {
  name: 'Success area',
  args: {
    data: [99.2, 99.5, 99.4, 99.7, 99.6, 99.9, 99.98],
    tone: 'success',
    area: true,
    ariaLabel: 'Uptime trending up over the last 7 days.',
  },
};

/** Destructive tone for a rising error rate. */
export const Destructive: Story = {
  args: {
    data: [0.2, 0.3, 0.25, 0.5, 0.45, 0.6, 0.4],
    tone: 'danger',
    ariaLabel: 'Error rate rising slightly over the last 7 days.',
  },
};

/** In context: a label + number with the sparkline carrying the shape. */
export const InAStatRow: Story = {
  name: 'In a stat row',
  render: (args) => (
    <div className="flex w-72 items-center justify-between gap-4 rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-4 shadow-elevation-xs">
      <div className="flex flex-col">
        <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">Requests</span>
        <span className="font-body text-heading-xs font-semibold tabular-nums text-[var(--color-text-text)]">4.2M</span>
      </div>
      <Sparkline {...args} />
    </div>
  ),
};
