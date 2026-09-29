import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { DatePicker } from './date-picker';
import { Label } from './label';

const meta: Meta<typeof DatePicker> = {
  title: 'Date & Time/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Single-date field composing a SelectTrigger-styled button + Popover + Calendar. Always carries an ' +
          'accessible name (a visible Label via id/htmlFor, or aria-label). Controlled with value/onChange, or ' +
          'uncontrolled with defaultValue. Pass calendarProps for min/max matchers etc.',
      },
    },
  },
  argTypes: {
    placeholder: { control: 'text', description: 'Trigger text when no date is picked.', table: { category: 'Content' } },
    showClear: { control: 'boolean', description: 'Show a clear button when a date is selected.', table: { category: 'Appearance' } },
    disabled: { control: 'boolean', description: 'Disables the date picker.', table: { category: 'State' } },
    'aria-label': { control: 'text', description: 'Accessible name when there is no visible Label.', table: { category: 'Content' } },
    value: { control: false, description: 'Controlled selected date.', table: { category: 'State' } },
    defaultValue: { control: false, description: 'Uncontrolled initial selected date.', table: { category: 'State' } },
    onChange: { control: false, description: 'Fires with the new date (or undefined when cleared).', table: { category: 'Events' } },
    calendarProps: { control: false, description: 'Props forwarded to the underlying Calendar.', table: { category: 'Advanced' } },
    id: { control: false, description: 'id on the trigger, for an external <label htmlFor>.', table: { category: 'Advanced' } },
    className: { control: false, description: 'Class on the trigger element.', table: { category: 'Advanced' } },
    'aria-invalid': { control: false, table: { category: 'Advanced' } },
    'aria-describedby': { control: false, table: { category: 'Advanced' } },
  },
  args: {
    'aria-label': 'Pick a date',
    placeholder: 'Pick a date',
    disabled: false,
    showClear: false,
  },
  decorators: [
    (Story) => (
      <div className="w-[240px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

/** The empty trigger. Open the calendar and pick a day — the trigger then shows the locale-formatted date. */
export const Default: Story = {};

function RenewalField(args: React.ComponentProps<typeof DatePicker>) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="renew-date">Renewal date</Label>
      <DatePicker {...args} id="renew-date" aria-label={undefined} value={date} onChange={setDate} placeholder="Pick a renewal date" />
    </div>
  );
}

/** Paired with a visible Label via id/htmlFor — the field's accessible name comes from the label, no aria-label needed. */
export const WithLabel: Story = {
  parameters: { controls: { exclude: ['aria-label'] } },
  render: (args) => <RenewalField {...args} />,
};

/** Pre-selected via defaultValue (uncontrolled). The trigger shows the locale-formatted date instead of the placeholder. */
export const WithValue: Story = {
  name: 'With value',
  args: { 'aria-label': 'Start date', defaultValue: new Date(2026, 5, 16) },
  // The chosen date is announced (as the description, since aria-label
  // replaces the button text); keyboard picking in the calendar updates it
  // and returns focus to the trigger. Ends closed.
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Start date' });
    await expect(trigger).toHaveAccessibleDescription('Jun 16, 2026');

    await userEvent.click(trigger);
    const calendar = await within(document.body).findByRole('grid');
    await waitFor(() => expect(calendar.contains(document.activeElement)).toBe(true));
    await userEvent.keyboard('{ArrowRight}{Enter}');

    await waitFor(() => expect(within(document.body).queryByRole('grid')).toBeNull());
    await expect(trigger).toHaveAccessibleDescription('Jun 17, 2026');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/** The clear button appears once a date is selected. */
export const WithClear: Story = {
  name: 'With clear button',
  args: { 'aria-label': 'Start date', defaultValue: new Date(2026, 5, 16), showClear: true },
  // Clearing resets to the placeholder, removes the clear button and puts
  // focus back on the trigger instead of dropping it on <body>.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Start date' });
    await userEvent.click(canvas.getByRole('button', { name: 'Clear date' }));
    await expect(trigger).toHaveAccessibleDescription('Pick a date');
    await expect(canvas.queryByRole('button', { name: 'Clear date' })).toBeNull();
    await expect(trigger).toHaveFocus();
  },
};

/** Disabled blocks interaction and dims the trigger. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: new Date(2026, 5, 16), 'aria-label': 'Start date' },
};

/** `calendarProps` forwards matchers to the inner Calendar — here, every day before today is disabled, so only future dates can be picked. */
export const FutureDatesOnly: Story = {
  name: 'Future dates only',
  args: { 'aria-label': 'Start date', placeholder: 'Pick a start date', calendarProps: { disabled: { before: new Date() } } },
};
