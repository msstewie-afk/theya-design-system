import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const blogTeaserGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'The latest posts near the end of a landing page: three cards with a cover, category, title, a line of excerpt, date and reading time.',
    'Covers in one family (the same kind of photo or abstract), 3 : 2.',
    'An "All articles" link in `action`.',
  ],
  whenNotToUse: [
    { text: 'A customer story with a quote and numbers', instead: 'TestimonialCase' },
    { text: 'The blog index itself', instead: 'a card grid with pagination' },
  ],
  anatomy: [
    { part: 'Section head', description: 'eyebrow, title, description at the start; the action at the end of the row.' },
    { part: 'Post card', description: 'cover (3 : 2, decorative), category in mono caps, title (the link), excerpt (two lines), date · reading time.' },
  ],
  doDont: [],
  a11y: [
    'Each card is one link, its title; the whole card is clickable through the stretched title link, so there are no nested or repeated links.',
    'Covers are decorative (alt=""): the title names the post.',
    'On phones the cards sit in a row you swipe through; it scrolls with the keyboard too, since every card holds a link.',
    'Dates are <time> elements with the ISO date.',
  ],
};
