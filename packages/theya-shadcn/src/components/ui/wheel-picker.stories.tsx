import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { WheelPicker } from './wheel-picker';
import { wheelPickerGuidelines } from './wheel-picker.guidelines';

/**
 * WheelPicker — a wheel for a short ordered list. Scroll over it, drag it, or use
 * the arrow keys; it rolls to the next detent on a spring.
 */
const meta = {
  title: 'Selection/WheelPicker',
  component: WheelPicker,
  tags: ['autodocs'],
  parameters: { guidelines: wheelPickerGuidelines, layout: 'centered' },
  argTypes: {
    rows: { control: 'inline-radio', options: [3, 5], description: 'Rows visible at once.' },
    disabled: { control: 'boolean' },
  },
  args: {
    'aria-label': 'Backup interval',
    options: ['15 minutes', '30 minutes', '1 hour', '2 hours', '6 hours', '12 hours', 'Daily'].map((label) => ({ value: label, label })),
    defaultValue: '1 hour',
  },
} satisfies Meta<typeof WheelPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FiveRows: Story = { name: 'Five rows', args: { rows: 5 } };

/** Controlled, with the value shown next to it. */
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState('2 hours');
    return (
      <div className="flex items-center gap-4">
        <WheelPicker {...args} value={value} onValueChange={setValue} />
        <span className="font-body text-body-m text-[var(--color-text-text)]">Every {value}</span>
      </div>
    );
  },
};
