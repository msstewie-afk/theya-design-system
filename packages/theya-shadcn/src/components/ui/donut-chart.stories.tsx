import type { Meta, StoryObj } from '@storybook/react';
import { DonutChart } from './donut-chart';

const STORAGE = [
  { label: 'Production', value: 62 },
  { label: 'Staging', value: 32 },
  { label: 'Development', value: 18 },
];

/**
 * DonutChart — a proportional part-of-whole ring (up to 7 slices). Slices
 * cycle the shared chart palette (--color-bg-chart-01..07), the center
 * shows the total, and the legend repeats each slice's name + value +
 * percent beside its swatch, so meaning never rides on color alone. Give
 * the wrapper a width; the ring height is a prop. Pass an `ariaLabel`
 * summarizing the split (the chart is exposed as one `role="img"`).
 */
const meta = {
  title: 'Data Display/DonutChart',
  component: DonutChart,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    data: { control: false, description: '{ label, value } slices (up to 7).' },
    height: { control: { type: 'number' }, description: 'Ring area height in px (width is fluid).' },
    unit: { control: 'text', description: 'Suffix on the default formatter (e.g. " GB").' },
    format: { control: false, description: 'Custom value formatter; overrides `unit`.' },
    centerLabel: { control: 'text', description: 'Caption under the center number.' },
    centerValue: { control: 'text', description: 'Override the center number (defaults to the sum).' },
    legend: { control: 'boolean', description: 'Show the slice legend.' },
    thickness: {
      control: 'radio',
      options: ['default', 'thin'],
      description: 'Ring band width — "thin" for a slim indicator ring beside a headline metric.',
    },
    layout: {
      control: 'radio',
      options: ['vertical', 'horizontal'],
      description: 'Legend below the ring (default) or beside it.',
    },
    loading: { control: 'boolean', description: 'Show the first-load skeleton instead of the chart.' },
    ariaLabel: { control: 'text', description: 'Accessible summary of the breakdown.' },
    className: { control: false, description: 'Class on the root element.' },
  },
  args: {
    data: STORAGE,
    height: 200,
    unit: ' GB',
    centerLabel: 'Storage',
    legend: true,
    ariaLabel: 'Storage by environment: production 62 GB, staging 32 GB, dev 18 GB.',
  },
  decorators: [
    (Story) => (
      <div className="w-[420px] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DonutChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Three environments, total in the center; hover a slice for value + percent. */
export const Default: Story = {};

/** Legend beside the ring instead of below it, once the container has room (`@min-[22rem]/donut`). */
export const Horizontal: Story = {
  args: { layout: 'horizontal' },
};

/** Percent unit with an overridden center value. */
export const AsPercent: Story = {
  name: 'As percent',
  args: {
    data: [
      { label: 'Used', value: 68 },
      { label: 'Free', value: 32 },
    ],
    unit: '%',
    centerLabel: 'Used',
    centerValue: '68%',
    ariaLabel: 'Disk usage: 68% used, 32% free.',
  },
};

/** No legend: rely on the center total + the role="img" summary (e.g. when the legend lives elsewhere in the card). */
export const NoLegend: Story = {
  name: 'No legend',
  args: { legend: false },
};

/** A slim indicator ring for a compact widget (e.g. beside a headline metric). */
export const Thin: Story = {
  args: { thickness: 'thin' },
};

/**
 * First-load state: a skeleton ring + one legend placeholder per slice
 * already in `data` (falls back to 3 when `data` is empty), sized from
 * `height`/`thickness`/`layout` — shown here at the defaults, and
 * combined with a thin ring + horizontal (legend-beside-ring) layout.
 */
export const Loading: Story = {
  parameters: { controls: { exclude: ['loading', 'thickness', 'layout'] } },
  render: (args) => (
    <div className="flex flex-wrap items-start gap-8">
      <div className="w-[280px] max-w-full">
        <DonutChart {...args} loading />
      </div>
      <div className="w-[280px] max-w-full">
        <DonutChart {...args} loading thickness="thin" layout="horizontal" />
      </div>
    </div>
  ),
};
