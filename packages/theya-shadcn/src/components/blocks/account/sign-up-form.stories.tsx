import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { SignUpForm } from './sign-up-form';

const meta: Meta<typeof SignUpForm> = {
  title: 'Patterns: Account/SignUpForm',
  component: SignUpForm,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { onSubmit: fn(), onSso: fn() },
};
export default meta;
type Story = StoryObj<typeof SignUpForm>;

/** Two fields; the password rule is visible up front and counts down; news is opt-in. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const password = canvas.getByLabelText('Password');
    await expect(password).toHaveAccessibleDescription('At least 8 characters.');
    await userEvent.type(canvas.getByRole('textbox', { name: 'Work email' }), 'dana@seashell.shop');
    await userEvent.type(password, 'abc');
    await expect(password).toHaveAccessibleDescription('5 more characters');
    await userEvent.click(canvas.getByRole('button', { name: 'Create account' }));
    await expect(password).toHaveFocus();
    await expect(password).toHaveAccessibleDescription(/Use at least 8 characters/);
    await expect(args.onSubmit).not.toHaveBeenCalled();

    await userEvent.type(password, 'defgh');
    await expect(canvas.getByRole('checkbox', { name: /product news/ })).not.toBeChecked();
    await userEvent.click(canvas.getByRole('button', { name: 'Create account' }));
    await expect(args.onSubmit).toHaveBeenCalledWith({ email: 'dana@seashell.shop', password: 'abcdefgh', news: false });
  },
};

/** The email already has an account: say so and point to sign-in / reset. */
export const EmailTaken: Story = {
  args: {
    error: (
      <>
        {'There’s already an account for this email. '}
        <a href="#sign-in" className="font-medium underline underline-offset-4">
          Sign in
        </a>
        {' or '}
        <a href="#reset" className="font-medium underline underline-offset-4">
          reset the password
        </a>
        .
      </>
    ),
  },
};
