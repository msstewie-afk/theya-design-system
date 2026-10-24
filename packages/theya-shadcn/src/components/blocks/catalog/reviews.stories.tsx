import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { Reviews } from './reviews';
import { DEMO_REVIEWS } from './demo-data';
import { reviewsGuidelines } from './reviews.guidelines';

const meta: Meta<typeof Reviews> = {
  title: 'Patterns: Catalog/Reviews',
  component: Reviews,
  tags: ['autodocs'],
  parameters: {
    guidelines: reviewsGuidelines,
    layout: 'padded',
  },
  args: { reviews: DEMO_REVIEWS, onWriteReview: fn() },
  decorators: [(Story) => <div className="max-w-3xl">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof Reviews>;

/** The distribution bars are filters — negative reviews are one click away. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const oneStar = canvas.getByRole('button', { name: /^1\s+star\b/ });
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

/**
 * "Show all" goes away once pressed; focus moves to the review list instead
 * of <body>. The count is the only live text: the button sits outside the
 * live region and the star glyph is read as a word.
 */
export const ShowAllFocus: Story = {
  name: 'Test: show all focus',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /^1\s+star\b/ }));

    // The live count ("1 review with 1 star"); the global Toaster has its own aria-live, so find it by its text.
    // "star" also labels the 1-star filter bar; the live one sits in an aria-live region.
    const live = canvas.getAllByText('star').map((el) => el.closest<HTMLElement>('[aria-live]')).find(Boolean)!;
    await expect(live).toHaveTextContent(/^1 review with 1/);
    await expect(within(live).getByText('star')).toHaveClass('sr-only');
    await expect(within(live).getByText('★')).toHaveAttribute('aria-hidden', 'true');
    await expect(within(live).queryByRole('button')).not.toBeInTheDocument();

    const showAll = canvas.getByRole('button', { name: 'Show all' });
    showAll.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(showAll).not.toBeInTheDocument());
    await waitFor(() => expect(canvas.getByText('Saved a client site in five minutes').closest('ul')).toHaveFocus());
    await expect(live).toHaveTextContent('8 reviews');
  },
};

/** The last "Show N more reviews" goes away; focus moves to the first review it revealed. */
export const ShowMoreFocus: Story = {
  name: 'Test: show more focus',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show 4 more reviews' }));
    await expect(canvas.queryByRole('button', { name: /^Show \d+ more reviews$/ })).not.toBeInTheDocument();
    // Most relevant order: the fifth review is Tom W.'s.
    await waitFor(() => expect(canvas.getByText('Database restore is all or nothing').closest('li')).toHaveFocus());
  },
};
