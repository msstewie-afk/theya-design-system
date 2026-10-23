import type { ComponentGuidelines } from '../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const notificationsInboxGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'A notifications center people read, filter and clear: alerts, invites, billing events.',
  ],
  whenNotToUse: [
    { text: 'A history of who did what', instead: 'AuditLog' },
    { text: 'A short message about an action just taken', instead: 'Toaster' },
  ],
  anatomy: [
    { part: 'Header', description: 'title and an optional Settings action.' },
    { part: 'Filters', description: 'All / Unread, then filters by status and by object.' },
    { part: 'Notification row', description: 'a tone icon, title with an unread dot, description, time and a menu.' },
    { part: 'Empty state', description: 'when nothing is left or nothing matches.', optional: true },
  ],
  doDont: [],
  a11y: [
    'Unread rows look different and announce “Unread”, never by color alone.',
    'Dismissing a notification can be undone from the toast.',
    'The whole row opens the notification; its menu stays a separate control.',
  ],
};
