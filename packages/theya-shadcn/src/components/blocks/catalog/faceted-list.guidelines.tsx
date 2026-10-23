import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const facetedListGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'Browsing a large catalog by narrowing it down: category, vendor, what it works with, price and rating.',
    'When people don’t know the name of what they want, but know what it must do or cost.',
  ],
  whenNotToUse: [
    { text: 'Results for a query people type', instead: 'SearchResults' },
    { text: 'Records people select, edit and delete', instead: 'ListView' },
  ],
  anatomy: [
    { part: 'Filters', description: 'facets with a count per value, a price range and a minimum rating; a sidebar when wide, a drawer with “Show N results” when narrow.' },
    { part: 'Toolbar', description: 'the result count, sort and a grid or list switch.' },
    { part: 'Applied filters', description: 'one removable chip per filter, and Clear all.', optional: true },
    { part: 'Results', description: 'item cards, in pages behind “Show N more” with “Showing x of y”.' },
    { part: 'Empty state', description: 'when nothing matches, with Clear all filters.', optional: true },
  ],
  doDont: [],
  a11y: [
    'The result count is a polite live region, so each filter change is announced as it applies.',
    'Each facet is a fieldset with a legend, and every option reads its count as its description (“6 results”).',
    'Applied filters are a named group; each chip is a button named “Remove filter:” plus the value.',
  ],
};
