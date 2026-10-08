import { C, type ComponentGuidelines } from '../../docs/guidelines';

const Tile = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] px-4 py-3 font-body text-body-m text-[var(--color-text-text)]">{children}</div>
);

export const tickerListGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['A few rows of recent activity inside a showcase card: transactions, signups, deploys.'],
  whenNotToUse: [
    { text: 'A real activity feed people scroll and act on', instead: 'List / DataTable' },
    { text: 'Notifications', instead: 'Toast' },
  ],
  anatomy: [
    { part: 'Window', description: <><C>visible</C> rows at a time.</> },
    { part: 'Turn', description: <>every <C>interval</C> ms the top row leaves and the next one slides in at the bottom.</> },
    { part: 'Pause', description: 'a small Pause / Play button under the list.' },
  ],
  doDont: [
    {
      do: { example: <Tile>3 visible of 6–10 short rows</Tile>, caption: 'Short rows, enough of them to make the motion meaningful.' },
      dont: { example: <Tile>Rows with buttons</Tile>, caption: 'A row that moves away while someone aims at it.' },
    },
  ],
  a11y: [
    'A plain list of the rows on screen; nothing is announced as it moves.',
    'Pauses on hover and focus and has a Pause button (WCAG 2.2.2).',
    'prefers-reduced-motion: it doesn’t move.',
  ],
};
