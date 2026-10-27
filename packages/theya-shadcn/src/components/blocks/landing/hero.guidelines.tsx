import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const heroGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'The first section of a landing page: what the product is, why it matters, the one action to take.',
    '`centered` for a statement and a wide visual below; `split` when the product visual carries the message; `inset` over a photo or a full-bleed scene.',
  ],
  whenNotToUse: [
    { text: 'The top of a screen inside the product', instead: 'PageHeader' },
    { text: 'A notice every visitor must see', instead: 'AnnouncementBar' },
  ],
  anatomy: [
    { part: 'Eyebrow', description: 'the product or category, one short line.', optional: true },
    { part: 'Title', description: 'the headline, h1. HeroAccent marks one or two words. No full stop after the last sentence; one between two sentences is fine.' },
    { part: 'Description', description: 'one or two sentences, body-l.', optional: true },
    { part: 'Actions', description: 'one primary button, at most one secondary — or an email field with a button.', optional: true },
    { part: 'Note', description: 'a quiet line under the actions: platforms, trial terms.', optional: true },
    { part: 'Media', description: 'the product built from Theya components, or a photo in `inset`.', optional: true },
  ],
  doDont: [],
  a11y: [
    'The title is the page’s only h1 (titleAs="h2" when the hero is not the page’s first section).',
    'A product visual made of components is one image to assistive tech: role="img" with a label that says what it shows, and no real controls inside.',
    'In `inset`, a scrim sits between the media and the text, and the card is a nested dark theme, so text and buttons keep their contrast over any image.',
    'Everything reads without motion; nothing waits for an animation to appear.',
  ],
};
