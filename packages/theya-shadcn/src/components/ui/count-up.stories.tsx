import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { CountUp } from './count-up';
import { countUpGuidelines } from './count-up.guidelines';

/** CountUp — a headline number counts up when it scrolls into view (landing pages). */
const meta = {
  title: 'Motion/CountUp',
  component: CountUp,
  tags: ['autodocs'],
  parameters: { layout: 'padded', guidelines: countUpGuidelines },
  argTypes: {
    to: { control: 'number', description: 'The value to land on.' },
    from: { control: 'number', description: 'Where to start.' },
    duration: { control: 'number', description: 'Run time, ms.' },
    prefix: { control: 'text' },
    suffix: { control: 'text' },
    format: { control: false, description: 'Intl.NumberFormat options.' },
  },
  args: { to: 12400, from: 0, duration: 1400 },
} satisfies Meta<typeof CountUp>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <p className="font-body text-heading-l font-semibold text-[var(--color-text-text)]">
      <CountUp {...args} /> <span className="text-body-l font-normal text-[var(--color-text-text-subtle)]">sites hosted</span>
    </p>
  ),
  play: async ({ canvasElement }) => {
    // The spoken value is the final one, whatever frame the digits are on.
    await expect(within(canvasElement).getByText('12,400')).toHaveClass('sr-only');
  },
};

/** A stats row: percent with a decimal, a compact figure, a prefix. */
export const StatsRow: Story = {
  render: () => (
    <dl className="grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
      {[
        { label: 'Uptime', value: <CountUp to={99.98} suffix="%" format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} /> },
        { label: 'Requests a day', value: <CountUp to={2400000} format={{ notation: 'compact' }} /> },
        { label: 'Saved on hosting', value: <CountUp to={340} prefix="$" suffix="/mo" /> },
      ].map((s) => (
        <div key={s.label} className="flex flex-col gap-1">
          <dt className="text-body-s text-[var(--color-text-text-subtler)]">{s.label}</dt>
          <dd className="font-body text-heading-m font-semibold text-[var(--color-text-text)]">{s.value}</dd>
        </div>
      ))}
    </dl>
  ),
};
