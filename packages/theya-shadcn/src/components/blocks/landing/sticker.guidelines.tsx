import type { ComponentGuidelines } from '../../../docs/guidelines';
import { C } from '../../../docs/guidelines';
import { Sticker } from './sticker';

export const stickerGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'One playful call to action on a landing: "Order now" or "See the menu" set over the corner of a big headline or a picture.',
    <>
      A link: <C>{'<Sticker asChild><a href="…">…</a></Sticker>'}</C>. An action on the page: the default <C>{'<button>'}</C>.
    </>,
    'One sticker per screen. The main action of the first screen stays a Button.',
  ],
  whenNotToUse: [
    { text: 'Product screens, forms, dialogs', instead: 'Button' },
    { text: 'A label that is not clickable ("New", "Award")', instead: 'Stamp' },
    { text: 'A status or a count', instead: 'Badge' },
  ],
  anatomy: [
    { part: 'Fill', description: 'a pastel accent (pink, cream, orange, yellow) with its own dark text, square corners.' },
    { part: 'Tilt', description: '−6° to +6°; it straightens on hover and keyboard focus.' },
    { part: 'Label', description: 'two or three words, capitals; the heavy display face at size lg.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex flex-col items-start gap-3">
            <p className="m-0 font-display-heavy text-heading-xl uppercase leading-[0.9]">Fresh bread</p>
            <Sticker tone="pink">Order now</Sticker>
          </div>
        ),
        caption: 'On a phone the sticker sits under the headline: every word stays readable.',
      },
      dont: {
        example: (
          <div className="relative">
            <p className="m-0 font-display-heavy text-heading-xl uppercase leading-[0.9]">Fresh bread</p>
            <Sticker tone="pink" className="absolute start-8 top-2">
              Order now
            </Sticker>
          </div>
        ),
        caption:
          'Over two letters or more. From 640 px up a sticker may cover part of one letter, at the start or the end of a line; on a phone it never overlaps.',
      },
    },
  ],
  a11y: [
    'A real button or link: named by its text, reached with Tab, activated with Enter (and Space for a button).',
    'It turns level on focus and shows the focus ring; with reduced motion it turns without animating.',
    'Each tone pairs its fill with its own dark text, at least 9:1 in light and dark.',
    'In forced colors the fill drops and a border keeps the shape.',
  ],
};
