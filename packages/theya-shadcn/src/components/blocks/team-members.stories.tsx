import type { Meta, StoryObj } from '@storybook/react';
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

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <TeamMembers />
    </div>
  ),
};

export const NoPendingInvites: Story = {
  name: 'No pending invites',
  render: () => (
    <div className="p-6">
      <TeamMembers invites={[]} />
    </div>
  ),
};
