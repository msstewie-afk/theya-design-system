import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
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

/** Over the corner of a headline: on a phone it touches one letter at most. Resize to 360 to compare. */
export const OverHeadline: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="mx-auto max-w-3xl py-10">
      <div className="relative inline-block pe-[clamp(3.25rem,5.5vw,4.5rem)] pt-[clamp(4.5rem,8vw,6.5rem)]">
        <h2 className="m-0 font-display-heavy text-display-xl uppercase leading-[0.9] text-[var(--color-text-text)]">
          Burger
          <br />
          time
        </h2>
        <Stamp size="md" tone="yellow" tilt={12} ring="Fresh every day · Fresh every day · " className="absolute end-0 top-0">
          New
        </Stamp>
      </div>
    </div>
  ),
};
