import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { TimeField } from './time-field';
import { Label } from './label';
import { FieldError } from './field';
import { timeFieldGuidelines } from './time-field.guidelines';

// Notes moved from the Docs description (the page now shows a reader-facing
// summary):
//   A time picker built on Combobox with allowCreate — type a time off the
//   step grid and it commits directly.
const meta: Meta<typeof TimeField> = {
  title: 'Date & Time/TimeField',
  component: TimeField,
  tags: ['autodocs'],
  parameters: {
    guidelines: timeFieldGuidelines,
    docs: {
      description: {
        component: "A time of day — a daily backup, a meeting start, a reminder — picked from a list or typed.",
      },
    },
  },
  argTypes: {
    value: { control: false, description: 'Controlled value as a 24-hour "HH:MM" string.' },
    onChange: { control: false, description: 'Called with the selected "HH:MM" value (or "" when cleared).' },
    hourCycle: { control: 'inline-radio', options: [12, 24], description: '12-hour (AM/PM) or 24-hour labels. Defaults to 12.', table: { category: 'Appearance' } },
    step: { control: { type: 'number', min: 1 }, description: 'Minutes between options. Defaults to 30.', table: { category: 'Behavior' } },
    min: { control: 'text', description: 'Earliest time offered, "HH:MM". Defaults to "00:00".', table: { category: 'Behavior' } },
    max: { control: 'text', description: 'Latest time offered, "HH:MM". Defaults to "23:59".', table: { category: 'Behavior' } },
    placeholder: { control: 'text', description: 'Placeholder text shown when empty.', table: { category: 'Content' } },
    disabled: { control: 'boolean', description: 'Disables the time field.', table: { category: 'State' } },
  },
};

export default meta;
type Story = StoryObj<typeof TimeField>;

// The option list renders in a portal, outside canvasElement.
const page = () => within(document.body);
const optionNames = () => page().getAllByRole('option').map((o) => o.textContent?.trim());

function ControlledDemo() {
  const [value, setValue] = useState('');
  return (
    <div className="w-[200px]">
      <TimeField value={value} onChange={setValue} aria-label="Time" />
      <p className="font-mono text-body-xs text-[var(--color-text-text-subtler)] mt-1">value: "{value}"</p>
    </div>
  );
}

/** Default: 30-minute steps, 12-hour labels. Open it and type to filter. */
export const Default: Story = {
  render: () => <ControlledDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Time' });

    // Pick from the generated 30-minute grid.
    await userEvent.click(input);
    await userEvent.click(await page().findByRole('option', { name: '9:00 AM' }));
    await expect(canvas.getByText('value: "09:00"')).toBeInTheDocument();
    await expect(input).toHaveValue('9:00 AM');

    // A time off the grid commits via free typing and is shown in the
    // same 12-hour format once the list closes.
    await userEvent.clear(input);
    await userEvent.type(input, '9:47 pm{Enter}');
    await expect(canvas.getByText('value: "21:47"')).toBeInTheDocument();
    await waitFor(() => expect(input).toHaveValue('9:47 PM'));

    // Unparseable text doesn't touch the value.
    await userEvent.clear(input);
    await expect(canvas.getByText('value: ""')).toBeInTheDocument();
    await userEvent.type(input, '25:00{Enter}');
    await expect(canvas.getByText('value: ""')).toBeInTheDocument();
    await waitFor(() => expect(input).toHaveValue(''));
  },
};

/** Pre-selected value (09:30). */
export const Preselected: Story = {
  render: () => (
    <div className="w-[200px]">
      <TimeField defaultValue="09:30" aria-label="Time" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox', { name: 'Time' });
    await expect(input).toHaveValue('9:30 AM');

    // Uncontrolled: a pick has to stick without an onChange wired up.
    await userEvent.click(input);
    await userEvent.click(await page().findByRole('option', { name: '10:00 AM' }));
    await expect(input).toHaveValue('10:00 AM');
    await waitFor(() => expect(page().queryByRole('listbox')).not.toBeInTheDocument());
  },
};

