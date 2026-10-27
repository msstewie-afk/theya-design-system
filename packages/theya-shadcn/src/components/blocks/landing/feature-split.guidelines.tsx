import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const featureSplitGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'One feature per section: a title, one or two sentences, a quiet link, and a slice of the product.',
    '`stacked` when the visual needs the full width; `side` for a narrower visual, alternating `reverse` down the page.',
  ],
  whenNotToUse: [
    { text: 'Three or more features in one section', instead: 'FeatureShowcase' },
    { text: 'A grid of short benefits with icons', instead: 'a card grid' },
  ],
  anatomy: [
    { part: 'Eyebrow', description: 'the feature’s name in small capitals.', optional: true },
    { part: 'Title', description: 'h2, heading-2xl; no full stop after the last sentence.' },
    { part: 'Description', description: 'one or two sentences, body-l.', optional: true },
    { part: 'Link', description: 'one quiet link, “Learn more →”.', optional: true },
    { part: 'Media', description: 'the product on a sunken sheet; its radius follows the padding.', optional: true },
  ],
  doDont: [],
  a11y: [
    'The visual is one image to assistive tech (role="img" with a label that says what it shows) and holds no real controls.',
    'Reading order is title, text, link, then the visual, whatever side the visual is on.',
  ],
};
