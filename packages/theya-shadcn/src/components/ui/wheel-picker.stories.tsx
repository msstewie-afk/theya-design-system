import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
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

export const Default: Story = {
  // Keyboard: ↑ ↓ step, Home / End jump; the chosen option is aria-selected.
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('listbox', { name: 'Backup interval' });
    const option = (name: string) => within(list).getByRole('option', { name });
    list.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(option('2 hours')).toHaveAttribute('aria-selected', 'true'));
    await userEvent.keyboard('{End}');
    await waitFor(() => expect(option('Daily')).toHaveAttribute('aria-selected', 'true'));
    await userEvent.keyboard('{Home}');
    await waitFor(() => expect(option('15 minutes')).toHaveAttribute('aria-selected', 'true'));
  },
};

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

/** With a visible label; a click on it focuses the wheel, like a label on a field. */
export const WithLabel: Story = {
  args: { label: 'Backup interval', 'aria-label': undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('listbox', { name: 'Backup interval' });
    await userEvent.click(canvas.getByText('Backup interval'));
    await expect(list).toHaveFocus();
  },
};
