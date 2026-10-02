import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fireEvent, userEvent, waitFor, within } from '@storybook/test';
import {
  Area as RechartsArea,
  AreaChart,
  Bar as RechartsBar,
  BarChart,
  CartesianGrid,
  Line as RechartsLine,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartRangeSelection, type ChartSelectionRange } from './chart-range-selection';

const DATA = [
  { label: 'Aug 1', requests: 38, errors: 8 },
  { label: 'Aug 2', requests: 52, errors: 10 },
  { label: 'Aug 3', requests: 46, errors: 7 },
  { label: 'Aug 4', requests: 64, errors: 12 },
  { label: 'Aug 5', requests: 59, errors: 9 },
  { label: 'Aug 6', requests: 78, errors: 15 },
  { label: 'Aug 7', requests: 71, errors: 11 },
  { label: 'Aug 8', requests: 86, errors: 16 },
  { label: 'Aug 9', requests: 76, errors: 13 },
  { label: 'Aug 10', requests: 92, errors: 18 },
];

const labels = DATA.map((point) => point.label);

const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: 'var(--color-text-text-subtler)', fontSize: 11 },
} as const;

// Recharts' own <Tooltip/> with no `content` renders its default plain
// white box — wrong in dark theme and inconsistent with every DS chart
// (AreaChart/LineChart/BarChart's own tooltips, and DonutChart's), which
// all use this exact card: `bg-surface-overlay` + `border-subtle` +
// `shadow-elevation-lg`, semantic text tokens throughout so it reads correctly in
// both themes. This story uses raw `recharts` primitives directly (to
// demo ChartRangeSelection wrapping an arbitrary chart, not a Theya
// component), so it needs its own copy of that same tooltip card rather
// than inheriting one — mirrors AreaChartTooltip/AreaChartMultiTooltip's
// styling 1:1 (see area-chart.tsx).
interface RangeTooltipEntry {
  dataKey?: string | number;
  name?: string;
  value?: number | string;
  color?: string;
}

