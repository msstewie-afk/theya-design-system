import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const noResultsGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'A search came back empty: say what was searched, then offer the most likely next step first.',
    'One scope is empty but others have matches, so the way out is those scopes.',
  ],
  whenNotToUse: [
    { text: 'A list or page with nothing in it yet', instead: 'EmptyState' },
    { text: 'A full results page, which already shows this when nothing matches', instead: 'SearchResults' },
  ],
  anatomy: [
    { part: 'Message', description: 'what was searched, so a typo is visible; left out with hideTitle when the page heading already says it.', optional: true },
    { part: 'Did you mean', description: 'a close spelling that has results.', optional: true },
    { part: 'Other scopes', description: 'the same query in the scopes that have matches, with their counts.', optional: true },
    { part: 'Tips', description: 'how to change the query, and Search everything when the search was narrowed to one scope.' },
    { part: 'Popular pages', description: 'the pages people look for most.', optional: true },
  ],
  doDont: [],
  a11y: [
    'Did you mean and the other scopes are buttons, since they run a new search rather than open a page.',
    'Each scope is named with its count, like “help articles (3)”.',
    'Popular pages have their own heading, so they can be reached by headings.',
  ],
};
