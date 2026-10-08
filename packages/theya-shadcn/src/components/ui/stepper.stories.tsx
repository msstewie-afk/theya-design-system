import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { Stepper } from './stepper';
import { stepperGuidelines } from './stepper.guidelines';

const meta: Meta<typeof Stepper> = {
  title: 'Navigation/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  parameters: { guidelines: stepperGuidelines },
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

/** Status word each step announces, in order. */
async function expectStatuses(root: HTMLElement, expected: Array<'completed' | 'current step' | 'upcoming'>) {
  const items = within(root).getAllByRole('listitem');
  await expect(items).toHaveLength(expected.length);
  for (const [i, status] of expected.entries()) {
    await expect(items[i]).toHaveTextContent(`step ${i + 1} of ${expected.length}, ${status}:`);
    if (status === 'current step') await expect(items[i]).toHaveAttribute('aria-current', 'step');
    else await expect(items[i]).not.toHaveAttribute('aria-current');
  }
}

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
    <div className="w-full max-w-[500px]">
      <Stepper {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('list', { name: 'Progress' });
    await expectStatuses(list, ['completed', 'current step', 'upcoming']);
    await expect(within(list).getAllByRole('listitem')[1]).toHaveTextContent('Plan');
  },
};

export const Vertical: Story = {
  args: { steps: STEPS, current: 1, orientation: 'vertical' },
  render: (args) => (
    <div className="w-[280px]">
      <Stepper {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectStatuses(canvasElement, ['completed', 'current step', 'upcoming']);
  },
};

export const Complete: Story = {
  args: { steps: STEPS, current: STEPS.length },
  render: (args) => (
    <div className="w-full max-w-[500px]">
      <Stepper {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // current === steps.length: everything done, nothing current.
    await expectStatuses(canvasElement, ['completed', 'completed', 'completed']);
  },
};

export const CenteredLabels: Story = {
  name: 'Centered labels',
  args: { steps: [{ label: 'One' }, { label: 'Two' }, { label: 'Three' }], current: 1, labelAlign: 'center' },
  render: (args) => (
    <div className="w-full max-w-[400px]">
      <Stepper {...args} />
    </div>
  ),
};

/** The first step in progress: nothing complete yet, the rest upcoming. */
export const FirstStep: Story = {
  name: 'First step',
  args: { steps: STEPS, current: 0 },
  render: (args) => (
    <div className="w-full max-w-[500px]">
      <Stepper {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectStatuses(canvasElement, ['current step', 'upcoming', 'upcoming']);
  },
};

/** Not started yet: pass a value below 0 so no step is current. */
export const NotStarted: Story = {
  name: 'Not started',
  args: { steps: STEPS, current: -1 },
  render: (args) => (
    <div className="w-full max-w-[500px]">
      <Stepper {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectStatuses(canvasElement, ['upcoming', 'upcoming', 'upcoming']);
  },
};

/** Regression check: 5 plain-label (no description) horizontal steps at several `current` values — every gap between indicators should read as the same width at every value. */
export const HorizontalEvenGaps: Story = {
  name: 'Horizontal even gaps',
  render: () => (
    <div className="flex w-full max-w-[500px] flex-col gap-10">
      {[0, 2, 4, PLAIN_STEPS.length].map((current) => (
        <Stepper key={current} steps={PLAIN_STEPS} orientation="horizontal" current={current} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    // The regression this story guards: equal spacing between indicators
    // at every progress value, measured rather than eyeballed.
    const lists = within(canvasElement).getAllByRole('list');
    await expect(lists).toHaveLength(4);
    for (const list of lists) {
      const lefts = within(list)
        .getAllByRole('listitem')
        .map((li) => (li.querySelector('span') as HTMLElement).getBoundingClientRect().left);
      const gaps = lefts.slice(1).map((x, i) => x - lefts[i]);
      for (const gap of gaps) await expect(Math.abs(gap - gaps[0])).toBeLessThanOrEqual(1);
    }
  },
};

/** Both orientations side by side at the same progress, showing how the same data drives a compact header or a roomy rail. */
export const Orientations: Story = {
  render: () => (
    <div className="flex w-full max-w-[500px] flex-col gap-10">
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
