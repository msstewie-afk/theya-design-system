import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const checkoutGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'Buying a plan or service in a few steps: options, payment, review, then a done screen.',
    'A checkout that keeps people on task: no site navigation, only a way back to the cart.',
  ],
  whenNotToUse: [
    { text: 'Editing what is in the cart', instead: 'Cart' },
    { text: 'Setting something up after it is bought', instead: 'OnboardingWizard' },
  ],
  anatomy: [
    { part: 'Header', description: 'the brand, a secure-checkout note and Back to cart.' },
    { part: 'Stepper', description: 'where you are; completed steps link back.' },
    { part: 'Steps', description: 'priced options, then payment, then the review with the Pay button.' },
    { part: 'Order summary', description: 'every line, tax and the total beside every step, updated as options change.' },
    { part: 'Done screen', description: 'the order number, what was bought and the next step.' },
  ],
  doDont: [],
  a11y: [
    'Each step change moves focus to a heading that says where you are, such as “Step 2 of 3: Payment”.',
    'Continuing from payment checks the card first: every error shows and focus goes to the first invalid field.',
    'Going back keeps everything entered, card details included, because earlier steps are hidden, not removed.',
  ],
};
