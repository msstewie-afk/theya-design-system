import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import {
  AnimatedIcon,
  ANIMATED_ICONS,
  CopyAnimated,
  EyeAnimated,
  HeartAnimated,
  MenuAnimated,
  PlusAnimated,
  RefreshAnimated,
} from './animated-icon';
import { Button } from './button';
import { animatedIconGuidelines } from './animated-icon.guidelines';

/** Animated icons — iconoir geometry, CSS motion on hover, on a second state, or as a busy loop. */
const meta = {
  title: 'Motion/AnimatedIcon',
  component: AnimatedIcon,
  tags: ['autodocs'],
  parameters: { layout: 'padded', guidelines: animatedIconGuidelines },
  argTypes: {
    name: { control: 'select', options: Object.keys(ANIMATED_ICONS), description: 'Which icon (or import the named component, e.g. CopyAnimated).' },
    trigger: { control: 'inline-radio', options: ['hover', 'active', 'loop'], description: 'When the motion plays.' },
    active: { control: 'boolean', description: 'Second state (Copy, Plus, Menu, Eye, Heart).' },
  },
  args: { name: 'Copy', trigger: 'hover', active: false },
} satisfies Meta<typeof AnimatedIcon>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Hover or Tab onto a button: its icon plays. */
export const Gallery: Story = {
  render: ({ name: _name, ...args }) => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2">
      {Object.entries(ANIMATED_ICONS).map(([name, Icon]) => (
        <Button key={name} appearance="outlined" tone="neutral" size="2xl" className="h-auto flex-col py-3" leftIcon={<Icon {...args} />}>
          {name}
        </Button>
      ))}
    </div>
  ),
};

/** `trigger="active"`: the second state follows a prop; the change happens even with reduced motion. */
export const States: Story = {
  render: function Render() {
    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [added, setAdded] = useState(false);
    const [liked, setLiked] = useState(false);
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button appearance="outlined" tone="neutral" leftIcon={<CopyAnimated trigger="active" active={copied} />} onClick={() => setCopied((v) => !v)}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button appearance="ghost" tone="neutral" iconOnly aria-label="Menu" aria-expanded={open} leftIcon={<MenuAnimated trigger="active" active={open} />} onClick={() => setOpen((v) => !v)} />
        <Button appearance="ghost" tone="neutral" iconOnly aria-label={hidden ? 'Show password' : 'Hide password'} leftIcon={<EyeAnimated trigger="active" active={hidden} />} onClick={() => setHidden((v) => !v)} />
        <Button appearance="tonal" leftIcon={<PlusAnimated trigger="active" active={added} />} onClick={() => setAdded((v) => !v)}>
          {added ? 'Close' : 'Add'}
        </Button>
        <Button appearance="ghost" tone="danger" iconOnly aria-label="Like" aria-pressed={liked} leftIcon={<HeartAnimated trigger="active" active={liked} />} onClick={() => setLiked((v) => !v)} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Copy' }));
    await expect(canvas.getByRole('button', { name: 'Copied' }).querySelector('[data-slot=animated-icon]')).toHaveAttribute('data-active');
    await userEvent.click(canvas.getByRole('button', { name: 'Menu' }));
    await expect(canvas.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'true');
  },
};

/** `trigger="loop"`: only while something is busy. */
export const Busy: Story = {
  render: () => (
    <Button appearance="outlined" tone="neutral" disabled leftIcon={<RefreshAnimated trigger="loop" />}>
      Refreshing…
    </Button>
  ),
};
