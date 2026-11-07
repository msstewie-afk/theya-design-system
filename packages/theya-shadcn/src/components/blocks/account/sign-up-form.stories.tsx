import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { SignUpForm } from './sign-up-form';
import { signUpFormGuidelines } from './sign-up-form.guidelines';

const meta: Meta<typeof SignUpForm> = {
  title: 'Patterns: Account/SignUpForm',
  component: SignUpForm,
  tags: ['autodocs'],
  parameters: { guidelines: signUpFormGuidelines, layout: 'centered' },
  args: { onSubmit: fn(), onSso: fn() },
};
export default meta;
type Story = StoryObj<typeof SignUpForm>;

/** Two fields; the password rule is visible up front and counts down; news is opt-in. */
export const Default: Story = {};

/** The email already has an account: say so and point to sign-in / reset. */
export const EmailTaken: Story = {
  args: {
    error: (
      <>
        {'There’s already an account for this email. '}
        <a href="#sign-in" className="rounded-[var(--size-border-radius-border-radius-sm)] font-medium no-underline underline-offset-4 outline-none hover:underline focus-visible:focus-ring">
          Sign in
        </a>
        {' or '}
        <a href="#reset" className="rounded-[var(--size-border-radius-border-radius-sm)] font-medium no-underline underline-offset-4 outline-none hover:underline focus-visible:focus-ring">
          reset the password
        </a>
        .
      </>
    ),
  },
};

/** Submitted with a short password: focus moves to it, and its description says what to change (WCAG 3.3.1). */
export const ShortPassword: Story = {
  name: 'Short password',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const password = canvas.getByLabelText('Password');
    await userEvent.type(canvas.getByRole('textbox', { name: 'Work email' }), 'elio@aether.photo');
    await userEvent.type(password, 'abc');
    await userEvent.click(canvas.getByRole('button', { name: 'Create account' }));
    await expect(password).toHaveFocus();
    await expect(password).toHaveAttribute('aria-invalid', 'true');
    await expect(password).toHaveAccessibleDescription(/Use at least 8 characters/);
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

/** Interaction test for Default, kept out of Default so Default opens untouched. */
export const TestInteractions: Story = {
  ...Default,
  name: 'Test: interactions',
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const password = canvas.getByLabelText('Password');
    await expect(password).toHaveAccessibleDescription('At least 8 characters.');
    await userEvent.type(canvas.getByRole('textbox', { name: 'Work email' }), 'elio@aether.photo');
    await userEvent.type(password, 'abc');
    await expect(password).toHaveAccessibleDescription('5 more characters');
    await userEvent.click(canvas.getByRole('button', { name: 'Create account' }));
    await expect(password).toHaveFocus();
    await expect(password).toHaveAccessibleDescription(/Use at least 8 characters/);
    await expect(args.onSubmit).not.toHaveBeenCalled();

    await userEvent.type(password, 'defgh');
    await expect(canvas.getByRole('checkbox', { name: /product news/ })).not.toBeChecked();
    await userEvent.click(canvas.getByRole('button', { name: 'Create account' }));
    await expect(args.onSubmit).toHaveBeenCalledWith({ email: 'elio@aether.photo', password: 'abcdefgh', news: false });
  },
};
