import type { Meta, StoryObj } from '@storybook/react';
import { expect } from '@storybook/test';
import { Button } from '../../ui/button';
import { ImageGround } from './image-ground';
import { imageGroundGuidelines } from './image-ground.guidelines';
import { SectionPanel } from './section-panel';

const BG = '/asset-examples/backgrounds';

const meta: Meta<typeof ImageGround> = {
  title: 'Patterns: Landing/ImageGround',
  component: ImageGround,
  tags: ['autodocs'],
  parameters: { guidelines: imageGroundGuidelines, layout: 'fullscreen' },
  args: { src: `${BG}/gray-mist-blur.webp`, tint: 'none', tintOpacity: 40, opacity: 100, flip: 'none', mirrorInRtl: false },
  argTypes: {
    tint: { control: 'inline-radio', options: ['none', 'primary', 'deep', 'surface', 'scrim'] },
    flip: { control: 'inline-radio', options: ['none', 'x', 'y', 'both'] },
    tintOpacity: { control: { type: 'range', min: 0, max: 90, step: 5 } },
    opacity: { control: { type: 'range', min: 0, max: 100, step: 5 } },
  },
};
export default meta;
type Story = StoryObj<typeof ImageGround>;

function Copy() {
  return (
    <div className="container-display flex min-h-[24rem] flex-col justify-center gap-6">
      <h2 className="m-0 max-w-[16ch] text-heading-3xl">Plan the week in one place</h2>
      <p className="m-0 max-w-[48ch] text-body-l">One list for the tasks, one for the notes, and the week laid out on a single screen.</p>
      <Button size="xl" className="self-start">
        Start free
      </Button>
    </div>
  );
}

/** Playground: every control on one picture, on the default panel. */
export const Playground: Story = {
  render: (args) => (
    <SectionPanel shape="bleed" padding="none" image={args.src} imageGround={args}>
      <Copy />
    </SectionPanel>
  ),
};

/** `deep`: the primary mixed with black over the picture, tone in tone — the ground for white text (inverse panel). */
export const DeepTintForWhiteText: Story = {
  args: { src: `${BG}/graphite-lines.webp`, tint: 'deep', tintOpacity: 50 },
  render: (args) => (
    <SectionPanel tone="inverse" shape="bleed" padding="none" image={args.src} imageGround={args}>
      <Copy />
    </SectionPanel>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot=image-ground-tint]')).not.toBeNull();
    await expect(canvasElement.querySelector('[data-slot=image-ground]')).toHaveAttribute('aria-hidden');
  },
};

/** A light veil: the picture at 35% over the page surface, for the regular text color. */
export const VeilForDarkText: Story = {
  args: { src: `${BG}/gray-glass-blocks.webp`, opacity: 45 },
  render: (args) => (
    <SectionPanel shape="bleed" padding="none" image={args.src} imageGround={args}>
      <Copy />
    </SectionPanel>
  ),
};

/** One file, four compositions: none, x, y, both. */
export const Flips: Story = {
  args: { src: `${BG}/gray-glass-blocks.webp`, opacity: 100 },
  render: (args) => (
    <div className="grid gap-4 p-4 md:grid-cols-2">
      {(['none', 'x', 'y', 'both'] as const).map((flip) => (
        <div key={flip} className="relative isolate h-48 overflow-hidden rounded-[var(--size-border-radius-border-radius-3xl)]">
          <ImageGround {...args} flip={flip} />
          <p className="m-3 inline-block rounded-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-surface-bg-surface)] px-2 py-1 font-mono text-body-s">
            flip=&quot;{flip}&quot;
          </p>
        </div>
      ))}
    </div>
  ),
};
