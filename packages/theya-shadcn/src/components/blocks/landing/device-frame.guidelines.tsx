import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const deviceFrameGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'Product shots on landing pages: an app screen in a phone, a web app in a browser window.',
    'Live Theya components inside the frame, or a screenshot with alt text.',
    '`screen="canvas"` paints the phone screen with the theme\'s gradient (Gradient canvas).',
  ],
  whenNotToUse: [
    { text: 'A UI card floating on its own', instead: 'ProductCollage with a Card' },
    { text: 'Inside the product itself', instead: 'no frame: show the real screen' },
  ],
  anatomy: [
    { part: 'Bezel', description: 'phone: near-black in both themes, radius and width scale with the phone width.' },
    { part: 'Camera island', description: 'phone: over the content, like the real one.' },
    { part: 'Window bar', description: 'browser: three dots and an optional address.' },
    { part: 'Screen', description: 'phone 9 : 19.5, clips its content; browser: the content height.' },
  ],
  doDont: [],
  a11y: [
    'The frame is decoration: the dots, the address and the island are hidden from screen readers.',
    'A screenshot needs alt text that says what the screen shows; live components keep their own roles.',
    'The phone screen clips what grows at 200% text: inside goes a screenshot with alt, or content that keeps its text (wraps or uses TruncatedText), never plain `truncate` (1.4.4, 1.4.12; Мария, 2026-11-24).',
  ],
};
