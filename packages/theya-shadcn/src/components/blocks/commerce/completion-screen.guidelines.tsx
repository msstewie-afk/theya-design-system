import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const completionScreenGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'The end of a purchase or a plan change: a clear “done”, the order number, the details and the next step.',
  ],
  whenNotToUse: [
    { text: 'A short confirmation of a small action', instead: 'Toaster' },
    { text: 'Following an order after it is placed', instead: 'StatusTracker' },
  ],
  anatomy: [
    { part: 'Confirmation', description: 'a check icon, the title and one line on what happened.' },
    { part: 'Order number', description: 'set in monospace.', optional: true },
    { part: 'Receipt email', description: 'where the receipt went, what to do if it doesn’t arrive, and send it again.', optional: true },
    { part: 'Details', description: 'a description list of what was bought.', optional: true },
    { part: 'Actions', description: 'the next step as the primary button, other actions beside it.', optional: true },
  ],
  doDont: [],
  a11y: [
    'The screen is a section named by its title; the check icon is decorative, so the title carries the message.',
    'The receipt address is spelled out, and send it again is a button inside the sentence, so it reads in context.',
  ],
};
