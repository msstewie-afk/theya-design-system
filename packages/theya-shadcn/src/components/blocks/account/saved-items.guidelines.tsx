import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const savedItemsGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'A saved list people come back to, where what changed since saving matters: a lower price, no longer available.',
    'Acting on several saved items at once, like adding them all to the cart.',
  ],
  whenNotToUse: [
    { text: 'Items about to be bought', instead: 'Cart' },
    { text: 'Browsing the catalog', instead: 'FacetedList' },
  ],
  anatomy: [
    { part: 'Header', description: 'the heading with the count, and a sort.' },
    { part: 'Bulk bar', description: 'Select all, the main action and Remove; always shown, active once something is selected.' },
    { part: 'Item', description: 'a checkbox, the image, the name as a link, the price per month, badges for what changed and when it was saved.' },
    { part: 'Remove', description: 'an icon button in the corner of each item.' },
    { part: 'Empty state', description: 'what saving is for, with a link to the catalog.', optional: true },
  ],
  doDont: [],
  a11y: [
    'What changed is said in words, like “Price dropped from $89” or “No longer available”, not by color or a faded image alone.',
    'Each checkbox and Remove button is named with its item.',
    'Removing is undone from the toast instead of being confirmed first.',
  ],
};
