import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { coveredLetters } from '../../../test/letter-overlap';
import { Sticker } from './sticker';
import { stickerGuidelines } from './sticker.guidelines';

const meta: Meta<typeof Sticker> = {
  title: 'Patterns: Landing/Sticker',
  component: Sticker,
  tags: ['autodocs'],
  parameters: { guidelines: stickerGuidelines, layout: 'centered' },
  args: { children: 'Order now' },
};
export default meta;
type Story = StoryObj<typeof Sticker>;

/** A button, yellow, tilted −4°. Hover or Tab to it: it straightens. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const sticker = within(canvasElement).getByRole('button', { name: 'Order now' });
    await expect(getComputedStyle(sticker).rotate).toBe('-4deg');
    await userEvent.tab();
    await expect(sticker).toHaveFocus();
    await waitFor(() => expect(['none', '0deg']).toContain(getComputedStyle(sticker).rotate));
  },
};

/** The four accent tones, each with its own dark text. */
export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <Sticker tone="pink" tilt={-5}>
        Order now
      </Sticker>
      <Sticker tone="cream" tilt={3}>
        See the menu
      </Sticker>
      <Sticker tone="orange" tilt={-2}>
        Book a class
      </Sticker>
      <Sticker tone="yellow" tilt={5}>
        Free delivery
      </Sticker>
    </div>
  ),
};

/** `sm` 36px, `md` 44px, `lg` 56px in the theme's heavy display face. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <Sticker size="sm">Order now</Sticker>
      <Sticker size="md">Order now</Sticker>
      <Sticker size="lg" tone="pink">
        Order now
      </Sticker>
    </div>
  ),
};

/** `asChild` puts the sticker on a link. */
export const AsLink: Story = {
  render: () => (
    <Sticker asChild tone="orange" tilt={4}>
      <a href="#menu">See the menu</a>
    </Sticker>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'See the menu' });
    await expect(link).toHaveAttribute('href', '#menu');
    await expect(link).toHaveAttribute('data-slot', 'sticker');
  },
};

/**
 * From 640 px up it covers part of the last letter of a line, never two
 * letters; on a phone it sits under the headline. Resize to 360 to compare.
 */
export const OverHeadline: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="mx-auto max-w-3xl py-10">
      <div className="relative inline-block">
        <h2 className="m-0 font-display-heavy text-display-xl uppercase leading-[0.9] text-[var(--color-text-text)]">
          Burger
          <br />
          time
        </h2>
        <Sticker
          asChild
          size="lg"
          tone="pink"
          tilt={-6}
          className="mt-6 sm:absolute sm:start-full sm:top-[38%] sm:mt-0 sm:-translate-x-[14%] rtl:sm:translate-x-[14%]"
        >
          <a href="#order">Order now</a>
        </Sticker>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const heading = within(canvasElement).getByRole('heading');
    const sticker = within(canvasElement).getByRole('link', { name: 'Order now' });
    const covered = coveredLetters(heading, sticker);
    await expect(covered.length).toBeLessThanOrEqual(1);
    for (const c of covered) await expect(c.share).toBeLessThanOrEqual(0.5);
  },
};
