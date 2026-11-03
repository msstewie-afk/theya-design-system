import { C, type ComponentGuidelines } from '../../docs/guidelines';

const Tile = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] px-4 py-3 font-body text-body-m text-[var(--color-text-text)]">{children}</div>
);

export const expandingPanelsGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['A landing section that shows three to five things side by side: collections, use cases, plans. Prefer tonal fills over photos: pictures make the row heavy and noisy.'],
  whenNotToUse: [
    { text: 'Text people need to read side by side or compare', instead: 'Card grid' },
    { text: 'Questions and answers, settings, long content', instead: 'Accordion' },
    { text: 'More than about five panels — the strips get too narrow to read', instead: 'OrbitCarousel or a card rail' },
  ],
  anatomy: [
    { part: 'Panel', description: <>a soft tonal fill (<C>tone</C>: primary, success, secondary, info, neutral — in this order; warning is not for panels, so neighbours never blend) with full-strength text — no gradient, no darkening; or, sparingly, a picture under a dark gradient. Open, it takes about five times a strip’s width.</> },
    { part: 'Title', description: <>a button in a heading (<C>titleAs</C>); runs up the strip when closed, sits above the text when open.</> },
    { part: 'Content', description: 'a line or two and at most one link, shown only in the open panel.' },
  ],
  doDont: [
    {
      do: { example: <Tile>4 panels, short titles, one line each</Tile>, caption: 'Titles fit the strip; the open text reads at a glance.' },
      dont: { example: <Tile>8 panels with paragraphs</Tile>, caption: 'Strips too thin to read and text cut off — use a grid.' },
    },
  ],
  a11y: [
    'An accordion: each title is a button with aria-expanded in a heading; the open text is a region named by it. One open at a time.',
    'Hover (mouse) and keyboard focus open a panel; leaving does not close it, so nothing flickers. Closed text is inert.',
    'The row keeps its height — only widths change, nothing below the row moves.',
    'Below 768px the panels stack and open downwards, titles horizontal.',
    'prefers-reduced-motion: the panels switch without sliding.',
  ],
};
