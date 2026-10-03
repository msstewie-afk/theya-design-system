import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Scheduler, type SchedulerEvent } from './scheduler';

const NOW = new Date(2026, 9, 5, 11, 20);
const at = (h: number, m = 0) => new Date(2026, 9, 5, h, m);

const GOOD: SchedulerEvent[] = [
  { id: '1', title: 'Database migration — eu-central', start: at(9), end: at(10, 30), tone: 'warning' },
  { id: '2', title: 'Deploy 4.12 to production', start: at(12), end: at(13), tone: 'success' },
];
const BAD: SchedulerEvent[] = [
  { id: '1', title: 'Weekly planning', start: at(9), end: at(10, 30), tone: 'danger' },
  { id: '2', title: 'Team lunch', start: at(12), end: at(13), tone: 'warning' },
];

const mini = { now: NOW, defaultDate: NOW, defaultView: 'day' as const, views: ['day' as const], scrollToHour: 8, hourHeight: 36, className: 'h-80 w-[26rem]' };

export const schedulerGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['Events placed in time: maintenance windows, bookings, shifts, release plans.', <>Rescheduling by drag (<C>onEventChange</C>) and creating from an empty slot (<C>onSlotClick</C>).</>],
  whenNotToUse: [
    { text: 'Picking a date or a range', instead: 'DatePicker or DateRangePicker' },
    { text: 'Past events as a log', instead: 'Timeline' },
    { text: 'Work by stage, not by time', instead: 'Kanban' },
    { text: 'A few upcoming items', instead: 'a list with dates' },
  ],
  anatomy: [
    { part: 'Header', description: 'Today, previous / next, the visible range, view switch.' },
    { part: 'Grid', description: <>day / week time grid with an all-day row and a “now” line; month grid with “+N more”.</> },
    { part: 'Event', description: <>title and time; <C>tone</C> for its kind; <C>locked</C> can’t be moved.</> },
  ],
  doDont: [
    {
      do: { example: <Scheduler {...mini} events={GOOD} />, caption: 'Tone marks the kind of event: risky work warning, a release success.' },
      dont: { example: <Scheduler {...mini} events={BAD} />, caption: 'Danger for a planning meeting: color stops meaning anything.' },
    },
  ],
  a11y: [
    'Events are buttons named with title and time; the visible range is announced when it changes.',
    'Drag isn’t the only way: clicking an event should open an editor with date and time fields.',
    <>Set <C>locale</C> and <C>weekStartsOn</C> for the user, not the server.</>,
    'Tone is never the only signal — say the kind in the title or details.',
  ],
};
