import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { Reveal, RevealGroup } from './reveal';
import { revealGuidelines } from './reveal.guidelines';

/**
 * Reveal — content eases in the first time it scrolls into view (landing
 * pages). The stories sit below a spacer: scroll the canvas to see them
 * enter. With prefers-reduced-motion (and in the test runner) they are
 * simply there.
 */
const meta = {
  title: 'Motion/Reveal',
  component: Reveal,
  tags: ['autodocs'],
  parameters: { layout: 'padded', guidelines: revealGuidelines },
  argTypes: {
    effect: { control: 'inline-radio', options: ['rise', 'fade', 'scale', 'blur'], description: 'How the content enters.' },
    delay: { control: 'number', description: 'Wait this long (ms) after it comes into view.' },
    threshold: { control: { type: 'range', min: 0, max: 1, step: 0.1 }, description: 'Share of the element that must be visible.' },
    once: { control: 'boolean', description: 'Play once, or every time it scrolls back into view.' },
  },
  args: { effect: 'rise', delay: 0, threshold: 0.2, once: true },
} satisfies Meta<typeof Reveal>;
export default meta;
type Story = StoryObj<typeof meta>;

const BOX = 'rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-5';

const Spacer = () => <p className="flex h-[70vh] items-end pb-6 text-body-s text-[var(--color-text-text-subtler)]">Scroll down ↓</p>;

export const Default: Story = {
  render: (args) => (
    <div className="max-w-md">
      <Spacer />
      <Reveal {...args} className={BOX}>
        <p className="text-body-l font-semibold">Backups every hour</p>
        <p className="mt-1 text-body-m text-[var(--color-text-text-subtle)]">Restore any site to a point in the last 30 days.</p>
      </Reveal>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Backups every hour')).toBeVisible();
  },
};

/** The four effects side by side. Keep to one effect per page. */
export const Effects: Story = {
  render: () => (
    <div>
      <Spacer />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(['rise', 'fade', 'scale', 'blur'] as const).map((effect) => (
          <Reveal key={effect} effect={effect} className={BOX}>
            <p className="font-mono text-body-m">{effect}</p>
          </Reveal>
        ))}
      </div>
    </div>
  ),
};

/** RevealGroup: direct children arrive one after another, 90ms apart. List markup stays a list. */
export const Staggered: Story = {
  render: () => (
    <div className="max-w-md">
      <Spacer />
      <RevealGroup className="flex flex-col gap-3" stagger={90}>
        {['Free SSL on every domain', 'Daily backups, kept 30 days', 'Staging copy in one click', 'Support that answers in minutes'].map((t) => (
          <div key={t} className={BOX}>
            <p className="text-body-m">{t}</p>
          </div>
        ))}
      </RevealGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Support that answers in minutes')).toBeVisible();
  },
};
