import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { PricedOptions } from './priced-options';

const meta: Meta<typeof PricedOptions> = {
  title: 'Patterns: Commerce/PricedOptions',
  component: PricedOptions,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof PricedOptions>;

/** Every option shows its cost; the cheapest starts selected. */
export const Backups: Story = {
  args: {
    legend: 'Backups',
    description: 'How long copies of your site are kept.',
    onValueChange: fn(),
    options: [
      { value: 'weekly', title: 'Weekly', description: 'Kept 4 weeks', price: 0 },
      { value: 'daily', title: 'Daily', description: 'Kept 30 days', price: 4, priceUnit: '/ mo' },
      { value: 'hourly', title: 'Hourly', description: 'Kept 90 days, restore to any hour', price: 12, priceUnit: '/ mo' },
    ],
  },
  render: (args) => (
    <div className="max-w-lg">
      <PricedOptions {...args} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radio', { name: 'Weekly' })).toBeChecked();
    const daily = canvas.getByRole('radio', { name: 'Daily' });
    await expect(daily).toHaveAccessibleDescription('Kept 30 days +$4 / mo');
    await userEvent.click(daily);
    await expect(args.onValueChange).toHaveBeenCalledWith('daily');
  },
};

/** Three across: region with a price per region. */
export const Region: Story = {
  args: {
    legend: 'Server region',
    columns: 3,
    options: [
      { value: 'eu-west', title: 'Frankfurt', description: 'Best for Europe', price: 0 },
      { value: 'us-east', title: 'Virginia', description: 'Best for the Americas', price: 0 },
      { value: 'ap-south', title: 'Singapore', description: 'Best for Asia', price: 3, priceUnit: '/ mo' },
    ],
  },
  render: (args) => (
    <div className="max-w-3xl">
      <PricedOptions {...args} />
    </div>
  ),
};
