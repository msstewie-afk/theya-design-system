import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Message } from './message';

export const messageGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['One turn in a conversation, inside ChatMessages.', <><C>variant</C> received (left) / sent (right); author and time when they help.</>],
  whenNotToUse: [
    { text: 'System notices in a transcript (“Agent joined”)', instead: 'a centered small text line' },
    { text: 'Notifications outside a chat', instead: 'Alert or Toast' },
  ],
  anatomy: [
    { part: 'Bubble', description: <>received: muted, left; sent: primary, right. <C>appearance</C> filled/tonal.</> },
    { part: 'Avatar and author', optional: true, description: 'who said it.' },
    { part: 'Timestamp', optional: true, description: 'when it matters (support, async threads).' },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex w-full flex-col gap-2">
            <Message author="Assistant" timestamp="09:41">Backup finished — 2.4 GB, 14 files.</Message>
            <Message variant="sent" author="You" timestamp="09:42">Thanks!</Message>
          </div>
        ),
        caption: 'Side and color say who; the author line says it in words too.',
      },
      dont: {
        example: (
          <div className="flex w-full flex-col gap-2">
            <Message variant="sent">Backup finished — 2.4 GB, 14 files.</Message>
            <Message variant="sent">Thanks!</Message>
          </div>
        ),
        caption: 'Both sides styled as “sent” and unnamed: whose message is whose?',
      },
    },
  ],
  a11y: [
    'Side and color aren’t read out — keep author text (visually or sr-only) so screen readers know who spoke.',
    'Long code or tables inside a message should scroll inside the bubble, not stretch the transcript.',
  ],
};
