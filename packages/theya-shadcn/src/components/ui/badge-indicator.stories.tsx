import type { Meta, StoryObj } from '@storybook/react';
import { Star } from 'iconoir-react'; // verified export — see avatar.stories.tsx note
import { BadgeIndicator } from './badge-indicator';

/**
 * BadgeIndicator — a small counter/status indicator (16/20px), distinct from
 * the pill-shaped `Badge`. Shows a qty value, a plain dot, or an icon, in a
 * filled or outlined treatment with a round or squared corner.
 */
const meta = {
  title: 'Data Display/BadgeIndicator',
  component: BadgeIndicator,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    value: { control: 'text', description: "Qty/text content, e.g. '5' or '99+'. Ignored when dot is set; if icon is also set, icon wins." },
    dot: { control: 'boolean', description: 'Renders a plain dot instead of value/icon — takes priority over both.' },
    icon: { control: false, description: 'Icon content (sized by BadgeIndicator, colored via currentColor). Ignored when dot is set.' },
    type: { control: 'inline-radio', options: ['filled', 'outlined'], description: 'Fill style.' },
    shape: { control: 'inline-radio', options: ['round', 'square'], description: 'Outer silhouette.' },
    tone: {
      control: 'select',
      options: ['inactive', 'info', 'success', 'warning', 'danger'],
      description: 'Semantic tone.',
    },
    size: { control: 'inline-radio', options: ['sm', 'md'], description: 'Badge size.' },
  },
  args: {
    value: '5',
    type: 'filled',
    shape: 'round',
    tone: 'inactive',
    size: 'sm',
  },
} satisfies Meta<typeof BadgeIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Use the Controls panel to switch type/shape/intent/size. */
export const Default: Story = {};

/** Every intent, Filled. */
export const Intents: Story = {
  parameters: { controls: { exclude: ['tone'] } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <BadgeIndicator {...args} tone="inactive" />
      <BadgeIndicator {...args} tone="info" />
      <BadgeIndicator {...args} tone="success" />
      <BadgeIndicator {...args} tone="warning" />
      <BadgeIndicator {...args} tone="danger" />
    </div>
  ),
};

/** Filled vs Outlined, across every intent. */
export const TypeComparison: Story = {
  name: 'Filled vs Outlined',
  parameters: { controls: { exclude: ['tone', 'type'] } },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {(['inactive', 'info', 'success', 'warning', 'danger'] as const).map((tone) => (
          <BadgeIndicator key={tone} {...args} type="filled" tone={tone} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {(['inactive', 'info', 'success', 'warning', 'danger'] as const).map((tone) => (
          <BadgeIndicator key={tone} {...args} type="outlined" tone={tone} />
        ))}
      </div>
    </div>
  ),
};

/** The three value types: qty text, a plain dot, and an icon. */
export const Types: Story = {
  parameters: { controls: { exclude: ['value', 'dot', 'icon'] } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <BadgeIndicator {...args} value="5" />
      <BadgeIndicator {...args} value="99+" />
      <BadgeIndicator {...args} dot />
      <BadgeIndicator {...args} icon={<Star width={10} height={10} aria-hidden="true" />} />
    </div>
  ),
};

/** Round vs squared corners. */
export const Shapes: Story = {
  parameters: { controls: { exclude: ['shape'] } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <BadgeIndicator {...args} shape="round" />
      <BadgeIndicator {...args} shape="square" />
    </div>
  ),
};

/** Small (16px) vs Medium (20px). */
export const Sizes: Story = {
  parameters: { controls: { exclude: ['size'] } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <BadgeIndicator {...args} size="sm" />
      <BadgeIndicator {...args} size="md" />
    </div>
  ),
};
