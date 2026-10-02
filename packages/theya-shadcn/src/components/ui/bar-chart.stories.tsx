import type { Meta, StoryObj } from '@storybook/react';
import { BarChart } from './bar-chart';

const DEPLOYS = [
  { label: 'Mon', value: 4 },
  { label: 'Tue', value: 7 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 8 },
  { label: 'Fri', value: 11 },
  { label: 'Sat', value: 2 },
  { label: 'Sun', value: 1 },
];

const REGIONS = [
  { label: 'eu-west-1', value: 42 },
  { label: 'us-east-1', value: 31 },
  { label: 'ap-south-1', value: 18 },
  { label: 'sa-east-1', value: 9 },
];

/**
 * BarChart — single-series categorical bars on Recharts: one brand fill,
 * rounded caps, a stepped value-grid, and a crosshair tooltip. Comparison is
 * carried by bar length, so color stays one signal. Use `orientation="horizontal"`
 * for a ranked breakdown with long labels. Give the wrapper a width; height is a
 * prop. Always pass a meaningful `ariaLabel` (the chart is one `role="img"`).
 */
const meta = {
  title: 'Charts/BarChart',
  component: BarChart,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    // `data` is intentionally NOT a controllable arg: Storybook freezes args
    // after the first render, and re-running its args-enhancers/spy-wrapping
    // loader (interactions addon) on ANY control change then tries to
    // reassign into that frozen array and throws "Cannot assign to read only
    // property '0'". Keeping the array out of args (passed directly inside
    // each story's `render` instead) sidesteps that entirely — this is an
    // upstream Storybook 8.6.x issue, not a BarChart bug.
    data: { control: false, description: 'Categorical entries to plot ({ label, value }).', table: { disable: true } },
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'], description: 'Columns vs ranked bars.' },
    height: { control: { type: 'number' }, description: 'Chart height in px (width is fluid).' },
    valueStep: { control: { type: 'number' }, description: 'Value-axis / gridline interval.' },
    unit: { control: 'text', description: 'Suffix on the default formatter (e.g. "%").' },
    labelPrefix: { control: 'text', description: 'Prefix before the category label in the tooltip.' },
    format: { control: false, description: 'Custom value formatter; overrides `unit`.' },
    ariaLabel: { control: 'text', description: 'Accessible summary of the comparison.' },
    className: { control: false, description: 'Class on the root element.' },
  },
  args: {
    orientation: 'vertical',
    height: 240,
    valueStep: 4,
    ariaLabel: 'Deploys per day this week, peaking Friday at 11.',
  },
  decorators: [
    (Story) => (
      <div className="w-[560px] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Vertical columns: deploys per day. Hover for the crosshair tooltip. */
export const Vertical: Story = {
  render: (args) => <BarChart {...args} data={DEPLOYS} />,
};

/** A ranked, horizontal breakdown: load by region, longest bar first. Good when
 * category labels are long. */
export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
    unit: '%',
    valueStep: 10,
    ariaLabel: 'Request load by region, led by eu-west-1 at 42%.',
  },
  render: (args) => <BarChart {...args} data={REGIONS} />,
};

/** Empty data: the gridded frame still renders, ready for incoming data. */
export const Empty: Story = {
  args: { ariaLabel: 'No deploy data yet.' },
  render: (args) => <BarChart {...args} data={[]} />,
};
