import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { CategoryLanding } from './category-landing';
import { DEMO_CATEGORIES, DEMO_ITEMS, DEMO_PICKS, DEMO_POPULAR } from './demo-data';

const meta: Meta<typeof CategoryLanding> = {
  title: 'Patterns: Catalog/CategoryLanding',
  component: CategoryLanding,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    title: 'Extensions',
    description: 'Add security, backups, speed and developer tools to your panel. Most install in under a minute.',
    total: DEMO_ITEMS.length,
    allHref: '#all',
    categories: DEMO_CATEGORIES,
    popular: DEMO_POPULAR,
    picks: DEMO_PICKS,
    getHref: (i) => `#${i.id}`,
  },
  decorators: [(Story) => <div className="max-w-7xl">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof CategoryLanding>;

/** Categories with counts, a short "Popular in" shelf, curated picks with reasons, and "View all". */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Security, 6 extensions' })).toHaveAttribute('href', '#category-security');
    await expect(canvas.getByRole('link', { name: 'View all 6 Security extensions' })).toHaveAttribute('href', '#category-security');
    await expect(canvas.getByRole('link', { name: 'View all 24 extensions' })).toHaveAttribute('href', '#all');
    await expect(canvas.getByRole('link', { name: 'Git Deploy by Forge' })).toBeVisible();
  },
};

/** Without curated content: categories and the full list are enough. */
export const CategoriesOnly: Story = {
  args: { popular: undefined, picks: [] },
};
