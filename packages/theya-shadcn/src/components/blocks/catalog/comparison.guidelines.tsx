import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const comparisonGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'Choosing between two to four similar catalog items on the same attributes: price, rating, what each works with.',
    'When people collect candidates while browsing and want to see them side by side before deciding.',
  ],
  whenNotToUse: [
    { text: 'Choosing between the plans of one product', instead: 'PlanComparison' },
    { text: 'The attributes of a single item', instead: 'SpecSheet' },
  ],
  anatomy: [
    { part: 'Compare checkbox', description: 'on each card; the other cards lock once the limit is reached.' },
    { part: 'Tray', description: 'stays at the bottom while browsing; shows the picks with Remove, the empty slots, a hint and Compare (n).' },
    { part: 'Table header', description: 'Back to results and a heading with how many items are compared.' },
    { part: 'Comparison table', description: 'one column per item, attributes as rows, rows that differ emphasised, with an “Only differences” switch.' },
  ],
  doDont: [],
  a11y: [
    'Compare stays focusable with fewer than two picks, and its description says what is missing instead of the button going silently dead.',
    'Opening the table moves focus to its heading; Back to results returns focus to Compare, with the picks kept.',
    'The table has a caption, column and row headers, and support is read as “Yes” or “No”, not only shown as an icon. Its scroll area takes focus, so it can be scrolled from the keyboard.',
  ],
};
