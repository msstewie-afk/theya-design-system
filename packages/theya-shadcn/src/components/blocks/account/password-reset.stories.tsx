import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { PasswordReset } from './password-reset';
import { passwordResetGuidelines } from './password-reset.guidelines';
import { testOnly } from '../../../lib/test-only';

const meta: Meta<typeof PasswordReset> = {
  title: 'Patterns: Account/PasswordReset',
  component: PasswordReset,
  tags: ['autodocs'],
  parameters: { guidelines: passwordResetGuidelines, layout: 'centered' },
  args: { onRequest: fn(), onReset: fn() },
};
export default meta;
type Story = StoryObj<typeof PasswordReset>;

/** Ask → "check your email" (never says whether the account exists) → resend after a wait or fix the address. */
export const Request: Story = {
  play: testOnly(async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: 'Email' }), 'thea@aether.photo{Enter}');
    await expect(args.onRequest).toHaveBeenCalledWith('thea@aether.photo');
    await waitFor(() => expect(canvas.getByRole('heading', { name: 'Check your email' })).toHaveFocus());
    await expect(canvas.getByText(/If an account exists for/)).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Resend link' })).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'Use a different email' }));
    await expect(canvas.getByRole('textbox', { name: 'Email' })).toHaveValue('thea@aether.photo');
  }),
};

/** Opened from the emailed link. */
export const NewPassword: Story = {
  args: { initialStep: 'reset', defaultEmail: 'thea@aether.photo' },
  play: testOnly(async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByLabelText('New password');
    await userEvent.type(field, 'correct-horse{Enter}');
    await expect(args.onReset).toHaveBeenCalledWith('correct-horse');
    await waitFor(() => expect(canvas.getByRole('heading', { name: 'Password changed' })).toHaveFocus());
    await expect(canvas.getByRole('link', { name: 'Sign in' })).toBeVisible();
  }),
};

/** An old link: one button for a new one, to the same address. */
export const Expired: Story = {
  args: { initialStep: 'expired', defaultEmail: 'thea@aether.photo' },
};
