import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const pageBreadcrumbsGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'Showing where a page sits in the hierarchy, the same however people arrived (Home › Domains › example.com › DNS).',
    'When people arrive from a search or a filtered list and need a way back that keeps the query and filters.',
  ],
  whenNotToUse: [
    { text: 'The steps of a process, in order', instead: 'Stepper' },
    { text: 'Switching between sibling views of one page', instead: 'Tabs' },
  ],
  anatomy: [
    { part: 'Back link', description: '“Back to …” for the route people came by, separate from the trail.', optional: true },
    { part: 'Trail', description: 'the hierarchy from the top level down to the parent.' },
    { part: 'Folded levels', description: 'past four crumbs the middle folds into “…”, keeping the first and the last two.', optional: true },
    { part: 'Current page', description: 'the last crumb, not a link.' },
  ],
  doDont: [],
  a11y: [
    'The trail is a navigation landmark and the last crumb is marked as the current page.',
    'Folded levels sit behind a button named after how many there are (“Show 3 more levels”) that opens a menu of links.',
    'Below sm only a link to the parent is shown, or the back link when there is one.',
  ],
};
