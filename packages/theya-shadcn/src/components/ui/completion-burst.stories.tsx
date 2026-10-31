import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { StatsUpSquare } from 'iconoir-react';
import { Button } from './button';
import { CompletionBurst } from './completion-burst';
import { completionBurstGuidelines } from './completion-burst.guidelines';

const meta: Meta<typeof CompletionBurst> = {
  title: 'Motion/CompletionBurst',
  component: CompletionBurst,
  tags: ['autodocs'],
  parameters: {
    guidelines: completionBurstGuidelines,
    layout: 'centered',
    docs: {
      description: {
        component: 'A “working on it” state that ends in a small celebration: the arc round the icon gives way to a tick that draws itself while short strokes burst out of it.',
      },
    },
  },
  args: { busyLabel: 'Preparing your plan', doneLabel: 'Your plan is ready', description: 'Setting up your reading goals', icon: <StatsUpSquare /> },
  argTypes: {
    status: { control: 'inline-radio', options: ['busy', 'done'], description: 'busy: the arc runs; done: the tick draws and the burst plays once.', table: { category: 'State' } },
    tone: { control: 'inline-radio', options: ['success', 'primary'], description: 'Circle and burst colour.', table: { category: 'Appearance' } },
    busyLabel: { control: 'text', table: { category: 'Content' } },
    doneLabel: { control: 'text', table: { category: 'Content' } },
    description: { control: 'text', table: { category: 'Content' } },
    icon: { control: false, table: { category: 'Content' } },
  },
};
export default meta;
type Story = StoryObj<typeof CompletionBurst>;

/** Busy: the arc runs round the icon. */
export const Busy: Story = { args: { status: 'busy' } };

/** Done: the tick, the burst (once), and the done line. */
export const Done: Story = { args: { status: 'done', description: 'Twelve weeks, three sessions a week' } };

/** The real flow: press Start, the work "takes" two seconds, then it is done. Press again to replay. The status line is announced both times. */
export const Flow: Story = {
  render: function FlowStory(args) {
    const [status, setStatus] = useState<'idle' | 'busy' | 'done'>('idle');
    useEffect(() => {
      if (status !== 'busy') return;
      const id = setTimeout(() => setStatus('done'), 2000);
      return () => clearTimeout(id);
    }, [status]);
    return (
      <div className="flex min-h-[18rem] flex-col items-center justify-center gap-8">
        {status !== 'idle' && <CompletionBurst {...args} status={status} description={status === 'done' ? 'Twelve weeks, three sessions a week' : args.description} />}
        <Button appearance={status === 'idle' ? 'filled' : 'outlined'} tone={status === 'idle' ? 'primary' : 'secondary'} disabled={status === 'busy'} onClick={() => setStatus('busy')}>
          {status === 'idle' ? 'Start' : 'Start again'}
        </Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Start' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Preparing your plan');
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Your plan is ready'), { timeout: 4000 });
  },
};
