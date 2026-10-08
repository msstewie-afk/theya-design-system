import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { TextEffect } from './text-effect';

export const textEffectGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    <>A hero headline or one key word on a landing page: letters rising in (<C>split</C>), a code-like reveal (<C>scramble</C>), a soft highlight (<C>shimmer</C>), rotating phrases (<C>typewriter</C>).</>,
  ],
  whenNotToUse: [
    { text: 'Body copy, labels, buttons, anything in product UI', instead: 'plain text' },
    { text: 'More than one animated headline in view at a time' },
    { text: 'Text people must read quickly (prices, warnings)', instead: 'plain text' },
  ],
  anatomy: [
    { part: 'Text', description: <>the string itself (<C>children</C>), or <C>phrases</C> for the typewriter.</> },
    { part: 'Trigger', description: <>split and scramble start in view (default), on hover or on mount (<C>trigger</C>).</> },
    { part: 'Caret', description: 'typewriter only, in the primary icon color.', optional: true },
  ],
  doDont: [
    {
      do: { example: <TextEffect effect="split" as="p" className="text-heading-s">Ship faster</TextEffect>, caption: 'One short headline, animated once.' },
      dont: { example: <TextEffect effect="shimmer" as="p" className="text-body-s">Your password must be at least 12 characters long.</TextEffect>, caption: 'An effect on running text: harder to read, and it doesn’t stop.' },
    },
  ],
  a11y: [
    'Screen readers get the plain text (every phrase, for the typewriter); the animated letters are aria-hidden.',
    'prefers-reduced-motion: the text simply shows; the typewriter shows its first phrase.',
    'Shimmer falls back to plain text in Windows high contrast.',
  ],
};
