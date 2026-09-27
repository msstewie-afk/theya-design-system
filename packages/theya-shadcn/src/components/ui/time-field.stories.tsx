import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TimeField } from './time-field';
import { Label } from './label';

const meta: Meta<typeof TimeField> = {
  title: 'Date & Time/TimeField',
  component: TimeField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A time picker built on Combobox with allowCreate — type a time off the step grid and it commits directly.',
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
};

/** Pre-selected value (09:30). */
export const Preselected: Story = {
  render: () => (
    <div className="w-[200px]">
      <TimeField defaultValue="09:30" aria-label="Time" />
    </div>
  ),
};

export const HourCycle24: Story = {
  name: '24-hour',
  render: () => (
    <div className="w-[160px]">
      <TimeField hourCycle={24} defaultValue="14:30" aria-label="Time" />
    </div>
  ),
};

/** 15-minute steps with a wired Label. */
export const WithLabel: Story = {
  name: 'With label',
  render: () => (
    <div className="flex flex-col gap-1.5 w-[200px]">
      <Label htmlFor="mtg">Meeting time</Label>
      <TimeField id="mtg" step={15} aria-label={undefined} />
    </div>
  ),
};

export const CustomStep: Story = {
  name: 'Custom step (15 min)',
  render: () => (
    <div className="w-[200px]">
      <TimeField step={15} aria-label="Time" />
    </div>
  ),
};

export const MinMax: Story = {
  name: 'Min/max range',
  render: () => (
    <div className="w-[200px]">
      <TimeField min="09:00" max="17:00" aria-label="Business hours" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-[200px]">
      <TimeField disabled defaultValue="09:00" aria-label="Time" />
    </div>
  ),
};
