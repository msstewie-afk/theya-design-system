import { useState } from 'react';
import type * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { DateRange } from 'react-day-picker';
import { Calendar } from './calendar';
import { calendarGuidelines } from './calendar.guidelines';

const meta: Meta<typeof Calendar> = {
  title: 'Date & Time/Calendar',
  tags: ['autodocs'],
  parameters: {
    guidelines: calendarGuidelines,
    docs: { description: { component: 'Themed date grid on react-day-picker (v10). Backs single/multiple/range selection.' } },
  },
  argTypes: {
    showOutsideDays: { control: 'boolean', description: 'Render days from the adjacent months that fill the edge cells.', table: { category: 'Appearance' } },
    showWeekNumber: { control: 'boolean', description: 'Render an extra column with each week\'s number.', table: { category: 'Appearance' } },
    captionLayout: {
      control: 'select',
      options: ['label', 'dropdown', 'dropdown-months', 'dropdown-years'],
      description: 'Static month/year label or selectable dropdowns.',
      table: { category: 'Appearance' },
    },
    numberOfMonths: {
      control: { type: 'number', min: 1, max: 2 },
      description: 'How many month grids to render side by side.',
      table: { category: 'Appearance' },
    },
    mode: { control: false, description: 'Selection mode — single, multiple or range.' },
    selected: { control: false, description: 'Controlled selected date(s).' },
    onSelect: { control: false, description: 'Fires with the new selected date(s).' },
  },
  args: {
    showOutsideDays: true,
    captionLayout: 'label',
    numberOfMonths: 1,
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

type CalendarArgs = React.ComponentProps<typeof Calendar>;

function SingleDemo(args: CalendarArgs) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return <Calendar {...args} mode="single" selected={date} onSelect={setDate} />;
}

export const Single: Story = {
  render: (args) => <SingleDemo {...args} />,
};

function RangeDemo(args: CalendarArgs) {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
  });
  return <Calendar {...args} mode="range" numberOfMonths={2} captionLayout="dropdown" defaultMonth={range?.from} selected={range} onSelect={setRange} />;
}

/** Two-month range with selectable month/year dropdowns — the shape used by a date-range filter. */
export const Range: Story = {
  parameters: { controls: { exclude: ['numberOfMonths', 'captionLayout'] } },
  render: (args) => <RangeDemo {...args} />,
};

function MultipleDemo(args: CalendarArgs) {
  const [dates, setDates] = useState<Date[] | undefined>([
    new Date(2026, 5, 3),
    new Date(2026, 5, 11),
    new Date(2026, 5, 19),
  ]);
  return <Calendar {...args} mode="multiple" defaultMonth={dates?.[0]} selected={dates} onSelect={setDates} />;
}

/** Pick any number of independent days — clicking a selected day deselects it. */
export const MultipleDates: Story = {
  render: (args) => <MultipleDemo {...args} />,
};

function DropdownCaptionDemo(args: CalendarArgs) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return <Calendar {...args} mode="single" captionLayout="dropdown" selected={date} onSelect={setDate} />;
}

/** The dropdown caption turns month + year into selects for fast navigation across distant months. */
export const DropdownCaption: Story = {
  parameters: { controls: { exclude: ['captionLayout'] } },
  render: (args) => <DropdownCaptionDemo {...args} />,
};

function DisabledDemo(args: CalendarArgs) {
  const [date, setDate] = useState<Date | undefined>();
  return <Calendar {...args} mode="single" selected={date} onSelect={setDate} disabled={{ before: new Date() }} />;
}

export const Disabled: Story = {
  render: (args) => <DisabledDemo {...args} />,
};
