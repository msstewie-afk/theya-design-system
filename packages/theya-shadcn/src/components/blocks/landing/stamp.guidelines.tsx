import type { ComponentGuidelines } from '../../../docs/guidelines';
import { C } from '../../../docs/guidelines';
import { Stamp } from './stamp';

export const stampGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'A playful mark on a landing: "New", "Award 2026", "Handmade", "Since 2014", set over the corner of a headline, a picture or a card.',
    <>
      Words around the edge: <C>ring</C> (circle only), with one or two words in the middle.
    </>,
    <>
      Decoration by default. When the stamp is the only place that says it (an award, a guarantee), give it a <C>label</C>.
    </>,
    'Where it goes is the designer’s call: above or below, at the start or the end of a line, wherever the composition needs it. Theya gives the rule, not a position: part of one letter at most.',
    'Size follows the headline: xs next to heading sizes, sm or md next to display sizes, lg only on the largest display. A small headline never gets a big stamp.',
  ],
  whenNotToUse: [
    { text: 'Something to click', instead: 'Sticker' },
    { text: 'A status or a count in the product', instead: 'Badge' },
    { text: 'Long text: more than three short lines', instead: 'a card or a paragraph' },
  ],
  anatomy: [
    { part: 'Shape', description: 'a circle or a rounded square in a pastel accent, tilted −15° to +15°.' },
    { part: 'Dashed border', description: 'inside the edge, in the text colour.' },
    { part: 'Ring', description: 'text around the edge, circle only.', optional: true },
    { part: 'Lines', description: 'one to three short lines in the heavy display face, capitals.', optional: true },
  ],
  doDont: [
    {
      do: {
        example: (
          <p className="m-0 pb-4 pt-14 font-display-heavy text-heading-xl uppercase leading-[0.9]">
            Fresh bread
            {/* Placement is the designer's: here a zero-width anchor after the last letter, offsets in em of the headline. */}
            <span className="relative inline-block h-[0.7em] w-0 align-baseline">
              <span className="absolute -start-[0.3em] bottom-[calc(100%-0.35em)]">
                <Stamp size="xs" tone="orange">
                  New
                </Stamp>
              </span>
            </span>
          </p>
        ),
        caption: 'A small stamp for a small headline, above the end of the line, touching the corner of one letter.',
      },
      dont: {
        example: (
          <div className="relative">
            <p className="m-0 font-display-heavy text-heading-xl uppercase leading-[0.9]">Fresh bread</p>
            <Stamp size="sm" tone="orange" className="absolute start-10 -top-4">
              New
            </Stamp>
          </div>
        ),
        caption:
          'Over two letters or more. The one exception is the designer’s call: a stamp in the middle of a very large headline, set by hand on that page.',
      },
    },
  ],
  a11y: [
    'Without `label` the stamp is hidden from screen readers: the same words must be on the page.',
    'With `label` it is an image with that name; write the whole meaning ("Best bakery award 2026"), not "stamp".',
    'Each tone pairs its fill with its own dark text, at least 9:1 in light and dark.',
    'It does not move; in forced colors the fill drops and the edge stays.',
  ],
};
