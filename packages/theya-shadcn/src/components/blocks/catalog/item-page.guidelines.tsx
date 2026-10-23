import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const itemPageGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'The page of one catalog item people are deciding to install or buy.',
    'When overview, specifications and reviews should all be readable on one scrolling page, not hidden in tabs.',
  ],
  whenNotToUse: [
    { text: 'A resource people already own and manage', instead: 'Details' },
    { text: 'Choosing between the plans of one product', instead: 'PlanComparison' },
  ],
  anatomy: [
    { part: 'Breadcrumbs', description: 'the category path, ending in the item.', optional: true },
    { part: 'Gallery', description: 'a large image with previous and next, and every image as a thumbnail.' },
    { part: 'Buying block', description: 'name, vendor, rating linked to the reviews, price with the trial terms, one primary action, what it works with and highlights.' },
    { part: 'On this page', description: 'links to Overview, Specifications and Reviews.' },
    { part: 'Sections', description: 'the overview, folded when long, the specifications and the reviews.' },
  ],
  doDont: [],
  a11y: [
    'Gallery thumbnails are buttons named after their image, the shown one is marked current, and each change is announced (“Screenshot 2 of 4: …”).',
    '“On this page” is a named navigation landmark, and every section is named by its heading.',
    '“Read the full description” reports whether it is expanded and points to the text it reveals.',
  ],
};
