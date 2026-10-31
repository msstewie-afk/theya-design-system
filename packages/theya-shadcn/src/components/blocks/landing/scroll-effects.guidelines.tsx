import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const scrollEffectsGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'One or two “wow” moments per page, where motion tells something: the product standing up (TiltIn), a tour told card by card (CardDeck), a statement read word by word (ScrollHighlight), features dealt out (FanOut), a picture opening from a capsule to the full screen (ScrollMaskReveal), a row of cards passing sideways (HorizontalScroll).',
    'Motion follows the scroll position: scrolling back plays it backwards and the reader sets the pace.',
  ],
  whenNotToUse: [
    { text: 'Every section of a page — the effect stops meaning anything', instead: 'plain sections between the moments' },
    { text: 'Content people need to compare or act on quickly (pricing, forms)', instead: 'a static layout' },
  ],
  anatomy: [
    { part: 'CardDeck', description: 'a pinned section; cards stand one behind another, the front one falls toward the viewer and the next comes forward; progress dots below.' },
    { part: 'TiltIn', description: 'a wrapper: its content starts tilted back in 3D and stands up flat as it scrolls into view.' },
    { part: 'ScrollHighlight', description: 'a big paragraph whose words light up from dim to full as it passes through the screen.' },
    { part: 'ScrollMaskReveal', description: 'a pinned section; the media is clipped to a capsule that opens to the full screen, then the text fades in over it.' },
    { part: 'HorizontalScroll', description: 'a pinned section (lg and up); scrolling down moves the row of cards sideways under the header, one pixel for one pixel.' },
    { part: 'MasonryDrift', description: 'a Pinterest-like wall: cards dealt into columns that slide past each other (odd up, even down) as the page scrolls, inside a window faded at the edges. Not pinned.' },
    { part: 'FanOut', description: 'a grid whose cards start as a pile in the middle and slide to their places (lg and up).' },
  ],
  doDont: [],
  a11y: [
    'Nothing runs on a timer; with prefers-reduced-motion every effect shows its plain layout (CardDeck becomes a list).',
    'Pinned scenes (CardDeck, ScrollMaskReveal, HorizontalScroll) — at most one or two per page. HorizontalScroll keeps every card in the reading order; Tab to a card scrolls the page to where it is in view. ScrollMaskReveal keeps its text out of the Tab order until it shows.',
    'MasonryDrift: Tab into the wall and it stops drifting and opens to full height, so a focused card is never clipped. Screen readers read it column by column.',
    'CardDeck: each card rests in front long enough to read (`hold`), only the front card is reachable by Tab and screen readers, and the progress is named (“card 2 of 5”).',
    'ScrollHighlight never hides words: dim words keep at least 28% opacity, and the text is one plain paragraph to assistive tech.',
    'Effects are transform and opacity only, so layout never jumps (no CLS) and the page stays scrollable at 360px.',
  ],
};
