import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { StatusDot } from './status-dot';

export const statusDotGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Live state next to its text label: Running, Stopped, Degraded, Online.', 'Dense lists and tables where a Badge would be too heavy.'],
  whenNotToUse: [
    { text: 'A status that should stand out', instead: 'Badge' },
    { text: 'A count or “new” mark on an icon', instead: 'BadgeIndicator' },
  ],
  anatomy: [
    { part: 'Dot', description: <>7px, <C>tone</C>; <C>inverse</C> on a forced-dark surface.</> },
    { part: 'Label', description: 'a sibling text — always.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex flex-col gap-2 text-body-s">
            <span className="inline-flex items-center gap-2"><StatusDot tone="success" />Running</span>
            <span className="inline-flex items-center gap-2"><StatusDot tone="danger" />Stopped</span>
          </div>
        ),
        caption: 'The word says the state; the dot helps scanning.',
      },
      dont: {
        example: (
          <div className="flex flex-col gap-2 text-body-s">
            <span className="inline-flex items-center gap-2"><StatusDot tone="success" />web-01</span>
            <span className="inline-flex items-center gap-2"><StatusDot tone="danger" />web-02</span>
          </div>
        ),
        caption: 'Color alone: not everyone can tell these two apart.',
      },
    },
  ],
  a11y: ['The dot is presentational — the text label carries the status.', <>On a forced-dark surface (Terminal header, dark toast) use <C>inverse</C> so the dot keeps its contrast.</>],
};
