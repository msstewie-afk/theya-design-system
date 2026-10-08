import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { toast } from '../ui/sonner';
import { Preferences } from './preferences';

const meta: Meta<typeof Preferences> = {
  title: 'Patterns/Preferences',
  component: Preferences,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    account: { control: false, description: '{ fullName, email } shown in the profile section.', table: { category: 'Content' } },
    recoveryCode: { control: 'text', description: 'Shown once, in a dialog, right after two-factor is enabled — never on the page.', table: { category: 'Content' } },
    notifications: { control: false, description: 'Notification toggle rows. Pass [] to omit the Notifications section.', table: { category: 'Content' } },
    onSaveProfile: { control: false, description: 'Called when the profile form is submitted.', table: { category: 'Events' } },
    onChangePassword: { control: false, description: 'Called when the change-password form is submitted.', table: { category: 'Events' } },
    onEnableTwoFactor: { control: false, description: 'Called with the entered code when two-factor is enabled.', table: { category: 'Events' } },
    onNotificationChange: { control: false, description: 'Fired when a notification switch is flipped — persist it here.', table: { category: 'Events' } },
    twoFactorEnabled: { control: 'boolean', description: 'Two-factor already on: status + "Generate new code" instead of the setup form.', table: { category: 'State' } },
    onRegenerateRecoveryCode: { control: false, description: 'Returns a fresh recovery code; the old one should stop working.', table: { category: 'Events' } },
    navLabel: { control: 'text', description: 'Accessible name of the section nav; give each screen its own when two share a page.', table: { category: 'Content' } },
    idPrefix: { control: 'text', description: 'Prefix for section ids. Readable by default (links like /settings#security keep working); set it when two Preferences blocks share a page.', table: { category: 'Behavior' } },
    onDeleteAccount: { control: false, description: 'Called when account deletion is confirmed.', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<typeof Preferences>;

const body = () => within(document.body);
const onSave = fn();
const onPassword = fn();
const formValues = (e: React.FormEvent<HTMLFormElement>) => Object.fromEntries(new FormData(e.currentTarget));

/** Every section end to end: profile save, password validation, 2FA, a notification switch, typed-confirm delete. */
export const Default: Story = {
  args: { onEnableTwoFactor: fn(), onRegenerateRecoveryCode: fn(() => 'NEW1-CODE-2345-6789'), onNotificationChange: fn(), onDeleteAccount: fn() },
  render: (args) => (
    <div className="p-6">
      <Preferences {...args} onSaveProfile={(e) => onSave(formValues(e))} onChangePassword={(e) => onPassword(formValues(e))} />
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

    // Two-factor: no recovery code on the page before setup.
    await expect(canvasElement).not.toHaveTextContent('K7Q2-9MTX-4BWP-1ZHL');
    const verify = canvas.getByRole('button', { name: 'Verify code' });
    await expect(verify).toBeDisabled();
    await userEvent.click(canvas.getByRole('textbox', { name: 'Enter the 6-digit code' }));
    await userEvent.keyboard('12345');
    await expect(verify).toBeDisabled();
    // Enter verifies too (the field is in a form now).
    await userEvent.keyboard('6{Enter}');
    await expect(args.onEnableTwoFactor).toHaveBeenCalledWith('123456');

    // The code appears once, in a dialog; the page shows status instead.
    let codeDialog = await body().findByRole('dialog', { name: 'Save your recovery code' });
    await expect(codeDialog).toHaveTextContent('K7Q2-9MTX-4BWP-1ZHL');
    await expect(canvas.queryByRole('button', { name: 'Verify code' })).toBeNull();
    await userEvent.click(within(codeDialog).getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(body().queryByRole('dialog')).toBeNull());
    const regenerate = canvas.getByRole('button', { name: 'Generate new code' });
    await waitFor(() => expect(regenerate).toHaveFocus());
    await expect(canvasElement).not.toHaveTextContent('K7Q2-9MTX-4BWP-1ZHL');

    // Regenerate: behind a confirm, then a new code, once.
    await userEvent.click(regenerate);
    const confirmRegen = await body().findByRole('alertdialog', { name: 'Generate a new recovery code?' });
    await userEvent.click(within(confirmRegen).getByRole('button', { name: 'Generate new code' }));
    await waitFor(() => expect(args.onRegenerateRecoveryCode).toHaveBeenCalledTimes(1));
    codeDialog = await body().findByRole('dialog', { name: 'Save your recovery code' });
    await expect(codeDialog).toHaveTextContent('NEW1-CODE-2345-6789');
    await userEvent.click(within(codeDialog).getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(body().queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Generate new code' })).toHaveFocus());
    toast.dismiss();

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
      <Preferences notifications={[]} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('heading', { name: 'Notifications' })).toBeNull();
    await expect(canvas.queryByRole('link', { name: 'Notifications', hidden: true })).toBeNull();
    await expect(canvas.getByRole('heading', { name: 'Danger zone' })).toBeInTheDocument();
  },
};

/**
 * Two screens on one page: with `idPrefix` on the second, no id repeats and
 * every section link lands in its own screen. Section ids stay readable
 * (`#security`) for deep links.
 */
export const TwoOnOnePage: Story = {
  name: 'Two on one page',
  render: () => (
    <div className="flex flex-col gap-16 p-6">
      <Preferences />
      <Preferences idPrefix="team-" navLabel="Team settings sections" account={{ fullName: 'Seashell team', email: 'team@seashell.dev' }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const ids = [...canvasElement.querySelectorAll('[id]')].map((el) => el.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    await expect(dupes).toEqual([]);
    await expect(canvasElement.querySelector('#security')).not.toBeNull();
    await expect(canvasElement.querySelector('#team-security')).not.toBeNull();
    // Each screen's nav points into its own sections.
    const navs = canvasElement.querySelectorAll('nav[aria-label$="ettings sections"]');
    await expect(navs).toHaveLength(2);
    navs.forEach((nav, i) => {
      for (const a of nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
        const target = document.getElementById(a.getAttribute('href')!.slice(1));
        expect(target).not.toBeNull();
        expect(target!.id.startsWith('team-')).toBe(i === 1);
      }
    });
  },
};
