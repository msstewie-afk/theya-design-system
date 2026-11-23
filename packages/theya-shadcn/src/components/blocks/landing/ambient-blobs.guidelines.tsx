import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const ambientBlobsGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'A landing ground that should feel alive without anything to watch: two soft shapes, slowly changing, out of step.',
    'On a gradient or colored ground (the default `light` tone: white 14%) or on a plain page (`tone="primary"`).',
    "Give the page a visible pause and pass it in `paused` (WCAG 2.2.2): the hero's own pause button, if it has one, stops the blobs too.",
  ],
  whenNotToUse: [
    { text: 'A brand ground', instead: 'SectionPanel tone="gradient" (the blobs lie on it, they do not replace it)' },
    { text: 'Behind dense text or forms', instead: 'a still ground' },
    { text: 'Product screens', instead: 'nothing: ambient motion is for landings' },
  ],
  anatomy: [
    { part: 'Blob', description: 'a blurred shape at x / y / size (% of the ground); its outline and scale change over 16 s (--transition-duration-ambient).' },
  ],
  doDont: [],
  a11y: [
    'Decoration only: hidden from screen readers and from the pointer, behind the content.',
    'With reduced motion the blobs are still; `paused` stops them for everyone else.',
    'A light blob lightens the ground under it: with dark ink that helps; with white text, check the contrast where a blob lies.',
  ],
};
