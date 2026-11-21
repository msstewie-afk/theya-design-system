import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const pricingSectionGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'On a landing page, after the features and the proof: two to four plans side by side.',
    'One recommended plan at most: it gets the filled card and the filled button.',
    'On a gradient band: put it inside SectionPanel tone="gradient"; the cards turn to frosted white.',
  ],
  whenNotToUse: [
    { text: 'A full feature-by-feature table inside the product', instead: 'PlanComparison' },
    { text: 'One price only', instead: 'CtaBand with the price in its text' },
  ],
  anatomy: [
    { part: 'Section head', description: 'eyebrow, title, description, centred.' },
    { part: 'Period switch', description: 'monthly / yearly, the yearly saving as a badge.' },
    { part: 'Plan card', description: 'name, who it is for, price per month, billing line, button, then four to six included features.' },
    { part: 'Footnote', description: 'one quiet line: taxes, trial, cancelling.', optional: true },
  ],
  doDont: [],
  a11y: [
    'The switch is a toggle group with its own name ("Billing period"); arrow keys move between the two periods.',
    'Prices count to their new value when the period changes; screen readers get only the final price, and with reduced motion it shows at once.',
    'Each plan name is an h3 under the section h2. Each card lists its features as a list.',
  ],
};
