import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const searchResultsGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'A full results page across types — domains, databases, settings, help — with the query kept in the field to refine it.',
    'Narrowing results to one type, with a count on every scope.',
  ],
  whenNotToUse: [
    { text: 'Search in the top bar', instead: 'SearchBox' },
    { text: 'Browsing one kind of item by facets', instead: 'FacetedList' },
  ],
  anatomy: [
    { part: 'Search field', description: 'the query, kept for refining, and Search.' },
    { part: 'Heading', description: 'the count and the query; when a typo was corrected, a notice with a way to search the original.' },
    { part: 'Scope tabs', description: 'All, plus one tab per type that has results, each with its count.' },
    { part: 'Results', description: 'on All, the best few of each type with View all; in one type, a flat list with Show more.' },
    { part: 'No results', description: 'tips, a close spelling and popular pages instead of a blank page.', optional: true },
  ],
  doDont: [],
  a11y: [
    'After a new search, focus moves to the heading with the count, so the result is heard and the next Tab starts on the results.',
    'Matched words are marked in bold, not by color.',
    'Each result is one link, named with its title and its type.',
  ],
};
