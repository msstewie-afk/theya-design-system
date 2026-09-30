import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
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
      options: ['sm', 'md'],
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
  play: async ({ canvasElement }) => {
    const group = within(within(canvasElement).getByRole('group', { name: 'Notify me by' }));
    await expect(group.getByRole('checkbox', { name: 'Email' })).toBeChecked();
    await userEvent.click(group.getByRole('checkbox', { name: 'SMS' }));
    await expect(group.getByRole('checkbox', { name: 'SMS' })).toBeChecked();
    await expect(group.getByRole('checkbox', { name: 'Email' })).toBeChecked();
    // Space toggles the focused item.
    group.getByRole('checkbox', { name: 'Email' }).focus();
    await userEvent.keyboard(' ');
    await expect(group.getByRole('checkbox', { name: 'Email' })).not.toBeChecked();
  },
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('value: [email, push]')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Email' }));
    await expect(canvas.getByText('value: [push]')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('checkbox', { name: 'SMS' }));
    await expect(canvas.getByText('value: [push, sms]')).toBeInTheDocument();
  },
};

export const Disabled: Story = {
  render: () => (
    <CheckboxGroup label="Notify me by" defaultValue={['email']} disabled>
      <CheckboxGroupItem name="email" label="Email" />
      <CheckboxGroupItem name="sms" label="SMS" />
      <CheckboxGroupItem name="push" label="Push notifications" />
    </CheckboxGroup>
  ),
  play: async ({ canvasElement }) => {
    const boxes = within(canvasElement).getAllByRole('checkbox');
    for (const box of boxes) await expect(box).toBeDisabled();
  },
};