function RangeChartTooltip({ active, payload, label }: { active?: boolean; payload?: RangeTooltipEntry[]; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  if (payload.length === 1) {
    const v = payload[0].value;
    return (
      <div className="flex flex-col gap-px rounded-[var(--size-border-radius-border-radius-md)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface-overlay)] px-2.5 py-1.5 shadow-elevation-lg">
        <span className="text-[0.6875rem] text-[var(--color-text-text-subtler)]">{label}</span>
        <span className="font-body text-body-s font-semibold tabular-nums text-[var(--color-text-text)]">{v}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1 rounded-[var(--size-border-radius-border-radius-md)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface-overlay)] px-2.5 py-1.5 shadow-elevation-lg">
      <span className="text-[0.6875rem] text-[var(--color-text-text-subtler)]">{label}</span>
      <div className="flex flex-col gap-0.5">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 font-body text-body-xs">
            <span className="inline-block size-2 shrink-0 rounded-[var(--size-border-radius-border-radius-sm)]" style={{ background: entry.color }} />
            <span className="text-[var(--color-text-text-subtler)]">{entry.name ?? String(entry.dataKey ?? '')}</span>
            <span className="ml-auto font-semibold tabular-nums text-[var(--color-text-text)]">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SelectionReadout({ range }: { range: ChartSelectionRange | null }) {
  return (
    <p className="font-body text-body-s text-[var(--color-text-text-subtler)]" aria-live="polite">
      {range ? (
        <>
          Selected: <span className="font-medium text-[var(--color-text-text)]">{range.from} – {range.to}</span>
        </>
      ) : (
        'Drag across the chart, or focus it and use Shift + arrow keys, to select a range. Click once or press Esc to clear it.'
      )}
    </p>
  );
}

function InteractiveExample({
  kind = 'area',
  initialRange = null,
  disabled = false,
}: {
  kind?: 'area' | 'line' | 'bar';
  initialRange?: ChartSelectionRange | null;
  disabled?: boolean;
}) {
  const [range, setRange] = useState<ChartSelectionRange | null>(initialRange);

  const common = {
    data: DATA,
    margin: { top: 12, right: 16, bottom: 0, left: 0 },
  };

  const chart =
    kind === 'line' ? (
      <LineChart {...common}>
        <CartesianGrid vertical={false} stroke="var(--color-border-border-subtle)" strokeOpacity={0.6} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis width={36} {...axisProps} />
        <Tooltip content={<RangeChartTooltip />} />
        <RechartsLine name="Requests" type="monotone" dataKey="requests" stroke="var(--color-bg-primary-bg-primary)" strokeWidth={2} dot={false} />
        <RechartsLine name="Errors" type="monotone" dataKey="errors" stroke="var(--color-bg-danger-bg-danger)" strokeWidth={2} dot={false} />
      </LineChart>
    ) : kind === 'bar' ? (
      <BarChart {...common}>
        <CartesianGrid vertical={false} stroke="var(--color-border-border-subtle)" strokeOpacity={0.6} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis width={36} {...axisProps} />
        <Tooltip content={<RangeChartTooltip />} cursor={{ fill: 'var(--color-bg-neutral-bg-neutral-subtle)' }} />
        <RechartsBar name="Requests" dataKey="requests" fill="var(--color-bg-primary-bg-primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    ) : (
      <AreaChart {...common}>
        <defs>
          <linearGradient id="range-story-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-bg-primary-bg-primary)" stopOpacity={0.32} />
            <stop offset="100%" stopColor="var(--color-bg-primary-bg-primary)" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--color-border-border-subtle)" strokeOpacity={0.6} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis width={36} {...axisProps} />
        <Tooltip content={<RangeChartTooltip />} />
        <RechartsArea name="Requests" type="monotone" dataKey="requests" stroke="var(--color-bg-primary-bg-primary)" strokeWidth={2} fill="url(#range-story-fill)" />
      </AreaChart>
    );

  return (
    <div className="flex flex-col gap-3">
      <SelectionReadout range={range} />
      <ChartRangeSelection labels={labels} selectedRange={range} onRangeChange={setRange} disabled={disabled} aria-label="Select a date range">
        {chart}
      </ChartRangeSelection>
    </div>
  );
}

/**
 * ChartRangeSelection — adds drag-to-select behavior to a categorical
 * Recharts chart. Wrap a chart without `ResponsiveContainer` and pass its
 * ordered x-axis `labels`. The selected range can be controlled to filter
 * data, update a detail view, or synchronize another chart.
 */
// Typed as Meta (not `satisfies`) so stories that supply children/labels
// through `render` aren't required to repeat them as args.
const meta: Meta<typeof ChartRangeSelection> = {
  title: 'Charts/ChartRangeSelection',
  component: ChartRangeSelection,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    // `children`/`labels` are excluded from controls for the same reason
    // BarChart's `data` is: this Storybook 8.6.x setup crashes when a
    // non-primitive arg (array/element) gets re-processed by the
    // interactions-addon args loader on a control change. Both are supplied
    // directly in each story's `render` instead.
    children: { control: false, description: 'The chart element the selection overlay wraps.' },
    labels: { control: false, description: "Ordered values used by the chart's categorical x-axis." },
    height: { control: { type: 'number' }, description: 'Chart height in px.' },
    selectedRange: { control: false, description: 'Controlled highlighted range.' },
    onRangeChange: { control: false, description: 'Called after a drag completes or the selection clears.' },
    disabled: { control: 'boolean', description: 'Disable interaction while retaining the highlight.' },
    className: { control: false, description: 'Class on the root element.' },
  },
  decorators: [
    (Story) => (
      <div className="w-[760px] max-w-full">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChartRangeSelection>;

const readout = (root: HTMLElement) => root.querySelector('p[aria-live]') as HTMLElement;
const liveRegion = (group: HTMLElement) => group.querySelector('[aria-live]') as HTMLElement;

/** Drag from one x-axis value to another. The readout shows the controlled value. */
export const Area: Story = {
  render: () => <InteractiveExample />,
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', { name: 'Select a date range' });
    await expect(group).toHaveAttribute('tabindex', '0');
    await expect(group).toHaveAccessibleDescription(/Shift plus arrow keys/);

    group.focus();
    // First arrow shows the cursor on the first value, the next moves it.
    await userEvent.keyboard('{ArrowRight}');
    await expect(liveRegion(group)).toHaveTextContent('Aug 1');
    await userEvent.keyboard('{ArrowRight}');
    await expect(liveRegion(group)).toHaveTextContent('Aug 2');

    await userEvent.keyboard('{Shift>}{ArrowRight}{ArrowRight}{/Shift}');
    await expect(liveRegion(group)).toHaveTextContent('Selected Aug 2 to Aug 4');
    await expect(readout(canvasElement)).toHaveTextContent('Selected: Aug 2 – Aug 4');

    // Extending backwards past the anchor flips the range around it.
    await userEvent.keyboard('{Shift>}{ArrowLeft}{ArrowLeft}{ArrowLeft}{/Shift}');
    await expect(readout(canvasElement)).toHaveTextContent('Selected: Aug 1 – Aug 2');

    await userEvent.keyboard('{Shift>}{End}{/Shift}');
    await expect(readout(canvasElement)).toHaveTextContent('Selected: Aug 2 – Aug 10');

    await userEvent.keyboard('{Escape}');
    await expect(liveRegion(group)).toHaveTextContent('Selection cleared');
    await expect(readout(canvasElement)).toHaveTextContent(/Drag across the chart/);
  },
};

/** The wrapper works with a multi-series line chart without changing its data model. */
export const Line: Story = {
  render: () => <InteractiveExample kind="line" />,
  play: async ({ canvasElement }) => {
    // Pointer drag across the plot: from ~20% to ~70% of its width.
    const surface = canvasElement.querySelector('.recharts-wrapper') as HTMLElement;
    const grid = canvasElement.querySelector('.recharts-cartesian-grid') as SVGGElement;
    const box = grid.getBoundingClientRect();
    const y = box.top + box.height / 2;
    const at = (f: number) => ({ clientX: box.left + box.width * f, clientY: y });

    // Recharts reads activeLabel for mousedown from the last hover, so the
    // pointer has to move onto the plot first, like a real mouse does.
    const tick = () => new Promise((r) => setTimeout(r, 50));
    fireEvent.mouseMove(surface, at(0.2));
    await tick();
    fireEvent.mouseDown(surface, at(0.2));
    await tick();
    fireEvent.mouseMove(surface, at(0.45));
    await tick();
    fireEvent.mouseMove(surface, at(0.7));
    await tick();
    fireEvent.mouseUp(surface, at(0.7));
    await waitFor(() => expect(readout(canvasElement)).toHaveTextContent(/Selected: Aug \d+ – Aug \d+/));
    const [, from, to] = readout(canvasElement).textContent!.match(/Aug (\d+) – Aug (\d+)/)!;
    await expect(Number(from)).toBeLessThan(Number(to));

    // A single click clears it.
    fireEvent.mouseMove(surface, at(0.5));
    await tick();
    fireEvent.mouseDown(surface, at(0.5));
    await tick();
    fireEvent.mouseUp(surface, at(0.5));
    await waitFor(() => expect(readout(canvasElement)).toHaveTextContent(/Drag across the chart/));
  },
};

/** The same selection behavior can wrap a categorical bar chart. */
export const Bar: Story = {
  render: () => <InteractiveExample kind="bar" />,
};

/** Disabled keeps the highlight but takes the selector out of the tab order and ignores keys and drags. */
export const Disabled: Story = {
  render: () => <InteractiveExample kind="bar" disabled initialRange={{ from: 'Aug 3', to: 'Aug 6' }} />,
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', { name: 'Select a date range' });
    await expect(group).toHaveAttribute('aria-disabled', 'true');
    await expect(group).not.toHaveAttribute('tabindex');
    group.focus();
    await userEvent.keyboard('{Escape}{Shift>}{ArrowRight}{/Shift}');
    await expect(readout(canvasElement)).toHaveTextContent('Selected: Aug 3 – Aug 6');
  },
};
