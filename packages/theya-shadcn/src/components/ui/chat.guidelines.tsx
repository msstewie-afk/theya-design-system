import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Chat, ChatMessages } from './chat';
import { Message } from './message';
import { PromptArea } from './prompt-area';

const BOX = 'h-72 w-full overflow-hidden rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border-subtle)]';

export const chatGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['A conversation surface: an AI assistant, support chat, comments thread in real time.', 'Transcript that scrolls with the composer pinned below.'],
  whenNotToUse: [
    { text: 'A one-off question and answer', instead: 'a form and a result' },
    { text: 'Threaded comments on an object', instead: 'a comments list' },
  ],
  anatomy: [
    { part: 'Chat', description: 'flex column; give it a height so only the transcript scrolls.' },
    { part: 'ChatMessages', description: <><C>role="log"</C>, newest last; Messages inside.</> },
    { part: 'Composer', description: 'usually a PromptArea, pinned at the bottom.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className={BOX}>
            <Chat className="h-full">
              <ChatMessages aria-label="Conversation example">
                <Message author="Assistant">Your SSL certificate renews in 5 days.</Message>
                <Message variant="sent" author="You">Renew it now.</Message>
              </ChatMessages>
              <PromptArea aria-label="Message the assistant" placeholder="Ask anything…" />
            </Chat>
          </div>
        ),
        caption: 'A fixed height: the transcript scrolls, the composer stays in reach.',
      },
      dont: {
        example: (
          <div className={BOX}>
            <div className="flex h-full flex-col gap-2 overflow-auto p-3">
              <PromptArea aria-label="Message, composer on top" placeholder="Ask anything…" />
              <Message variant="sent" author="You">Renew it now.</Message>
              <Message author="Assistant">Your SSL certificate renews in 5 days.</Message>
            </div>
          </div>
        ),
        caption: 'Composer on top, newest message first: it reads backwards and isn’t announced as a log.',
      },
    },
  ],
  a11y: [
    <>Keep the newest message last in the DOM — <C>role="log"</C> announces additions at the end.</>,
    'Name the transcript (“Conversation with Assistant”) when there are several on a page.',
  ],
};
