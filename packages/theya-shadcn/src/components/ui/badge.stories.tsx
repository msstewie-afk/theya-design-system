import type { Meta, StoryObj } from '@storybook/react';
import { Check, GitBranch } from 'iconoir-react';
import { Badge } from './badge';
import { StatusDot } from './status-dot';
import { badgeGuidelines } from './badge.guidelines';

/**
 * Badge — a small, non-interactive status pill. Tones map to the subtle
 * token families (neutral / primary / success / warning / danger /
 * info) plus a `solid` accent. Pair it with `StatusDot` for the "dot +
 * label" pattern so status is never carried by color alone. Use `asChild`
 * to render the pill as a link or other element.
 */
const meta = {
  title: 'Labels/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: { guidelines: badgeGuidelines, layout: 'centered' },
  argTypes: {
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Tone token family applied to the pill.',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'sm is the original size; md matches Chip\'s own size="lg" height/icon (h-8, 16px icons) but with text-body-m (14px) type.',
    },
    asChild: { control: false, description: 'Renders the child element instead of a span, merging props.' },
    children: { control: 'text', description: 'Badge content.' },
  },
  args: { children: 'Running', tone: 'neutral', size: 'sm' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default neutral, sm pill. Use the Controls panel to switch tone/size. */
export const Default: Story = {};

/** Every tone, from neutral through the solid accent. */
export const Variants: Story = {
  parameters: { controls: { exclude: ['tone'] } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge {...args} tone="neutral">
        Draft
      </Badge>
      <Badge {...args} tone="primary">
        Beta
      </Badge>
      <Badge {...args} tone="success">
        Running
      </Badge>
      <Badge {...args} tone="warning">
        Suspended
      </Badge>
      <Badge {...args} tone="danger">
        Error
      </Badge>
      <Badge {...args} tone="info">
        Queued
      </Badge>
      <Badge {...args} tone="primary" appearance="filled">
        New
      </Badge>
    </div>
  ),
};

/**
 * sm (default, original) vs md — md matches Chip's own size="lg" height
 * and icon size (h-8, 16px icons), but sets text-body-m (14px) type,
 * one step up from Chip's own text-body-s.
 */
export const Sizes: Story = {
  parameters: { controls: { exclude: ['size'] } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge {...args} size="sm">
        <StatusDot tone="success" />
        Running
      </Badge>
      <Badge {...args} size="md">
        <StatusDot tone="success" />
        Running
      </Badge>
    </div>
  ),
};

/**
 * The "dot + label" status pattern: pair a `StatusDot` with a text label so
 * the state is never communicated by color alone.
 */
export const WithStatusDot: Story = {
  name: 'With status dot',
  parameters: { controls: { exclude: ['tone', 'children'] } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge {...args} tone="success">
        <StatusDot tone="success" />
        Running
      </Badge>
      <Badge {...args} tone="warning">
        <StatusDot tone="warning" />
        Suspended
      </Badge>
      <Badge {...args} tone="danger">
        <StatusDot tone="danger" />
        Error
      </Badge>
    </div>
  ),
};

/** Pair a 12px icon (decorative — meaning lives in the text) with a label. */
export const WithIcon: Story = {
  name: 'With icon',
  args: {
    tone: 'success',
    children: (
      <>
        <Check aria-hidden="true" />
        Verified
      </>
    ),
  },
};

/** A count or numeral, e.g. an unread tally or a version tag. */
export const Count: Story = {
  args: { tone: 'primary', children: '12' },
};

/**
 * Render as a link via `asChild`. The consumer supplies the accessible name
 * and href on the child; identifiers stay lowercase mono.
 */
export const AsLink: Story = {
  name: 'As link',
  parameters: { controls: { exclude: ['children'] } },
  args: { tone: 'neutral' },
  render: (args) => (
    <Badge {...args} asChild>
      <a href="/sites/shop.seashell.dev">
        <GitBranch aria-hidden="true" />
        <span className="font-mono">v2.4.0</span>
      </a>
    </Badge>
  ),
};

/** `appearance="filled"` — full tone background, same colors as Chip's solid look. */
export const Filled: Story = {
  parameters: { controls: { exclude: ['tone', 'appearance'] } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      {(['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const).map((t) => (
        <Badge key={t} {...args} tone={t} appearance="filled">
          {t}
        </Badge>
      ))}
    </div>
  ),
};
