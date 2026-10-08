import { C, type ComponentGuidelines } from '../../docs/guidelines';

const Tile = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] px-4 py-3 font-body text-body-m text-[var(--color-text-text)]">{children}</div>
);

export const marqueeColumnsGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['A decorative wall of cards behind or beside a hero: testimonials, templates, integrations.'],
  whenNotToUse: [
    { text: 'A single row of logos or short items', instead: 'Marquee' },
    { text: 'Cards people need to read or click in order', instead: 'Card grid' },
  ],
  anatomy: [
    { part: 'Columns', description: <>one per array in <C>columns</C>; neighbours drift in opposite directions at slightly different speeds.</> },
    { part: 'Fade', description: 'the top and bottom edges fade out.' },
    { part: 'Pause', description: <>a Pause / Play button (<C>pauseButton</C>).</> },
  ],
  doDont: [
    {
      do: { example: <Tile>3 columns, 4–6 short cards each</Tile>, caption: 'Enough cards to loop without visible repeats.' },
      dont: { example: <Tile>A wall of buttons and forms</Tile>, caption: 'Moving controls are hard to hit.' },
    },
  ],
  a11y: [
    'Pauses on hover and while anything inside has focus; Pause stops it for good (WCAG 2.2.2).',
    'Each column renders its items twice; the copy is aria-hidden and inert, so each card is met once.',
    'prefers-reduced-motion: the columns stand still.',
  ],
};
