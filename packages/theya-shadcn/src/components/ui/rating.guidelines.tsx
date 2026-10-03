import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Rating } from './rating';

export const ratingGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Leaving a 1–5 score (review form).', <><C>readOnly</C>: showing an average next to a review count, with fractional stars.</>],
  whenNotToUse: [
    { text: 'Satisfaction on a labelled scale (“Very poor … Excellent”)', instead: 'RadioGroup' },
    { text: 'A single like/favourite', instead: 'Toggle or RatingStar' },
  ],
  anatomy: [
    { part: 'Stars', description: <>one radio each in input mode; <C>size</C> sm 16px / md 24px.</> },
    { part: 'Value text', optional: true, description: 'the number and review count next to read-only stars.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex items-center gap-2">
            <Rating readOnly value={4.6} size="sm" />
            <span className="font-body text-body-s text-[var(--color-text-text-subtle)]">4.6 · 128 reviews</span>
          </div>
        ),
        caption: 'Stars plus the number and count — stars alone don’t say 4.6 vs 4.4.',
      },
      dont: {
        example: <Rating readOnly value={4.6} size="md" />,
        caption: 'Stars with no number or count: imprecise and unweighted.',
      },
    },
  ],
  a11y: [
    'Input mode is a radio group: arrows change the score, each star is named “3 of 5”.',
    <>Read-only is one image named with the exact value (“4.6 of 5”); <C>formatLabel</C> changes the wording.</>,
    'Filled vs empty differs in shape (solid vs outline), not only color.',
  ],
};
