import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DateTimePicker } from './date-time-picker';
import { Label } from './label';

const meta: Meta<typeof DateTimePicker> = {
  title: 'Date & Time/DateTimePicker',
  component: DateTimePicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Pick a date and a time together, composing DatePicker (a Calendar popover) with TimeField (a time ' +
          'list). Fields stack on a phone and sit side by side from sm up.',
      },
    },
  },
  argTypes: {
    value: { control: false, description: 'Controlled combined date+time value.' },
    onChange: { control: false, description: 'Fires with the new combined date+time value.' },
    hourCycle: { control: 'inline-radio', options: [12, 24], description: '12-hour (AM/PM) or 24-hour time labels.', table: { category: 'Appearance' } },
    showClear: { control: 'boolean', description: 'Show a clear button in the date field.', table: { category: 'Appearance' } },
    disabled: { control: 'boolean', description: 'Disables the date and time fields.', table: { category: 'State' } },
  },
  args: { hourCycle: 12, showClear: false, disabled: false },
  decorators: [
    (Story) => (
      <div className="w-[380px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DateTimePicker>;

function ControlledDemo(args: React.ComponentProps<typeof DateTimePicker>) {
  const [value, setValue] = useState<Date | undefined>();
  return <DateTimePicker {...args} value={value} onChange={setValue} aria-label="Appointment" />;
}

/** Empty: pick a date, then a time. */
export const Default: Story = {
  render: (args) => <ControlledDemo {...args} />,
};

/** Pre-selected date and time. */
export const Preselected: Story = {
  args: { defaultValue: new Date(2026, 6, 18, 9, 30), 'aria-label': 'Appointment' },
};

/** With a wired label and 24-hour time. */
export const WithLabel: Story = {
  render: (args) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="deploy-at">Schedule deploy</Label>
      <DateTimePicker {...args} id="deploy-at" hourCycle={24} aria-label="Schedule deploy" />
    </div>
  ),
};

export const HourCycle24: Story = {
  name: '24-hour',
  render: (args) => <ControlledDemo {...args} hourCycle={24} />,
};

export const Disabled: Story = {
  args: { disabled: true, 'aria-label': 'Appointment' },
};
