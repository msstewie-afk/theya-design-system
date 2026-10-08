import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { Reviews } from './reviews';
import { DEMO_REVIEWS } from './demo-data';

const meta: Meta<typeof Reviews> = {
  title: 'Patterns: Catalog/Reviews',
  component: Reviews,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { reviews: DEMO_REVIEWS, onWriteReview: fn() },
  decorators: [(Story) => <div className="max-w-3xl">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof Reviews>;

/** The distribution bars are filters — negative reviews are one click away. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const oneStar = canvas.getByRole('button', { name: /^1\s+stars/ });
    await userEvent.click(oneStar);
    await expect(oneStar).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByText('First run filled my disk')).toBeVisible();
    await expect(canvas.queryByText('Saved a client site in five minutes')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Show all' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Show 4 more reviews' }));
    await expect(canvas.getAllByRole('listitem')).toHaveLength(8);

    await userEvent.click(canvas.getByRole('button', { name: 'Write a review' }));
    await expect(args.onWriteReview).toHaveBeenCalledTimes(1);
  },
};
