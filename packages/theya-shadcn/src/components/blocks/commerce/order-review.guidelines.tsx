import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const orderReviewGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'The last step before money moves: every detail of the order on one screen, each group with its own Edit.',
  ],
  whenNotToUse: [
    { text: 'The receipt after paying', instead: 'CompletionScreen' },
    { text: 'Changing quantities or removing lines', instead: 'Cart' },
  ],
  anatomy: [
    { part: 'Heading', description: '“Review and pay”, with a note that nothing is charged until Pay.' },
    { part: 'Review groups', description: 'a title, Edit for that group, and its details as a description list.' },
    { part: 'Order summary', description: 'lines, tax and total.' },
    { part: 'Pay button', description: 'names the amount (“Pay $420”) and shows a spinner while the charge runs.' },
    { part: 'Legal', description: 'terms and renewal in small print under the button.', optional: true },
  ],
  doDont: [],
  a11y: [
    'Each Edit names its group for screen readers, such as “Edit payment”.',
    'The heading and the button both say this step charges, and the button states the amount, so it is never mistaken for a receipt.',
    'Groups are sections with their own headings under the page heading.',
  ],
};
