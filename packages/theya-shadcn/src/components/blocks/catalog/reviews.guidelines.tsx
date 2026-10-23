import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const reviewsGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'Ratings and written reviews of a catalog item, where people want to read the complaints as easily as the praise.',
    'As a section of an item page, or on its own page when there are many reviews.',
  ],
  whenNotToUse: [
    { text: 'Asking someone for their own rating', instead: 'Rating' },
    { text: 'Only the average next to an item in a list', instead: 'ItemCard' },
  ],
  anatomy: [
    { part: 'Heading', description: 'with Write a review when people can write one.' },
    { part: 'Summary', description: 'the average, its stars and the review count.' },
    { part: 'Distribution', description: 'one bar per star rating; each bar filters the list.' },
    { part: 'Toolbar', description: 'how many reviews are shown, Show all while filtered, and sort, including lowest rated.' },
    { part: 'Review list', description: 'rating, title, author and date, the text, and the developer’s reply under the review it answers; Show more at the end.' },
  ],
  doDont: [],
  a11y: [
    'Distribution bars are toggle buttons in a group named “Filter by rating”, each read as its star rating and review count, with its pressed state.',
    'Each review’s rating is read as “4 out of 5 stars”; the star icons are hidden from screen readers.',
    'The review count is a polite live region, so applying a star filter is announced. A developer reply is marked with a “Developer” badge, in words.',
  ],
};
