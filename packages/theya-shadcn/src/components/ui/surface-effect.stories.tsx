import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { Aurora, SurfaceEffect } from './surface-effect';
import { surfaceEffectGuidelines } from './surface-effect.guidelines';

/** SurfaceEffect — decorative effects for landing-page cards; Aurora — a drifting color field behind a hero. Hover the cards. */
const meta = {
  title: 'Motion/SurfaceEffect',
  component: SurfaceEffect,
  tags: ['autodocs'],
  parameters: { layout: 'padded', guidelines: surfaceEffectGuidelines },
  argTypes: { effect: { control: 'inline-radio', options: ['spotlight', 'beam', 'tilt', 'shine', 'lift'] }, children: { control: false } },
  args: { effect: 'spotlight' },
} satisfies Meta<typeof SurfaceEffect>;
export default meta;
type Story = StoryObj<typeof meta>;

const CARD = 'rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]';

const Content = ({ title }: { title: string }) => (
  <div className="flex flex-col gap-1 p-5">
    <p className="text-body-l font-semibold text-[var(--color-text-text)]">{title}</p>
    <p className="text-body-m text-[var(--color-text-text-subtle)]">Daily backups, free SSL and a staging copy for every site.</p>
  </div>
);

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

/** All five on one screen for comparison — on a real page, pick one. */
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

export const AuroraHero: Story = {
  name: 'Aurora behind a hero',
  render: () => (
    <section className="relative isolate flex min-h-80 max-w-3xl flex-col items-center justify-center gap-3 overflow-hidden rounded-[var(--size-border-radius-border-radius-3xl)] border border-solid border-[var(--color-border-border-subtle)] px-6 py-16 text-center">
      <Aurora />
      <h2 className="font-body text-heading-l font-semibold text-[var(--color-text-text)]">Hosting that gets out of the way</h2>
      <p className="max-w-md text-body-l text-[var(--color-text-text-subtle)]">Sites, mail and backups in one place — set up in minutes.</p>
    </section>
  ),
};
