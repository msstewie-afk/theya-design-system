import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HoldToTalk } from './hold-to-talk';
import { holdToTalkGuidelines } from './hold-to-talk.guidelines';
import { PromptArea } from './prompt-area';

/**
 * HoldToTalk — push-to-talk for a prompt: hold to speak, release to send, slide off
 * or press Escape to cancel. It shows the state; recording is up to you.
 */
const meta = {
  title: 'AI & Chat/HoldToTalk',
  component: HoldToTalk,
  tags: ['autodocs'],
  parameters: { guidelines: holdToTalkGuidelines, layout: 'centered' },
  argTypes: {
    label: { control: 'text', description: 'Accessible name. Default “Hold to talk”.' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof HoldToTalk>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hold the button (or Space) — the log shows what your handlers would get. */
export const Default: Story = {
  render: (args) => {
    const [log, setLog] = useState('—');
    return (
      <div className="flex flex-col items-center gap-3">
        <HoldToTalk {...args} onHoldStart={() => setLog('Recording…')} onHoldEnd={() => setLog('Sent')} onCancel={() => setLog('Cancelled')} />
        <span className="font-body text-body-s text-[var(--color-text-text-subtle)]">{log}</span>
      </div>
    );
  },
};

/** In PromptArea's trailing slot. */
export const InPromptArea: Story = {
  name: 'In PromptArea',
  parameters: { layout: 'padded' },
  render: () => (
    <div className="mx-auto w-full max-w-xl">
      <PromptArea aria-label="Message" placeholder="Ask anything…" trailing={<HoldToTalk />} />
    </div>
  ),
};
