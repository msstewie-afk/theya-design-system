import { C, type ComponentGuidelines } from '../../docs/guidelines';

const Tile = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] px-4 py-3 font-body text-body-m text-[var(--color-text-text)]">{children}</div>
);

export const orbitCarouselGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['A showcase on a landing page: case studies, product shots, a few campaign cards.'],
  whenNotToUse: [
    { text: 'Content people browse or compare in the product', instead: 'Carousel' },
    { text: 'More than ~10 cards, or cards with forms and long text', instead: 'Card grid' },
  ],
  anatomy: [
    { part: 'Drum', description: <><C>shape="drum"</C>: cards round a cylinder that turns on its vertical axis.</> },
    { part: 'Drum options', description: <><C>lean</C> tips the drum toward the viewer; <C>center</C> puts a word or a logo in the middle, and the cards orbit it, passing behind and in front.</> },
    { part: 'Wheel', description: <><C>shape="wheel"</C>: cards on the rim of a large wheel to the start side, rolling past vertically; up to three on each side, fading out.</> },
    { part: 'Wall', description: <><C>shape="wall"</C>: the viewer stands inside the drum — a curved wall, the edges swinging in (coverflow). Stops at the ends.</> },
    { part: 'Fan', description: <><C>shape="fan"</C>: cards on an arc, the middle one upright and in focus; a click on a side card brings it to the middle. Deals itself out the first time it scrolls in. Stops at the ends.</> },
    { part: 'Controls', description: <>Previous / Next; Pause when <C>autoplay</C> is set; dots on the wall and the fan.</> },
  ],
  doDont: [
    {
      do: { example: <Tile>5–8 image-led cards</Tile>, caption: 'Enough cards to read as a circle; each one makes sense on its own.' },
      dont: { example: <Tile>2 cards on a drum</Tile>, caption: 'Too few to form a circle — use a plain Carousel.' },
    },
  ],
  a11y: [
    'One tab stop, described by a hint about the arrow keys; ← / → (↑ / ↓ for the wheel) turn it; drag or swipe does the same, the cards following the finger.',
    'Only the front card is in the accessibility tree; the others are aria-hidden and inert. Its position and name are announced (“2 of 8: Research”) — silent while autoplay runs.',
    'autoplay pauses on hover and focus and has a Pause button (WCAG 2.2.2).',
    'prefers-reduced-motion: no turning animation and no autoplay.',
  ],
};
