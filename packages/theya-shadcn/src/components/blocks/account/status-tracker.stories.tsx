import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { Button } from '../../ui/button';
import { StatusTracker } from './status-tracker';
import { DEMO_EVENTS, DEMO_STEPS } from './demo-data';

const meta: Meta<typeof StatusTracker> = {
  title: 'Patterns: Account/StatusTracker',
  component: StatusTracker,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    title: 'Migrating seashell.shop',
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
    await expect(canvas.getByRole('heading', { level: 2, name: 'Copying files — step 2 of 5' })).toBeVisible();
    const current = canvasElement.querySelector('[aria-current="step"]');
    await expect(current).toHaveTextContent('Copying files');
  },
};

/** Stopped: why, and the two ways forward — retry from that step, or support with the reference. */
export const Failed: Story = {
  args: {
    current: 2,
    state: 'failed',
    failure: { title: 'The old host refused the database connection', description: 'Files are copied and kept. Check that remote access is allowed for 203.0.113.24 on the old host, then retry — we’ll continue from the databases.' },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Retry from “Copying databases”' }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole('link', { name: 'Contact support (quote TH-24817)' })).toHaveAttribute('href', '#support');
  },
};

export const Completed: Story = {
  args: {
    state: 'done',
    current: 4,
    doneActions: (
      <>
        <Button asChild appearance="filled" tone="primary">
          <a href="#site">Open seashell.shop</a>
        </Button>
        <Button asChild appearance="outlined" tone="secondary">
          <a href="#dns">Check DNS records</a>
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
