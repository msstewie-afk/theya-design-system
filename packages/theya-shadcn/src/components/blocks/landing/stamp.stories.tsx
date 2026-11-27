import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { coveredLetters } from '../../../test/letter-overlap';
import { Stamp } from './stamp';
import { stampGuidelines } from './stamp.guidelines';

const meta: Meta<typeof Stamp> = {
  title: 'Patterns: Landing/Stamp',
  component: Stamp,
  tags: ['autodocs'],
  parameters: { guidelines: stampGuidelines, layout: 'centered' },
  args: { children: 'New' },
};
export default meta;
type Story = StoryObj<typeof Stamp>;

/** A yellow circle, tilted −8°: decoration, hidden from screen readers. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const stamp = canvasElement.querySelector('[data-slot="stamp"]');
    await expect(stamp).toHaveAttribute('aria-hidden', 'true');
  },
};

/** `circle` and `squircle`, one to three lines. */
export const Shapes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-8">
      <Stamp tone="pink">New</Stamp>
      <Stamp shape="squircle" tone="cream" tilt={6}>
        Since
        <br />
        2014
      </Stamp>
      <Stamp tone="orange" tilt={-12}>
        Small
        <br />
        batch
        <br />
        only
      </Stamp>
    </div>
  ),
};

/** `sm`, `md`, `lg`: each grows with the window between its two sizes. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-8">
      <Stamp size="sm">New</Stamp>
      <Stamp size="md">New</Stamp>
      <Stamp size="lg" tone="pink">
        New
      </Stamp>
    </div>
  ),
};

/** `ring` sets words around the edge of a circle. */
export const Ring: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-8">
      <Stamp size="lg" tone="yellow" ring="Handmade · Small batch · Soy wax · ">
        ★
      </Stamp>
      <Stamp size="lg" tone="pink" tilt={10} ring="Fresh every day · Fresh every day · ">
        Since
        <br />
        2014
      </Stamp>
    </div>
  ),
};

/** The award is said nowhere else on the page: `label` names it for screen readers. */
export const WithLabel: Story = {
  args: { label: 'Best bakery award 2026', shape: 'squircle', tone: 'orange', children: 'Best bakery 2026' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('img', { name: 'Best bakery award 2026' })).toBeInTheDocument();
  },
};

/**
 * At the end of the last line, over the corner of its last letter, never two.
 * The offset is in em of the headline, so the bite is the same in every theme
 * font and at every width; a phone takes the small stamp. Resize to 360.
 */
export const OverHeadline: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="mx-auto max-w-3xl pb-[clamp(5rem,9vw,7.5rem)] pt-10">
      <h2 className="m-0 font-display-heavy text-display-xl uppercase leading-[0.9] text-[var(--color-text-text)]">
        Burger
        <br />
        time
        {/* A zero-width anchor on the baseline, one cap height tall, right after the last letter: em offsets follow the headline. */}
        <span className="relative inline-block h-[0.7em] w-0 align-baseline">
          <span className="absolute -start-[0.22em] top-[0.7em] -translate-y-1/2">
            <Stamp size="sm" tone="yellow" tilt={12} className="sm:size-[clamp(6.5rem,11vw,9rem)] sm:text-body-m">
              New
            </Stamp>
          </span>
        </span>
      </h2>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const heading = within(canvasElement).getByRole('heading');
    const stamp = canvasElement.querySelector('[data-slot="stamp"]')!;
    const covered = coveredLetters(heading, stamp);
    await expect(covered.length).toBeLessThanOrEqual(1);
    for (const c of covered) await expect(c.share).toBeLessThanOrEqual(0.5);
  },
};
