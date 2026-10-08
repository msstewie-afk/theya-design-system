import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { DensityToggle } from './density-toggle';

export const densityToggleGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'Products with data-heavy screens (tables, admin forms), where some people want more rows on screen and others want larger targets.',
    <>A single dense region on a regular page: control it with <C>value</C> / <C>onValueChange</C> and put <C>data-density</C> on that region.</>,
  ],
  whenNotToUse: [
    { text: 'Marketing and landing pages', instead: 'the default density, no toggle' },
    { text: 'Touch-first screens', instead: 'default or comfortable; compact controls drop to 24–36px' },
  ],
  anatomy: [
    { part: 'Group', description: <>outlined single ToggleGroup, one option always on; uncontrolled it sets <C>data-density</C> on the document.</> },
    { part: 'Options', description: 'Compact · Default · Comfortable — text labels, localized.' },
  ],
  doDont: [
    {
      do: { example: <DensityToggle />, caption: 'Next to the table it affects, or in the view / display settings.' },
      dont: { example: <span className="font-body text-body-m text-[var(--color-text-text-subtle)]">Density toggle inside every card</span>, caption: 'One switch per screen or region; repeated switches fight each other.' },
    },
  ],
  a11y: [
    'A radio-style group named “Density”; arrow keys move between options, the current one is announced as checked.',
    'Compact shrinks controls one step (40 → 36px for a default field) but never under 24px, the WCAG 2.5.8 minimum; DataTable keeps a 44px floor for controls below the md breakpoint.',
  ],
};
