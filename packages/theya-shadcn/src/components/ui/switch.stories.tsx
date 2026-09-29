import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { Switch } from './switch';

const meta: Meta<typeof Switch> = {
  title: 'Forms/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'Built on Radix Switch. Uncontrolled by default via `defaultChecked`.' } },
  },
  argTypes: {
    label: { control: 'text', description: 'Label text next to the switch.', table: { category: 'Content' } },
    description: { control: 'text', description: 'Secondary helper line under the label.', table: { category: 'Content' } },
    tone: { control: 'radio', options: ['primary', 'warning', 'danger'], description: 'Color when on.', table: { category: 'Appearance' } },
    checkIcon: { control: 'boolean', description: 'Shows a checkmark inside the thumb when on. Default true.', table: { category: 'Appearance' } },
    disabled: { control: 'boolean', description: 'Disables the switch.', table: { category: 'State' } },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Playground: Story = {
  args: { label: 'Enable notifications', onCheckedChange: fn() },
  // Label click and Space both toggle; state is exposed as aria-checked.
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch', { name: 'Enable notifications' });
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(canvas.getByText('Enable notifications'));
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);

    toggle.focus();
    await userEvent.keyboard(' ');
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
  },
};

export const Bare: Story = {
  name: 'No label',
  args: { 'aria-label': 'Toggle dark mode' },
};

export const WithDescription: Story = {
  args: {
    label: 'Marketing emails',
    description: 'Receive occasional updates about new features.',
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('switch', { name: 'Marketing emails' })).toHaveAccessibleDescription(
      'Receive occasional updates about new features.',
    );
  },
};

export const NoCheckIcon: Story = {
  name: 'checkIcon = false',
  args: { label: 'Plain toggle, no checkmark', defaultChecked: true, checkIcon: false },
};

export const AllStates: Story = {
  name: 'All states (from Figma)',
  render: () => (
    <div className="flex flex-col gap-4">
      <Switch label="On" defaultChecked />
      <Switch label="On disabled" defaultChecked disabled />
      <Switch label="Off" />
      <Switch label="Off disabled" disabled />
      <Switch label="On warning" tone="warning" defaultChecked />
      <Switch label="On warning disabled" tone="warning" defaultChecked disabled />
      <Switch label="On danger" tone="danger" defaultChecked />
      <Switch label="On danger disabled" tone="danger" defaultChecked disabled />
    </div>
  ),
};

export const Intents: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Switch label="Primary" tone="primary" defaultChecked />
      <Switch label="Warning" tone="warning" defaultChecked />
      <Switch label="Danger" tone="danger" defaultChecked />
    </div>
  ),
};
