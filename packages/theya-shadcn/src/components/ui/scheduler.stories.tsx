import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Scheduler, type SchedulerEvent } from './scheduler';

/**
 * Scheduler — week / day time grid with drag-to-move and resize, month grid
 * with "+N more". Events are buttons named with their title and time.
 * Stories use a fixed "now" (Mon, Oct 5 2026, 11:20) so they render the same every day.
 */

const NOW = new Date(2026, 9, 5, 11, 20);
const at = (day: number, h: number, m = 0) => new Date(2026, 9, day, h, m);

const EVENTS: SchedulerEvent[] = [
  { id: 'e1', title: 'Database migration — eu-central', start: at(7, 2), end: at(7, 4), tone: 'warning' },
  { id: 'e2', title: 'Weekly planning', start: at(7, 10), end: at(7, 11) },
  { id: 'e3', title: 'Release 4.12 freeze', start: at(6, 0), end: at(7, 0), allDay: true, tone: 'info' },
  { id: 'e4', title: 'Design review: checkout', start: at(6, 14), end: at(6, 15, 30), tone: 'neutral' },
  { id: 'e5', title: 'Deploy 4.12 to staging', start: at(5, 9, 30), end: at(5, 10, 30), tone: 'primary' },
  { id: 'e6', title: 'Incident review', start: at(5, 10), end: at(5, 11), tone: 'danger' },
  { id: 'e7', title: 'Customer call — Acme', start: at(5, 10, 15), end: at(5, 10, 45), tone: 'neutral' },
  { id: 'e8', title: 'Certificate renewal window', start: at(5, 13), end: at(5, 14), tone: 'warning', locked: true },
  { id: 'e9', title: 'Deploy 4.12 to production', start: at(8, 9), end: at(8, 10), tone: 'success' },
  { id: 'e10', title: 'On-call: Alex', start: at(8, 0), end: at(11, 0), allDay: true, tone: 'neutral' },
  { id: 'e11', title: 'Retro', start: at(9, 16), end: at(9, 17) },
  { id: 'e12', title: 'Backup restore drill', start: at(14, 3), end: at(14, 5), tone: 'warning' },
  { id: 'e13', title: 'Quarterly planning', start: at(20, 10), end: at(20, 12) },
  { id: 'e14', title: 'Team lunch', start: at(20, 12, 30), end: at(20, 13, 30), tone: 'success' },
  { id: 'e15', title: 'Security audit', start: at(20, 14), end: at(20, 16), tone: 'danger' },
  { id: 'e16', title: 'Docs sprint', start: at(20, 16), end: at(20, 17), tone: 'info' },
];

const meta = {
  title: 'Data/Scheduler',
  component: Scheduler,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    events: { control: false, description: 'id, title, start, end, allDay, tone, locked.' },
    view: { control: false },
    defaultView: { control: 'inline-radio', options: ['day', 'week', 'month'] },
    onViewChange: { control: false },
    date: { control: false },
    defaultDate: { control: false },
    onDateChange: { control: false },
    views: { control: 'check', options: ['day', 'week', 'month'], description: 'Views offered in the switch.' },
    onEventClick: { control: false },
    onEventChange: { control: false, description: 'Drag/resize finished; omit for read-only.' },
    onSlotClick: { control: false, description: 'Empty slot clicked (create flow).' },
    locale: { control: 'text', description: 'Intl locale for dates and times.' },
    weekStartsOn: { control: { type: 'number', min: 0, max: 6 } },
    hourHeight: { control: 'number' },
    scrollToHour: { control: 'number' },
    maxEventsPerDay: { control: 'number' },
    now: { control: false, description: 'Fixed "now" (stories/tests).' },
    className: { control: false },
  },
  args: { events: EVENTS, now: NOW, defaultDate: NOW, className: 'h-[640px]' },
} satisfies Meta<typeof Scheduler>;

export default meta;
type Story = StoryObj<typeof meta>;

function Editable(args: React.ComponentProps<typeof Scheduler>) {
  const [events, setEvents] = useState(EVENTS);
  const [log, setLog] = useState('');
  return (
    <div className="flex flex-col gap-3">
      <Scheduler
        {...args}
        events={events}
        onEventClick={(e) => setLog(`Opened “${e.title}”`)}
        onEventChange={(e, next) => {
          setEvents((prev) => prev.map((x) => (x.id === e.id ? { ...x, ...next } : x)));
          setLog(`Moved “${e.title}” to ${next.start.toLocaleString()}`);
        }}
        onSlotClick={({ start, end, allDay }) => {
          setEvents((prev) => [...prev, { id: `n${prev.length + 1}`, title: 'New event', start, end, allDay }]);
          setLog(`Created at ${start.toLocaleString()}`);
        }}
      />
      {log && <p className="text-body-s text-[var(--color-text-text-subtle)]">{log}</p>}
    </div>
  );
}

