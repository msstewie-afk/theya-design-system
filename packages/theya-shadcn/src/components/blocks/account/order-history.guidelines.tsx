import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const orderHistoryGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'Past orders people look up for a reason: to get an invoice, check what they paid for, see what is still in progress or buy the same again.',
  ],
  whenNotToUse: [
    { text: 'Plan, usage and subscription invoices together', instead: 'BillingUsage' },
    { text: 'The live progress of one order being set up', instead: 'StatusTracker' },
    { text: 'Many records to sort and filter by column', instead: 'DataTable' },
  ],
  anatomy: [
    { part: 'Toolbar', description: 'search by order number or item name, a status filter and the number of orders.' },
    { part: 'Order row', description: 'what was bought, the order number and date, the total, the status and Details.' },
    { part: 'Details', description: 'line items, total and payment method, with Track progress, Invoice (PDF) and Buy again where they apply.' },
    { part: 'Show more', description: 'the next page of orders, with how many are shown.', optional: true },
    { part: 'Empty state', description: 'when nothing matches the search or filter, with Show all orders.', optional: true },
  ],
  doDont: [],
  a11y: [
    'Status is a word in a badge, like “Payment failed” or “Refunded”, never color alone.',
    'Details reports whether it is expanded and is named with its order number, so every row’s button is told apart.',
    'The order count updates politely as people search or filter, so the result is heard.',
  ],
};