/** `hourCycle={24}`: the options and the field read as 24-hour times, such as 14:30. */
export const HourCycle24: Story = {
  name: '24-hour',
  render: () => (
    <div className="w-[160px]">
      <TimeField hourCycle={24} defaultValue="14:30" aria-label="Time" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox', { name: 'Time' });
    await expect(input).toHaveValue('14:30');
    await userEvent.click(input);
    await page().findByRole('listbox');
    await expect(optionNames().slice(0, 3)).toEqual(['00:00', '00:30', '01:00']);
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('14:30');
  },
};

/** 15-minute steps with a wired Label. */
export const WithLabel: Story = {
  name: 'With label',
  render: () => (
    <div className="flex flex-col gap-1 w-[200px]">
      <Label htmlFor="mtg">Meeting time</Label>
      <TimeField id="mtg" step={15} aria-label={undefined} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // The visible <Label htmlFor> names the combobox.
    const input = within(canvasElement).getByRole('combobox', { name: 'Meeting time' });
    await userEvent.click(input);
    await page().findByRole('listbox');
    await expect(optionNames().slice(0, 3)).toEqual(['12:00 AM', '12:15 AM', '12:30 AM']);
    await expect(optionNames()).toHaveLength(96);
    await userEvent.keyboard('{Escape}');
  },
};

/** `step={15}` offers a time every 15 minutes instead of the default 30. */
export const CustomStep: Story = {
  name: 'Custom step (15 min)',
  render: () => (
    <div className="w-[200px]">
      <TimeField step={15} aria-label="Time" />
    </div>
  ),
};

/** `min` and `max` limit the list to business hours; a typed time outside the range is rejected, one inside it is accepted even off the step grid. */
export const MinMax: Story = {
  name: 'Min/max range',
  render: function Render() {
    // onInvalidInput hands over the reason; show it under the field.
    const [error, setError] = useState('');
    return (
      <div className="flex w-[200px] flex-col gap-1">
        <TimeField
          min="09:00"
          max="17:00"
          aria-label="Business hours"
          aria-describedby={error ? 'business-hours-error' : undefined}
          onChange={() => setError('')}
          onInvalidInput={(_, message) => setError(message)}
        />
        <FieldError id="business-hours-error">{error}</FieldError>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox', { name: 'Business hours' });
    await userEvent.click(input);
    await page().findByRole('listbox');
    const names = optionNames();
    await expect(names[0]).toBe('9:00 AM');
    await expect(names[names.length - 1]).toBe('5:00 PM');
    await expect(names).toHaveLength(17);

    // Out of range typed time is rejected; the field stays empty, is marked
    // invalid and says why (WCAG 3.3.1).
    await userEvent.type(input, '8:00 am{Enter}');
    await waitFor(() => expect(input).toHaveValue(''));
    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
    await expect(input).toHaveAccessibleDescription('Choose a time from 9:00 AM to 5:00 PM.');

    // In range but off the grid is accepted.
    await userEvent.click(input);
    await userEvent.type(input, '4:45 pm{Enter}');
    await waitFor(() => expect(input).toHaveValue('4:45 PM'));
    await expect(input).not.toHaveAttribute('aria-invalid', 'true');
    await expect(within(canvasElement).queryByRole('alert')).not.toBeInTheDocument();
  },
};

/** `disabled`: the time stays readable, but the field can't be focused or opened. */
export const Disabled: Story = {
  render: () => (
    <div className="w-[200px]">
      <TimeField disabled defaultValue="09:00" aria-label="Time" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox', { name: 'Time' });
    await expect(input).toBeDisabled();
    await expect(input).toHaveValue('9:00 AM');
    await userEvent.click(input);
    await expect(page().queryByRole('listbox')).not.toBeInTheDocument();
  },
};
