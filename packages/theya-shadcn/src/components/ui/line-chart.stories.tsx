import type { Meta, StoryObj } from '@storybook/react';
import { LineChart } from './line-chart';
import { lineChartGuidelines } from './line-chart.guidelines';

const USAGE = [
  { label: 'Mon', cpu: 32, mem: 51 },
  { label: 'Tue', cpu: 41, mem: 55 },
  { label: 'Wed', cpu: 38, mem: 60 },
  { label: 'Thu', cpu: 52, mem: 64 },
  { label: 'Fri', cpu: 61, mem: 72 },
  { label: 'Sat', cpu: 44, mem: 58 },
  { label: 'Sun', cpu: 36, mem: 54 },
];

/**
 * LineChart — compares a few trends (up to 7) over one ordered sequence.
 * Each series takes the next chart palette color (--color-bg-chart-01..07);
 * the legend and the tooltip always repeat the series NAME beside its
 * swatch, so meaning never rides on color alone. Give the wrapper a width;
 * height is a prop. Pass an `ariaLabel` stating the relationship, since the
 * chart is exposed as one `role="img"`.
 */
const meta = {
  title: 'Charts/LineChart',
  component: LineChart,
  tags: ['autodocs'],
  parameters: { guidelines: lineChartGuidelines, layout: 'padded' },
  argTypes: {
    data: { control: false, description: '{ label } + one numeric key per series.' },
    series: { control: false, description: '{ key, name } series to draw (up to 7).' },
    height: { control: { type: 'number' }, description: 'Chart height in px (width is fluid).' },
    yStep: { control: { type: 'number' }, description: 'Gridline / y-tick interval.' },
    unit: { control: 'text', description: 'Suffix on the default formatter (e.g. "%").' },
    labelPrefix: { control: 'text', description: 'Prefix before the point label in the tooltip.' },
    format: { control: false, description: 'Custom value formatter; overrides `unit`.' },
    legend: { control: 'boolean', description: 'Show the series legend.' },
    showXAxis: { control: 'boolean', description: 'Show the x-axis labels.' },
    showYAxis: { control: 'boolean', description: 'Show the y-axis labels.' },
    ariaLabel: { control: 'text', description: 'Accessible summary of the comparison.' },
    className: { control: false, description: 'Class on the root element.' },
  },
  args: {
    data: USAGE,
    series: [
      { key: 'cpu', name: 'CPU' },
      { key: 'mem', name: 'Memory' },
    ],
    height: 260,
    yStep: 25,
    unit: '%',
    legend: true,
    ariaLabel: 'CPU vs memory usage across the week; memory runs higher.',
  },
  decorators: [
    (Story) => (
      <div className="w-[680px] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two series, CPU vs memory. Hover for a per-series crosshair tooltip. */
export const TwoSeries: Story = {};

/** Three series pull chart-01..03 in order; the legend keeps them named. */
export const ThreeSeries: Story = {
  args: {
    data: USAGE.map((d) => ({ ...d, net: Math.round(d.cpu * 0.6) })),
    series: [
      { key: 'cpu', name: 'CPU' },
      { key: 'mem', name: 'Memory' },
      { key: 'net', name: 'Network' },
    ],
    ariaLabel: 'CPU, memory and network across the week.',
  },
};

/** A single series still works (legend collapses to one entry). */
export const SingleSeries: Story = {
  args: {
    series: [{ key: 'cpu', name: 'CPU' }],
    ariaLabel: 'CPU usage across the week, peaking Friday.',
  },
};

/**
 * `showXAxis`/`showYAxis` drop the axis labels for a sparkline-style read
 * where the shape carries the meaning and the precise numbers live in
 * surrounding text. The gridlines, legend and tooltip stay.
 */
export const NoAxes: Story = {
  name: 'No axes',
  args: {
    height: 120,
    legend: false,
    showXAxis: false,
    showYAxis: false,
  },
};
