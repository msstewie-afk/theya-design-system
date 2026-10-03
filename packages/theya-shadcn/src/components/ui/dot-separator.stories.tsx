import type { Meta, StoryObj } from '@storybook/react';
import { DotSeparator } from './dot-separator';
import { dotSeparatorGuidelines } from './dot-separator.guidelines';

/**
 * DotSeparator — a small inline middot (·) for joining short metadata
 * segments on one line, like a domain, an age, and a region. Purely
 * decorative and always `aria-hidden`, so screen readers announce the
 * segments as plain text without the glyph — reach for it instead of
 * typing a literal middot so the spacing and the aria handling stay
 * consistent everywhere.
 */
const meta = {
  title: 'Labels/DotSeparator',
  component: DotSeparator,
  tags: ['autodocs'],
  parameters: { guidelines: dotSeparatorGuidelines, layout: 'centered' },
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
      <span className="font-mono">shop.seashell.dev</span>
      <DotSeparator {...args} />
      90 days
      <DotSeparator {...args} />
      <span className="font-mono">eu-west-1</span>
    </p>
  ),
};

/**
 * In a list — one summary line per site, the same dot-joined metadata
 * pattern repeated. Long identifiers truncate per row rather than
 * wrapping the line.
 */
export const SiteList: Story = {
  name: 'Site list',
  render: (args) => (
    <ul className="w-full max-w-sm space-y-2 font-body text-body-m">
      {[
        { domain: 'shop.seashell.dev', region: 'eu-west-1', status: 'Active' },
        { domain: 'api.seashell.dev', region: 'us-east-1', status: 'Active' },
        { domain: 'docs.seashell.dev', region: 'eu-west-1', status: 'Suspended' },
      ].map((site) => (
        <li key={site.domain} className="text-[var(--color-text-text-subtler)]">
          <span className="font-mono text-[var(--color-text-text)]">{site.domain}</span>
          <DotSeparator {...args} />
          {site.status}
          <DotSeparator {...args} />
          <span className="font-mono">{site.region}</span>
        </li>
      ))}
    </ul>
  ),
};

/**
 * Certificate metadata — mixes plain text and mono identifiers across
 * several segments on a single line.
 */
export const CertMeta: Story = {
  name: 'Cert meta',
  render: (args) => (
    <p className="font-body text-body-m text-[var(--color-text-text-subtler)]">
      Let&rsquo;s Encrypt
      <DotSeparator {...args} />
      <span className="font-mono">RSA 2048</span>
      <DotSeparator {...args} />
      Renews in 28 days
      <DotSeparator {...args} />
      <span className="font-mono">*.seashell.dev</span>
    </p>
  ),
};
