import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const productCollageGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    "The hero picture of a product landing: two to four real UI cards floating over a photo or the theme's gradient.",
    'Inside Hero (media slot) or FeatureSplit, in place of a flat screenshot.',
    'Give the cards different depths (0.2 to 1) so they part while the page scrolls.',
  ],
  whenNotToUse: [
    { text: 'A whole app screen', instead: 'DeviceFrame' },
    { text: 'Many small images', instead: 'MarqueeColumns or a gallery' },
  ],
  anatomy: [
    { part: 'Ground', description: "a photo, or (no image) the theme's gradient with its blooms; the 5xl radius." },
    { part: 'Collage item', description: 'a card placed by x / y / width in % of the ground; depth sets its scroll drift.' },
  ],
  doDont: [],
  a11y: [
    'The cards rise in one after another when the collage scrolls into view; with reduced motion they are there at once and do not drift.',
    'Reading order is the order of the items, also when they float: put the most telling card first.',
    'A photo that is mood only takes alt="".',
    'Under 512px the cards stack in reading order; hideNarrow drops the extras so the stack stays short.',
  ],
};
