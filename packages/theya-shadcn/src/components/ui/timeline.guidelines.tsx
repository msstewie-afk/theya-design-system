import { CheckCircle, WarningTriangle } from 'iconoir-react';
import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Timeline, TimelineDescription, TimelineItem, TimelineTitle } from './timeline';

export const timelineGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A sequence of events in time: activity on a site, an incident’s history, an order’s progress.'],
  whenNotToUse: [
    { text: 'A searchable, filterable log', instead: 'DataTable (audit log)' },
    { text: 'Steps people go through', instead: 'Stepper' },
    { text: 'Raw console output', instead: 'Terminal' },
  ],
  anatomy: [
    { part: 'Rail', description: <>a dot, or a chip with <C>icon</C>, colored by <C>tone</C>; a line to the next event.</> },
    { part: 'Time', description: <><C>time</C> — absolute, or relative with the exact time on hover.</> },
    { part: 'Title', description: 'what happened.' },
    { part: 'Description', description: 'the object or detail.', optional: true },
  ],
  doDont: [
    {
      do: {
        example: (
          <Timeline className="w-80">
            <TimelineItem tone="success" time="14:02" icon={<CheckCircle />}>
              <TimelineTitle>Certificate issued</TimelineTitle>
              <TimelineDescription>shop.seashell.dev · valid 90 days</TimelineDescription>
            </TimelineItem>
            <TimelineItem tone="warning" time="13:40" icon={<WarningTriangle />}>
              <TimelineTitle>DNS check retried</TimelineTitle>
            </TimelineItem>
            <TimelineItem time="13:38"><TimelineTitle>Renewal started</TimelineTitle></TimelineItem>
          </Timeline>
        ),
        caption: 'Newest first, each event with a time; color only where it matters.',
      },
      dont: {
        example: (
          <Timeline className="w-80">
            <TimelineItem tone="success" icon={<CheckCircle />}><TimelineTitle>Certificate issued</TimelineTitle></TimelineItem>
            <TimelineItem tone="success" icon={<CheckCircle />}><TimelineTitle>DNS check retried</TimelineTitle></TimelineItem>
            <TimelineItem tone="success" icon={<CheckCircle />}><TimelineTitle>Renewal started</TimelineTitle></TimelineItem>
          </Timeline>
        ),
        caption: 'No times, every event green — order and meaning are lost.',
      },
    },
  ],
  a11y: [
    'An ordered list; each non-neutral tone adds an sr-only word (“success”, “error”), so status isn’t color alone.',
    <>Override that word with <C>toneLabel</C> when the default doesn’t fit.</>,
    'Use a <time> element or full date in the description where the time is ambiguous.',
  ],
};
