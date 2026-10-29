import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const cardMotionGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'RingCarousel: six to ten cards of the same kind (templates, integrations, rooms) shown as a ring that turns; with `center`, a ring around a word or a logo; with `shape="wall"`, a curved wall the viewer stands inside (coverflow).',
    'FanCarousel: three to eight cards where one at a time deserves focus — stories, plans, case studies.',
    'FolderReveal: a collection that opens to show what is inside — folders, playlists, boards.',
    'ParallaxLayers: a decorative hero visual (glass cards, shapes) that drifts with the mouse, layer by layer.',
    'FlipCard: a card with a short answer on the back — a feature and how it works, a number and where it comes from.',
  ],
  whenNotToUse: [
    { text: 'Content the reader must compare side by side', instead: 'a grid' },
    { text: 'Anything that changes on a timer', instead: 'nothing — these move only when the reader moves them' },
  ],
  anatomy: [
    { part: 'RingCarousel', description: 'a 3D ring of cards (turned with drag, Arrow keys or the arrows), optional centre content, arrows below.' },
    { part: 'FanCarousel', description: 'cards on an arc, the middle one in focus; arrows and dots below. Deals itself out from the middle the first time it scrolls in.' },
    { part: 'ParallaxLayers', description: 'a stage of ParallaxLayer children; each moves with the pointer by its `depth` (negative = against it) and trails it slightly.' },
    { part: 'FolderReveal', description: 'a link shaped as a folder: back with a tab, up to three cards, a front pocket with the name.' },
    { part: 'FlipCard', description: 'front and glass back; a flip button in the corner.' },
  ],
  doDont: [],
  a11y: [
    'Carousels are named regions (aria-roledescription="carousel"); the track is a Tab stop with Arrow keys, and the arrows are buttons. Only the card in front is reachable; the position is announced (“3 of 8”).',
    'FolderReveal is one link named by the folder; the fan opens on keyboard focus as well as hover.',
    'FlipCard turns on hover with a mouse, and with its button for keyboard and touch (aria-pressed); only the face in view is read out.',
    'ParallaxLayers is mouse-only decoration: it does not move on touch or with reduced motion, and should be aria-hidden unless its layers carry meaning.',
    'Reduced motion: the same states switch without travelling (FlipCard cross-fades).',
  ],
};
