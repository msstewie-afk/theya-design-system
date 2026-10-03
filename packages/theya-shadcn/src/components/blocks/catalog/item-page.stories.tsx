import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { ItemPage } from './item-page';
import { DEMO_DESCRIPTION, DEMO_HIGHLIGHTS, DEMO_IMAGES, DEMO_ITEM, DEMO_ITEMS, DEMO_REVIEW_SUMMARY, DEMO_REVIEWS, DEMO_SPECS } from './demo-data';

const meta: Meta<typeof ItemPage> = {
  title: 'Patterns: Catalog/ItemPage',
  component: ItemPage,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    item: DEMO_ITEM,
    breadcrumbs: [
      { label: 'Extensions', href: '#extensions' },
      { label: 'Backups', href: '#backups' },
    ],
    images: DEMO_IMAGES,
    highlights: DEMO_HIGHLIGHTS,
    description: DEMO_DESCRIPTION,
    specs: DEMO_SPECS,
    reviews: DEMO_REVIEWS,
    reviewSummary: DEMO_REVIEW_SUMMARY,
    trialDays: 14,
    onInstall: fn(),
    onWriteReview: fn(),
  },
  decorators: [(Story) => <div className="max-w-6xl">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof ItemPage>;

/** One scrolling page: gallery and buy box, then overview, specifications and reviews. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const thumb = canvas.getByRole('button', { name: 'Screenshot 2: Storage targets' });
    await userEvent.click(thumb);
    await expect(thumb).toHaveAttribute('aria-current', 'true');

    await expect(canvas.queryByRole('heading', { name: 'Security' })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Read the full description' }));
    await expect(canvas.getByRole('heading', { name: 'Security' })).toBeVisible();

    await expect(canvas.getByText('Free for 14 days, then billed monthly. Cancel anytime.')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Start free trial' }));
    await expect(args.onInstall).toHaveBeenCalledTimes(1);
  },
};

/** A free item: "Install", no trial line. */
export const Free: Story = {
  args: { item: DEMO_ITEMS.find((i) => i.id === 'certpilot')!, trialDays: undefined, images: DEMO_IMAGES.slice(0, 1) },
};
