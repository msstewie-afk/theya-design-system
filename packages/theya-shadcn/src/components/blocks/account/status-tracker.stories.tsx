import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { Button } from '../../ui/button';
import { StatusTracker } from './status-tracker';
import { DEMO_EVENTS, DEMO_STEPS } from './demo-data';
import { statusTrackerGuidelines } from './status-tracker.guidelines';

const meta: Meta<typeof StatusTracker> = {
  title: 'Patterns: Account/StatusTracker',
  component: StatusTracker,
  tags: ['autodocs'],
  parameters: { guidelines: statusTrackerGuidelines, layout: 'padded' },
  args: {
    title: 'Importing into Mnemosyne',
    reference: 'TH-24817',
    startedLabel: 'today at 14:18',
    steps: DEMO_STEPS,
    current: 1,
    state: 'running',
    progress: 40,
    eta: 'About 12 minutes left',
    events: DEMO_EVENTS,
    onCancel: fn(),
    onRetry: fn(),
    supportHref: '#support',
  },
  decorators: [(Story) => <div className="max-w-4xl">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof StatusTracker>;

/** Where it is, how long is left, and that you can leave. */
export const Running: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 2, name: 'Copying photos — step 2 of 5' })).toBeVisible();
    const current = canvasElement.querySelector('[aria-current="step"]');
    await expect(current).toHaveTextContent('Copying photos');
  },
};

/** Stopped: why, and the two ways forward — retry from that step, or support with the reference. */
export const Failed: Story = {
  args: {
    current: 2,
    state: 'failed',
    failure: { title: 'The old service refused the album export', description: 'Photos are copied and kept. Check that album export is turned on in your account on the old service, then retry — we’ll continue from the albums.' },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Retry from “Copying albums”' }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole('link', { name: 'Contact support (quote TH-24817)' })).toHaveAttribute('href', '#support');
  },
};

/** `state="done"`: every step is ticked off, and `doneActions` offer where to go next. */
export const Completed: Story = {
  args: {
    state: 'done',
    current: 4,
    doneActions: (
      <>
        <Button asChild appearance="filled" tone="primary">
          <a href="#archive">Open Mnemosyne</a>
        </Button>
        <Button asChild appearance="outlined" tone="secondary">
          <a href="#portal">View helios.aether.photo</a>
        </Button>
      </>
    ),
  },
};

/** Simulated run, for looking at the motion and the announcements. */
export const Live: Story = {
  render: function Render(args) {
    const [tick, setTick] = useState(0);
    useEffect(() => {
      const t = setInterval(() => setTick((n) => (n >= 24 ? n : n + 1)), 700);
      return () => clearInterval(t);
    }, []);
    const current = Math.min(4, Math.floor(tick / 5));
    return <StatusTracker {...args} current={current} progress={(tick % 5) * 25} state={tick >= 24 ? 'done' : 'running'} />;
  },
};
