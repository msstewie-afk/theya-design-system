import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CheckboxGroup, CheckboxGroupItem } from './checkbox-group';

const meta: Meta<typeof CheckboxGroup> = {
  title: 'Forms/CheckboxGroup',
  component: CheckboxGroup,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Group label, rendered as a native <legend> via the underlying <fieldset>.',
      table: { category: 'Content' },
    },
    defaultValue: {
      control: false,
      description: 'Uncontrolled initial set of checked item names.',
      table: { category: 'State' },
    },
    value: {
      control: false,
      description: 'Controlled set of checked item names — pair with `onValueChange`.',
      table: { category: 'State' },
    },
    onValueChange: {
      control: false,
      description: 'Fires with the full checked-name set whenever any item is toggled.',
      table: { category: 'Events' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables every CheckboxGroupItem in the group at once.',
      table: { category: 'Behavior' },
    },
    size: {
      control: 'select',
      options: ['s', 'm'],
      description: 'Checkbox size for every item, unless an item overrides its own.',
      table: { category: 'Appearance', defaultValue: { summary: 'm' } },
    },
    children: {
      control: false,
      description: 'One or more CheckboxGroupItem elements.',
      table: { category: 'Content' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CheckboxGroup>;

export const Default: Story = {
  render: () => (
    <CheckboxGroup label="Notify me by" defaultValue={['email']}>
      <CheckboxGroupItem name="email" label="Email" />
      <CheckboxGroupItem name="sms" label="SMS" />
      <CheckboxGroupItem name="push" label="Push notifications" />
    </CheckboxGroup>
  ),
};

function ControlledDemo() {
  const [value, setValue] = useState<string[]>(['email', 'push']);
  return (
    <div className="flex flex-col gap-2">
      <CheckboxGroup label="Notify me by" value={value} onValueChange={setValue}>
        <CheckboxGroupItem name="email" label="Email" />
        <CheckboxGroupItem name="sms" label="SMS" />
        <CheckboxGroupItem name="push" label="Push notifications" />
      </CheckboxGroup>
      <p className="font-mono text-body-xs text-[var(--color-text-text-subtler)]">
        value: [{value.join(', ')}]
      </p>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
};

export const Disabled: Story = {
  render: () => (
    <CheckboxGroup label="Notify me by" defaultValue={['email']} disabled>
      <CheckboxGroupItem name="email" label="Email" />
      <CheckboxGroupItem name="sms" label="SMS" />
      <CheckboxGroupItem name="push" label="Push notifications" />
    </CheckboxGroup>
  ),
};
