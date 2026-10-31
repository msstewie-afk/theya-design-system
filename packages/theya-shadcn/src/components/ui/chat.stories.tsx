import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Chat, ChatMessages, ChatTyping } from './chat';
import { Message } from './message';
import { PromptArea } from './prompt-area';
import { Avatar, AvatarFallback } from './avatar';
import { chatGuidelines } from './chat.guidelines';
import { Button } from './button';
import { expect, userEvent, within } from '@storybook/test';
import { resetFocus, tabTo } from '../../test/keyboard';

/**
 * Chat — the layout for a conversation: a scrolling `ChatMessages`
 * transcript and a pinned composer (`PromptArea`). Give `Chat` a height and
 * the messages region takes the rest.
 */
const meta = {
  title: 'AI & Chat/Chat',
  component: Chat,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "The layout of a conversation: a transcript that scrolls and a composer pinned below it. Give Chat a height and the messages take the rest.",
      },
    },
    guidelines: chatGuidelines, layout: 'padded',
  },
} satisfies Meta<typeof Chat>;

export default meta;
type Story = StoryObj<typeof meta>;

// Avatar's own `size` prop (not a className override — Avatar sets its
// geometry via inline style, so a Tailwind size-* class on it is ignored).
const botAvatar = (
  <Avatar size="sm">
    <AvatarFallback>AI</AvatarFallback>
  </Avatar>
);

type DemoMessage = { id: number; variant: 'sent' | 'received'; text: string; time: string; author?: string };

const SEED: DemoMessage[] = [
  { id: 1, variant: 'received', author: 'Assistant', time: '9:32 AM', text: 'Hi! I can help you manage your sites and databases. What would you like to do?' },
  { id: 2, variant: 'sent', time: '9:33 AM', text: 'Create a new MySQL database in eu-west-1.' },
  { id: 3, variant: 'received', time: '9:33 AM', text: 'Done. I created acme_production (MySQL 8.0) in eu-west-1. Want me to add a user and grant access?' },
  { id: 4, variant: 'sent', time: '9:34 AM', text: 'Yes, add a user called app with read/write.' },
  { id: 5, variant: 'received', time: '9:34 AM', text: 'Created the app user with read/write on acme_production. The connection string is in your dashboard.' },
];

const nowLabel = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

/**
 * A full conversation surface: transcript that scrolls, composer pinned below.
 * Interactive demo: sending appends your message and a canned reply. In a real
 * product (or a prototype) the same wiring lives in your code — Chat is layout
 * only; keep the messages in state and append on PromptArea's `onSubmit`.
 */
export const Default: Story = {
  render: function ChatDemo() {
    const [messages, setMessages] = useState<DemoMessage[]>(SEED);
    const send = (text: string) => {
      const id = Date.now();
      setMessages((m) => [...m, { id, variant: 'sent', text, time: nowLabel() }]);
      window.setTimeout(() => {
        setMessages((m) => [
          ...m,
          { id: id + 1, variant: 'received', text: 'This is a demo reply — connect onSubmit to your backend for real answers.', time: nowLabel() },
        ]);
      }, 600);
    };
    return (
      <Chat className="h-[32rem] max-w-xl overflow-hidden rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]">
        <ChatMessages>
          {messages.map((m) => (
            <Message
              key={m.id}
              variant={m.variant}
              avatar={m.variant === 'received' ? botAvatar : undefined}
              author={m.author}
              timestamp={m.time}
            >
              {m.text}
            </Message>
          ))}
        </ChatMessages>
        <div className="border-t border-solid border-[var(--color-border-border)] p-3">
          <PromptArea placeholder="Message the assistant…" onSubmit={send} />
        </div>
      </Chat>
    );
  },
  // Keyboard: the message list is a tab stop (it scrolls on its own), the
  // field comes next, and Enter sends.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const log = canvas.getByRole('log');
    resetFocus();
    // A tab stop, so the arrow keys can scroll it (synthetic key events don't
    // scroll, so the scrolling itself isn't asserted here).
    await tabTo(log);
    await tabTo(canvas.getByRole('textbox'));
    await userEvent.keyboard('Can I add a staging site?{Enter}');
    await expect(await within(log).findByText('Can I add a staging site?')).toBeVisible();
    await expect(canvas.getByRole('textbox')).toHaveValue('');
  },
};

/** ChatTyping: the other side is writing. Remove it when their message arrives. */
export const Typing: Story = {
  render: () => (
    <Chat className="h-64 w-full max-w-md rounded-[var(--size-border-radius-border-radius-xl)] border border-solid border-[var(--color-border-border-subtle)]">
      <ChatMessages>
        <Message variant="sent">Is the SSL renewal automatic?</Message>
        <ChatTyping />
      </ChatMessages>
    </Chat>
  ),
};

function TypingReplyDemo() {
  const [state, setState] = useState<'idle' | 'typing' | 'replied'>('idle');
  const ask = () => {
    setState('typing');
    window.setTimeout(() => setState('replied'), 2500);
  };
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Button className="self-start" onClick={ask} disabled={state === 'typing'}>
        Simulate a reply
      </Button>
      <Chat className="h-64 rounded-[var(--size-border-radius-border-radius-xl)] border border-solid border-[var(--color-border-border-subtle)]">
        <ChatMessages>
          <Message variant="sent">Is the SSL renewal automatic?</Message>
          {state === 'replied' && <Message>Yes. Theya renews it 30 days before it expires.</Message>}
          {state === 'typing' && <ChatTyping />}
        </ChatMessages>
      </Chat>
    </div>
  );
}

/** ChatTyping mounts while the other side writes ("Typing…" is announced), then their message lands in the log. */
export const TypingThenReply: Story = {
  name: 'Typing, then reply',
  render: () => <TypingReplyDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Simulate a reply' }));
    await expect(await canvas.findByRole('status', { name: 'Typing…' })).toBeInTheDocument();
    await expect(await canvas.findByText(/renews it 30 days/, {}, { timeout: 4000 })).toBeVisible();
  },
};
