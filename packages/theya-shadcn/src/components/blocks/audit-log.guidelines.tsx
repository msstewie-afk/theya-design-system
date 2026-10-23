import type { ComponentGuidelines } from '../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const auditLogGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'An activity or audit history people search and filter: sign-ins, changes, deletions.',
    'Compliance and troubleshooting views where the exact time and target of each event matter.',
  ],
  whenNotToUse: [
    { text: 'A few recent events on a dashboard', instead: 'Timeline' },
    { text: 'Notifications people act on and mark as read', instead: 'NotificationsInbox' },
  ],
  anatomy: [
    { part: 'Toolbar', description: 'search, a category filter and a date range.' },
    { part: 'Event row', description: 'actor, action and target, the category as an icon and a badge, the absolute time.' },
    { part: 'Loading', description: 'skeleton rows while the first page loads.', optional: true },
    { part: 'Empty state', description: 'different for “no events yet” and “nothing matches the filters”.', optional: true },
  ],
  doDont: [],
  a11y: [
    'The category is a word in a badge as well as an icon, never color alone.',
    'Times are absolute and formatted the same for every reader, so a log copied into a ticket still means the same moment.',
    'When filters hide everything, the empty state says so, separately from a log with no events at all.',
  ],
};
