import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { RangeField, type RangeValue } from './range-field';
import { rangeFieldGuidelines } from './range-field.guidelines';

/**
 * RangeField — a two-thumb slider plus "From"/"To" number fields that stay
 * in sync: drag for a rough pick, type for an exact bound. `onValueCommit`
 * fires once per finished change (thumb released or bound committed) — use
 * it to filter or fetch. An optional `histogram` shows where the items are.
 */
const meta = {
  title: 'Selection/RangeField',
  component: RangeField,
  tags: ['autodocs'],
  parameters: { layout: 'padded', guidelines: rangeFieldGuidelines },
  argTypes: {
    label: { control: 'text', table: { category: 'Content' } },
    description: { control: 'text', table: { category: 'Content' } },
    min: { control: 'number', table: { category: 'Behavior' } },
    max: { control: 'number', table: { category: 'Behavior' } },
    step: { control: 'number', table: { category: 'Behavior' } },
    minDistance: { control: 'number', description: 'Smallest gap between the bounds.', table: { category: 'Behavior' } },
    heightSize: { control: 'inline-radio', options: ['sm', 'md'], table: { category: 'Appearance' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    histogram: { control: false },
    formatValue: { control: false },
    onValueChange: { control: false },
    onValueCommit: { control: false },
  },
  args: { label: 'Storage, GB', min: 0, max: 500, step: 10, heightSize: 'md' },
  decorators: [(Story) => <div className="w-[320px]">{Story()}</div>],
} satisfies Meta<typeof RangeField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Drag a thumb or type a bound. "From" can't pass "To". */
export const Default: Story = {};

const PRICE_HISTOGRAM = [2, 5, 9, 14, 18, 22, 19, 15, 12, 9, 7, 6, 4, 3, 3, 2, 1, 1, 1, 0];

/** A price filter: currency formatting, a histogram of how many plans sit at each price, and the commit count — one per finished change, not per drag tick. */
export const PriceFilter: Story = {
  args: { label: 'Price per month', min: 0, max: 200, step: 1, histogram: PRICE_HISTOGRAM, formatValue: (v: number) => `€${v}` },
  render: function Render(args) {
    const [commits, setCommits] = useState(0);
    const [last, setLast] = useState<RangeValue | null>(null);
    return (
      <div className="flex flex-col gap-3">
        <RangeField
          {...args}
          onValueCommit={(v) => {
            setCommits((n) => n + 1);
            setLast(v);
          }}
        />
        <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">
          Filter applied {commits} time{commits === 1 ? '' : 's'}
          {last ? ` · last: €${last[0]}–€${last[1]}` : ''}
        </span>
      </div>
    );
  },
};

/** `minDistance` keeps a gap between the bounds — here at least 50 GB. */
export const MinDistance: Story = {
  args: { minDistance: 50, defaultValue: [100, 200] },
};

/** Controlled with a reset — "Any" in the summary means the full range, i.e. no filter. */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [value, setValue] = useState<RangeValue>([20, 80]);
    return (
      <div className="flex flex-col gap-3">
        <RangeField label="Response time, ms" min={0} max={100} value={value} onValueChange={setValue} />
        <Button appearance="ghost" tone="neutral" size="md" className="self-start" onClick={() => setValue([0, 100])}>
          Reset
        </Button>
      </div>
    );
  },
};

/** Compact for filter sidebars. */
export const Small: Story = {
  args: { heightSize: 'sm', label: 'Price per month', min: 0, max: 200, histogram: PRICE_HISTOGRAM, formatValue: (v: number) => `€${v}` },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: [50, 300] },
};
