import type { Meta, StoryObj } from '@storybook/react';
import { UsageBar } from './usage-bar';
import { usageBarGuidelines } from './usage-bar.guidelines';

const meta: Meta<typeof UsageBar> = {
  title: 'Status & Feedback/UsageBar',
  component: UsageBar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "A total split into up to four parts against a limit: storage by type, downloads by gallery, seats by role.",
      },
    },
    layout: 'padded', guidelines: usageBarGuidelines,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[420px] max-w-full">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    segments: { control: false, description: 'Stacked segments, each with a value/label/tone.' },
    total: {
      control: { type: 'number' },
      description: 'Denominator for the percentages; defaults to the sum of the segment values.',
    },
    showLegend: {
      control: { type: 'boolean' },
      description: 'Render the labelled legend below the bar.',
    },
    formatValue: { control: false, description: 'Custom formatter for values shown in the legend.' },
    className: { control: false, description: 'Class on the root element.' },
  },
  args: {
    showLegend: true,
  },
};

export default meta;
type Story = StoryObj<typeof UsageBar>;

const gb = (n: number) => `${n} GB`;

/** Storage for a studio, split by file type against a 384 GB quota. The unused
 * headroom shows because `total` (384) exceeds the segment sum. */
export const Default: Story = {
  args: {
    total: 384,
    formatValue: gb,
    segments: [
      { label: 'RAW originals', value: 142.6 },
      { label: 'Edited exports', value: 61.3 },
      { label: 'Video', value: 38.4 },
      { label: 'Previews', value: 12.8 },
    ],
  },
};

/** No `total`, so the segments fill the whole track — here client downloads
 * split across studios for the billing period. Values format as gigabytes. */
export const Downloads: Story = {
  parameters: { controls: { exclude: ['total'] } },
  args: {
    formatValue: gb,
    segments: [
      { label: 'Selene Weddings', value: 212 },
      { label: 'Helios Studio', value: 148 },
      { label: 'Eos Portraits', value: 86 },
      { label: 'Othrys Lodge', value: 31 },
    ],
  },
};

/** The bar alone, with `showLegend` off — useful inline in a dense table row or
 * a card header where the labels live elsewhere. The `role="img"` summary still
 * carries the full breakdown for assistive tech. */
export const NoLegend: Story = {
  args: {
    showLegend: false,
    total: 1000,
    formatValue: (n) => `${n} licenses`,
    segments: [
      { label: 'Editorial', value: 612 },
      { label: 'Commercial', value: 248 },
      { label: 'Print', value: 96 },
    ],
  },
};
