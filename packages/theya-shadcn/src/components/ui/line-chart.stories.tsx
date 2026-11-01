import type { Meta, StoryObj } from '@storybook/react';
import { expect } from '@storybook/test';
import { LineChart } from './line-chart';
import { lineChartGuidelines } from './line-chart.guidelines';

// Share of delivered galleries that clients downloaded from / opened, per day.
const DELIVERY = [
  { label: 'Mon', downloaded: 32, opened: 51 },
  { label: 'Tue', downloaded: 41, opened: 55 },
  { label: 'Wed', downloaded: 38, opened: 60 },
  { label: 'Thu', downloaded: 52, opened: 64 },
  { label: 'Fri', downloaded: 61, opened: 72 },
  { label: 'Sat', downloaded: 44, opened: 58 },
  { label: 'Sun', downloaded: 36, opened: 54 },
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
  parameters: {
    docs: {
      description: {
        component:
          "Compares a few trends over the same period: downloads against views, this week against last. Every series is named in the legend and the tooltip.",
      },
    },
    guidelines: lineChartGuidelines, layout: 'padded',
  },
  argTypes: {
    data: { control: false, description: '{ label } + one numeric key per series.' },
    series: { control: false, description: '{ key, name } series to draw (up to 7).' },
    height: { control: { type: 'number' }, description: 'Chart height in px (width is fluid).' },
    yStep: { control: { type: 'number' }, description: 'Gridline / y-tick interval.' },
    unit: { control: 'text', description: 'Suffix on the default formatter (e.g. "%").' },
    labelPrefix: { control: 'text', description: 'Prefix before the point label in the tooltip.' },
    format: { control: false, description: 'Custom value formatter; overrides `unit`.' },
    legend: { control: 'boolean', description: 'Show the series legend.' },
    seriesPatterns: { control: 'boolean', description: 'Each series also gets its own dash (WCAG 1.4.1). Default true.' },
    showXAxis: { control: 'boolean', description: 'Show the x-axis labels.' },
    showYAxis: { control: 'boolean', description: 'Show the y-axis labels.' },
    ariaLabel: { control: 'text', description: 'Accessible summary of the comparison.' },
    className: { control: false, description: 'Class on the root element.' },
  },
  args: {
    data: DELIVERY,
    series: [
      { key: 'downloaded', name: 'Downloaded' },
      { key: 'opened', name: 'Opened' },
    ],
    height: 260,
    yStep: 25,
    unit: '%',
    legend: true,
    ariaLabel: 'Galleries downloaded vs opened across the week; opened runs higher.',
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[680px] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two series, downloaded vs opened. Hover for a per-series crosshair tooltip. */
export const TwoSeries: Story = {};

/** Three series pull chart-01..03 in order; the legend keeps them named. */
export const ThreeSeries: Story = {
  args: {
    data: DELIVERY.map((d) => ({ ...d, favorited: Math.round(d.downloaded * 0.6) })),
    series: [
      { key: 'downloaded', name: 'Downloaded' },
      { key: 'opened', name: 'Opened' },
      { key: 'favorited', name: 'Favorited' },
    ],
    ariaLabel: 'Galleries downloaded, opened and favorited across the week.',
  },
};

/**
 * Without `ariaLabel` the chart writes its own summary: the series names,
 * then each series' first value, last value and peak, so a screen-reader
 * user still hears the numbers. A hand-written `ariaLabel` is still better.
 */
export const DefaultSummary: Story = {
  args: { ariaLabel: undefined },
  play: async ({ canvasElement }) => {
    const img = canvasElement.querySelector('[data-slot="line-chart"]')!;
    expect(img).toHaveAttribute('role', 'img');
    expect(img.getAttribute('aria-label')).toBe('Downloaded, Opened across 7 points. Downloaded: from 32% to 36%, peak 61% (Fri). Opened: from 51% to 54%, peak 72% (Fri)');
    // The recharts keyboard layer stays off: no tab stop inside role="img".
    expect([...img.querySelectorAll<HTMLElement>('*')].filter((el) => el.tabIndex >= 0)).toHaveLength(0);
  },
};

/** A single series still works (legend collapses to one entry). */
export const SingleSeries: Story = {
  args: {
    series: [{ key: 'downloaded', name: 'Downloaded' }],
    ariaLabel: 'Galleries downloaded across the week, peaking Friday.',
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
