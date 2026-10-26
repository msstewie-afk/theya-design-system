import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const sectionPanelGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'Give a landing section its own colored sheet: a dark band for logos or a quote, the brand color for a call to action, a sunken neutral to set a group of features apart.',
    'Stack them with `overlap`, so each sheet is laid over the end of the previous section.',
  ],
  whenNotToUse: [
    { text: 'A group of content inside the product', instead: 'Card' },
    { text: 'Every section of a page — alternate with plain sections, or the color stops meaning anything', instead: 'a plain section with section-display' },
  ],
  anatomy: [
    { part: 'Sheet', description: 'a full-width section with 32px rounded top corners, display scale inside.' },
    { part: 'Content', description: 'a container-display column with the section’s own blocks.' },
  ],
  doDont: [],
  a11y: [
    '`inverse` is a nested dark theme and `primary` remaps the ink for the brand fill, so every component inside keeps its contrast without its own variant.',
    'Give the section a heading (or aria-label), so it is a named region.',
  ],
};
