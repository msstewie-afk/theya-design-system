import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const planComparisonGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'Choosing or changing a plan: plans side by side with their prices, a billing-period toggle and what each one includes.',
  ],
  whenNotToUse: [
    { text: 'One priced choice inside a flow, such as region or backups', instead: 'PricedOptions' },
    { text: 'Comparing catalog items people pick themselves', instead: 'CompareFlow' },
    { text: 'The current plan and its usage', instead: 'BillingUsage' },
  ],
  anatomy: [
    { part: 'Period toggle', description: 'Monthly or Yearly, with the yearly saving on it.' },
    { part: 'Plan cards', description: 'name, description, price per month and the Choose button; one plan can be Recommended.' },
    { part: 'Feature rows', description: 'a value or included / not included per plan, with help on terms people may not know.' },
    { part: 'Only differences', description: 'a switch that hides the rows where every plan is the same.', optional: true },
    { part: 'Plan tabs', description: 'in a narrow space, one tab per plan instead of the table.' },
  ],
  doDont: [],
  a11y: [
    'Included and not included are read out as words, not only shown as a check or a dash.',
    'Each Choose button names the plan, price and period (“Choose Pro, $24 per month, billed yearly”); the current plan’s reads “Current plan”.',
    'The table has a caption with the billing period, and column and row headers, so every value is read with its plan and feature.',
  ],
};
