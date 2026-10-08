import { C, type ComponentGuidelines } from '../../docs/guidelines';

const Tile = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] px-4 py-3 font-body text-body-m text-[var(--color-text-text)]">{children}</div>
);

export const cardFanGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['A playful group of 3–5 cards in a hero or an about page: team members, plans, product shots.'],
  whenNotToUse: [
    { text: 'More than five cards, or cards people compare', instead: 'Card grid' },
    { text: 'Navigation or settings', instead: 'Tabs / List' },
  ],
  anatomy: [
    { part: 'Stack', description: 'cards on top of each other, slightly rotated.' },
    { part: 'Fan', description: <>on hover or focus the cards spread by <C>offset</C> px and <C>spread</C>°, one after another.</> },
    { part: 'Active card', description: 'the one under the pointer or focus lifts 16px and comes to the front.' },
  ],
  doDont: [
    {
      do: { example: <Tile>3–5 cards of the same size</Tile>, caption: 'The fan reads as one group.' },
      dont: { example: <Tile>10 cards of mixed size</Tile>, caption: 'Cards cover each other even when open.' },
    },
  ],
  a11y: [
    'Every card stays in the tab order and the accessibility tree; the fan only changes the layout.',
    'Keyboard focus opens the fan and lifts the focused card, so focus is never hidden behind another card.',
    'On touch, a tap opens the fan. prefers-reduced-motion: the fan opens without animation.',
  ],
};
