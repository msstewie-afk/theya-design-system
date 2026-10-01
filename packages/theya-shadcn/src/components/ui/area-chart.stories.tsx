import type { Meta, StoryObj } from '@storybook/react';
import { AreaChart } from './area-chart';

const WEEK = [
  { label: 'Mon', value: 3.0 },
  { label: 'Tue', value: 4.2 },
  { label: 'Wed', value: 3.6 },
  { label: 'Thu', value: 5.1 },
  { label: 'Fri', value: 6.4 },
  { label: 'Sat', value: 4.8 },
  { label: 'Sun', value: 4.0 },
];

const FORTNIGHT = Array.from({ length: 14 }, (_, i) => {
  const base = [2.1, 2.8, 2.5, 3.4, 3.0, 3.9, 3.3, 4.6, 4.1, 5.2, 4.7, 6.1, 5.4, 5.9];
  return { label: `${i + 1}`, value: base[i] };
});

const STORAGE = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 1}`,
  value: Math.round(40 + i * 6.5 + Math.sin(i) * 4),
}));

const TRAFFIC = [
  { label: 'Mon', direct: 1.2, organic: 2.1, referral: 0.6 },
  { label: 'Tue', direct: 1.4, organic: 2.3, referral: 0.7 },
  { label: 'Wed', direct: 1.3, organic: 2.6, referral: 0.5 },
  { label: 'Thu', direct: 1.6, organic: 2.8, referral: 0.9 },
  { label: 'Fri', direct: 2.0, organic: 3.2, referral: 1.1 },
  { label: 'Sat', direct: 1.5, organic: 2.4, referral: 0.8 },
  { label: 'Sun', direct: 1.1, organic: 2.0, referral: 0.6 },
];

/**
 * Area chart — a calm, single-series time chart on Recharts: a soft brand
 * gradient fill, a 2px smooth line, a light stepped y-grid, adaptive
 * x-labels, resting dots only on the peak + latest points, and a crosshair
 * tooltip. Color is a spotlight for one series, not a flood. The width is
 * fluid (give the wrapper a width); height is a prop. Always pass a
 * meaningful `ariaLabel` describing the trend, since the chart is exposed
 * to assistive tech as a single `role="img"`.
 */
const meta = {
  title: 'Data Display/AreaChart',
  component: AreaChart,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    data: { control: false, description: 'Ordered { label, value } points, or { label } + one numeric key per series.' },
    series: { control: false, description: '{ key, name } series to draw (up to 5); omit for the single-series `value` chart.' },
    stacked: { control: 'boolean', description: 'Stack series on top of each other; false overlays them (only with `series`).' },
    legend: { control: 'boolean', description: 'Show the series legend when `series` is set.' },
    height: { control: { type: 'number' }, description: 'Chart height in px (width is fluid).' },
    yStep: { control: { type: 'number' }, description: 'Gridline / y-tick interval in data units.' },
    unit: { control: 'text', description: 'Suffix on the default formatter (e.g. "M", "%").' },
    labelPrefix: { control: 'text', description: 'Prefix before the point label in the tooltip.' },
    format: { control: false, description: 'Custom value formatter; overrides `unit`.' },
    showXAxis: { control: 'boolean', description: 'Show the x-axis labels.' },
    showYAxis: { control: 'boolean', description: 'Show the y-axis labels.' },
    floatingAxis: {
      control: 'boolean',
      description: 'Float axis labels inside the plot area on a semi-transparent chip derived from the chart background instead of an outside gutter.',
    },
    loading: { control: 'boolean', description: 'Show the first-load skeleton instead of the chart.' },
    ariaLabel: { control: 'text', description: 'Accessible summary of the trend.' },
    className: { control: false, description: 'Class on the root element.' },
  },
  args: {
    data: WEEK,
    height: 240,
    yStep: 1,
    unit: 'M',
    labelPrefix: '',
    ariaLabel: 'Requests over the work week, peaking Friday.',
  },
  decorators: [
    (Story) => (
      <div className="w-[760px] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AreaChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A week of request volume. The peak (Fri) and the latest point (Sun) keep
 * resting dots; hover for the crosshair tooltip. */
export const Default: Story = {};

/** More points (14 days). X-labels thin out adaptively so the axis stays legible. */
export const ManyPoints: Story = {
  name: 'Many points',
  args: {
    data: FORTNIGHT,
    labelPrefix: 'Day ',
    ariaLabel: 'Requests across the last 14 days, trending up.',
  },
};

/** A custom `format` (and taller chart) for a non-suffix unit — storage in GB
 * across a billing cycle. `format` overrides `unit`. */
export const CustomFormat: Story = {
  parameters: { controls: { exclude: ['format', 'unit', 'height', 'yStep'] } },
  args: {
    data: STORAGE,
    height: 300,
    yStep: 20,
    labelPrefix: 'Day ',
    format: (v: number) => `${v.toFixed(0)} GB`,
    ariaLabel: 'Storage used across the billing cycle, climbing steadily.',
  },
};

/** Multiple series stacked (the default when `series` is set): each area sits on
 * top of the last, so the top edge reads as the combined total while the bands
 * show each channel's share. The legend and tooltip repeat the series name
 * beside its swatch, so the split never rides on color alone. */
export const StackedArea: Story = {
  name: 'Stacked area',
  args: {
    data: TRAFFIC,
    series: [
      { key: 'direct', name: 'Direct' },
      { key: 'organic', name: 'Organic' },
      { key: 'referral', name: 'Referral' },
    ],
    yStep: 1,
    unit: 'M',
    ariaLabel: 'Direct, organic and referral traffic across the week, stacked to show the total.',
  },
};

/** `stacked={false}` overlays the same series instead of stacking them — useful
 * when each series should be read against the shared y-axis on its own, not as
 * a part of a whole. */
export const OverlaidArea: Story = {
  name: 'Overlaid area',
  args: {
    ...StackedArea.args,
    stacked: false,
    ariaLabel: 'Direct, organic and referral traffic across the week, overlaid for comparison.',
  },
};

/** Inside a card: a label + headline number gives the precise read in text, with
 * the chart carrying the shape of the trend (the tooltip is a pointer-only
 * enhancement). Built on a plain div (no Card component confirmed in Theya yet)
 * — swap in the real Card primitive here once/if there is one. */
export const InCard: Story = {
  name: 'In card',
  parameters: { controls: { exclude: ['height'] } },
  render: (args) => (
    <div className="rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-5 shadow-elevation-xs">
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">Requests / day</span>
          <span className="font-body text-heading-xl font-semibold tabular-nums text-[var(--color-text-text)]">6.4M</span>
        </div>
        <span className="font-body text-body-s text-[var(--color-text-text-success)]">+12% vs last week</span>
      </div>
      <div className="mt-4">
        <AreaChart {...args} height={200} />
      </div>
    </div>
  ),
};

/** A single point still renders (line collapses to the lone peak/latest dot) —
 * the chart degrades gracefully rather than breaking. */
export const SinglePoint: Story = {
  name: 'Single point',
  args: {
    data: [{ label: 'Mon', value: 4.2 }],
    ariaLabel: 'Requests for a single day.',
  },
};

/** Empty data: the gridded frame and axes still render, ready for incoming data. */
export const Empty: Story = {
  args: {
    data: [],
    ariaLabel: 'No request data yet.',
  },
};

/** `showXAxis`/`showYAxis` drop the axis labels for a sparkline-style read where
 * the shape carries the meaning and the precise numbers live in surrounding text
 * (e.g. a headline number above, per `InCard`). The gridlines and tooltip stay. */
export const NoAxes: Story = {
  name: 'No axes',
  args: {
    height: 120,
    showXAxis: false,
    showYAxis: false,
    ariaLabel: 'Requests over the work week, peaking Friday.',
  },
};

/** `floatingAxis` moves both axes' tick labels onto semi-transparent, rounded
 * chips derived from the chart background. Override `--area-chart-background`
 * when the chart sits on a surface other than the page background. */
export const FloatingAxis: Story = {
  name: 'Floating axis',
  args: {
    floatingAxis: true,
    height: 260,
    ariaLabel: 'Requests over the work week, peaking Friday.',
  },
};

/** The x axis measures the responsive container and drops intermediate labels
 * when there is not enough horizontal room. The first and last parts of the
 * trend remain readable without labels colliding. */
export const NarrowResponsiveAxis: Story = {
  name: 'Narrow responsive axis',
  decorators: [
    (Story) => (
      <div className="w-[280px]">
        <Story />
      </div>
    ),
  ],
  args: {
    data: FORTNIGHT,
    labelPrefix: 'Day ',
    ariaLabel: 'Requests across 14 days in a narrow chart.',
  },
};

/** A short chart similarly thins the y axis according to its available height,
 * while retaining the same data domain and grid step. */
export const ShortResponsiveAxis: Story = {
  name: 'Short responsive axis',
  decorators: [
    (Story) => (
      <div className="w-[520px] max-w-full">
        <Story />
      </div>
    ),
  ],
  args: {
    height: 112,
    yStep: 1,
    ariaLabel: 'Requests across the week in a short chart.',
  },
};

/** First-load state: a skeleton curve sized from `height`, with the y-axis
 * gutter and x-axis label row reserved to match `showYAxis`/`showXAxis` — a
 * single curve for the plain chart, up to three layered curves when `series`
 * is set, so the placeholder hints at "stacked" rather than a flat block. */
export const Loading: Story = {
  parameters: { controls: { exclude: ['loading', 'series'] } },
  render: (args) => (
    <div className="flex flex-col gap-8">
      <div className="w-[420px] max-w-full">
        <AreaChart {...args} loading />
      </div>
      <div className="w-[420px] max-w-full">
        <AreaChart {...args} loading series={StackedArea.args!.series} />
      </div>
    </div>
  ),
};
