import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Button } from './button';

/** Static stand-in for the bar, for the do/don't examples. */
function BarMock({ message, children }: { message: string; children: React.ReactNode }) {
  return (
    <div className="flex w-80 items-center justify-between gap-3 rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] px-4 py-3 shadow-elevation-lg">
      <span className="font-body text-body-m text-[var(--color-text-text)]">{message}</span>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

export const stickyActionBarGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['Save / Discard at the end of a long form, kept in view while scrolling.', <>Bulk actions for a selection (<C>variant="floating"</C>) — appears when something is selected.</>, 'The primary button of a mobile screen.'],
  whenNotToUse: [
    { text: 'Short forms where the buttons are already in view' },
    { text: 'Navigation', instead: 'Tabs or a bottom nav' },
    { text: 'A message without actions', instead: 'Alert or Toast' },
  ],
  anatomy: [
    { part: 'Bar', description: <><C>bar</C> (full-width strip) or <C>floating</C> (centered card); <C>sticky</C> or <C>fixed</C>.</> },
    { part: 'Message', optional: true, description: '“3 selected”, “Unsaved changes” — announced when it changes.' },
    { part: 'Actions', description: 'primary last; md buttons.' },
    { part: 'Close', optional: true, description: <><C>onClose</C> — “Clear selection”.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <BarMock message="3 selected">
            <Button appearance="outlined" tone="secondary" size="md">Export</Button>
            <Button appearance="filled" tone="danger" size="md">Delete</Button>
          </BarMock>
        ),
        caption: 'Says what the actions apply to.',
      },
      dont: {
        example: (
          <BarMock message="">
            <Button appearance="outlined" tone="secondary" size="md">Export</Button>
            <Button appearance="filled" tone="danger" size="md">Delete</Button>
          </BarMock>
        ),
        caption: 'Without the count, “Delete” could mean anything.',
      },
    },
  ],
  a11y: [
    'It’s a labelled landmark (“Actions” by default); the message is a polite live region.',
    'Closed means not rendered — no hidden tab stops.',
    'Keep the end of the page reachable: the bar covers the content under it.',
  ],
};
