import { type ComponentGuidelines } from '@/docs/guidelines';
import { DotSeparator } from './dot-separator';

const META = 'flex items-center gap-1.5 font-body text-body-s text-[var(--color-text-text-subtler)]';

export const dotSeparatorGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Separating short inline facts on one line: “eu-west-1 · Created Mar 2026 · v2.4.0”.'],
  whenNotToUse: [
    { text: 'Between sentences or long items', instead: 'separate lines' },
    { text: 'Between sections', instead: 'Separator' },
  ],
  anatomy: [{ part: 'Dot', description: 'decorative, hidden from screen readers.' }],
  doDont: [
    {
      do: {
        example: <p className={META}>eu-west-1<DotSeparator />Created Mar 2026<DotSeparator />v2.4.0</p>,
        caption: 'Three short facts on one line.',
      },
      dont: {
        example: (
          <p className={`${META} w-72 flex-wrap`}>
            Backups run nightly and are kept for 14 days<DotSeparator />Restores take up to an hour<DotSeparator />Contact support for older copies
          </p>
        ),
        caption: 'Sentences joined by dots: they wrap and the dots land at line starts.',
      },
    },
  ],
  a11y: ['The dot is aria-hidden; screen readers hear the facts run together, so keep each one self-explanatory.'],
};
