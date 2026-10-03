import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Progress } from './progress';
import { Skeleton } from './skeleton';

export const progressGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A task with a known percent done: upload, restore, export, install.', 'Steps of a long setup, when the share done is meaningful.'],
  whenNotToUse: [
    { text: 'How full something is (disk, quota)', instead: 'Meter' },
    { text: 'Content loading for the first time', instead: 'Skeleton' },
    { text: 'A background task people shouldn’t wait on', instead: 'a progress toast (toast.progress)' },
    { text: 'Named steps of a flow', instead: 'Stepper' },
  ],
  anatomy: [
    { part: 'Label', description: <>what is running — next to the bar and linked with <C>aria-labelledby</C>.</> },
    { part: 'Track and indicator', description: <><C>value</C> 0–100, clamped.</> },
    { part: 'Value / status text', description: 'percent, or “3 of 12 sites”, or time left.', optional: true },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex w-72 flex-col gap-1.5">
            <div className="flex justify-between text-body-s"><span id="gl-pr-label">Restoring backup</span><span className="tabular-nums">66%</span></div>
            <Progress value={66} aria-labelledby="gl-pr-label" />
          </div>
        ),
        caption: 'What’s running and how much is done.',
      },
      dont: {
        example: <div className="w-72"><Progress value={66} aria-label="Progress" /></div>,
        caption: 'A bare bar: progress of what?',
      },
    },
    {
      do: {
        example: (
          <div className="flex w-72 flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        ),
        caption: 'Unknown duration → a skeleton of the coming content.',
      },
      dont: {
        example: <div className="w-72"><Progress value={30} aria-label="Loading" /></div>,
        caption: 'A fake percent for a page load lies about the wait.',
      },
    },
  ],
  a11y: [
    <>Always named: <C>aria-labelledby</C> to the visible label, or <C>aria-label</C>.</>,
    'Announce start and finish in a live region (or a toast); don’t announce every percent.',
    'Movement respects reduced motion.',
  ],
};
