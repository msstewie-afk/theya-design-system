import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const landingSectionsGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'TestimonialCase: one customer story that carries real numbers — a quote, the person, a photo and one or two results. For a row of short quotes, use QuoteCard in a grid.',
    'FaqSection: the questions people ask before signing up, near the end of the page. `accordion` is the default; `chat` (Wispr) for a product that talks, on wide screens.',
    'CtaBand: the last section — one sentence and the main action. In a SectionPanel for a colored band.',
  ],
  whenNotToUse: [
    { text: 'Long help articles or more than about eight questions', instead: 'a help centre page with search' },
    { text: 'A second CTA band higher on the page', instead: 'the hero’s actions — one closing band per page' },
  ],
  anatomy: [
    { part: 'TestimonialCase', description: 'a card: the quote (display serif by default) and the person with an avatar on the start side; a photo with a results panel (one or two figures) on the end side; stacked on a phone.' },
    { part: 'FaqSection', description: 'the section heading on the start side (sticky on wide screens), the questions on the end side. Chat: the questions as a list, the chosen one asked and answered as Messages after a short typing indicator.' },
    { part: 'CtaBand', description: 'a centred heading-3xl line (an accent word with HeroAccent), an optional line under it, one or two buttons, a quiet note.' },
  ],
  doDont: [],
  a11y: [
    'TestimonialCase: the quote and its author are a figure with a figcaption; the results a description list; the quotation marks are drawn and hidden from screen readers.',
    'FaqSection accordion: Accordion’s buttons with aria-expanded. Chat: a vertical tab list (↑ / ↓ between questions, Tab into the answer); the answer is the tab panel. Below 1024px the chat becomes the accordion.',
    'The sections are named regions (aria-labelledby on their heading).',
    'Reduced motion: no typing indicator and no entrance — the answer is simply there.',
  ],
};
