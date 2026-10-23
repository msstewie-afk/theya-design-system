import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const specSheetGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'The technical facts of one item in named groups: limits, requirements, versions, sizes.',
    'When some terms need a short explanation in place and long sheets should fold after the first rows.',
  ],
  whenNotToUse: [
    { text: 'Several items side by side', instead: 'Comparison' },
    { text: 'A few loose key-value pairs', instead: 'DescriptionList' },
  ],
  anatomy: [
    { part: 'Group', description: 'a heading and its specs, like Requirements or Limits.' },
    { part: 'Spec', description: 'a label and a value, always with its unit (“512 MB”, never a bare “512”).' },
    { part: 'Help icon', description: 'explains a term people may not know.', optional: true },
    { part: 'Show all', description: '“Show all N specifications” after the first rows (eight by default).', optional: true },
  ],
  doDont: [],
  a11y: [
    'Specs are a description list: the label is the term, the value its details, and the unit is text, not only implied.',
    'A help icon is a button named “About” plus the label.',
    '“Show all N specifications” reports whether it is expanded and points to the list it unfolds.',
  ],
};
