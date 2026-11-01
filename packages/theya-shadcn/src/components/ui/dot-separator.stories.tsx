import type { Meta, StoryObj } from '@storybook/react';
import { DotSeparator } from './dot-separator';
import { dotSeparatorGuidelines } from './dot-separator.guidelines';

/**
 * DotSeparator — a small inline middot (·) for joining short metadata
 * segments on one line, like a file name, a size, and a studio. Purely
 * decorative and always `aria-hidden`, so screen readers announce the
 * segments as plain text without the glyph — reach for it instead of
 * typing a literal middot so the spacing and the aria handling stay
 * consistent everywhere.
 */
const meta = {
  title: 'Labels/DotSeparator',
  component: DotSeparator,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "A small dot between short facts on one line: “Helios Studio · Created Mar 2026 · v2.4.0”.",
      },
    },
    guidelines: dotSeparatorGuidelines, layout: 'centered',
  },
  argTypes: {
    className: { control: false, description: 'A small inline "·" divider between meta text items.' },
  },
  args: {},
} satisfies Meta<typeof DotSeparator>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default usage: a single metadata line where each DotSeparator sits
 * between two segments. Identifiers stay mono.
 */
export const Default: Story = {
  render: (args) => (
    <p className="font-body text-body-m text-[var(--color-text-text-subtler)]">
      <span className="font-mono">DAWN_0412.jpg</span>
      <DotSeparator {...args} />
      24.6 MB
      <DotSeparator {...args} />
      Eos Portraits
    </p>
  ),
};

/**
 * In a list — one summary line per studio, the same dot-joined metadata
 * pattern repeated.
 */
export const StudioList: Story = {
  name: 'Studio list',
  render: (args) => (
    <ul className="w-full max-w-sm space-y-2 font-body text-body-m">
      {[
        { studio: 'Helios Studio', status: 'Active', galleries: '48 galleries' },
        { studio: 'Selene Weddings', status: 'Active', galleries: '31 galleries' },
        { studio: 'Othrys Lodge', status: 'Suspended', galleries: '6 galleries' },
      ].map((item) => (
        <li key={item.studio} className="text-[var(--color-text-text-subtler)]">
          <span className="text-[var(--color-text-text)]">{item.studio}</span>
          <DotSeparator {...args} />
          {item.status}
          <DotSeparator {...args} />
          {item.galleries}
        </li>
      ))}
    </ul>
  ),
};

/**
 * License metadata — mixes plain text and mono identifiers across
 * several segments on a single line.
 */
export const LicenseMeta: Story = {
  name: 'License meta',
  render: (args) => (
    <p className="font-body text-body-m text-[var(--color-text-text-subtler)]">
      Commercial license
      <DotSeparator {...args} />
      <span className="font-mono">LIC-2048</span>
      <DotSeparator {...args} />
      Renews in 28 days
      <DotSeparator {...args} />
      <span className="font-mono">GOLDEN_0907.tif</span>
    </p>
  ),
};
