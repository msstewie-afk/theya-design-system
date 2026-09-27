import type { Meta, StoryObj } from '@storybook/react';
import { Bold, Italic, Underline } from 'iconoir-react';
import { Toggle } from './toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Actions/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: ['tonal', 'outline', 'ghost'], description: 'Fill style.', table: { category: 'Appearance' } },
    size: { control: 'radio', options: ['s', 'md', 'lg'], description: 'Toggle size.', table: { category: 'Appearance' } },
    disabled: { control: 'boolean', description: 'Disables the toggle.', table: { category: 'State' } },
    pressed: { control: 'boolean', description: 'Controlled pressed state.', table: { category: 'State' } },
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Playground: Story = {
  args: { 'aria-label': 'Bold' },
  render: (args) => (
    <Toggle {...args}>
      <Bold /> Bold
    </Toggle>
  ),
};

export const IconOnly: Story = {
  args: { 'aria-label': 'Bold' },
  render: (args) => (
    <Toggle {...args}>
      <Bold />
    </Toggle>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex gap-3">
      <Toggle variant="tonal" aria-label="Bold">
        <Bold />
      </Toggle>
      <Toggle variant="outline" aria-label="Italic">
        <Italic />
      </Toggle>
      <Toggle variant="ghost" aria-label="Underline">
        <Underline />
      </Toggle>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Toggle size="s" aria-label="Bold">
        <Bold />
      </Toggle>
      <Toggle size="md" aria-label="Bold">
        <Bold />
      </Toggle>
      <Toggle size="lg" aria-label="Bold">
        <Bold />
      </Toggle>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex gap-3">
      <Toggle aria-label="Unpressed">
        <Underline />
      </Toggle>
      <Toggle defaultPressed aria-label="Pressed">
        <Underline />
      </Toggle>
      <Toggle disabled aria-label="Disabled">
        <Underline />
      </Toggle>
    </div>
  ),
};
