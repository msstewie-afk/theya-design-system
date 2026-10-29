import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const landingScrollGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'StickyStack: three to five big cards that pile up as the reader scrolls — steps of a story, product areas.',
    'CardRail: more cards than fit a row (customer stories, templates); the next one peeks in so the row reads as scrollable.',
    'StickySteps: a numbered process told in steps, with the heading and the step list staying in view.',
    'RevealGroup: cards that ease in the first time they scroll into view — decoration, never the only way to see them.',
  ],
  whenNotToUse: [
    { text: 'Content the reader must compare side by side', instead: 'a grid or a table' },
    { text: 'Anything that moves the page for the reader (scroll-jacking, pinned scenes)', instead: 'nothing — the page scrolls at the reader’s pace' },
  ],
  anatomy: [
    { part: 'StickyStack', description: 'an ordered list; each card sticks 24px lower than the one before (below a 64px sticky header).' },
    { part: 'CardRail', description: 'heading with prev / next at the top end; Carousel with 85% / 46% / 31% slides, so the next card always peeks in.' },
    { part: 'StickySteps', description: 'sticky heading and numbered step links on the start side; the steps on the end side.' },
  ],
  doDont: [],
  a11y: [
    'Nothing hijacks the scroll and nothing moves on a timer; every card is in the DOM in reading order.',
    'CardRail is a named carousel region: arrows, Arrow keys and drag; slides are labelled “2 of 6”; with reduced motion it jumps instead of sliding.',
    'StickySteps marks the step in view with aria-current="step", a heavier label and a 2px bar — not color alone; the numbers link to their steps.',
    'Revealed content is fully visible under prefers-reduced-motion; keep it to secondary blocks.',
  ],
};
