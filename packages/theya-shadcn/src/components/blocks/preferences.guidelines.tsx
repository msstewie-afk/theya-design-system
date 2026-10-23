import type { ComponentGuidelines } from '../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const preferencesGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'An account settings page in sections people jump between: profile, security, notifications, danger zone.',
  ],
  whenNotToUse: [
    { text: 'Settings of one object', instead: 'Details' },
    { text: 'A form that creates something', instead: 'ResourceForm' },
  ],
  anatomy: [
    { part: 'Section nav', description: 'links to each section, sticky beside them from lg.' },
    { part: 'Sections', description: 'heading, description and their own fields and actions — separated by space, not boxes.' },
    { part: 'Danger zone', description: 'deleting the account, behind a typed confirmation.', optional: true },
  ],
  doDont: [],
  a11y: [
    'The section nav marks the section in view as current.',
    'Deleting the account asks people to type their email to confirm.',
  ],
};
