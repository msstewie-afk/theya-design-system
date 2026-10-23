import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const cartGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'The cart before checkout: lines with quantities, Save for later, a promo code and the full cost with tax.',
  ],
  whenNotToUse: [
    { text: 'Checking the order just before paying', instead: 'OrderReview' },
    { text: 'Items kept without buying them', instead: 'SavedItems' },
    { text: 'Past orders', instead: 'OrderHistory' },
  ],
  anatomy: [
    { part: 'Cart lines', description: 'name, detail and price, a quantity field where the amount can change, Save for later and Remove.' },
    { part: 'Saved for later', description: 'parked lines with Move to cart.', optional: true },
    { part: 'Promo code', description: 'a link that opens the field; an applied code shows with Remove code.', optional: true },
    { part: 'Order summary', description: 'subtotal, discount, tax and total, with Continue to checkout.' },
    { part: 'Empty state', description: 'when nothing is in the cart or saved, with Browse plans.', optional: true },
  ],
  doDont: [],
  a11y: [
    'Remove, and a quantity of 0, take the line out at once and offer undo in the toast.',
    'Every line’s buttons and quantity steppers name the item (“Remove Pro plan”), so they stay distinct when read out of context.',
    'Opening the promo field moves focus into it; an empty or wrong code shows its error on the field.',
  ],
};
