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

/** A full conversation surface: transcript that scrolls, composer pinned below. */
export const Default: Story = {
  render: () => (
    <Chat className="h-[32rem] max-w-xl overflow-hidden rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]">
      <ChatMessages>
        <Message variant="received" avatar={botAvatar} author="Assistant" timestamp="9:32 AM">
          Hi! I can help you manage your sites and databases. What would you like to do?
        </Message>
        <Message variant="sent" timestamp="9:33 AM">
          Create a new MySQL database in eu-west-1.
        </Message>
        <Message variant="received" avatar={botAvatar} timestamp="9:33 AM">
          Done. I created acme_production (MySQL 8.0) in eu-west-1. Want me to add a user and grant access?
        </Message>
        <Message variant="sent" timestamp="9:34 AM">
          Yes, add a user called app with read/write.
        </Message>
        <Message variant="received" avatar={botAvatar} timestamp="9:34 AM">
          Created the app user with read/write on acme_production. The connection string is in your dashboard.
        </Message>
      </ChatMessages>
      <div className="border-t border-solid border-[var(--color-border-border-subtle)] p-3">
        <PromptArea placeholder="Message the assistant…" />
      </div>
    </Chat>
  ),
};
