import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { StatusDot } from './status-dot';
import { ToneIcon } from './tone-icon';

const ROW = 'flex items-center gap-2.5 font-body text-body-m text-[var(--color-text-text)]';

export const toneIconGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Leading a row or card whose meaning is a tone: a warning in a list, a success step, an info note.', 'When the tone must still read in grayscale (fill + icon shape + color).'],
  whenNotToUse: [
    { text: 'A live state on a small item', instead: 'StatusDot' },
    { text: 'A labelled status', instead: 'Badge' },
    { text: 'A full message', instead: 'Alert' },
  ],
  anatomy: [
    { part: 'Container', description: <>tinted fill; <C>shape</C> circle/square, <C>size</C> sm/md/lg.</> },
    { part: 'Glyph', description: 'a distinct shape per tone (info i, success check, warning triangle, danger circle).' },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex flex-col gap-3">
            <div className={ROW}><ToneIcon tone="warning" />Certificate expires in 5 days</div>
            <div className={ROW}><ToneIcon tone="success" />Backup completed</div>
          </div>
        ),
        caption: 'Shape and text carry the meaning; color adds to it.',
      },
      dont: {
        example: (
          <div className="flex flex-col gap-3">
            <div className={ROW}><StatusDot tone="warning" />Certificate</div>
            <div className={ROW}><StatusDot tone="success" />Backup</div>
          </div>
        ),
        caption: 'Colored dots with nouns: what about the certificate? Color alone says it.',
      },
    },
  ],
  a11y: [
    'Decorative by default (aria-hidden) — the text next to it must say the status.',
    <>Standalone with no text: pass <C>aria-hidden={'{false}'}</C> and an <C>aria-label</C>.</>,
  ],
};
