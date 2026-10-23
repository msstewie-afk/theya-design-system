import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const categoryLandingGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'The entry page of a catalog: every category up front with how many items it holds, so people pick a path instead of guessing.',
    'When a short shelf of popular items or a few curated picks helps people start.',
  ],
  whenNotToUse: [
    { text: 'The full list with filters and sorting', instead: 'FacetedList' },
    { text: 'The home page of an app people work in', instead: 'DashboardOverview' },
  ],
  anatomy: [
    { part: 'Header', description: 'title, a line of description and “View all” with the total.' },
    { part: 'Categories', description: 'one tile per category with its icon and item count.' },
    { part: 'Popular shelf', description: 'a few cards from one category, ending in “View all” for that category.', optional: true },
    { part: 'Editor’s picks', description: 'a few items, each with the reason it was picked.', optional: true },
  ],
  doDont: [],
  a11y: [
    'Each category tile is one link named with its count, like “Security, 6 extensions”.',
    'Every shelf is a section named by its heading, and each “View all” link says which list it opens.',
  ],
};
