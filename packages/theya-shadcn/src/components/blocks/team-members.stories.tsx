import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { toast } from '../ui/sonner';
import { TeamMembers } from './team-members';

const meta: Meta<typeof TeamMembers> = {
  title: 'Patterns/TeamMembers',
  component: TeamMembers,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    title: { control: 'text', description: 'Section heading.', table: { category: 'Content' } },
    description: { control: 'text', description: 'Supporting copy under the title.', table: { category: 'Content' } },
    members: { control: false, description: 'Active team members listed in the table.', table: { category: 'Content' } },
    invites: { control: false, description: 'Pending invitations listed below the members table.', table: { category: 'Content' } },
    roles: { control: false, description: 'Selectable roles offered in the role picker.', table: { category: 'Content' } },
    currentUserId: { control: 'text', description: 'Id of the signed-in member: its row shows "You" and locks role + removal.', table: { category: 'Behavior' } },
    onInvite: { control: false, description: 'Called with the email and role when a new invite is sent.', table: { category: 'Events' } },
    onChangeRole: { control: false, description: "Called with the member and new role when a member's role is changed.", table: { category: 'Events' } },
    onRemoveMember: { control: false, description: 'Called when a member is removed.', table: { category: 'Events' } },
    onResendInvite: { control: false, description: 'Called when a pending invite is resent.', table: { category: 'Events' } },
    onRevokeInvite: { control: false, description: 'Called when a pending invite is revoked.', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<typeof TeamMembers>;

const body = () => within(document.body);
const toastByTitle = (title: string) => body().findByText(title, { selector: '[data-title]' });
async function clearToasts() {
  toast.dismiss();
  await waitFor(() => expect(document.querySelectorAll('[data-sonner-toast]')).toHaveLength(0), { timeout: 3000 });
}

const memberNames = (canvasElement: HTMLElement) =>
  within(canvasElement)
    .getAllByRole('row')
    .slice(1)
    .map((row) => row.querySelector('.font-medium')?.textContent);
const inviteEmails = (canvasElement: HTMLElement) =>
  [...canvasElement.querySelectorAll('ul[role="list"] > li')].map((li) => li.querySelector('.font-medium')?.textContent);

/** Picks a Select option by keyboard (type-ahead) — Radix Select ignores synthetic pointer picks. */
async function pickByKeyboard(trigger: HTMLElement, letter: string, expected: string) {
  trigger.focus();
  await userEvent.keyboard('{Enter}');
  const listbox = await body().findByRole('listbox');
  await userEvent.keyboard(letter);
  await waitFor(() => expect(within(listbox).getByRole('option', { name: expected })).toHaveFocus());
  await userEvent.keyboard('{Enter}');
  await waitFor(() => expect(body().queryByRole('listbox')).toBeNull());
}

/** Invite validation, role change, remove + undo, resend, revoke + undo. */
export const Default: Story = {
  args: { onInvite: fn(), onChangeRole: fn(), onRemoveMember: fn(), onResendInvite: fn(), onRevokeInvite: fn() },
  render: (args) => (
    <div className="p-6">
      <TeamMembers {...args} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const emailInput = canvas.getByLabelText('Email address');
    const send = canvas.getByRole('button', { name: 'Send invite' });
    await expect(memberNames(canvasElement)).toEqual(['Alex Morgan', 'Jordan Kim', 'Priya Nair', 'Sam Okoro']);
    // The signed-in owner can't be removed or re-roled.
    await expect(canvas.queryByRole('button', { name: 'Remove Alex Morgan' })).toBeNull();
    await expect(canvas.queryByRole('combobox', { name: 'Role for Alex Morgan' })).toBeNull();

    // Empty submit now says why, and puts focus back on the field.
    await userEvent.click(send);
    await expect(await canvas.findByRole('alert')).toHaveTextContent('Enter an email address.');
    await expect(emailInput).toHaveFocus();
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    await expect(emailInput).toHaveAccessibleDescription('Enter an email address.');

    await userEvent.type(emailInput, 'nope');
    await expect(canvas.getByRole('alert')).toHaveTextContent('An email address needs an @, e.g. name@example.com.');
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'Priya@seashell.dev');
    await expect(canvas.getByRole('alert')).toHaveTextContent('This person is already a member.');
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'dana@contractor.dev');
    await expect(canvas.getByRole('alert')).toHaveTextContent('This email already has a pending invite.');
    await userEvent.click(send);
    await expect(args.onInvite).not.toHaveBeenCalled();

    // A valid invite, with a non-default role.
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'new@seashell.dev');
    await expect(canvas.queryByRole('alert')).toBeNull();
    await userEvent.click(canvas.getByRole('radio', { name: 'Billing' }));
    await userEvent.click(send);
    await expect(args.onInvite).toHaveBeenCalledWith('new@seashell.dev', 'billing');
    await expect(inviteEmails(canvasElement)[0]).toBe('new@seashell.dev');
    await expect(await toastByTitle('Invite sent')).toBeInTheDocument();
    await expect(emailInput).toHaveValue('');
    await expect(canvas.queryByRole('alert')).toBeNull();
    await clearToasts();

    // Role change.
    await pickByKeyboard(canvas.getByRole('combobox', { name: 'Role for Priya Nair' }), 'a', 'Admin');
    await expect(args.onChangeRole).toHaveBeenCalledWith(expect.objectContaining({ name: 'Priya Nair', role: 'admin' }), 'admin');
    await expect(canvas.getByRole('combobox', { name: 'Role for Priya Nair' })).toHaveTextContent('Admin');
    await clearToasts();

    // Remove behind a confirm, undo puts the member back in place.
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Sam Okoro' }));
    const removeDialog = await body().findByRole('alertdialog', { name: 'Remove Sam Okoro?' });
    await userEvent.click(within(removeDialog).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(memberNames(canvasElement)).toEqual(['Alex Morgan', 'Jordan Kim', 'Priya Nair']));
    await expect(canvas.getByText(/people have access/)).toHaveTextContent('3 people have access');
    await expect(args.onRemoveMember).toHaveBeenCalledWith(expect.objectContaining({ name: 'Sam Okoro' }));
    const removed = (await toastByTitle('Member removed')).closest('[data-sonner-toast]') as HTMLElement;
    await userEvent.click(within(removed).getByRole('button', { name: 'Undo' }));
    await waitFor(() => expect(memberNames(canvasElement)).toEqual(['Alex Morgan', 'Jordan Kim', 'Priya Nair', 'Sam Okoro']));
    await clearToasts();

    // Invite buttons are named per invite.
    await userEvent.click(canvas.getByRole('button', { name: 'Resend invite to lee@seashell.dev' }));
    await expect(args.onResendInvite).toHaveBeenCalledWith(expect.objectContaining({ email: 'lee@seashell.dev' }));
    await expect(await toastByTitle('Invite resent')).toBeInTheDocument();
    await clearToasts();

    await userEvent.click(canvas.getByRole('button', { name: 'Revoke invite for dana@contractor.dev' }));
    const revokeDialog = await body().findByRole('alertdialog', { name: 'Revoke this invite?' });
    await userEvent.click(within(revokeDialog).getByRole('button', { name: 'Revoke' }));
    await waitFor(() => expect(inviteEmails(canvasElement)).toEqual(['new@seashell.dev', 'lee@seashell.dev']));
    await expect(args.onRevokeInvite).toHaveBeenCalledWith(expect.objectContaining({ email: 'dana@contractor.dev' }));
    const revoked = (await toastByTitle('Invite revoked')).closest('[data-sonner-toast]') as HTMLElement;
    await userEvent.click(within(revoked).getByRole('button', { name: 'Undo' }));
    await waitFor(() => expect(inviteEmails(canvasElement)).toEqual(['new@seashell.dev', 'dana@contractor.dev', 'lee@seashell.dev']));
    await clearToasts();
  },
};

/** No invites: the empty state gives way to the list on the first invite. */
export const NoPendingInvites: Story = {
  name: 'No pending invites',
  render: () => (
    <div className="p-6">
      <TeamMembers invites={[]} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'No pending invites' })).toBeInTheDocument();
    await userEvent.type(canvas.getByLabelText('Email address'), 'first@seashell.dev{Enter}');
    await waitFor(() => expect(inviteEmails(canvasElement)).toEqual(['first@seashell.dev']));
    await expect(canvas.queryByRole('heading', { name: 'No pending invites' })).toBeNull();
    await clearToasts();
  },
};
