import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { PromptArea } from './prompt-area';
import { TextField } from './text-field';

export const promptAreaGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['The composer of a chat or AI assistant: multi-line input that grows, send and stop, attachments, @mentions and /commands.'],
  whenNotToUse: [
    { text: 'A one-line search', instead: 'SearchBox or TextField' },
    { text: 'Long-form text in a form', instead: 'TextArea' },
  ],
  anatomy: [
    { part: 'Textarea', description: <>grows to <C>maxRows</C>; Enter sends, Shift+Enter breaks a line; ↑ in an empty field edits the last message.</> },
    { part: 'Send / Stop', description: <>one button: Send, or Stop while <C>busy</C> (streaming); <C>submitLabel</C>/<C>stopLabel</C>.</> },
    { part: 'Limit', optional: true, description: <><C>maxLength</C> counter with a danger state near the limit.</> },
    { part: 'Slots', optional: true, description: <><C>leading</C>/<C>trailing</C> tools, <C>attachments</C>, <C>mentions</C>, <C>commands</C>.</> },
  ],
  doDont: [
    {
      do: {
        example: <div className="w-full"><PromptArea aria-label="Message the assistant" placeholder="Ask about your sites…" /></div>,
        caption: 'Grows with the message; Enter sends, Stop appears while answering.',
      },
      dont: {
        example: <TextField label="Message" placeholder="Ask about your sites…" widthSize="full" />,
        caption: 'A one-line field for prompts: long questions scroll out of sight, no stop, no attachments.',
      },
    },
  ],
  a11y: [
    <>Name it with <C>aria-label</C> (default “Message”); status changes (sending, stopped, limit) go to a live region.</>,
    'Send and Stop are one named button that switches label while busy, so focus never jumps.',
  ],
};
