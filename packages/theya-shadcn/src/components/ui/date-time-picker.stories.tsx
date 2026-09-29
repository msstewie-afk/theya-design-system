import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
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

const body = () => within(document.body);
const optionNames = () => body().getAllByRole('option').map((o) => o.textContent?.trim());

/** Opens a TimeField list and clicks an option by its label. */
async function pickTime(field: HTMLElement, label: string) {
  await userEvent.click(field);
  await userEvent.click(await body().findByRole('option', { name: label }));
  await waitFor(() => expect(body().queryByRole('listbox')).toBeNull());
}

const dateFmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

/** Opens the date popover, moves `days` with the arrow keys and picks. */
async function pickDay(trigger: HTMLElement, days: number) {
  await userEvent.click(trigger);
  await body().findByRole('grid');
  await waitFor(() => expect(document.activeElement?.closest('[role="grid"]')).not.toBeNull());
  await userEvent.keyboard('{ArrowRight}'.repeat(days) + '{Enter}');
  await waitFor(() => expect(body().queryByRole('grid')).toBeNull());
}

function ControlledDemo(args: React.ComponentProps<typeof DateTimePicker>) {
  const [value, setValue] = useState<Date | undefined>();
  return <DateTimePicker {...args} value={value} onChange={setValue} aria-label="Appointment" />;
}

/** Empty: pick a date, then a time. */
export const Default: Story = {
  render: (args) => <ControlledDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const date = canvas.getByRole('button', { name: 'Appointment' });
    const time = canvas.getByRole('combobox', { name: 'Appointment time' });
    await expect(date).toHaveAccessibleDescription('Pick a date');

    // Time first: it lands on today.
    await pickTime(time, '9:00 AM');
    await expect(date).toHaveAccessibleDescription(dateFmt.format(new Date()));
    await expect(time).toHaveValue('9:00 AM');

    // A new date keeps the chosen time.
    await pickDay(date, 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await expect(date).toHaveAccessibleDescription(dateFmt.format(tomorrow));
    await expect(time).toHaveValue('9:00 AM');
  },
};

/** Pre-selected date and time. */
export const Preselected: Story = {
  args: { defaultValue: new Date(2026, 6, 18, 9, 30), 'aria-label': 'Appointment' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const date = canvas.getByRole('button', { name: 'Appointment' });
    const time = canvas.getByRole('combobox', { name: 'Appointment time' });
    await expect(date).toHaveAccessibleDescription('Jul 18, 2026');
    await expect(time).toHaveValue('9:30 AM');

    await pickTime(time, '2:00 PM');
    await expect(time).toHaveValue('2:00 PM');
    await expect(date).toHaveAccessibleDescription('Jul 18, 2026');

    await pickDay(date, 1);
    await expect(date).toHaveAccessibleDescription('Jul 19, 2026');
    await expect(time).toHaveValue('2:00 PM');
  },
};

/** With a wired label and 24-hour time. */
export const WithLabel: Story = {
  render: (args) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="deploy-at">Schedule deploy</Label>
      <DateTimePicker {...args} id="deploy-at" hourCycle={24} aria-label="Schedule deploy" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Schedule deploy' })).toBeInTheDocument();
    const time = canvas.getByRole('combobox', { name: 'Schedule deploy time' });
    await expect(time).toHaveValue('');
    await userEvent.click(time);
    await body().findByRole('listbox');
    await expect(optionNames().slice(0, 2)).toEqual(['00:00', '00:30']);
    await userEvent.keyboard('{Escape}');
  },
};

export const HourCycle24: Story = {
  name: '24-hour',
  render: (args) => <ControlledDemo {...args} hourCycle={24} />,
};

export const Disabled: Story = {
  args: { disabled: true, 'aria-label': 'Appointment' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Appointment' })).toBeDisabled();
    await expect(canvas.getByRole('combobox', { name: 'Appointment time' })).toBeDisabled();
  },
};

/** Invalid: the error covers the whole value, so both fields show it and both are described by the message. */
export const Invalid: Story = {
  render: (args) => (
    <div className="flex flex-col gap-1.5">
      <DateTimePicker
        {...args}
        defaultValue={new Date(2026, 6, 18, 9, 30)}
        aria-label="Appointment"
        aria-invalid
        aria-describedby="appointment-error"
      />
      <p id="appointment-error" className="font-body text-body-xs font-medium text-[var(--color-text-text-danger)]">
        That slot is already booked.
      </p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const date = canvas.getByRole('button', { name: 'Appointment' });
    const time = canvas.getByRole('combobox', { name: 'Appointment time' });
    await expect(date).toHaveAttribute('aria-invalid', 'true');
    await expect(time).toHaveAttribute('aria-invalid', 'true');
    await expect(time).toHaveAccessibleDescription('That slot is already booked.');
  },
};
