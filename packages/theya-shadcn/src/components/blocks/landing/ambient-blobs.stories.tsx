import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Pause, Play } from 'iconoir-react';
import { Button } from '../../ui/button';
import { AmbientBlobs } from './ambient-blobs';
import { ambientBlobsGuidelines } from './ambient-blobs.guidelines';
import { SectionPanel } from './section-panel';

const meta: Meta<typeof AmbientBlobs> = {
  title: 'Patterns: Landing/AmbientBlobs',
  component: AmbientBlobs,
  tags: ['autodocs'],
  parameters: { guidelines: ambientBlobsGuidelines, layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof AmbientBlobs>;

function Ground({ tone, children }: { tone: 'gradient' | 'default'; children: React.ReactNode }) {
  return (
    <SectionPanel tone={tone} shape="bleed" padding="none" className="isolate min-h-[28rem] overflow-hidden">
      {children}
    </SectionPanel>
  );
}

/** On the theme's gradient, with the page's pause wired in (the button stands for the hero's own). */
export const OnGradient: Story = {
  parameters: { globals: { brand: 'ember' } },
  render: function Render(args) {
    const [paused, setPaused] = useState(false);
    return (
      <Ground tone="gradient">
        <AmbientBlobs {...args} paused={paused} />
        <div className="container-display flex min-h-[28rem] flex-col justify-center gap-6">
          <h2 className="m-0 font-display text-display-xl">Listen to yourself</h2>
          <Button
            appearance="tonal"
            iconOnly
            className="self-start"
            aria-label="Pause the background"
            aria-pressed={paused}
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? <Play aria-hidden /> : <Pause aria-hidden />}
          </Button>
        </div>
      </Ground>
    );
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Pause the background' });
    await userEvent.click(button);
    await expect(canvasElement.querySelector('[data-slot=ambient-blobs]')).toHaveAttribute('data-paused');
  },
};

/** On a plain page, tinted with the primary. */
export const OnPage: Story = {
  args: { tone: 'primary' },
  render: (args) => (
    <Ground tone="default">
      <AmbientBlobs {...args} />
      <div className="container-display flex min-h-[28rem] items-center">
        <h2 className="m-0 font-display text-display-xl">A quiet ground</h2>
      </div>
    </Ground>
  ),
};
