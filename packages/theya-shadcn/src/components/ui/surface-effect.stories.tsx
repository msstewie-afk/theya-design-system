import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { Aurora, SurfaceEffect } from './surface-effect';
import { surfaceEffectGuidelines } from './surface-effect.guidelines';

/** SurfaceEffect — decorative effects for landing-page cards; Aurora — a drifting color field behind a hero. Hover the cards. */
const meta = {
  title: 'Motion/SurfaceEffect',
  component: SurfaceEffect,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Decorative effects for landing-page cards — a glow under the pointer, a light running round the border, a tilt — and Aurora, a drifting color field behind a hero.",
      },
    },
    layout: 'padded', guidelines: surfaceEffectGuidelines,
  },
  argTypes: { effect: { control: 'inline-radio', options: ['spotlight', 'beam', 'tilt', 'shine', 'lift', 'reveal'] }, children: { control: false } },
  args: { effect: 'spotlight' },
} satisfies Meta<typeof SurfaceEffect>;
export default meta;
type Story = StoryObj<typeof meta>;

const CARD = 'rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]';

const Content = ({ title }: { title: string }) => (
  <div className="flex flex-col gap-1 p-5">
    <p className="text-body-l font-semibold text-[var(--color-text-text)]">{title}</p>
    <p className="text-body-m text-[var(--color-text-text-subtle)]">Client galleries, print licenses and an archive for every shoot.</p>
  </div>
);

/** A card with `effect="spotlight"` (default): a soft glow follows the pointer — hover the card, or pick another effect in the Controls. */
export const Default: Story = {
  render: (args) => (
    <SurfaceEffect {...args} className={`max-w-sm ${args.effect === 'beam' ? 'rounded-[var(--size-border-radius-border-radius-2xl)]' : CARD}`}>
      <Content title="Pro plan" />
    </SurfaceEffect>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Pro plan')).toBeVisible();
  },
};

/** The five card effects on one screen for comparison — on a real page, pick one. (`reveal` needs a second picture: see Reveal.) */
export const AllEffects: Story = {
  render: () => (
    <div className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
      {(['spotlight', 'beam', 'tilt', 'shine', 'lift'] as const).map((effect) => (
        <SurfaceEffect key={effect} effect={effect} className={effect === 'beam' ? 'rounded-[var(--size-border-radius-border-radius-2xl)]' : CARD}>
          <Content title={effect} />
        </SurfaceEffect>
      ))}
    </div>
  ),
};

/** `effect="reveal"`: a second picture shows through a circle that follows the pointer — here the color photo under a black-and-white one (Hover Mask). */
export const Reveal: Story = {
  render: () => (
    <SurfaceEffect
      effect="reveal"
      className="aspect-[4/3] max-w-xl rounded-[var(--size-border-radius-border-radius-4xl)]"
      reveal={<img src="/asset-examples/login-carousel-02.jpg" alt="" />}
    >
      <img src="/asset-examples/login-carousel-02.jpg" alt="Blue glass blocks in soft light" className="size-full object-cover grayscale" />
    </SurfaceEffect>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The picture keeps its name; the revealed copy is decoration.
    await expect(canvas.getByRole('img', { name: 'Blue glass blocks in soft light' })).toBeInTheDocument();
    await expect(canvasElement.querySelector('[data-slot=surface-effect-reveal]')).toHaveAttribute('aria-hidden', 'true');
  },
};

/** `Aurora` placed behind a hero section: a slow-drifting color field, with the heading and text kept on top at full contrast. */
export const AuroraHero: Story = {
  name: 'Aurora behind a hero',
  render: () => (
    <section className="relative isolate flex min-h-80 max-w-3xl flex-col items-center justify-center gap-3 overflow-hidden rounded-[var(--size-border-radius-border-radius-3xl)] border border-solid border-[var(--color-border-border-subtle)] px-6 py-16 text-center">
      <Aurora />
      <h2 className="font-body text-heading-l font-semibold text-[var(--color-text-text)]">Galleries that get out of the way</h2>
      <p className="max-w-md text-body-l text-[var(--color-text-text-subtle)]">Galleries, clients and the archive in one place — set up in minutes.</p>
    </section>
  ),
};
