import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { TimeRangePicker, type TimeRange } from './time-range-picker';
import { Label } from './label';
import { timeRangePickerGuidelines } from './time-range-picker.guidelines';

const meta: Meta<typeof TimeRangePicker> = {
  title: 'Date & Time/TimeRangePicker',
  component: TimeRangePicker,
  tags: ['autodocs'],
  parameters: {
    guidelines: timeRangePickerGuidelines,
    docs: {
      description: {
        component:
          'A start + end time pair, two TimeFields with a "to" separator. The end field\u2019s earliest option ' +
          'follows the chosen start, so you cannot pick an end before the start.',
      },
    },
  },
  argTypes: {
    value: { control: false, description: 'Controlled { start, end } time range.' },
    onChange: { control: false, description: 'Called with the new { start, end } time range.' },
    hourCycle: { control: 'inline-radio', options: [12, 24], description: '12-hour (AM/PM) or 24-hour labels. Defaults to 12.', table: { category: 'Appearance' } },
    step: { control: { type: 'number', min: 1 }, description: 'Minutes between options for both fields.', table: { category: 'Behavior' } },
    min: { control: 'text', description: 'Earliest time offered, "HH:MM".', table: { category: 'Behavior' } },
    max: { control: 'text', description: 'Latest time offered, "HH:MM".', table: { category: 'Behavior' } },
    startLabel: { control: 'text', description: 'Accessible label for the start-time field.', table: { category: 'Content' } },
    endLabel: { control: 'text', description: 'Accessible label for the end-time field.', table: { category: 'Content' } },
    disabled: { control: 'boolean', description: 'Disables both time fields.', table: { category: 'State' } },
  },
};

export default meta;
type Story = StoryObj<typeof TimeRangePicker>;

const body = () => within(document.body);
const optionNames = () => body().getAllByRole('option').map((o) => o.textContent?.trim());

/** Opens a TimeField list and clicks an option by its label. */
async function pickTime(field: HTMLElement, label: string) {
  await userEvent.click(field);
  await userEvent.click(await body().findByRole('option', { name: label }));
  await waitFor(() => expect(body().queryByRole('listbox')).toBeNull());
}

function ControlledDemo(args: React.ComponentProps<typeof TimeRangePicker>) {
  const [value, setValue] = useState<TimeRange>({});
  return (
    <div className="w-[380px]">
      <TimeRangePicker {...args} value={value} onChange={setValue} />
      <p className="font-mono text-body-xs text-[var(--color-text-text-subtler)] mt-1">
        {value.start ?? '—'} to {value.end ?? '—'}
      </p>
    </div>
  );
}

/** An empty range. */
export const Default: Story = {
  render: (args) => <ControlledDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const start = canvas.getByRole('combobox', { name: 'Start time' });
    const end = canvas.getByRole('combobox', { name: 'End time' });

    await pickTime(start, '9:00 AM');
    await expect(canvas.getByText('09:00 to —')).toBeInTheDocument();

    // The end list starts at the chosen start.
    await userEvent.click(end);
    await body().findByRole('listbox');
    await expect(optionNames()[0]).toBe('9:00 AM');
    await userEvent.click(body().getByRole('option', { name: '5:00 PM' }));
    await expect(canvas.getByText('09:00 to 17:00')).toBeInTheDocument();

    // Moving the start past the end drops the end instead of inverting.
    await pickTime(start, '6:00 PM');
    await expect(canvas.getByText('18:00 to —')).toBeInTheDocument();
    await expect(end).toHaveValue('');
  },
};

/** A pre-filled business-hours range. */
export const Preselected: Story = {
  render: (args) => (
    <div className="w-[380px]">
      <TimeRangePicker {...args} defaultValue={{ start: '09:00', end: '17:00' }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('combobox', { name: 'Start time' })).toHaveValue('9:00 AM');
    const end = canvas.getByRole('combobox', { name: 'End time' });
    await expect(end).toHaveValue('5:00 PM');
    // Uncontrolled: a pick sticks.
    await pickTime(end, '6:00 PM');
    await expect(end).toHaveValue('6:00 PM');
  },
};

export const HourCycle24: Story = {
  name: '24-hour',
  render: (args) => (
    <div className="w-[380px]">
      <TimeRangePicker {...args} hourCycle={24} defaultValue={{ start: '09:00', end: '17:00' }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('combobox', { name: 'Start time' })).toHaveValue('09:00');
    await expect(canvas.getByRole('combobox', { name: 'End time' })).toHaveValue('17:00');
  },
};

/** 24-hour labels with a wired group label and a custom step — a maintenance window. */
export const TwentyFourHour: Story = {
  name: '24-hour, with label',
  render: (args) => (
    <div className="flex flex-col gap-1.5 w-[380px]">
      <Label id="maintenance-window">Maintenance window</Label>
      <TimeRangePicker {...args} aria-labelledby="maintenance-window" hourCycle={24} step={60} defaultValue={{ start: '01:00', end: '04:00' }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // The visible label names the pair.
    const group = within(canvasElement).getByRole('group', { name: 'Maintenance window' });
    const end = within(group).getByRole('combobox', { name: 'End time' });
    await userEvent.click(end);
    await body().findByRole('listbox');
    await expect(optionNames().slice(0, 3)).toEqual(['01:00', '02:00', '03:00']);
    await userEvent.keyboard('{Escape}');
  },
};

export const Disabled: Story = {
  render: (args) => (
    <div className="w-[380px]">
      <TimeRangePicker {...args} disabled defaultValue={{ start: '09:00', end: '17:00' }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('combobox', { name: 'Start time' })).toBeDisabled();
    await expect(canvas.getByRole('combobox', { name: 'End time' })).toBeDisabled();
  },
};
