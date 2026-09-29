import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Password } from './password';
import { PasswordStrengthMeter } from './password-strength-meter';

const meta: Meta<typeof Password> = {
  title: 'Forms/Password',
  component: Password,
  tags: ['autodocs'],
  args: { widthSize: 'lg' },
  parameters: {
    docs: {
      description: {
        component: 'TextField variant with a show/hide toggle. Shares border/bg/focus/error/success/disabled/read-only styling with TextField, but only two widths (m 200px, l 348px) and no left icon or clear button — the toggle occupies the right slot.',
      },
    },
  },
  argTypes: {
    label: { control: 'text', description: 'Field label, rendered above the input.', table: { category: 'Content' } },
    placeholder: { control: 'text', description: 'Placeholder text shown when the field is empty.', table: { category: 'Content' } },
    description: { control: 'text', description: 'Helper text below the field.', table: { category: 'Content' } },
    required: { control: 'boolean', description: 'Renders the required asterisk on the label.', table: { category: 'Content' } },
    error: { control: 'text', description: 'Error message; turns the field danger-styled.', table: { category: 'State' } },
    success: { control: 'text', description: 'Success message; turns the field success-styled.', table: { category: 'State' } },
    disabled: { control: 'boolean', description: 'Disables the input and the show/hide toggle.', table: { category: 'State' } },
    widthSize: {
      control: 'radio',
      options: ['md', 'lg'],
      description: 'm 200px | l (default) 348px',
      table: { category: 'Appearance' },
    },
    heightSize: {
      control: 'radio',
      options: ['md', 'sm', 'lg'],
      description: 'md (default) 40px, body-m | sm 32px, body-s | lg 48px, body-m — label/value text follows.',
      table: { category: 'Appearance' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Password>;

export const Playground: Story = {
  args: { label: 'Password', placeholder: 'Enter password' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Password');
    const toggle = canvas.getByRole('button', { name: 'Show password' });

    await userEvent.type(input, 'hunter2');
    await expect(input).toHaveAttribute('type', 'password');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(toggle);
    await expect(input).toHaveAttribute('type', 'text');
    await expect(input).toHaveValue('hunter2');
    // Same name, state flips — not a renamed button.
    await expect(canvas.getByRole('button', { name: 'Show password' })).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(toggle);
    await expect(input).toHaveAttribute('type', 'password');
    await expect(input).toHaveValue('hunter2');
  },
};

export const WithDescription: Story = {
  args: {
    label: 'New password',
    description: 'Must be at least 8 characters.',
    placeholder: 'Enter password',
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByLabelText('New password')).toHaveAccessibleDescription('Must be at least 8 characters.');
  },
};

export const WithError: Story = {
  name: 'With error message',
  args: { label: 'Password', error: 'Password is too short.', defaultValue: 'abc' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('Password');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription('Password is too short.');
  },
};

export const WithSuccess: Story = {
  name: 'With success message',
  args: { label: 'Password', success: 'Strong password!', defaultValue: 'correct-horse-battery-staple' },
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Password label="Default" placeholder="Enter password" widthSize="lg" />
      <Password label="Error" error placeholder="Enter password" widthSize="lg" />
      <Password label="Disabled" disabled defaultValue="secret123" widthSize="lg" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Disabled')).toBeDisabled();
    // The toggle is disabled with its field; the others stay usable.
    const toggles = canvas.getAllByRole('button', { name: 'Show password' });
    await expect(toggles).toHaveLength(3);
    await expect(toggles[2]).toBeDisabled();
    await expect(toggles[0]).toBeEnabled();
  },
};

function StrengthMeterDemo() {
  const [pwd, setPwd] = useState('');
  return (
    <div className="flex flex-col gap-3 w-[348px]">
      <Password
        label="Password"
        placeholder="Enter password"
        widthSize="lg"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
      />
      <PasswordStrengthMeter value={pwd} />
    </div>
  );
}

export const StrengthMeter: Story = {
  name: 'Strength meter',
  parameters: {
    docs: {
      description: {
        story:
          'Composition example: Password + the standalone, exported `PasswordStrengthMeter` component ' +
          '(src/components/ui/password-strength-meter.tsx) — both share the same controlled value. ' +
          'Solid color per score band (danger/warning/success), no gradient.',
      },
    },
  },
  render: () => <StrengthMeterDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const meter = canvas.getByRole('progressbar', { name: 'Password strength' });
    await expect(meter).toHaveAttribute('aria-valuenow', '0');
    await expect(meter).toHaveAttribute('aria-valuetext', 'No password entered');

    const input = canvas.getByLabelText('Password');
    await userEvent.type(input, 'abc');
    await expect(meter).toHaveAttribute('aria-valuetext', 'Weak');
    await expect(canvas.getByText('Password strength: Weak')).toBeInTheDocument();
    // Each rule states met / not met, not only via icon and color.
    await expect(canvas.getByText('Lowercase letter')).toHaveTextContent('Lowercase letter, met');
    await expect(canvas.getByText('Number')).toHaveTextContent('Number, not met');

    // lower + upper = 2 of 5 rules.
    await userEvent.type(input, 'DE');
    await expect(meter).toHaveAttribute('aria-valuetext', 'Good');

    // "abcDE12!" meets all five.
    await userEvent.type(input, '12!');
    await expect(meter).toHaveAttribute('aria-valuenow', '100');
    await expect(meter).toHaveAttribute('aria-valuetext', 'Strong');
  },
};
