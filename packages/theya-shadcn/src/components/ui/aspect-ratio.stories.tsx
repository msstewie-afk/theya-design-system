import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { AspectRatio } from './aspect-ratio';
import { aspectRatioGuidelines } from './aspect-ratio.guidelines';

const meta: Meta<typeof AspectRatio> = {
  title: 'Layout/AspectRatio',
  component: AspectRatio,
  tags: ['autodocs'],
  parameters: { guidelines: aspectRatioGuidelines, layout: 'padded' },
  argTypes: {
    ratio: {
      control: { type: 'number', step: 0.01 },
      description: 'Width-to-height ratio (e.g. 16 / 9 ≈ 1.78, 4 / 3 ≈ 1.33, 1).',
    },
    className: { control: false, description: 'Class on the root element.' },
    children: { control: false, description: 'Content stretched to fill the ratio box.' },
  },
  args: { ratio: 16 / 9 },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[480px] max-w-full">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AspectRatio>;

const BOX = 'rounded-[var(--size-border-radius-border-radius-2xl)] border border-[var(--color-border-border)] bg-[var(--color-bg-neutral-bg-neutral-subtle)]';

/** The default 16:9 box. Adjust `ratio` in the Controls panel to reshape it. */
export const Default: Story = {
  render: (args) => (
    <AspectRatio {...args} className={BOX}>
      <div className="absolute inset-0 grid place-items-center font-mono text-body-s text-[var(--color-text-text-subtler)]">
        16 : 9
      </div>
    </AspectRatio>
  ),
};

/** Common ratios side by side. The box fills its column width and computes its
 * height from the ratio, so each tile stays proportional as the grid reflows. */
export const Ratios: Story = {
  parameters: { controls: { exclude: ['ratio'] } },
  render: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {[
        { ratio: 16 / 9, label: '16 : 9' },
        { ratio: 4 / 3, label: '4 : 3' },
        { ratio: 1, label: '1 : 1' },
      ].map((r) => (
        <AspectRatio key={r.label} ratio={r.ratio} className={BOX}>
          <div className="absolute inset-0 grid place-items-center font-mono text-body-s text-[var(--color-text-text-subtler)]">
            {r.label}
          </div>
        </AspectRatio>
      ))}
    </div>
  ),
};

/** Site preview thumbnail. A fill child carries a meaningful `alt`; the
 * `overflow-hidden` box crops it to the ratio so oversized media never bleeds
 * out. (Uses a token-styled placeholder here in place of a real screenshot.) */
export const Thumbnail: Story = {
  parameters: { controls: { exclude: ['ratio'] } },
  render: () => (
    <AspectRatio
      ratio={16 / 9}
      role="img"
      aria-label="Preview of shop.seashell.dev"
      className="rounded-[var(--size-border-radius-border-radius-2xl)] border border-[var(--color-border-border)] bg-[var(--color-bg-neutral-bg-neutral-subtler)]"
    >
      <div className="absolute inset-0 flex flex-col justify-end p-3">
        <span className="font-mono text-body-s text-[var(--color-text-text)]">shop.seashell.dev</span>
        <span className="text-body-xs text-[var(--color-text-text-subtler)]">Site preview</span>
      </div>
    </AspectRatio>
  ),
};

/** Square region tile with an overlay label. Status and identity are carried by
 * the readable label, never color alone. */
export const RegionTile: Story = {
  parameters: { controls: { exclude: ['ratio'] } },
  decorators: [
    (Story) => (
      <div className="w-[200px] max-w-full">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <AspectRatio ratio={1} className={BOX}>
      <span className="absolute bottom-2 left-2 rounded-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-surface-bg-surface-overlay-dark)] px-2 py-0.5 font-mono text-body-xs text-[var(--color-text-text-on-dark)]">
        eu-west-1
      </span>
    </AspectRatio>
  ),
};

/** A responsive embed. The iframe fills the ratio box and carries its own
 * `title`, since the wrapper provides no accessible name for media it doesn't
 * own. (`about:blank` keeps the story self-contained.) */
export const Embed: Story = {
  parameters: { controls: { exclude: ['ratio'] } },
  render: function Render() {
    // Focus moves into the iframe's own document, so :focus never matches
    // the <iframe> itself (WCAG 2.4.7): track it with focus/blur events and
    // ring the frame from here.
    const [focused, setFocused] = useState(false);
    return (
      <AspectRatio ratio={16 / 9} className={cn(BOX, focused && 'focus-ring')}>
        <iframe title="Uptime dashboard for shop.seashell.dev" src="about:blank" onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} className="absolute inset-0 size-full rounded-[inherit] outline-none" />
      </AspectRatio>
    );
  },
};
