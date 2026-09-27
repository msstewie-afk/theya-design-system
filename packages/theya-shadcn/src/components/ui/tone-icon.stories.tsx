import type { Meta, StoryObj } from '@storybook/react';
import { Rocket } from 'iconoir-react';
import { ToneIcon } from './tone-icon';

/**
 * ToneIcon — a tone-tinted glyph (subtle-fill circle/square + a
 * shape-distinct icon in the matching darker ink). Stacks three
 * signals — fill color, icon shape, icon color — so tone still reads
 * in grayscale, unlike a bare StatusDot or a text-only label.
 *
 * Decorative by default (`aria-hidden="true"`) — always pair with a
 * visible text label, status is never color-alone.
 */
const meta: Meta<typeof ToneIcon> = {
  title: 'Data Display/ToneIcon',
  component: ToneIcon,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    tone: {
      control: 'select',
      options: ['info', 'success', 'warning', 'destructive', 'neutral', 'primary'],
      description: 'Semantic tone driving the background and default icon.',
    },
    shape: { control: 'select', options: ['circle', 'square'], description: 'Outer silhouette.' },
    size: { control: 'select', options: ['sm', 'default', 'lg'], description: 'Overall size of the icon and its container.' },
    icon: { control: false, description: "Overrides the tone's default icon." },
  },
  args: { tone: 'success', shape: 'circle', size: 'default' },
};

export default meta;
type Story = StoryObj<typeof ToneIcon>;

/** Switch tone/shape/size in the Controls panel. Always shown beside a label here. */
export const Default: Story = {
  render: (args) => (
    <span className="inline-flex items-center gap-2 font-body text-body-m text-[var(--color-text-text)]">
      <ToneIcon {...args} />
      Deployment succeeded
    </span>
  ),
};

/** Every tone with its default icon — shape alone still distinguishes them in grayscale. */
export const Tones: Story = {
  parameters: { controls: { exclude: ['tone'] } },
  render: () => (
    <ul className="flex flex-col gap-3 font-body text-body-m text-[var(--color-text-text)]">
      {(
        [
          ['info', 'Update available'],
          ['success', 'Deployment succeeded'],
          ['warning', 'Disk usage high'],
          ['destructive', 'Backup failed'],
          ['neutral', 'New notification'],
          ['primary', 'Upgraded to Pro'],
        ] as const
      ).map(([tone, label]) => (
        <li key={tone} className="inline-flex items-center gap-2">
          <ToneIcon tone={tone} />
          {label}
        </li>
      ))}
    </ul>
  ),
};

/** `sm` / `default` / `lg` side by side. */
export const Sizes: Story = {
  parameters: { controls: { exclude: ['tone', 'size'] } },
  render: () => (
    <div className="flex items-center gap-4">
      <ToneIcon tone="success" size="sm" />
      <ToneIcon tone="success" size="default" />
      <ToneIcon tone="success" size="lg" />
    </div>
  ),
};

/** `circle` (default) vs `square` — square uses the standard control radius. */
export const Shapes: Story = {
  parameters: { controls: { exclude: ['tone', 'shape'] } },
  render: () => (
    <div className="flex items-center gap-4">
      <ToneIcon tone="info" shape="circle" />
      <ToneIcon tone="info" shape="square" />
    </div>
  ),
};

/** `icon` overrides the tone's default glyph — any node, not just the built-in set. */
export const CustomIcon: Story = {
  parameters: { controls: { exclude: ['tone', 'icon'] } },
  render: () => (
    <span className="inline-flex items-center gap-2 font-body text-body-m text-[var(--color-text-text)]">
      <ToneIcon tone="primary" icon={<Rocket />} />
      Launch scheduled
    </span>
  ),
};
