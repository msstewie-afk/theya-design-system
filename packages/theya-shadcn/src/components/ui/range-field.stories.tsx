import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Price per month' });
    const minThumb = canvas.getByRole('slider', { name: 'Price per month minimum' });
    const maxThumb = canvas.getByRole('slider', { name: 'Price per month maximum' });
    const from = canvas.getByLabelText('From');
    const to = canvas.getByLabelText('To');
    const applied = () => canvas.getByText(/^Filter applied/);

    await expect(within(group).getByText('Any')).toBeInTheDocument();
    await expect(applied()).toHaveTextContent('Filter applied 0 times');

    // Keyboard on a thumb: the field and summary follow; each key press is one commit.
    minThumb.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
    await expect(minThumb).toHaveAttribute('aria-valuenow', '3');
    await expect(minThumb).toHaveAttribute('aria-valuetext', '€3');
    await expect(from).toHaveValue('3');
    await expect(within(group).getByText('€3 – €200')).toBeInTheDocument();
    await expect(applied()).toHaveTextContent('Filter applied 3 times');

    // Typing in a field moves the thumb and commits once, on Enter.
    await userEvent.clear(to);
    await userEvent.type(to, '150');
    await expect(applied()).toHaveTextContent('Filter applied 3 times');
    await userEvent.keyboard('{Enter}');
    await expect(maxThumb).toHaveAttribute('aria-valuenow', '150');
    await expect(applied()).toHaveTextContent('Filter applied 4 times · last: €3–€150');

    // A To value below From is clamped to From, not accepted as an inverted range.
    await userEvent.clear(to);
    await userEvent.type(to, '1{Enter}');
    await expect(to).toHaveValue('3');
    await expect(maxThumb).toHaveAttribute('aria-valuenow', '3');
  },
};

/** `minDistance` keeps a gap between the bounds — here at least 50 GB. */
export const MinDistance: Story = {
  args: { minDistance: 50, defaultValue: [100, 200] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const minThumb = canvas.getByRole('slider', { name: 'Storage, GB minimum' });
    const from = canvas.getByLabelText('From');
    const maxThumb = canvas.getByRole('slider', { name: 'Storage, GB maximum' });
    // End on the minimum moves THAT thumb as far as it may go (50 below the other),
    // not the maximum thumb to the end of the scale.
    minThumb.focus();
    await userEvent.keyboard('{End}');
    await waitFor(() => expect(minThumb).toHaveAttribute('aria-valuenow', '150'));
    await expect(maxThumb).toHaveAttribute('aria-valuenow', '200');
    // Home on the maximum, likewise, stops 50 above the minimum.
    maxThumb.focus();
    await userEvent.keyboard('{Home}');
    await waitFor(() => expect(maxThumb).toHaveAttribute('aria-valuenow', '200'));
    await expect(minThumb).toHaveAttribute('aria-valuenow', '150');
    // …and neither can a typed value.
    await userEvent.clear(from);
    await userEvent.type(from, '190{Enter}');
    await expect(from).toHaveValue('150');
  },
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('20 – 80')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await expect(canvas.getByText('Any')).toBeInTheDocument();
    await expect(canvas.getByLabelText('From')).toHaveValue('0');
    await expect(canvas.getByRole('slider', { name: 'Response time, ms maximum' })).toHaveAttribute('aria-valuenow', '100');
  },
};

/** Compact for filter sidebars. */
export const Small: Story = {
  args: { heightSize: 'sm', label: 'Price per month', min: 0, max: 200, histogram: PRICE_HISTOGRAM, formatValue: (v: number) => `€${v}` },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: [50, 300] },
};
