import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { ChatBubble } from 'iconoir-react';
import { Button } from './button';
import { MessagePopup, MessagePopupContent, MessagePopupTrigger } from './message-popup';
import { TextField } from './text-field';

export const messagePopupGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['A help or AI assistant that lives in a corner while the page stays usable beside it.'],
  whenNotToUse: [
    { text: 'Forms people must complete', instead: 'Dialog or a page' },
    { text: 'Notifications', instead: 'Toaster' },
  ],
  anatomy: [
    { part: 'Launcher', description: 'a round icon button with a name.' },
    { part: 'Panel', description: <>fixed width; <C>title</C>, <C>description</C>, close; holds a Chat transcript and a PromptArea.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <MessagePopup>
            <MessagePopupTrigger>
              <Button appearance="filled" tone="primary" size="lg" iconOnly leftIcon={<ChatBubble />} aria-label="Open assistant" />
            </MessagePopupTrigger>
            <MessagePopupContent title="Assistant" description="Ask about your sites and billing.">
              <p className="font-body text-body-m text-[var(--color-text-text-subtle)]">Hi! How can I help?</p>
            </MessagePopupContent>
          </MessagePopup>
        ),
        caption: 'A conversation on the side; the page stays usable.',
      },
      dont: {
        example: (
          <MessagePopup>
            <MessagePopupTrigger>
              <Button appearance="filled" tone="primary" size="lg" iconOnly leftIcon={<ChatBubble />} aria-label="Open support form" />
            </MessagePopupTrigger>
            <MessagePopupContent title="New support ticket">
              <div className="flex flex-col gap-3">
                <TextField label="Subject" widthSize="full" />
                <TextField label="Site" widthSize="full" />
                <TextField label="Contact email" widthSize="full" />
              </div>
            </MessagePopupContent>
          </MessagePopup>
        ),
        caption: 'A form in a chat bubble — lost with one click outside.',
      },
    },
  ],
  a11y: [
    'The launcher is a named button with aria-expanded; focus moves into the panel and back on close.',
    'Put new messages in a live region so they’re announced.',
  ],
};
