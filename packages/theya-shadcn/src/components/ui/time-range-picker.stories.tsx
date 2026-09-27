import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TimeRangePicker, type TimeRange } from './time-range-picker';
import { Label } from './label';

const meta: Meta<typeof TimeRangePicker> = {
  title: 'Date & Time/TimeRangePicker',
  component: TimeRangePicker,
  tags: ['autodocs'],
  parameters: {
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
};

/** A pre-filled business-hours range. */
export const Preselected: Story = {
  render: (args) => (
    <div className="w-[380px]">
      <TimeRangePicker {...args} defaultValue={{ start: '09:00', end: '17:00' }} />
    </div>
  ),
};

export const HourCycle24: Story = {
  name: '24-hour',
  render: (args) => (
    <div className="w-[380px]">
      <TimeRangePicker {...args} hourCycle={24} defaultValue={{ start: '09:00', end: '17:00' }} />
    </div>
  ),
};

/** 24-hour labels with a wired group label and a custom step — a maintenance window. */
export const TwentyFourHour: Story = {
  name: '24-hour, with label',
  render: (args) => (
    <div className="flex flex-col gap-1.5 w-[380px]">
      <Label>Maintenance window</Label>
      <TimeRangePicker {...args} hourCycle={24} step={60} defaultValue={{ start: '01:00', end: '04:00' }} />
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div className="w-[380px]">
      <TimeRangePicker {...args} disabled defaultValue={{ start: '09:00', end: '17:00' }} />
    </div>
  ),
};
