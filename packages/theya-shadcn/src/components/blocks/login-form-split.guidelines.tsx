import type { ComponentGuidelines } from '../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const loginFormSplitGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'A wide sign-in page with images and a tagline beside the form, for a product with a brand presence.',
  ],
  whenNotToUse: [
    { text: 'A plain centered sign-in page', instead: 'LoginForm' },
  ],
  anatomy: [
    { part: 'Image panel', description: 'a carousel of images with a tagline, dots and a Pause / Play button; logo and a back link on top.', optional: true },
    { part: 'Form', description: 'the same LoginForm, on the other side.' },
  ],
  doDont: [],
  a11y: [
    'The images don’t carry the task: the form works the same without them, and below md only the form remains.',
    'The carousel is named by its tagline, and each slide says its position (“Slide 2 of 3”).',
    'Autoplay (WCAG 2.2.2): it holds while the panel is hovered or has focus, the Pause / Play button next to the dots stops it, and with prefers-reduced-motion it doesn’t start (no button then).',
  ],
};
