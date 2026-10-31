import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Password } from './password';
import { PasswordStrengthMeter } from './password-strength-meter';
import { passwordGuidelines } from './password.guidelines';
import { resetFocus, tabTo } from '../../test/keyboard';

// Notes moved from the Docs description (the page now shows a reader-facing
// summary):
//   TextField variant with a show/hide toggle. Shares
//   border/bg/focus/error/success/disabled/read-only styling with TextField,
//   but only two widths (m 200px, l 348px) and no left icon or clear button —
//   the toggle occupies the right slot.
const meta: Meta<typeof Password> = {
  title: 'Text Input/Password',
  component: Password,
  tags: ['autodocs'],
  args: { widthSize: 'lg' },
  parameters: {
    guidelines: passwordGuidelines,
    docs: {
      description: {
        component: "Signing in, or setting and changing a password, with a button to show what was typed.",
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

/** The interactive example driven by the Controls below; the eye button shows or hides what was typed without clearing it. */
export const Playground: Story = {
  args: { label: 'Password', placeholder: 'Enter password' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Password');
    const toggle = canvas.getByRole('button', { name: 'Show password' });

    await userEvent.type(input, 'hunter2');
    await expect(input).toHaveAttribute('type', 'password');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');

    // Keyboard: the eye button is the next tab stop after the field; Enter toggles.
    await tabTo(toggle);
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveAttribute('type', 'text');
    await expect(input).toHaveValue('hunter2');
    // Same name, state flips — not a renamed button.
    await expect(canvas.getByRole('button', { name: 'Show password' })).toHaveAttribute('aria-pressed', 'true');

    await userEvent.keyboard(' ');
    await expect(input).toHaveAttribute('type', 'password');
    await expect(input).toHaveValue('hunter2');
  },
};

/** `description` adds helper text under the field — state the rules before people start typing. */
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

/** `error` turns the field danger-styled and reads the message as the input's description. */
export const WithError: Story = {
  name: 'With error message',
  args: { label: 'Password', autoComplete: 'new-password', error: 'Password is too short.', defaultValue: 'abc' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('Password');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription('Password is too short.');
  },
};

/** `success` confirms the value with a success-styled field and message. */
export const WithSuccess: Story = {
  name: 'With success message',
  args: { label: 'Password', autoComplete: 'new-password', success: 'Strong password!', defaultValue: 'correct-horse-battery-staple' },
};

/** Default, error and disabled side by side; in the disabled field the show/hide toggle is disabled too. */
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Password label="Default" placeholder="Enter password" widthSize="lg" />
      <Password label="Error" error="Password is too short." placeholder="Enter password" widthSize="lg" />
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
    <div className="flex flex-col gap-3 w-full max-w-[348px]">
      <Password
        label="Password"
        autoComplete="new-password"
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
