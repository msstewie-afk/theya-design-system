import { C, type ComponentGuidelines } from '../../docs/guidelines';

const Tile = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] px-4 py-3 font-body text-body-m text-[var(--color-text-text)]">{children}</div>
);

export const cardStackGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['A landing or empty-state showcase that cycles a few cards: testimonials, highlights, recent invoices.'],
  whenNotToUse: [
    { text: 'Content the user has to read or act on', instead: 'Card grid / List' },
    { text: 'Browsing many items by hand', instead: 'Carousel' },
  ],
  anatomy: [
    { part: 'Deck', description: <>the front card plus <C>depth</C> cards behind it, each 12px higher and 5% smaller.</> },
    { part: 'Cycle', description: <>every <C>interval</C> ms the front card drops away and returns to the back.</> },
    { part: 'Controls', description: 'Pause / Play and Next, under the deck.' },
  ],
  doDont: [
    {
      do: { example: <Tile>3–6 short cards, 4 s each</Tile>, caption: 'Few short cards; time to read each one.' },
      dont: { example: <Tile>A form inside a cycling card</Tile>, caption: 'Interactive content that leaves while someone is using it.' },
    },
  ],
  a11y: [
    'Pauses on hover and while anything inside has focus; Pause / Play stops it for good (WCAG 2.2.2).',
    'Only the front card is in the accessibility tree; the rest are aria-hidden and inert.',
    'prefers-reduced-motion: no timer and no animation, the cards change only with Next.',
  ],
};
