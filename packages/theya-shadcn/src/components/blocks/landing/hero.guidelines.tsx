import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const heroGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'The first section of a landing page: what the product is, why it matters, the one action to take.',
    '`centered` for a statement and a wide visual below; `split` when the product visual carries the message; `inset` over a photo or a full-bleed scene.',
    '`statement`: a phrase at the bottom of a full-bleed photo or video, edge to edge, for a brand or a place (presentation sites).',
    '`wordmark`: the name across the full width, a hairline and the page in numbered columns. `title` is plain text; it is the h1.',
    '`backdrop` (centered, split): a HeroTexture (dither, halftone, particles) or an Aurora behind the copy; keep it faint.',
    'A first screen whose title is the product name or one short claim: `titleSize="display"` (56 → 128 px in the theme\'s display face), then `subtitle` for what it does and two to four `points`. A landing\'s first screen is display type, not a section heading.',
    '`titleFont="theme"` (the default) is the theme\'s own heading face, serif or not (Playfair Display in ember); `display-serif` is EB Garamond whatever the theme.',
  ],
  whenNotToUse: [
    { text: 'The top of a screen inside the product', instead: 'PageHeader' },
    { text: 'A notice every visitor must see', instead: 'AnnouncementBar' },
  ],
  anatomy: [
    { part: 'Eyebrow', description: 'the product or category, one short line.', optional: true },
    { part: 'Title', description: 'the headline, h1. HeroAccent marks one or two words. No full stop after the last sentence; one between two sentences is fine.' },
    { part: 'Subtitle', description: 'one large line in the body face at full colour: what the product does, when the title is a name.', optional: true },
    { part: 'Description', description: 'one or two sentences, body-l, quiet.', optional: true },
    { part: 'Points', description: 'two to four short benefits as a list, each opening with its point in bold.', optional: true },
    { part: 'Actions', description: 'one primary button, at most one secondary — or an email field with a button.', optional: true },
    { part: 'Note', description: 'a quiet line under the actions: platforms, trial terms.', optional: true },
    { part: 'Media', description: 'the product built from Theya components, or a photo in `inset`.', optional: true },
  ],
  doDont: [],
  a11y: [
    'The title is the page’s only h1 (titleAs="h2" when the hero is not the page’s first section).',
    'A product visual made of components is one image to assistive tech: role="img" with a label that says what it shows, and no real controls inside.',
    'In `inset`, a scrim sits between the media and the text, and the card is a nested dark theme, so text and buttons keep their contrast over any image.',
    'In `statement`, a scrim rises from the bottom under the copy and the section is a nested dark theme.',
    'The wordmark fits its width by measuring itself; it stays real text, so it is found, translated and read.',
    'HeroTexture is decorative (aria-hidden); particles stand still under reduced motion and stop while off screen.',
    'Everything reads without motion; nothing waits for an animation to appear.',
  ],
};
