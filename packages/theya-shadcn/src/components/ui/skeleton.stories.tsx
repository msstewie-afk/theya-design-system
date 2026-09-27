import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './skeleton';

/**
 * Skeleton — a placeholder block you size to the content it stands in for
 * during first load. It renders a plain `<div>` with no role, so size each
 * one (via `className`: `h-4 w-48`, `size-9 rounded-full`, …) to roughly
 * match the text, avatar, or card it replaces — that way the layout doesn't
 * shift when real data arrives. The pulse is gated behind `motion-safe:`
 * via Tailwind's `animate-pulse`, so it honors `prefers-reduced-motion`.
 * Consumer obligation: mark the surrounding loading region `aria-busy="true"`
 * so assistive tech treats it as transient, not as real content (the
 * skeletons themselves are already `aria-hidden` by default).
 */
const meta = {
  title: 'Feedback/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    className: {
      control: 'text',
      description: 'Tailwind classes to size and shape the placeholder.',
    },
  },
  args: { className: 'h-4 w-48' },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A single placeholder line. Use the Controls panel to resize/reshape it. */
export const Default: Story = {};

/**
 * Stacked text lines. The region is marked `aria-busy` so screen readers skip
 * it while content loads. The last line is shorter to read like a wrapped
 * paragraph.
 */
export const TextLines: Story = {
  parameters: { controls: { exclude: ['className'] } },
  render: () => (
    <div className="flex w-64 max-w-full flex-col gap-2.5" aria-busy="true">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  ),
};

/**
 * Avatar + label row — pair a round avatar placeholder (`size-9 rounded-full`)
 * with two text lines for a name and a secondary identifier.
 */
export const AvatarRow: Story = {
  parameters: { controls: { exclude: ['className'] } },
  render: () => (
    <div className="flex w-64 max-w-full items-center gap-3" aria-busy="true">
      <Skeleton className="size-9 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  ),
};

/**
 * Common shapes, each sized to the content it stands in for: a circular avatar,
 * a thumbnail, a line of body text, and a button-height block.
 */
export const Shapes: Story = {
  parameters: { controls: { exclude: ['className'] } },
  render: () => (
    <div className="flex flex-wrap items-end gap-6">
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="size-12 rounded-full" />
        <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">Avatar</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="size-16 rounded-[var(--size-border-radius-border-radius-md)]" />
        <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">Thumbnail</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-4 w-32" />
        <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">Text line</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-9 w-28 rounded-[var(--size-border-radius-border-radius-md)]" />
        <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">Button</span>
      </div>
    </div>
  ),
};

/**
 * A full card placeholder — the whole loading surface is one `aria-busy`
 * region so it's announced as a single transient block. Mirror the real
 * card's metrics so nothing jumps when data arrives. Built on plain divs
 * rather than a Card component (not confirmed to exist in Theya yet) —
 * swap in the real Card primitive here once/if there is one.
 */
export const CardPlaceholder: Story = {
  name: 'Card placeholder',
  parameters: { controls: { exclude: ['className'] } },
  render: () => (
    <div
      className="flex w-80 max-w-full flex-col gap-3 rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-5"
      aria-busy="true"
      aria-label="Loading site"
    >
      <div className="flex min-w-0 items-center gap-3">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-col gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex flex-col gap-3 pt-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-1 h-9 w-28 rounded-[var(--size-border-radius-border-radius-md)]" />
      </div>
    </div>
  ),
};
