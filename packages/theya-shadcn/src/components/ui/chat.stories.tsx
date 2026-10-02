import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Chat, ChatMessages } from './chat';
import { Message } from './message';
import { PromptArea } from './prompt-area';
import { Avatar, AvatarFallback } from './avatar';

/**
 * Chat — the layout for a conversation: a scrolling `ChatMessages`
 * transcript and a pinned composer (`PromptArea`). Give `Chat` a height and
 * the messages region takes the rest.
 */
const meta = {
  title: 'AI & Chat/Chat',
  component: Chat,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
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
        <div className="border-t border-solid border-[var(--color-border-border-subtle)] p-3">
          <PromptArea placeholder="Message the assistant…" onSubmit={send} />
        </div>
      </Chat>
    );
  },
};
