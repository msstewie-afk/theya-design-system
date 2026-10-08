import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Marquee } from './marquee';
import { marqueeGuidelines } from './marquee.guidelines';

/** Marquee — an endless strip of logos or short quotes (landing pages). Pauses on hover, focus and its own button. */
const meta = {
  title: 'Motion/Marquee',
  component: Marquee,
  tags: ['autodocs'],
  parameters: { layout: 'padded', guidelines: marqueeGuidelines },
  argTypes: {
    duration: { control: 'number', description: 'Seconds for one loop.' },
    reverse: { control: 'boolean', description: 'Run against the reading direction.' },
    gap: { control: 'text', description: 'Space between items (CSS length).' },
    pauseButton: { control: 'boolean', description: 'Show the pause / play button.' },
    fade: { control: 'boolean', description: 'Fade out at both edges.' },
    children: { control: false },
  },
  args: { duration: 30, reverse: false, gap: '2.5rem', pauseButton: true, fade: true, children: null },
} satisfies Meta<typeof Marquee>;
export default meta;
type Story = StoryObj<typeof meta>;

const NAMES = ['Northwind', 'Kestrel', 'Quartz', 'Lumen', 'Babel', 'Seashell', 'Harbor', 'Fieldnote'];

export const Default: Story = {
  render: (args) => (
    <Marquee {...args} className="max-w-3xl">
      {NAMES.map((n) => (
        <span key={n} className="font-body text-heading-xs font-semibold whitespace-nowrap text-[var(--color-text-text-subtle)]">
          {n}
        </span>
      ))}
    </Marquee>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Each name is met once by assistive tech (the duplicate copy is hidden).
    await expect(canvas.getAllByText('Northwind', { ignore: '[aria-hidden="true"] *' })).toHaveLength(1);
    const button = canvas.queryByRole('button', { name: 'Pause animation' });
    if (!button) return; // hidden under prefers-reduced-motion: nothing moves
    await userEvent.click(button);
    await expect(canvas.getByRole('button', { name: 'Play animation' })).toBeInTheDocument();
    await expect(canvasElement.querySelector('[data-slot="marquee"]')).toHaveAttribute('data-paused');
  },
};

/** Two strips in opposite directions, testimonial chips. */
export const Testimonials: Story = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-3">
      {[false, true].map((reverse) => (
        <Marquee key={String(reverse)} reverse={reverse} duration={40} gap="1rem">
          {['“Moved 40 sites in an afternoon.”', '“Backups saved our launch.”', '“Support replied in four minutes.”', '“Staging is one click now.”'].map((q) => (
            <span key={q} className="rounded-full border border-solid border-[var(--color-border-border-subtle)] px-4 py-2 text-body-m whitespace-nowrap">
              {q}
            </span>
          ))}
        </Marquee>
      ))}
    </div>
  ),
};
