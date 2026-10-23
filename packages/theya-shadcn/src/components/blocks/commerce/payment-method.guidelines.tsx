import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const paymentMethodGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'Taking card details, or the choice of a wallet such as PayPal, inside a checkout.',
  ],
  whenNotToUse: [
    { text: 'The whole purchase, from options to payment', instead: 'Checkout' },
    { text: 'A single formatted field such as a phone number', instead: 'PhoneField' },
  ],
  anatomy: [
    { part: 'Method tabs', description: 'Card and PayPal, with Card selected first.' },
    { part: 'Card details', description: 'name, number, expiry and security code in one enclosed block, with a note on how the card is handled.' },
    { part: 'Card brand', description: 'shown next to the number label once it is recognized.', optional: true },
    { part: 'Security code help', description: 'a help icon that says where to find the code on this brand of card.' },
    { part: 'PayPal panel', description: 'what happens next: approve in a new window, then come back to review.' },
  ],
  doDont: [],
  a11y: [
    'A field’s error shows when it is left with something typed, not on every keystroke, and says how to fix it (“The card number is 16 digits — 3 missing.”).',
    'Validating shows every error and moves focus to the first invalid field.',
    'Fields carry the cc-name, cc-number, cc-exp and cc-csc autocomplete values, so browsers and password managers fill them.',
  ],
};
