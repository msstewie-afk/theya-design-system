import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { ItemPage } from './item-page';
import { DEMO_DESCRIPTION, DEMO_HIGHLIGHTS, DEMO_IMAGES, DEMO_ITEM, DEMO_REVIEW_SUMMARY, DEMO_REVIEWS, DEMO_SPECS } from './demo-data';
import { itemPageGuidelines } from './item-page.guidelines';

const meta: Meta<typeof ItemPage> = {
  title: 'Patterns: Catalog/ItemPage',
  component: ItemPage,
  tags: ['autodocs'],
  parameters: {
    guidelines: itemPageGuidelines,
    layout: 'padded',
  },
  args: {
    item: DEMO_ITEM,
    breadcrumbs: [
      { label: 'Shop', href: '#shop' },
      { label: 'Plan add-ons', href: '#plan-add-ons' },
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
export const Default: Story = {};

/** A free item: "Install", no trial line. */
export const Free: Story = {
  // The same item made free, so the page copy (description, specs) still matches it.
  args: { item: { ...DEMO_ITEM, price: 0 }, trialDays: undefined, images: DEMO_IMAGES.slice(0, 1) },
};

/** Interaction test for Default, kept out of Default so Default opens untouched. */
export const TestInteractions: Story = {
  ...Default,
  name: 'Test: interactions',
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const thumb = canvas.getByRole('button', { name: 'Screenshot 2: Soft blue silk glow' });
    await userEvent.click(thumb);
    await expect(thumb).toHaveAttribute('aria-current', 'true');

    await expect(canvas.queryByRole('heading', { name: 'Privacy' })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Read the full description' }));
    await expect(canvas.getByRole('heading', { name: 'Privacy' })).toBeVisible();

    await expect(canvas.getByText('Free for 14 days, then billed monthly. Cancel anytime.')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Start free trial' }));
    await expect(args.onInstall).toHaveBeenCalledTimes(1);
  },
};
