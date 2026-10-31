import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { Meter } from './meter';
import { meterGuidelines } from './meter.guidelines';

/**
 * Meter — a labelled bar for a measured value inside a known range (disk
 * usage, a quota, capacity, a health score). Built on native `role="meter"`
 * semantics (aria-valuemin/max/now/text) since no Radix meter primitive
 * exists. Use it — not Progress — whenever the number is a static
 * measurement rather than task completion, and carry a threshold `tone`
 * (primary / success / warning / danger / info).
 */
const meta = {
  title: 'Status & Feedback/Meter',
  component: Meter,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "How full something is within a known range: disk, memory, a quota, seats used — or a score, also as segments.",
      },
    },
    layout: 'centered', guidelines: meterGuidelines,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[340px] max-w-full">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 }, description: 'Current value.' },
    tone: {
      control: { type: 'inline-radio' },
      options: ['primary', 'success', 'warning', 'danger', 'info'],
      description: 'Fill color.',
    },
    min: { control: false, description: 'Minimum value.' },
    max: { control: false, description: 'Maximum value.' },
    label: { control: 'text', description: 'Label shown above the meter.' },
    format: { control: false, description: 'Intl.NumberFormat options for the displayed value.' },
    getValueLabel: { control: false, description: 'Custom accessible value text (aria-valuetext).' },
    showValue: { control: 'boolean', description: 'Shows the formatted value alongside the label.' },
    segments: {
      control: false,
      description: 'Render as N discrete lit-or-not cells instead of a smooth fill, for a fixed count of physical/logical units. Typically set max equal to segments.',
    },
    thresholds: {
      control: false,
      description: 'Marks on the bar: `{ value, label?, tone? }[]`. Each draws a tick (and a label under it); once `value` reaches one, the fill takes its `tone` (default warning). The aria text names the nearest thresholds.',
    },
    className: { control: false, description: 'Class on the root element.' },
  },
  args: { value: 72, label: 'Health score', tone: 'primary', showValue: true },
} satisfies Meta<typeof Meter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A labelled meter showing the raw value (the default readout). Drag `value` and switch `tone`. */
export const Default: Story = {};

/** Threshold tones — the same value read as healthy, warning, and over-limit. */
export const Tones: Story = {
  parameters: { controls: { exclude: ['value', 'tone', 'label'] } },
  render: () => (
    <div className="flex flex-col gap-5">
      <Meter value={0.38} min={0} max={1} label="CPU" tone="success" format={{ style: 'percent' }} />
      <Meter value={0.82} min={0} max={1} label="Memory" tone="warning" format={{ style: 'percent' }} />
      <Meter value={0.96} min={0} max={1} label="Disk" tone="danger" format={{ style: 'percent' }} />
    </div>
  ),
};

/**
 * A custom range and unit `format`: the displayed value and the aria text both
 * report gigabytes, not a percentage, while the fill still tracks the range.
 */
export const FormattedUnits: Story = {
  parameters: { controls: { exclude: ['value', 'min', 'max', 'format', 'label'] } },
  render: () => (
    <Meter value={37.4} min={0} max={50} label="Storage" tone="primary" format={{ style: 'unit', unit: 'gigabyte', maximumFractionDigits: 1 }} />
  ),
};

/** No visible value — pass a `label` (which names it for assistive tech) and hide
 * the number for a compact inline indicator. */
export const LabelOnly: Story = {
  parameters: { controls: { exclude: ['value', 'showValue', 'label'] } },
  render: () => <Meter value={64} label="Health score" showValue={false} />,
};

/** Bare bar — no header at all. Provide an `aria-label` so it still has a name. */
export const Bare: Story = {
  parameters: { controls: { exclude: ['value', 'label', 'showValue'] } },
  render: () => <Meter value={45} label={undefined} showValue={false} aria-label="Bandwidth used 45%" />,
};

/**
 * Segmented mode — a fixed count of physical/logical units (GPUs, seats,
 * slots) as N discrete lit-or-not cells instead of a smooth fill. `max`
 * matches `segments` (one cell per unit) so `value` maps directly to a
 * count of lit cells.
 */
export const Segmented: Story = {
  parameters: { controls: { exclude: ['value', 'tone', 'label'] } },
  render: () => <Meter value={7} max={10} segments={10} label="GPUs" showValue={false} />,
};

const grams = { style: 'unit', unit: 'gram', maximumFractionDigits: 1 } as const;

/**
 * Thresholds — a tick and a label for each limit. Below every threshold the
 * fill keeps the Meter's own `tone`; once the value reaches one, the fill takes
 * that threshold's `tone` (warning by default). Screen readers hear the value,
 * the range and the nearest thresholds: "1.1 g of 3 g, below the 2 g threshold".
 */
export const WithThresholds: Story = {
  parameters: { controls: { exclude: ['value', 'min', 'max', 'format', 'label', 'tone', 'thresholds'] } },
  render: () => (
    <div className="flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-6">
      <Meter
        value={1.1}
        max={3}
        label="Salt today"
        tone="success"
        format={grams}
        thresholds={[{ value: 2, label: '2 g limit' }]}
      />
      <Meter
        value={2.4}
        max={3}
        label="Salt this week"
        tone="success"
        format={grams}
        thresholds={[{ value: 2, label: '2 g limit' }]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [under, over] = within(canvasElement).getAllByRole('meter');
    await expect(under).toHaveAttribute('aria-valuetext', '1.1 g of 3 g, below the 2 g threshold');
    await expect(under).toHaveAttribute('data-tone', 'success');
    await expect(over).toHaveAttribute('aria-valuetext', '2.4 g of 3 g, above the 2 g threshold');
    await expect(over).toHaveAttribute('data-tone', 'warning');
  },
};

/**
 * A minimum to reach (protein, steps, savings): start in `warning` and give the
 * threshold `tone: 'success'`, so the fill turns green once the goal is met.
 * Several thresholds work the same way: the highest one reached sets the tone.
 */
export const MinimumAndSteps: Story = {
  parameters: { controls: { exclude: ['value', 'min', 'max', 'format', 'label', 'tone', 'thresholds'] } },
  render: () => (
    <div className="flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-6">
      <Meter
        value={42}
        max={80}
        label="Protein"
        tone="warning"
        format={grams}
        thresholds={[{ value: 50, label: 'Goal 50 g', tone: 'success' }]}
      />
      <Meter
        value={0.68}
        max={1}
        label="Disk"
        tone="success"
        format={{ style: 'percent' }}
        thresholds={[
          { value: 0.6, label: 'Warning' },
          { value: 0.9, label: 'Critical', tone: 'danger' },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [protein, disk] = within(canvasElement).getAllByRole('meter');
    await expect(protein).toHaveAttribute('aria-valuetext', '42 g of 80 g, below the 50 g threshold');
    await expect(protein).toHaveAttribute('data-tone', 'warning');
    await expect(disk).toHaveAttribute('aria-valuetext', '68% of 100%, above the 60% threshold, below the 90% threshold');
    await expect(disk).toHaveAttribute('data-tone', 'warning');
  },
};
