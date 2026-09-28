import type { Meta, StoryObj } from '@storybook/react';
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from 'iconoir-react';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';

const meta: Meta<typeof ToggleGroup> = {
  title: 'Actions/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
  argTypes: {
    appearance: { control: 'radio', options: ['tonal', 'outlined', 'ghost'], description: 'Flows to every item via context. Default ghost.' },
    size: { control: 'radio', options: ['s', 'md', 'lg'], description: 'Flows to every item via context.' },
    type: { control: 'inline-radio', options: ['single', 'multiple'], description: 'Single or multiple selection.' },
    value: { control: false, description: 'Controlled value(s) — a string for type="single", an array for type="multiple".' },
    defaultValue: { control: false, description: 'Uncontrolled initial value(s).' },
    onValueChange: { control: false, description: 'Fires with the new value(s) on selection change.' },
    disabled: { control: 'boolean', description: 'Disables every item in the group.' },
  },
};

export default meta;
type Story = StoryObj<typeof ToggleGroup>;

export const Outline: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="left" appearance="outlined">
      <ToggleGroupItem value="left" aria-label="Align left">
        <AlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <AlignCenter />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <AlignRight />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Tonal: Story = {
  render: () => (
    <ToggleGroup type="multiple" appearance="tonal">
      <ToggleGroupItem value="bold" aria-label="Bold">
        <Bold />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <Italic />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <Underline />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Ghost: Story = {
  render: () => (
    <ToggleGroup type="multiple" appearance="ghost">
      <ToggleGroupItem value="bold" aria-label="Bold">
        <Bold />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <Italic />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <Underline />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};
