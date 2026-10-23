import type { ComponentGuidelines } from '../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const resourceFormGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'Creating or editing one object from a list of fields in sections: a database, a mailbox, a site.',
  ],
  whenNotToUse: [
    { text: 'A setup in several steps', instead: 'OnboardingWizard' },
    { text: 'Account settings', instead: 'Preferences' },
  ],
  anatomy: [
    { part: 'Title', description: 'what is being created or edited.' },
    { part: 'Sections', description: 'groups of fields with a heading; fields keep sensible widths.' },
    { part: 'Error summary', description: 'after a failed submit with several errors.', optional: true },
    { part: 'Actions', description: 'submit and cancel at the end.' },
  ],
  doDont: [],
  a11y: [
    'One error moves focus to its field; several move it to the summary, which links to each field.',
    'Errors are tied to their fields and turn the field itself danger, not only the text under it.',
  ],
};
