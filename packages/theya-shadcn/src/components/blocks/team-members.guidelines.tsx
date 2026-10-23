import type { ComponentGuidelines } from '../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const teamMembersGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'Managing who has access: invite by email with a role, change roles, remove members, handle pending invites.',
  ],
  whenNotToUse: [
    { text: 'API keys and tokens', instead: 'AccessTokens' },
    { text: 'A plain list of people', instead: 'ListItem' },
  ],
  anatomy: [
    { part: 'Invite row', description: 'email and a role, then Invite.' },
    { part: 'Members table', description: 'name and email, a role picker and Remove per row.' },
    { part: 'Pending invites', description: 'Resend and Revoke per invite, or an empty state.' },
  ],
  doDont: [],
  a11y: [
    'Roles are words in badges and pickers, never color alone.',
    'Remove and Revoke confirm first and can be undone from the toast.',
  ],
};
