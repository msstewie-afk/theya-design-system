import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { LoginForm } from './login-form';

const meta: Meta<typeof LoginForm> = {
  title: 'Patterns/LoginForm',
  component: LoginForm,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    onSubmit: { control: false, description: 'Fires on form submit.', table: { category: 'Events' } },
    appName: { control: 'text', description: 'Product name shown in the heading and on the brand mark.', table: { category: 'Content' } },
    forgotHref: { control: 'text', description: '"Forgot password" link target.', table: { category: 'Content' } },
    signupHref: { control: 'text', description: 'Sign-up link target.', table: { category: 'Content' } },
    showSso: { control: 'boolean', description: 'Show the "or continue with" single sign-on row.', table: { category: 'Appearance' } },
    onSso: { control: false, description: 'Fired by "Continue with GitHub".', table: { category: 'Events' } },
    card: {
      control: 'boolean',
      description: 'Wrap the fields in a bordered Card. Turn off when the form already sits in its own visually distinct area (e.g. the right pane of LoginFormSplit).',
      table: { category: 'Appearance' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoginForm>;

const onSignIn = fn();

/** Empty and malformed input is caught on the fields before onSubmit; valid credentials go through. */
export const Default: Story = {
  args: { onSso: fn() },
  render: (args) => (
    <div className="flex min-h-[600px] items-center justify-center p-6">
      <LoginForm
        onSso={args.onSso}
        onSubmit={(e) => {
          e.preventDefault();
          onSignIn(Object.fromEntries(new FormData(e.currentTarget)));
        }}
      />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    onSignIn.mockClear();
    const email = canvas.getByRole('textbox', { name: 'Email' });
    const password = canvas.getByLabelText('Password');
    const signIn = canvas.getByRole('button', { name: 'Sign in' });

    await userEvent.click(signIn);
    await waitFor(() => expect(email).toHaveAccessibleDescription('Enter your email.'));
    await expect(password).toHaveAccessibleDescription('Enter your password.');
    await expect(email).toHaveFocus();
    await expect(onSignIn).not.toHaveBeenCalled();

    await userEvent.type(email, 'dana@');
    await userEvent.click(signIn);
    await waitFor(() => expect(email).toHaveAccessibleDescription('Enter a valid email address.'));

    // Email fixed: the password is now the first invalid field.
    await userEvent.type(email, 'seashell.dev');
    await userEvent.click(signIn);
    await waitFor(() => expect(password).toHaveFocus());
    await expect(email).not.toHaveAttribute('aria-invalid', 'true');

    // Enter submits; the values reach onSubmit.
    await userEvent.type(password, 'correct-horse{Enter}');
    await waitFor(() => expect(onSignIn).toHaveBeenCalledWith({ email: 'dana@seashell.dev', password: 'correct-horse', remember: 'on' }));

    await userEvent.click(canvas.getByRole('button', { name: 'Continue with GitHub' }));
    await expect(args.onSso).toHaveBeenCalledTimes(1);
  },
};

export const NoSso: Story = {
  name: 'No SSO',
  render: () => (
    <div className="flex min-h-[600px] items-center justify-center p-6">
      <LoginForm showSso={false} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button', { name: 'Continue with GitHub' })).toBeNull();
  },
};

/** A failed sign-in from your auth call: the reason and the next step sit above the fields, the email stays. */
export const SignInError: Story = {
  name: 'Sign-in error',
  render: () => (
    <div className="flex min-h-[600px] items-center justify-center p-6">
      <LoginForm error="That email and password don't match. Check the password, or reset it below." />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('alert')).toHaveTextContent("That email and password don't match.");
  },
};
