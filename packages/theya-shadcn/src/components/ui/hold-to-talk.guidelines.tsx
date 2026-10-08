import { type ComponentGuidelines } from '../../docs/guidelines';
import { HoldToTalk } from './hold-to-talk';

export const holdToTalkGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['Voice input in a prompt or chat composer, where speaking replaces typing for one message.'],
  whenNotToUse: [
    { text: 'Long dictation or a recorder with pause and review', instead: 'a toggle Button (Record / Stop)' },
    { text: 'Anything that isn’t voice', instead: 'Button' },
  ],
  anatomy: [
    { part: 'Button', description: 'a round microphone button.' },
    { part: 'Waveform', description: 'appears while held; the button grows into a pill.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex items-center gap-2 rounded-full border border-solid border-[var(--color-border-border)] px-3 py-1.5 font-body text-body-m text-[var(--color-text-text-subtler)]">
            <span className="flex-1">Ask anything…</span>
            <HoldToTalk />
          </div>
        ),
        caption: 'In the composer’s trailing slot, next to Send.',
      },
      dont: {
        example: <HoldToTalk label="Record" />,
        caption: 'A name that hides how it works — say “Hold to talk”, so the press-and-hold is announced.',
      },
    },
  ],
  a11y: [
    'Space or Enter held down works like a held pointer; Escape cancels.',
    'aria-pressed while held, and “Release to send” is announced once.',
    'Recording is yours: start it in onHoldStart, send in onHoldEnd, discard in onCancel.',
  ],
};
