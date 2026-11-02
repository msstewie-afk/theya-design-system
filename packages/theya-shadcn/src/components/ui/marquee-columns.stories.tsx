import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { MarqueeColumns } from './marquee-columns';
import { marqueeColumnsGuidelines } from './marquee-columns.guidelines';
import { resetFocus, tabTo } from '../../test/keyboard';

const PROMPTS = [
  'Hey Susanne, ready for today’s meditation?',
  'How is the new moisturiser working for you, Marc?',
  'Oh, the slow jazz you made me helps me unwind.',
  'Remind me to stretch at four.',
  'Book a table for two on Friday.',
  'What did I spend on groceries this month?',
  'Play something calm for focus.',
  'Draft a thank-you note to Ana.',
  'Turn the lights down at ten.',
];

const card = (text: string) => (
  <div key={text} className="rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-4 font-body text-body-m text-[var(--color-text-text)] shadow-elevation-xs">
    {text}
  </div>
);

/** MarqueeColumns — columns of cards drifting vertically, neighbours in opposite directions (landing pages). */
const meta = {
  title: 'Motion/MarqueeColumns',
  component: MarqueeColumns,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Columns of cards drifting up and down, neighbours in opposite directions, beside a hero on a landing page.",
      },
    },
    layout: 'padded', guidelines: marqueeColumnsGuidelines,
  },
  argTypes: {
    columns: { control: false, description: 'One array of cards per column.' },
    duration: { control: { type: 'number', min: 10, max: 120 }, description: 'Seconds for one loop of the first column.' },
    gap: { control: 'text', description: 'Space between cards and columns (CSS length).' },
    drive: { control: 'inline-radio', options: ['time', 'scroll'], description: 'What moves the columns: a timer or the page scroll.' },
    pauseButton: { control: 'boolean', description: 'Show the Pause / Play button (time-driven only).' },
  },
  args: {
    duration: 40,
    columns: [PROMPTS.slice(0, 3).map(card), PROMPTS.slice(3, 6).map(card), PROMPTS.slice(6, 9).map(card)],
  },
} satisfies Meta<typeof MarqueeColumns>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Three columns; hover to pause. */
export const Default: Story = {
  render: (args) => <MarqueeColumns {...args} aria-label="Things people ask" className="mx-auto h-[26rem] max-w-3xl" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Each card is met once: the moving copy is hidden.
    const exposed = canvas.getAllByText('Book a table for two on Friday.').filter((el) => !el.closest('[aria-hidden="true"]'));
    await expect(exposed).toHaveLength(1);
    // Under prefers-reduced-motion nothing moves, so there is no Pause.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await expect(canvas.queryByRole('button', { name: 'Pause' })).toBeNull();
    } else {
      resetFocus();
      await tabTo(canvas.getByRole('button', { name: 'Pause' }));
      await userEvent.keyboard(' ');
      await expect(canvas.getByRole('button', { name: 'Play' })).not.toHaveAttribute('aria-pressed');
    }
  },
};

const TALL = ['h-32', 'h-48', 'h-40', 'h-56', 'h-36', 'h-44'];

/** Driven by the scroll: the columns slide past each other as the page moves (a Pinterest-like board). Scroll the canvas. */
export const ScrollDriven: Story = {
  name: 'Scroll-driven',
  args: {
    drive: 'scroll',
    columns: [0, 1, 2].map((c) =>
      PROMPTS.concat(PROMPTS)
        .filter((_, i) => i % 3 === c)
        .map((text, i) => (
          <div key={i} className={`flex items-end rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-4 font-body text-body-m text-[var(--color-text-text)] shadow-elevation-xs ${TALL[(i + c) % TALL.length]}`}>
            {text}
          </div>
        )),
    ),
  },
  render: (args) => (
    <div className="flex flex-col gap-10">
      <p className="m-0 grid h-[35vh] place-items-center rounded-[var(--size-border-radius-border-radius-4xl)] border border-dashed border-[var(--color-border-border-subtle)] font-body text-body-m text-[var(--color-text-text-subtle)]">Scroll down: the columns move with the page</p>
      <MarqueeColumns {...args} aria-label="Things people ask" className="mx-auto h-[32rem] max-w-3xl" />
      <p className="m-0 grid h-[35vh] place-items-center rounded-[var(--size-border-radius-border-radius-4xl)] border border-dashed border-[var(--color-border-border-subtle)] font-body text-body-m text-[var(--color-text-text-subtle)]">End of the example</p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wall = canvas.getByRole('group', { name: 'Things people ask' });
    // No looping copy and no Pause: the reader drives it.
    await expect(canvas.queryByRole('button', { name: 'Pause' })).toBeNull();
    await expect(within(wall).getAllByText('Book a table for two on Friday.')).toHaveLength(2);
    await expect(wall.querySelector('[aria-hidden="true"]')).toBeNull();
  },
};
