import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import type { DateRange } from 'react-day-picker';
import { DateRangePicker } from './date-range-picker';
import { Label } from './label';

const meta: Meta<typeof DateRangePicker> = {
  title: 'Date & Time/DateRangePicker',
  component: DateRangePicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Start/end date field composing a SelectTrigger-styled button + Popover + a range Calendar. Stays open ' +
          'through selection (a range needs two clicks); two months show by default and stack below md. For a ' +
          'single date use DatePicker; for an always-visible grid use Calendar.',
      },
    },
  },
  argTypes: {
    placeholder: { control: 'text', description: 'Trigger text when no range is picked.', table: { category: 'Content' } },
    showClear: { control: 'boolean', description: 'Show a clear button when a range is selected.', table: { category: 'Appearance' } },
    numberOfMonths: { control: { type: 'number', min: 1, max: 3 }, description: 'How many calendar months are shown side by side.', table: { category: 'Appearance' } },
    disabled: { control: 'boolean', description: 'Disables the date range picker.', table: { category: 'State' } },
    'aria-label': { control: 'text', description: 'Accessible name when there is no visible Label.', table: { category: 'Content' } },
    value: { control: false, description: 'Controlled selected range.', table: { category: 'State' } },
    defaultValue: { control: false, description: 'Uncontrolled initial selected range.', table: { category: 'State' } },
    onChange: { control: false, description: 'Fires with the new range.', table: { category: 'Events' } },
    calendarProps: { control: false, description: 'Props forwarded to the underlying Calendar.', table: { category: 'Advanced' } },
    id: { control: false, description: 'id on the trigger, for an external <label htmlFor>.', table: { category: 'Advanced' } },
    className: { control: false, description: 'Class on the trigger element.', table: { category: 'Advanced' } },
    'aria-invalid': { control: false, table: { category: 'Advanced' } },
    'aria-describedby': { control: false, table: { category: 'Advanced' } },
  },
  args: {
    'aria-label': 'Pick a date range',
    placeholder: 'Pick a date range',
    numberOfMonths: 2,
    disabled: false,
    showClear: false,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[320px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DateRangePicker>;

const body = () => within(document.body);

/** Opens the popover and waits until the calendar owns focus. */
async function openCalendar(trigger: HTMLElement) {
  await userEvent.click(trigger);
  const grid = (await body().findAllByRole('grid'))[0];
  await waitFor(() => expect(document.activeElement?.closest('[role="grid"]')).not.toBeNull());
  return grid;
}

async function closeWithEscape(trigger: HTMLElement) {
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body().queryByRole('grid')).toBeNull());
  await waitFor(() => expect(trigger).toHaveFocus());
}

/** The empty trigger. Open the calendar and click a start then an end day — the trigger then shows "from – to". */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Pick a date range' });
    // aria-label replaces the button text, so the value rides on the description.
    await expect(trigger).toHaveAccessibleDescription('Pick a date range');

    await openCalendar(trigger);
    await userEvent.keyboard('{Enter}');
    // Start picked: one date, popover stays open for the end.
    await waitFor(() => expect(trigger).not.toHaveAccessibleDescription('Pick a date range'));
    await expect(trigger.textContent).not.toContain('–');
    await expect(body().getAllByRole('grid').length).toBeGreaterThan(0);

    await userEvent.keyboard('{ArrowRight}{ArrowRight}{Enter}');
    await waitFor(() => expect(trigger.textContent).toContain('–'));

    await closeWithEscape(trigger);
    await expect(trigger.textContent).toContain('–');
  },
};

function ReportRange(args: React.ComponentProps<typeof DateRangePicker>) {
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="report-range">Report period</Label>
      <DateRangePicker {...args} id="report-range" aria-label={undefined} value={range} onChange={setRange} />
    </div>
  );
}

/** Paired with a visible Label via id/htmlFor. Controlled state. */
export const WithLabel: Story = {
  parameters: { controls: { exclude: ['aria-label'] } },
  render: (args) => <ReportRange {...args} />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Report period' });
    await expect(trigger).toHaveAccessibleDescription('Pick a date range');
  },
};

/** Pre-selected via defaultValue (uncontrolled): the trigger shows the range. */
export const WithValue: Story = {
  name: 'With value',
  args: { 'aria-label': 'Report period', defaultValue: { from: new Date(2026, 5, 2), to: new Date(2026, 5, 9) } },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Report period' });
    await expect(trigger).toHaveAccessibleDescription('Jun 2, 2026 – Jun 9, 2026');

    // Opens on the range's month with focus on its start, not on today.
    await openCalendar(trigger);
    await expect(document.activeElement?.textContent).toBe('2');
    await expect(body().getAllByRole('grid')[0]).toHaveAccessibleName(/June 2026/);

    await closeWithEscape(trigger);
    await expect(trigger).toHaveAccessibleDescription('Jun 2, 2026 – Jun 9, 2026');
  },
};

/** The clear button appears once a range is selected. */
export const WithClear: Story = {
  name: 'With clear button',
  args: { 'aria-label': 'Report period', defaultValue: { from: new Date(2026, 5, 2), to: new Date(2026, 5, 9) }, showClear: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Report period' });
    await userEvent.click(canvas.getByRole('button', { name: 'Clear date range' }));
    await expect(trigger).toHaveAccessibleDescription('Pick a date range');
    await expect(canvas.queryByRole('button', { name: 'Clear date range' })).toBeNull();
    // The clear button unmounted; focus stays in the field.
    await expect(trigger).toHaveFocus();
  },
};

/** A single month, restricted to the past — useful for a log/report filter. */
export const PastOnlySingleMonth: Story = {
  name: 'Past dates only, single month',
  args: { 'aria-label': 'Log date range', numberOfMonths: 1, calendarProps: { disabled: { after: new Date() } } },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Log date range' });
    await openCalendar(trigger);
    await expect(body().getAllByRole('grid')).toHaveLength(1);
    await closeWithEscape(trigger);
  },
};

/** Disabled blocks interaction and dims the trigger. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: { from: new Date(2026, 5, 2), to: new Date(2026, 5, 9) }, 'aria-label': 'Report period' },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Report period' });
    await expect(trigger).toBeDisabled();
    await expect(trigger).toHaveAccessibleDescription('Jun 2, 2026 – Jun 9, 2026');
  },
};
