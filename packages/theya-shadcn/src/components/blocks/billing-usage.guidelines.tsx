import type { ComponentGuidelines } from '../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const billingUsageGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'The billing page of an account: current plan, usage against quotas and recent invoices in one place.',
  ],
  whenNotToUse: [
    { text: 'Choosing or changing a plan', instead: 'PlanComparison' },
    { text: 'The first screen of an account', instead: 'DashboardOverview' },
  ],
  anatomy: [
    { part: 'Plan header', description: 'plan name with a badge, price and the Upgrade action.' },
    { part: 'Key numbers', description: 'a row of Stat cards.' },
    { part: 'Usage', description: 'a bar per quota, and one bar split by type.' },
    { part: 'Invoices', description: 'a table with date, amount and status per invoice.' },
  ],
  doDont: [],
  a11y: [
    'Quota fullness is in numbers and percent, not only in the bar.',
    'Invoice status is a dot with a word, never color alone.',
    'Sections are headed, so screen-reader users can jump between plan, usage and invoices.',
  ],
};
