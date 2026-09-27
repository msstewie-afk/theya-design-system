import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from './slider';

const meta: Meta<typeof Slider> = {
  title: 'Forms/Slider',
  component: Slider,
  tags: ['autodocs'],
  argTypes: {
    min: { control: 'number', description: 'Minimum value (aria-valuemin).', table: { category: 'Range' } },
    max: { control: 'number', description: 'Maximum value (aria-valuemax).', table: { category: 'Range' } },
    step: { control: 'number', description: 'Granularity of value changes.', table: { category: 'Range' } },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Track direction.',
      table: { category: 'Appearance' },
    },
    invalid: { control: 'boolean', description: 'Danger-styled track/thumb.', table: { category: 'State' } },
    disabled: { control: 'boolean', description: 'Disables the slider.', table: { category: 'State' } },
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Playground: Story = {
  args: { defaultValue: [50], 'aria-label': 'Volume' },
  render: (args) => (
    <div className="w-[280px]">
      <Slider {...args} />
    </div>
  ),
};

function ConcurrencyDemo() {
  const [value, setValue] = useState([8]);
  return (
    <div className="w-[280px] space-y-3">
      <div className="flex items-center justify-between text-body-s">
        <span className="font-medium text-[var(--color-text-text)]">Worker concurrency</span>
        <span className="font-mono text-[var(--color-text-text-subtler)]">{value[0]}</span>
      </div>
      <Slider aria-label="Worker concurrency" min={1} max={32} value={value} onValueChange={setValue} />
    </div>
  );
}

/** Controlled single-thumb slider with a visible value readout. */
export const SingleValue: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ConcurrencyDemo />,
};

function BudgetRangeDemo() {
  const [range, setRange] = useState([20, 80]);
  return (
    <div className="w-[280px] space-y-3" role="group" aria-labelledby="budget-label">
      <p id="budget-label" className="text-body-s font-medium text-[var(--color-text-text)]">
        Monthly budget (USD)
      </p>
      <Slider aria-label="Monthly budget" min={0} max={200} step={5} value={range} onValueChange={setRange} />
      <p className="text-body-s text-[var(--color-text-text-subtler)]">
        <span className="font-mono">${range[0]}</span> – <span className="font-mono">${range[1]}</span>
      </p>
    </div>
  );
}

/** Two thumbs name a labelled group; each thumb becomes "minimum" / "maximum". Controlled, with a live readout. */
export const Range: Story = {
  parameters: { controls: { disable: true } },
  render: () => <BudgetRangeDemo />,
};

/** `invalid` — track fill + thumb turn destructive and the focus ring recolors, matching the TextField/Select error treatment. Pair it with a message — never color alone. */
export const Invalid: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-[280px] space-y-3" role="group" aria-labelledby="ram-label">
      <p id="ram-label" className="text-body-s font-medium text-[var(--color-text-text)]">
        Reserved memory (GB)
      </p>
      <Slider aria-label="Reserved memory" invalid aria-describedby="ram-error" min={0} max={16} step={1} defaultValue={[14]} />
      <p id="ram-error" className="text-body-s text-[var(--color-text-text-danger)]">
        Exceeds your plan&apos;s 8 GB limit.
      </p>
    </div>
  ),
};

export const Disabled: Story = {
  args: { defaultValue: [50], disabled: true, 'aria-label': 'Volume' },
  render: (args) => (
    <div className="w-[280px]">
      <Slider {...args} />
    </div>
  ),
};

function VerticalDemo() {
  const [value, setValue] = useState([60]);
  return (
    <div className="flex h-52 items-center gap-4">
      <Slider aria-label="Log retention days" orientation="vertical" min={0} max={90} value={value} onValueChange={setValue} />
      <span className="font-mono text-body-s text-[var(--color-text-text-subtler)]">{value[0]}d</span>
    </div>
  );
}

/** Pass `orientation="vertical"`; the track pins to a 176px height by default (override via className). */
export const Vertical: Story = {
  parameters: { controls: { disable: true } },
  render: () => <VerticalDemo />,
};

function CacheTierDemo() {
  const tiers = ['Off', 'Low', 'Medium', 'High'];
  const [value, setValue] = useState([2]);
  return (
    <div className="w-[280px] space-y-3">
      <p className="text-body-s font-medium text-[var(--color-text-text)]">Edge cache tier</p>
      <Slider aria-label="Edge cache tier" min={0} max={3} step={1} value={value} onValueChange={setValue} formatValue={(v) => tiers[v]} />
      <p className="text-body-s text-[var(--color-text-text-subtler)]">{tiers[value[0]]}</p>
    </div>
  );
}

/** `formatValue` maps a thumb's number to a human-readable string set as `aria-valuetext`, so screen readers announce "Medium" rather than "2". */
export const FormattedValue: Story = {
  parameters: { controls: { disable: true } },
  render: () => <CacheTierDemo />,
};
