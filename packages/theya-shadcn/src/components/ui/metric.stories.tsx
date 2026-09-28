import type { Meta, StoryObj } from '@storybook/react';
import { Mail, WarningCircle, NavArrowRight } from 'iconoir-react';
import { Metric } from './metric';
import { Button } from './button';

const meta: Meta<typeof Metric> = {
  title: 'Data Display/Metric',
  tags: ['autodocs'],
  argTypes: {
    icon: { control: false, description: 'Optional leading icon (decorative — the visible value/label carry the meaning).' },
    value: { control: 'text', description: 'The metric value — a string/number is the common case (tabular-nums).' },
    label: { control: 'text', description: 'Label under the value.' },
    description: { control: 'text', description: 'Optional muted explainer line below the value/label.' },
    actions: { control: false, description: 'Optional trailing controls. Omit to render none.' },
  },
};

export default meta;
type Story = StoryObj<typeof Metric>;

export const Default: Story = {
  render: () => (
    <div className="w-[360px] rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]">
      <Metric
        icon={<Mail />}
        value={8}
        // The leading space is what puts the gap between "8" and "aliases" —
        // Metric's own value/label gap is deliberately 0 (see metric.tsx),
        // so a word-separated label needs its own leading space.
        label=" aliases"
        description="Alternate addresses for existing mailboxes"
        actions={<Button appearance="ghost" iconOnly size="md" aria-label="View aliases" leftIcon={<NavArrowRight />} />}
      />
    </div>
  ),
};

/**
 * The other side of the same gap-0 rule: a numeric value can glue straight
 * to a suffix with no space at all ("121" + "/150 mailboxes" reads as one
 * run, not two words) — same component, no prop for it, just how the label
 * string is written.
 */
export const TightSuffix: Story = {
  name: 'Tight suffix',
  render: () => (
    <div className="w-[360px] rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]">
      <Metric value={121} label="/150 mailboxes" icon={<Mail />} />
    </div>
  ),
};

/** A stack of Metric rows inside a bordered container, divided by a hairline. */
export const Stack: Story = {
  render: () => (
    <div className="w-[360px] divide-y divide-[var(--color-border-border-subtle)] rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]">
      <Metric icon={<Mail />} value={8} label=" aliases" />
      <Metric icon={<Mail />} value={121} label="/150 mailboxes" />
      <Metric icon={<WarningCircle />} value={2} label=" DNS records not propagated" />
    </div>
  ),
};
