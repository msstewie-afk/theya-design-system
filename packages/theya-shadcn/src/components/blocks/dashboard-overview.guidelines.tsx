import type { ComponentGuidelines } from '../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const dashboardOverviewGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'The first screen of an account or a product: what needs attention first, then the key numbers and recent activity.',
  ],
  whenNotToUse: [
    { text: 'A full list of records', instead: 'ListView' },
    { text: 'The billing page', instead: 'BillingUsage' },
  ],
  anatomy: [
    { part: 'Needs attention', description: 'the few things to act on now, each with its action.', optional: true },
    { part: 'Key numbers', description: 'four Stat cards.' },
    { part: 'Traffic', description: 'an area chart of requests.' },
    { part: 'Usage', description: 'a bar per metered resource, with an optional breakdown.' },
    { part: 'Recent activity', description: 'a Timeline of the latest events.' },
  ],
  doDont: [],
  a11y: [
    'What needs attention comes first in reading order, not only first on screen.',
    'Usage is given in numbers and percent; charts and bars repeat what the text already says.',
  ],
};
