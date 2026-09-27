import type { Meta, StoryObj } from '@storybook/react';
import { LineChart } from './LineChart';

const meta: Meta<typeof LineChart> = {
  title: 'Components/Chart/LineChart',
  component: LineChart,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Built on Recharts, colored via Theya CSS custom properties (theme-aware — respects light/dark mode automatically).',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LineChart>;

const dailyData = [
  { time: '00:00', executions: 5, errors: 20, baseline: 15 },
  { time: '04:00', executions: 25, errors: 45, baseline: 20 },
  { time: '08:00', executions: 80, errors: 90, baseline: 30 },
  { time: '12:00', executions: 100, errors: 145, baseline: 60 },
  { time: '16:00', executions: 145, errors: 105, baseline: 100 },
  { time: '20:00', executions: 150, errors: 40, baseline: 140 },
  { time: '23:59', executions: 155, errors: 10, baseline: 120 },
];

/** Recreates the "Agent Activity" chart from the Botrix reference. */
export const MultiLine: Story = {
  args: {
    data: dailyData,
    xKey: 'time',
    series: [
      { key: 'executions', label: 'Executions', color: 'warning' },
      { key: 'errors', label: 'Errors', color: 'primary' },
      { key: 'baseline', label: 'Baseline', color: 'neutral' },
    ],
    variant: 'line',
    height: 320,
  },
};

const monthlyData = [
  { month: 'Jan', income: 600, expense: 400 },
  { month: 'Feb', income: 750, expense: 500 },
  { month: 'Mar', income: 900, expense: 400 },
  { month: 'Apr', income: 700, expense: 890 },
  { month: 'May', income: 600, expense: 500 },
  { month: 'Jun', income: 750, expense: 600 },
  { month: 'Jul', income: 800, expense: 500 },
  { month: 'Aug', income: 950, expense: 850 },
  { month: 'Sep', income: 850, expense: 550 },
  { month: 'Oct', income: 1000, expense: 650 },
  { month: 'Nov', income: 700, expense: 900 },
  { month: 'Dec', income: 650, expense: 600 },
];

/** Recreates the "Finance Analytics" chart from the finance-dashboard reference. */
export const AreaVariant: Story = {
  args: {
    data: monthlyData,
    xKey: 'month',
    series: [{ key: 'income', label: 'Income', color: 'warning' }],
    variant: 'area',
    height: 320,
    valueFormatter: (v) => `$${v}`,
  },
};

/** A single crypto-wallet-style value line, matching the Coinbase-style reference. */
export const SingleLineWithGradient: Story = {
  render: () => {
    const walletData = [
      { t: '9am', v: 2789 },
      { t: '10am', v: 3129 },
      { t: '11am', v: 2900 },
      { t: '12pm', v: 3188 },
      { t: '1pm', v: 3400 },
      { t: '2pm', v: 3792 },
      { t: '3pm', v: 3600 },
      { t: '4pm', v: 3820 },
    ];
    return (
      <LineChart
        data={walletData}
        xKey="t"
        series={[{ key: 'v', label: 'Wallet (USD)', color: 'success' }]}
        variant="area"
        height={280}
        valueFormatter={(v) => `$${v.toLocaleString()}`}
      />
    );
  },
};

export const NoGrid: Story = {
  args: {
    ...MultiLine.args,
    data: [...dailyData],
    showGrid: false,
    showYAxis: false,
  },
};
