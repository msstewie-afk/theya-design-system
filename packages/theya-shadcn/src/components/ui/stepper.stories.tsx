import type { Meta, StoryObj } from '@storybook/react';
import { Stepper } from './stepper';

const meta: Meta<typeof Stepper> = {
  title: 'Navigation/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  argTypes: {
    steps: { control: false, description: 'Ordered list of { label, description } steps.' },
    current: { control: { type: 'number', min: 0 }, description: '0-based index of the in-progress step.' },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'], description: 'Layout direction of the step list.' },
    labelAlign: {
      control: 'inline-radio',
      options: ['start', 'center'],
      description: "Horizontal only: 'start' matches the indicator's left edge; 'center' pins under it (short labels only).",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Stepper>;

const STEPS = [
  { label: 'Account' },
  { label: 'Plan', description: 'Pick a tier' },
  { label: 'Review' },
];

const PLAIN_STEPS = [
  { label: 'Step 1' },
  { label: 'Step 2' },
  { label: 'Step 3' },
  { label: 'Step 4' },
  { label: 'Step 5' },
];

const VERTICAL_STEPS = [
  { label: 'Connect domain', description: 'Point DNS at the platform' },
  { label: 'Choose region', description: 'Where the workload runs' },
  { label: 'Configure runtime', description: 'Versions and environment' },
  { label: 'Review and deploy' },
];

export const Horizontal: Story = {
  args: { steps: STEPS, current: 1 },
  render: (args) => (
    <div className="w-[500px]">
      <Stepper {...args} />
    </div>
  ),
};

export const Vertical: Story = {
  args: { steps: STEPS, current: 1, orientation: 'vertical' },
  render: (args) => (
    <div className="w-[280px]">
      <Stepper {...args} />
    </div>
  ),
};

export const Complete: Story = {
  args: { steps: STEPS, current: STEPS.length },
  render: (args) => (
    <div className="w-[500px]">
      <Stepper {...args} />
    </div>
  ),
};

export const CenteredLabels: Story = {
  name: 'Centered labels',
  args: { steps: [{ label: 'One' }, { label: 'Two' }, { label: 'Three' }], current: 1, labelAlign: 'center' },
  render: (args) => (
    <div className="w-[400px]">
      <Stepper {...args} />
    </div>
  ),
};

/** The first step in progress: nothing complete yet, the rest upcoming. */
export const FirstStep: Story = {
  name: 'First step',
  args: { steps: STEPS, current: 0 },
  render: (args) => (
    <div className="w-[500px]">
      <Stepper {...args} />
    </div>
  ),
};

/** Not started yet: pass a value below 0 so no step is current. */
export const NotStarted: Story = {
  name: 'Not started',
  args: { steps: STEPS, current: -1 },
  render: (args) => (
    <div className="w-[500px]">
      <Stepper {...args} />
    </div>
  ),
};

/** Regression check: 5 plain-label (no description) horizontal steps at several `current` values — every gap between indicators should read as the same width at every value. */
export const HorizontalEvenGaps: Story = {
  name: 'Horizontal even gaps',
  render: () => (
    <div className="flex w-[500px] flex-col gap-10">
      {[0, 2, 4, PLAIN_STEPS.length].map((current) => (
        <Stepper key={current} steps={PLAIN_STEPS} orientation="horizontal" current={current} />
      ))}
    </div>
  ),
};

/** Both orientations side by side at the same progress, showing how the same data drives a compact header or a roomy rail. */
export const Orientations: Story = {
  render: () => (
    <div className="flex w-[500px] flex-col gap-10">
      <div className="flex flex-col gap-2">
        <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">Horizontal</p>
        <Stepper orientation="horizontal" steps={STEPS} current={1} />
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">Vertical</p>
        <Stepper orientation="vertical" steps={VERTICAL_STEPS} current={2} />
      </div>
    </div>
  ),
};
