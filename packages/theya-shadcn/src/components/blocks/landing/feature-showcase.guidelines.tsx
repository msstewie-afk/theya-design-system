import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const featureShowcaseGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'Three to five features in one section, where seeing each one helps: pick a feature, see it in the product.',
    '`accordion` when each feature needs a sentence or two; `chips` for short names and a bigger visual.',
  ],
  whenNotToUse: [
    { text: 'One feature', instead: 'FeatureSplit' },
    { text: 'Features that change on their own, on a timer', instead: 'nothing — let the reader choose (WCAG 2.2.2)' },
  ],
  anatomy: [
    { part: 'Header', description: 'eyebrow, h2 title and an optional description.' },
    { part: 'Selector', description: 'an Accordion with one item always open, or Tabs variant="chips".' },
    { part: 'Media', description: 'the visual of the open item; on phones it sits inside the accordion item.' },
  ],
  doDont: [],
  a11y: [
    'Accordion and tabs keep their keyboard patterns: Enter or Space opens an item, arrows move between chips.',
    'Every feature’s text is in the page whether or not its visual is shown, and nothing switches on a timer.',
    'Each visual is one labelled image with no controls inside.',
  ],
};
