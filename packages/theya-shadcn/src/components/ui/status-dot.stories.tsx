import type { Meta, StoryObj } from '@storybook/react';
import { StatusDot } from './status-dot';
import { Badge } from './badge';

/**
 * StatusDot — a 7px semantic color dot rendered beside a text label to
 * convey live status. Tones map to the semantic tokens so they adapt to
 * light and dark themes.
 *
 * The dot is `role="presentation"` and carries no accessible meaning on its
 * own: status is **never color-alone**, so always pair it with an adjacent
 * text label (e.g. "Running") or place it inside a labelled Badge.
 */
const meta = {
  title: 'Data Display/StatusDot',
  component: StatusDot,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    tone: {
      control: 'select',
      options: ['success', 'warning', 'destructive', 'neutral', 'primary', 'info'],
      description: 'Semantic color of the dot, mapped to a background token.',
    },
    className: { control: false, description: 'Class on the root element.' },
    inverse: {
      control: 'boolean',
      description: 'Swap to the --color-*-on-dark palette for a dot on a forced-dark surface.',
    },
  },
  args: { tone: 'neutral' },
} satisfies Meta<typeof StatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The dot must never stand alone — pair it with a text label so the state
 * is conveyed to screen readers and color-blind users. Switch tone in the
 * Controls panel.
 */
export const Default: Story = {
  render: (args) => (
    <span className="inline-flex items-center gap-2 font-body text-body-m text-[var(--color-text-text)]">
      <StatusDot {...args} />
      Running
    </span>
  ),
};

/** Every tone, each beside the label it typically signals. */
export const Tones: Story = {
  parameters: { controls: { exclude: ['tone'] } },
  render: () => (
    <ul className="flex flex-col gap-3 font-body text-body-m text-[var(--color-text-text)]">
      <li className="inline-flex items-center gap-2">
        <StatusDot tone="success" />
        Running
      </li>
      <li className="inline-flex items-center gap-2">
        <StatusDot tone="warning" />
        Degraded
      </li>
      <li className="inline-flex items-center gap-2">
        <StatusDot tone="destructive" />
        Error
      </li>
      <li className="inline-flex items-center gap-2">
        <StatusDot tone="primary" />
        Deploying
      </li>
      <li className="inline-flex items-center gap-2">
        <StatusDot tone="info" />
        Pending
      </li>
      <li className="inline-flex items-center gap-2">
        <StatusDot tone="neutral" />
        Suspended
      </li>
    </ul>
  ),
};

/** `inverse` — the --color-*-on-dark palette, for a dot on a surface
 * that's forced dark regardless of page theme (e.g. Terminal's own
 * `inverse` header). */
export const Inverse: Story = {
  parameters: { controls: { exclude: ['tone'] } },
  render: () => (
    <ul className="flex flex-col gap-3 rounded-[var(--size-border-radius-border-radius-2xl)] bg-[var(--color-code-bg-inverse)] p-4 font-body text-body-m text-[var(--color-text-text-on-dark)]">
      <li className="inline-flex items-center gap-2">
        <StatusDot tone="success" inverse />
        Running
      </li>
      <li className="inline-flex items-center gap-2">
        <StatusDot tone="warning" inverse />
        Degraded
      </li>
      <li className="inline-flex items-center gap-2">
        <StatusDot tone="destructive" inverse />
        Error
      </li>
      <li className="inline-flex items-center gap-2">
        <StatusDot tone="neutral" inverse />
        Suspended
      </li>
    </ul>
  ),
};

/** Inside a Badge to color-code a state as a compact pill. */
export const InBadge: Story = {
  name: 'In Badge',
  parameters: { controls: { exclude: ['tone'] } },
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="success">
        <StatusDot tone="success" />
        Running
      </Badge>
      <Badge variant="warning">
        <StatusDot tone="warning" />
        Degraded
      </Badge>
      <Badge variant="destructive">
        <StatusDot tone="destructive" />
        Error
      </Badge>
      <Badge variant="neutral">
        <StatusDot tone="neutral" />
        Suspended
      </Badge>
    </div>
  ),
};

/** In a list row: a mono identifier paired with its status. */
export const InListRow: Story = {
  name: 'In list row',
  parameters: { controls: { exclude: ['tone'] } },
  render: () => (
    <ul className="flex w-full max-w-sm flex-col divide-y divide-[var(--color-border-border-subtle)] rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] font-body text-body-m">
      <li className="flex items-center justify-between gap-3 px-3 py-2">
        <span className="min-w-0 truncate font-mono">shop.seashell.dev</span>
        <span className="inline-flex shrink-0 items-center gap-2 text-[var(--color-text-text-subtler)]">
          <StatusDot tone="success" />
          Running
        </span>
      </li>
      <li className="flex items-center justify-between gap-3 px-3 py-2">
        <span className="min-w-0 truncate font-mono">api.seashell.dev</span>
        <span className="inline-flex shrink-0 items-center gap-2 text-[var(--color-text-text-subtler)]">
          <StatusDot tone="destructive" />
          Error
        </span>
      </li>
      <li className="flex items-center justify-between gap-3 px-3 py-2">
        <span className="min-w-0 truncate font-mono">legacy.seashell.dev</span>
        <span className="inline-flex shrink-0 items-center gap-2 text-[var(--color-text-text-subtler)]">
          <StatusDot tone="warning" />
          Suspended
        </span>
      </li>
    </ul>
  ),
};
