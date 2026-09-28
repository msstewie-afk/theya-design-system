import type { Meta, StoryObj } from '@storybook/react';
import { ChatBubbleEmpty } from 'iconoir-react';
import { MessagePopup, MessagePopupTrigger, MessagePopupContent } from './message-popup';
import { Button } from './button';
import { Chat, ChatMessages } from './chat';
import { Message } from './message';
import { PromptArea } from './prompt-area';
import { Avatar, AvatarFallback } from './avatar';

/**
 * MessagePopup — a floating chat/assistant panel anchored to a launcher
 * button, built on Popover. The trigger opens a fixed-width panel holding a
 * Chat transcript and a PromptArea.
 */
const meta: Meta<typeof MessagePopup> = {
  title: 'Overlays/MessagePopup',
  component: MessagePopup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'MessagePopup is a bare re-export of Popover (Root), so it has no props of its own beyond Popover\'s open/defaultOpen/onOpenChange/modal. Build the panel from MessagePopupTrigger/MessagePopupContent (title/description/showClose).',
      },
    },
  },
  argTypes: {
    open: { control: false, description: 'Controlled open state.' },
    onOpenChange: { control: false, description: 'Fires when the popup opens or closes.' },
    modal: { control: 'boolean', description: 'Trap focus and block outside interaction while open.' },
  },
};

export default meta;
type Story = StoryObj<typeof MessagePopup>;

const botAvatar = (
  <Avatar className="size-7">
    <AvatarFallback className="bg-[var(--color-bg-primary-bg-primary-subtle)] font-body text-body-xs text-[var(--color-text-text-link-on-tonal)]">AI</AvatarFallback>
  </Avatar>
);

function AssistantPopup() {
  return (
    <MessagePopup>
      <MessagePopupTrigger>
        <Button appearance="filled" tone="primary" iconOnly aria-label="Open assistant" leftIcon={<ChatBubbleEmpty />} className="rounded-full" />
      </MessagePopupTrigger>
      <MessagePopupContent title="Assistant" description="Ask about your account">
        <Chat className="min-h-0 flex-1">
          <ChatMessages>
            <Message avatar={botAvatar} author="Assistant" timestamp="Now">
              Hi! How can I help with your sites today?
            </Message>
          </ChatMessages>
          <div className="border-t border-solid border-[var(--color-border-border-subtle)] p-2">
            <PromptArea placeholder="Ask a question..." />
          </div>
        </Chat>
      </MessagePopupContent>
    </MessagePopup>
  );
}

/** The launcher button (closed). Click it to open the assistant panel. */
export const Default: Story = {
  render: () => <AssistantPopup />,
};

/** Opened via the trigger; the panel holds a transcript and a composer. */
export const Open: Story = {
  render: () => <AssistantPopup />,
};
