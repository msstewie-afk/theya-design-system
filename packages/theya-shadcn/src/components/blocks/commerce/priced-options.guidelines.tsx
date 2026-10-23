import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const pricedOptionsGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'One choice where every option has its own cost: billing period, region, backup retention, support level.',
    'Add-ons in a checkout, priced as extras (“+$4 / mo”) or as full prices.',
  ],
  whenNotToUse: [
    { text: 'Choices without a price', instead: 'OptionCard' },
    { text: 'Turning on several add-ons at once', instead: 'CheckboxGroup' },
    { text: 'Comparing whole plans feature by feature', instead: 'PlanComparison' },
  ],
  anatomy: [
    { part: 'Legend', description: 'what the choice is about.' },
    { part: 'Description', description: 'a hint under the legend.', optional: true },
    { part: 'Options', description: 'option cards, or radios on dividers in the list appearance, each with a title and what it gets you.' },
    { part: 'Price', description: 'on every option: “Included”, an extra such as “+$4 / mo”, or the full price.' },
  ],
  doDont: [],
  a11y: [
    'The options are a radio group in a fieldset, named by the legend and described by the hint.',
    'Each option’s price is part of its description, so it is read with the option, not on its own.',
  ],
};
