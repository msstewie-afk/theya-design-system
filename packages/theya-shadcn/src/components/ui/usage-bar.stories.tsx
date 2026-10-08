import type { Meta, StoryObj } from '@storybook/react';
import { UsageBar } from './usage-bar';
import { usageBarGuidelines } from './usage-bar.guidelines';

const meta: Meta<typeof UsageBar> = {
  title: 'Status & Feedback/UsageBar',
  component: UsageBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded', guidelines: usageBarGuidelines },
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

/** Disk usage for a site, split by category against a 50 GB quota. The unused
 * headroom shows because `total` (50) exceeds the segment sum. */
export const Default: Story = {
  args: {
    total: 50,
    formatValue: gb,
    segments: [
      { label: 'Uploads', value: 18.2 },
      { label: 'Database', value: 9.4 },
      { label: 'Application', value: 6.1 },
      { label: 'Logs', value: 2.3 },
    ],
  },
};

/** No `total`, so the segments fill the whole track — here outbound bandwidth
 * split across regions for the billing period. Values format as terabytes. */
export const Bandwidth: Story = {
  parameters: { controls: { exclude: ['total'] } },
  args: {
    formatValue: (n) => `${n} TB`,
    segments: [
      { label: 'eu-west-1', value: 4.2 },
      { label: 'us-east-1', value: 3.1 },
      { label: 'ap-south-1', value: 1.6 },
      { label: 'sa-east-1', value: 0.7 },
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
    formatValue: (n) => `${n} certs`,
    segments: [
      { label: "Let's Encrypt", value: 612 },
      { label: 'Sectigo', value: 248 },
      { label: 'DigiCert', value: 96 },
    ],
  },
};
