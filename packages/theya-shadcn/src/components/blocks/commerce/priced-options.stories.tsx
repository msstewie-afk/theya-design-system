import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { PricedOptions } from './priced-options';
import { pricedOptionsGuidelines } from './priced-options.guidelines';

const meta: Meta<typeof PricedOptions> = {
  title: 'Patterns: Commerce/PricedOptions',
  component: PricedOptions,
  tags: ['autodocs'],
  parameters: { guidelines: pricedOptionsGuidelines, layout: 'padded' },
  argTypes: {
    appearance: { control: 'inline-radio', options: ['cards', 'list'], description: '`cards`: OptionCards. `list`: radios on dividers, price on the right — for secondary choices on a page that already has cards.' },
    priceMode: { control: 'inline-radio', options: ['extra', 'total'], description: '`extra`: add-on prices ("+$4 / mo", 0 = "Included"). `total`: full price of each option.' },
    columns: { control: 'inline-radio', options: [1, 2, 3], description: 'Grid columns from sm up (cards only).' },
  },
};
export default meta;
type Story = StoryObj<typeof PricedOptions>;

/** Every option shows its cost; the cheapest starts selected. */
export const Archive: Story = {
  args: {
    legend: 'Archive',
    description: 'How long Mnemosyne keeps your original files.',
    onValueChange: fn(),
    options: [
      { value: 'standard', title: 'Standard', description: 'Kept 30 days', price: 0 },
      { value: 'extended', title: 'Extended', description: 'Kept 1 year', price: 4, priceUnit: '/ mo' },
      { value: 'permanent', title: 'Permanent', description: 'Kept until you delete them, with full-resolution restore', price: 12, priceUnit: '/ mo' },
    ],
  },
  render: (args) => (
    <div className="max-w-lg">
      <PricedOptions {...args} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radio', { name: 'Standard' })).toBeChecked();
    const extended = canvas.getByRole('radio', { name: 'Extended' });
    await expect(extended).toHaveAccessibleDescription('Kept 1 year +$4 / mo');
    await userEvent.click(extended);
    await expect(args.onValueChange).toHaveBeenCalledWith('extended');
  },
};

/** Three across: a shoot location with a price per location. */
export const Location: Story = {
  args: {
    legend: 'Shoot location',
    columns: 3,
    options: [
      { value: 'helios', title: 'Helios Studio', description: 'Our studio, lighting included', price: 0 },
      { value: 'venue', title: 'Your venue', description: 'Within 30 km of the studio', price: 40, priceUnit: 'once' },
      { value: 'othrys', title: 'Othrys Lodge', description: 'Mountain location, half day', price: 120, priceUnit: 'once' },
    ],
  },
  render: (args) => (
    <div className="max-w-3xl">
      <PricedOptions {...args} />
    </div>
  ),
};

/** The same choice without cards: radios on dividers, price on the right. Lighter next to other cards. */
export const List: Story = {
  args: { ...Archive.args, appearance: 'list' },
  render: (args) => (
    <div className="max-w-lg">
      <PricedOptions {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radio', { name: 'Standard' })).toBeChecked();
    await expect(canvas.getByRole('radio', { name: 'Extended' })).toHaveAccessibleDescription('Kept 1 year +$4 / mo');
  },
};
