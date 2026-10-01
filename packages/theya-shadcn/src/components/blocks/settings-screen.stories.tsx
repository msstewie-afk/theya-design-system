import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { SettingsScreen } from './settings-screen';

const meta: Meta<typeof SettingsScreen> = {
  title: 'Patterns/SettingsScreen',
  component: SettingsScreen,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    account: { control: false, description: '{ fullName, email } shown in the profile section.', table: { category: 'Content' } },
    recoveryCode: { control: 'text', description: 'Recovery code shown once after enabling two-factor.', table: { category: 'Content' } },
    notifications: { control: false, description: 'Notification toggle rows. Pass [] to omit the Notifications section.', table: { category: 'Content' } },
    onSaveProfile: { control: false, description: 'Called when the profile form is submitted.', table: { category: 'Events' } },
    onChangePassword: { control: false, description: 'Called when the change-password form is submitted.', table: { category: 'Events' } },
    onEnableTwoFactor: { control: false, description: 'Called with the entered code when two-factor is enabled.', table: { category: 'Events' } },
    onNotificationChange: { control: false, description: 'Fired when a notification switch is flipped — persist it here.', table: { category: 'Events' } },
    onDeleteAccount: { control: false, description: 'Called when account deletion is confirmed.', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<typeof SettingsScreen>;

const body = () => within(document.body);
const onSave = fn();
const onPassword = fn();
const formValues = (e: React.FormEvent<HTMLFormElement>) => Object.fromEntries(new FormData(e.currentTarget));

/** Every section end to end: profile save, password validation, 2FA, a notification switch, typed-confirm delete. */
export const Default: Story = {
  args: { onEnableTwoFactor: fn(), onNotificationChange: fn(), onDeleteAccount: fn() },
  render: (args) => (
    <div className="p-6">
      <SettingsScreen {...args} onSaveProfile={(e) => onSave(formValues(e))} onChangePassword={(e) => onPassword(formValues(e))} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    onSave.mockClear();
    onPassword.mockClear();

    // Profile: the submit button submits (it didn't before 94c520f).
    const name = canvas.getByLabelText('Full name');
    await userEvent.clear(name);
    await userEvent.type(name, 'Dana O.');
    await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ fullName: 'Dana O.', email: 'dana.okafor@seashell.dev' }));

    // Password: required, 8+ characters, must differ; first invalid field takes focus.
    const current = canvas.getByLabelText('Current password');
    const next = canvas.getByLabelText('New password');
    const update = canvas.getByRole('button', { name: 'Update password' });
    await userEvent.click(update);
    await waitFor(() => expect(current).toHaveAccessibleDescription('Enter your current password.'));
    await waitFor(() => expect(next).toHaveAccessibleDescription('Enter a new password.'));
    await waitFor(() => expect(current).toHaveFocus());
    await userEvent.type(current, 'old-pass-1');
    await userEvent.type(next, 'short');
    await userEvent.click(update);
    await waitFor(() => expect(next).toHaveAccessibleDescription('Use at least 8 characters.'));
    await waitFor(() => expect(next).toHaveFocus());
    // Typing clears the error without remounting the field: the same
    // element keeps its value and focus (a bare TextField used to remount
    // when its message appeared/cleared, wiping both).
    await userEvent.type(next, 'x');
    await waitFor(() => expect(next).not.toHaveAttribute('aria-invalid'));
    await expect(next.isConnected).toBe(true);
    await expect(next).toHaveValue('shortx');
    await expect(next).toHaveFocus();
    await userEvent.clear(next);
    await userEvent.type(next, 'old-pass-1');
    await userEvent.click(update);
    await waitFor(() => expect(next).toHaveAccessibleDescription('Choose a password different from the current one.'));
    await expect(onPassword).not.toHaveBeenCalled();
    await userEvent.clear(next);
    await userEvent.type(next, 'new-pass-22');
    await userEvent.click(update);
    await waitFor(() => expect(onPassword).toHaveBeenCalledWith({ currentPassword: 'old-pass-1', newPassword: 'new-pass-22' }));
    await expect(next).not.toHaveAttribute('aria-invalid', 'true');

    // Two-factor: Verify stays disabled until all six digits are in.
    const verify = canvas.getByRole('button', { name: 'Verify code' });
    await expect(verify).toBeDisabled();
    await userEvent.click(canvas.getByRole('textbox', { name: 'Enter the 6-digit code' }));
    await userEvent.keyboard('12345');
    await expect(verify).toBeDisabled();
    await userEvent.keyboard('6');
    await expect(verify).toBeEnabled();
    await userEvent.click(verify);
    await expect(args.onEnableTwoFactor).toHaveBeenCalledWith('123456');

    // Notification switches report to the host ("changes apply immediately").
    const weekly = canvas.getByRole('switch', { name: 'Weekly summary' });
    await expect(weekly).not.toBeChecked();
    await userEvent.click(weekly);
    await expect(args.onNotificationChange).toHaveBeenCalledWith('weekly-summary', true);

    // Delete: typed confirmation gates the action.
    await userEvent.click(canvas.getByRole('button', { name: 'Delete account' }));
    const dialog = await body().findByRole('alertdialog', { name: 'Delete your account?' });
    const confirm = within(dialog).getByRole('button', { name: 'Delete account' });
    await expect(confirm).toBeDisabled();
    await userEvent.type(within(dialog).getByRole('textbox'), 'dana.okafor@seashell.dev');
    await expect(confirm).toBeEnabled();
    await userEvent.click(confirm);
    await expect(args.onDeleteAccount).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(body().queryByRole('alertdialog')).toBeNull());
  },
};

export const NoNotifications: Story = {
  name: 'No notifications section',
  render: () => (
    <div className="p-6">
      <SettingsScreen notifications={[]} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('heading', { name: 'Notifications' })).toBeNull();
    await expect(canvas.queryByRole('link', { name: 'Notifications', hidden: true })).toBeNull();
    await expect(canvas.getByRole('heading', { name: 'Danger zone' })).toBeInTheDocument();
  },
};
