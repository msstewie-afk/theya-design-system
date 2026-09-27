import type { Meta, StoryObj } from '@storybook/react';
import { Message } from './message';
import { Avatar, AvatarFallback } from './avatar';
import { Attachment } from './attachment';

/**
 * Message — one chat/assistant bubble. `received` = left + muted; `sent` =
 * right + primary. Pass `avatar`/`author`/`timestamp`; the body is
 * `children`, so a message can hold text, an `Attachment`, or any content.
 * Group messages inside a Chat transcript; keep the running author/timestamp
 * light (omit on consecutive messages from the same sender).
 */
const meta: Meta<typeof Message> = {
  title: 'Data Display/Message',
  component: Message,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['received', 'sent'], description: 'Message direction.' },
    tone: { control: 'inline-radio', options: ['filled', 'tonal'], description: 'Only affects variant="sent": filled (solid primary) or tonal (primary-subtle).' },
    avatar: { control: false, description: 'Leading Avatar (usually shown on received messages).' },
    author: { control: 'text', description: 'Sender name shown above the bubble.' },
    timestamp: { control: 'text', description: 'Time label shown beside the author.' },
  },
};

export default meta;
type Story = StoryObj<typeof Message>;

const botAvatar = (
  <Avatar className="size-8">
    <AvatarFallback className="bg-[var(--color-bg-primary-bg-primary-subtle)] text-[var(--color-text-text-link-subtle)] text-body-xs">AI</AvatarFallback>
  </Avatar>
);

/** A received message with an avatar, author and timestamp. */
export const Default: Story = {
  render: () => (
    <div className="max-w-xl">
      <Message avatar={botAvatar} author="Assistant" timestamp="9:32 AM">
        I can help you spin up a new site. Which region should it live in?
      </Message>
    </div>
  ),
};

/** A short exchange: received then sent. */
export const Exchange: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-4">
      <Message avatar={botAvatar} author="Assistant" timestamp="9:32 AM">
        I can help you spin up a new site. Which region should it live in?
      </Message>
      <Message variant="sent" timestamp="9:33 AM">
        eu-west-1, closest to our users.
      </Message>
      <Message avatar={botAvatar}>Great choice. I will provision it in eu-west-1 now.</Message>
    </div>
  ),
};

/**
 * A message carrying an attachment above its text. Uses `tone="tonal"`
 * (light primary-subtle bubble) rather than the default `filled` (solid
 * primary) — Attachment's own name/size text and icon are hardcoded to the
 * ink-on-surface tokens, so they only read correctly on a light bubble;
 * `filled`'s solid primary fill would need an -on-primary override instead.
 */
export const WithAttachment: Story = {
  name: 'With attachment',
  render: () => (
    <div className="max-w-xl">
      <Message variant="sent" tone="tonal" timestamp="10:04 AM">
        <div className="flex flex-col gap-2">
          <Attachment name="error-log.txt" size={18400} />
          <span>Here is the log from the failed deploy.</span>
        </div>
      </Message>
    </div>
  ),
};

/** `tone="tonal"` vs the default `filled` for a sent bubble — softer for a long transcript. */
export const Tone: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col items-end gap-2">
      <Message variant="sent" tone="filled" timestamp="9:33 AM">
        Filled (default) — solid primary.
      </Message>
      <Message variant="sent" tone="tonal" timestamp="9:33 AM">
        Tonal — lighter primary-subtle.
      </Message>
    </div>
  ),
};
