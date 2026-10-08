import { type ComponentGuidelines } from '../../docs/guidelines';
import { CheckCircle } from 'iconoir-react';
import { SuccessCheck } from './success-check';

const ROW = 'flex items-center gap-2 font-body text-body-m text-[var(--color-text-text)] [&>svg]:size-5 [&>svg]:text-[var(--color-icon-icon-success)]';

export const successCheckGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'The moment something succeeds: a success Alert or Toast, a finished step, a "Saved" confirmation.',
    'Next to text that says what succeeded.',
  ],
  whenNotToUse: [
    { text: 'A success state that is already on screen when the page opens (a list of passed checks)', instead: 'a static CheckCircle icon' },
    { text: 'Many items at once (every row of a table)', instead: 'a static icon — one drawing at a time' },
  ],
  anatomy: [
    { part: 'Ring', description: 'drawn first, clockwise from 12 o’clock.' },
    { part: 'Tick', description: 'drawn after the ring.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <p className={ROW}>
            <SuccessCheck />
            Backup restored
          </p>
        ),
        caption: 'Shown when the success happens, with text that names it.',
      },
      dont: {
        example: (
          <p className={ROW}>
            <CheckCircle />
            <SuccessCheck />
            <SuccessCheck />
          </p>
        ),
        caption: 'Several drawings at once, or next to a static check — the motion stops meaning “just now”.',
      },
    },
  ],
  a11y: [
    'Decorative (aria-hidden): announce the success in text, e.g. a Toast or an Alert with live="polite".',
    'Plays once, under a second; with reduced motion the icon is simply shown.',
  ],
};
