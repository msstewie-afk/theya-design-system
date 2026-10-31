import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HoldToTalk } from './hold-to-talk';
import { holdToTalkGuidelines } from './hold-to-talk.guidelines';
import { PromptArea } from './prompt-area';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { resetFocus, tabTo } from '../../test/keyboard';

/**
 * HoldToTalk — push-to-talk for a prompt: hold to speak, release to send, slide off
 * or press Escape to cancel. It shows the state; recording is up to you.
 */
const meta = {
  title: 'AI & Chat/HoldToTalk',
  component: HoldToTalk,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Push-to-talk for a prompt: hold to speak, release to send, slide away or press Escape to cancel. It shows the state; the recording itself is up to the app.",
      },
    },
    guidelines: holdToTalkGuidelines, layout: 'centered',
  },
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
  // Keyboard: hold Space to talk, release to send; Escape while holding cancels.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Hold to talk' });
    // user-event doesn't deliver the keyup of a held Space to a button whose
    // keydown was prevented; a real keyboard does, so release it natively.
    const releaseSpace = () => button.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', code: 'Space', bubbles: true }));
    resetFocus();
    await tabTo(button);
    await userEvent.keyboard('{ >}');
    await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'true'));
    await expect(canvas.getByText('Recording…')).toBeVisible();
    releaseSpace();
    await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'false'));
    await expect(canvas.getByText('Sent')).toBeVisible();

    await userEvent.keyboard('{ >}');
    await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'true'));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'false'));
    await expect(canvas.getByText('Cancelled')).toBeVisible();
    // Releasing Space after a cancel doesn't send.
    releaseSpace();
    await expect(canvas.getByText('Cancelled')).toBeVisible();
    await userEvent.keyboard('{/ }'); // let user-event's own key state go, too
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
