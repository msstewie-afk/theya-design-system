import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Skeleton } from './skeleton';

export const skeletonGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['First load of content whose shape is known: a card, a list, a profile header.', 'Short waits, roughly under a few seconds.'],
  whenNotToUse: [
    { text: 'Table rows', instead: 'TableSkeleton' },
    { text: 'A task with known percent done', instead: 'Progress' },
    { text: 'Reloading data that is already shown', instead: 'keep the old data and show a subtle busy state' },
    { text: 'Nothing to show', instead: 'EmptyState' },
  ],
  anatomy: [{ part: 'Block', description: <>a pulsing shape; size it with <C>className</C> to the content it stands in for.</> }],
  doDont: [
    {
      do: {
        example: (
          <div className="flex w-72 items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ),
        caption: 'Same layout as the real item — nothing jumps when it loads.',
      },
      dont: { example: <Skeleton className="h-24 w-72 rounded-[var(--size-border-radius-border-radius-lg)]" />, caption: 'One big block: the layout shifts when content arrives.' },
    },
  ],
  a11y: [
    'Skeletons are hidden from screen readers; mark the loading region aria-busy="true" and remove it when done.',
    'Fully rounded by default; give blocks (images, cards) a block radius. The sweep stops with reduced motion.',
    'Don’t put focusable elements inside a loading region.',
  ],
};