/** Week view: drag to move (also across days), drag the bottom edge to resize, click an empty slot to create. The locked event can't move. */
export const Week: Story = {
  render: (args) => <Editable {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = () => canvas.getByRole('heading', { level: 2 });
    const log = () => canvas.getByText(/^(Opened|Moved|Created)/);

    // Navigation: next week, then back with Today.
    await expect(title()).toHaveTextContent('Oct 5 – 11, 2026');
    await userEvent.click(canvas.getByRole('button', { name: 'Next week' }));
    await expect(title()).toHaveTextContent('Oct 12 – 18, 2026');
    await userEvent.click(canvas.getByRole('button', { name: 'Today' }));
    await expect(title()).toHaveTextContent('Oct 5 – 11, 2026');

    // Events are buttons named with title, day and time; click and Enter open them.
    const deploy = canvas.getByRole('button', { name: /^Deploy 4\.12 to staging, Monday, October 5, 2026, 9:30/ });
    await userEvent.click(deploy);
    await expect(log()).toHaveTextContent('Opened “Deploy 4.12 to staging”');
    deploy.focus();
    await userEvent.keyboard('{Enter}');
    await expect(log()).toHaveTextContent('Opened “Deploy 4.12 to staging”');

    // Drag down by one hour (48px per hour): the event moves in 15-minute steps.
    const box = deploy.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + 8;
    // Native pointer events (user-event's pointer moves didn't reliably reach the handler).
    const fire = (type: string, clientY: number) =>
      deploy.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, composed: true, pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0, buttons: type === 'pointerup' ? 0 : 1, clientX: x, clientY }));
    fire('pointerdown', y);
    fire('pointermove', y + 24);
    fire('pointermove', y + 48);
    fire('pointerup', y + 48);
    await waitFor(() => expect(log()).toHaveTextContent(/^Moved “Deploy 4\.12 to staging”/));
    await expect(canvas.getByRole('button', { name: /^Deploy 4\.12 to staging, .*10:30/ })).toBeInTheDocument();

    // The locked event doesn't drag: a press-and-move just opens it.
    const locked = canvas.getByRole('button', { name: /^Certificate renewal window/ });
    await userEvent.click(locked);
    await expect(log()).toHaveTextContent('Opened “Certificate renewal window”');

    // Clicking an empty slot creates an event there.
    const tuesday = canvas.getByRole('group', { name: 'Tuesday, October 6, 2026' });
    const col = tuesday.getBoundingClientRect();
    await userEvent.pointer({ keys: '[MouseLeft]', target: tuesday, coords: { clientX: col.left + 10, clientY: col.top + 48 * 17 + 5 } });
    await waitFor(() => expect(log()).toHaveTextContent(/^Created/));
    await expect(canvas.getByRole('button', { name: /^New event, Tuesday, October 6, 2026, 5:00/ })).toBeInTheDocument();
  },
};

/** Day view, with overlapping events side by side and the "now" line. */
export const Day: Story = {
  args: { defaultView: 'day' },
  render: (args) => <Editable {...args} />,
};

/** Month view: "+N more" opens the day. */
export const Month: Story = {
  args: { defaultView: 'month' },
  render: (args) => <Editable {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 2 })).toHaveTextContent('October 2026');
    // Oct 20 has four events; three show, the rest is behind "+1 more", which opens the day.
    const day = canvas.getByRole('group', { name: 'Tuesday, October 20, 2026, 4 events' });
    const chips = within(day).getAllByRole('button').filter((b) => !b.textContent?.startsWith('+'));
    await expect(chips).toHaveLength(3);
    await userEvent.click(within(day).getByRole('button', { name: /^\+1 more/ }));
    await expect(canvas.getByRole('heading', { level: 2 })).toHaveTextContent('Tuesday, October 20, 2026');
    await expect(canvas.getByRole('radio', { name: 'Day' })).toBeChecked();
    await expect(canvas.getByRole('button', { name: /^Docs sprint/ })).toBeInTheDocument();
  },
};

/** Read-only: no onEventChange / onSlotClick. */
export const ReadOnly: Story = {
  name: 'Read-only',
  args: { views: ['week', 'month'] },
};

/** German locale: 24-hour times and localized day and month names. */
export const Localized: Story = {
  args: { locale: 'de-DE', weekStartsOn: 1, defaultView: 'week' },
};
