import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const landingCardsGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'Landing sections made of cards: features (FeatureCard), product slices (MediaCard), numbers (StatCard), customer stories (StoryCard), testimonials (QuoteCard), next steps (LinkCard).',
    'BentoGrid for a mix of sizes: one wide or tall card carries the main point, the small ones support it.',
    'Live charts for cards and bento tiles (landing-viz, plus ProgressRing from ui): GrowBars (bars grow in), TrendChart (thin bars, scrub with the mouse for a value).',
    '`surface` and `hue` set the look (outlined, sunken, tonal pastel, inverse, primary); `hover` the pointer behaviour.',
  ],
  whenNotToUse: [
    { text: 'Cards inside the product (lists, settings, dashboards)', instead: 'Card' },
    { text: 'One feature with a big visual', instead: 'FeatureSplit' },
  ],
  anatomy: [
    { part: 'Surface', description: '16px corners, 24 / 32px padding; media bleeds to the edge on its side.' },
    { part: 'Title', description: 'h3; with `href` it is the link for the whole card.' },
    { part: 'Body', description: 'description, number, quote — depending on the kind.', optional: true },
    { part: 'Accent', description: 'on a tonal card, icons and links take the card’s hue (on-tonal inks, AA on the fill).' },
    { part: 'Link label', description: '“Learn more →”, visible text only; the title names the link.', optional: true },
  ],
  doDont: [],
  a11y: [
    'Each live chart is one picture (role="img") whose name tells the whole story ("from 180 to 587, peak 602 in week 25"); the motion plays once on scroll-in and not at all with reduced motion, and the TrendChart scrubber adds detail, never meaning.',
    'A whole-card link is one real link on the title, stretched over the card: one Tab stop, named by the title, the focus ring round the whole card.',
    'Hover effects are pointer-only and off under reduced motion; the beam runs only while the card is hovered or focused, so nothing moves on its own.',
    '`expand` folds the description only where the device can hover; it opens on focus too, and on touch it is always open.',
    'Tonal and primary cards re-point the subtle text and link colors so they keep 4.5:1 on the fill.',
  ],
};
