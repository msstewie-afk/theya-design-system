import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { TextEffect } from './text-effect';
import { textEffectGuidelines } from './text-effect.guidelines';

/** TextEffect — animated headline text for landing pages: split, scramble, shimmer, typewriter. */
const meta = {
  title: 'Motion/TextEffect',
  component: TextEffect,
  tags: ['autodocs'],
  parameters: { layout: 'padded', guidelines: textEffectGuidelines },
  argTypes: {
    effect: { control: 'inline-radio', options: ['split', 'scramble', 'shimmer', 'typewriter'] },
    trigger: { control: 'inline-radio', options: ['view', 'hover', 'mount'], description: 'When split / scramble start.' },
    children: { control: 'text' },
    phrases: { control: 'object', description: 'Typewriter phrases.' },
    as: { control: false },
  },
  args: { effect: 'split', trigger: 'view', children: 'Hosting that gets out of the way' },
} satisfies Meta<typeof TextEffect>;
export default meta;
type Story = StoryObj<typeof meta>;

const H = 'font-body text-heading-l font-semibold text-[var(--color-text-text)]';

export const Split: Story = {
  render: (args) => <TextEffect {...args} as="h2" className={H} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading', { name: 'Hosting that gets out of the way' })).toBeInTheDocument();
  },
};

/** Hover to replay. */
export const Scramble: Story = {
  args: { effect: 'scramble', trigger: 'hover', children: 'deploy --prod' },
  render: (args) => <TextEffect {...args} as="p" className="font-mono text-heading-m text-[var(--color-text-text)]" />,
};

export const Shimmer: Story = {
  args: { effect: 'shimmer', children: 'Now with hourly backups' },
  render: (args) => <TextEffect {...args} as="p" className="text-heading-s font-semibold" />,
};

export const Typewriter: Story = {
  args: { effect: 'typewriter', children: undefined, phrases: ['your shop.', 'your blog.', 'your docs.'] },
  render: (args) => (
    <p className={H}>
      Hosting for <TextEffect {...args} />
    </p>
  ),
  play: async ({ canvasElement }) => {
    // Screen readers get every phrase at once instead of a moving target.
    await expect(within(canvasElement).getByText('your shop., your blog., your docs.')).toHaveClass('sr-only');
  },
};
