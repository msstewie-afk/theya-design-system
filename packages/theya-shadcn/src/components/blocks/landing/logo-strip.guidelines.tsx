import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const logoStripGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'Right under the hero, as quiet proof: who already uses the product.',
    '`marquee` for eight logos or more; `static` for a short row that fits the page width.',
    'In a dark band: put it inside SectionPanel tone="inverse"; the logos follow the text color.',
  ],
  whenNotToUse: [
    { text: 'Numbers as proof (users, uptime, speed)', instead: 'a stats row (CountUp + Stat)' },
    { text: 'Quotes from customers', instead: 'a testimonial' },
  ],
  anatomy: [
    { part: 'Label', description: 'one quiet line above the logos, body-m.', optional: true },
    { part: 'Logos', description: 'monochrome marks in the subtle text color, about 32px high, 64px apart.' },
    { part: 'Pause button', description: 'marquee only, at the end of the strip.' },
  ],
  doDont: [],
  a11y: [
    'The marquee pauses on hover, on keyboard focus and with its own button (WCAG 2.2.2); with reduced motion it does not move and the logos wrap into rows.',
    'Screen readers meet each logo once: the looping copy is hidden.',
    'Every logo has a name: alt text on an image, or a wordmark. The label names the section.',
  ],
};
