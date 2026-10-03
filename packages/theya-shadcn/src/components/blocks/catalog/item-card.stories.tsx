import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { ItemCard } from './item-card';
import { DEMO_ITEMS } from './demo-data';

const meta: Meta<typeof ItemCard> = {
  title: 'Patterns: Catalog/ItemCard',
  component: ItemCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { item: DEMO_ITEMS[0], href: '#shieldwall' },
};
export default meta;
type Story = StoryObj<typeof ItemCard>;

/** Grid for browsing: the same facts in the same order on every card. */
export const Grid: Story = {
  render: () => (
    <ul className="grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {DEMO_ITEMS.slice(0, 6).map((item) => (
        <li key={item.id}>
          <ItemCard item={item} href={`#${item.id}`} />
        </li>
      ))}
    </ul>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Shieldwall by Seashell Labs' })).toHaveAttribute('href', '#shieldwall');
  },
};

/** List for scanning: summary and facts on one row, price at the end. */
export const List: Story = {
  render: () => (
    <ul className="flex max-w-4xl flex-col gap-3">
      {DEMO_ITEMS.slice(0, 4).map((item) => (
        <li key={item.id}>
          <ItemCard item={item} layout="list" href={`#${item.id}`} />
        </li>
      ))}
    </ul>
  ),
};

/** With "Compare": the checkbox sits above the card's link, so ticking it doesn't open the item. */
export const WithCompare: Story = {
  render: function Render() {
    const [checked, setChecked] = useState(false);
    return (
      <div className="max-w-sm">
        <ItemCard item={DEMO_ITEMS[0]} compare={{ checked, onChange: setChecked }} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('checkbox', { name: 'Compare Shieldwall' });
    await userEvent.click(box);
    await expect(box).toBeChecked();
  },
};
