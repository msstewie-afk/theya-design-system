import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const arcStageGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'A hero picture that changes in place, one at a time, with a calm long move: a dish per stage, a product per season, a screen per step.',
    'Drive it with `Tabs variant="chips"` (the stages) and a visible pause, or with its own `autoplay` and `paused`.',
    'Cut-out pictures (transparent PNG or SVG) of the same size and framing, so they read as one object changing.',
  ],
  whenNotToUse: [
    { text: 'A showcase of five or more cards', instead: 'OrbitCarousel' },
    { text: 'Slides people browse themselves, with text', instead: 'Carousel' },
    { text: 'Stages as a process', instead: 'Stepper (and the stage switcher next to ArcStage is Tabs chips, not Stepper)' },
  ],
  anatomy: [
    { part: 'Stage', description: 'a square (ratio) box; sizes are % of its width.' },
    { part: 'Arc', description: 'an invisible quarter circle around a corner (corner, radius); the shown item rests at restAngle.' },
    { part: 'Item', description: 'the picture: comes in past the top, turns (spin) as it travels, leaves past the side.' },
  ],
  doDont: [],
  a11y: [
    'A group named by `label`, read as a carousel; only the shown item is exposed, the others are hidden.',
    'Autoplay stops while `paused`, while the tab is hidden, and with reduced motion; give the page a visible pause (WCAG 2.2.2).',
    'With reduced motion the pictures cross-fade in place, without travel or spin.',
    'Each picture needs its own alt text (the dish), since the stage shows one at a time.',
  ],
};
