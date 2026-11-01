import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const cardMotionGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'Ring, ring around a word, wall and fan carousels: use OrbitCarousel (Motion) with `shape` drum (plus `lean` / `center`), wall or fan. These stories show it in landing sections.',
    'FolderReveal: a collection that opens to show what is inside — folders, playlists, boards.',
    'ParallaxLayers: a decorative hero visual (glass cards, shapes) that drifts with the mouse, layer by layer.',
    'FlipCard: a card with a short answer on the back — a feature and how it works, a number and where it comes from.',
  ],
  whenNotToUse: [
    { text: 'Content the reader must compare side by side', instead: 'a grid' },
    { text: 'Anything that changes on a timer', instead: 'nothing — these move only when the reader moves them' },
  ],
  anatomy: [
    { part: 'ParallaxLayers', description: 'a stage of ParallaxLayer children; each moves with the pointer by its `depth` (negative = against it) and trails it slightly.' },
    { part: 'FolderReveal', description: 'a link shaped as a folder: back with a tab, up to three cards, a front pocket with the name.' },
    { part: 'FlipCard', description: 'front and glass back; a flip button in the corner.' },
  ],
  doDont: [],
  a11y: [
    'Carousels: see OrbitCarousel — one Tab stop with Arrow keys, only the card in front is reachable, the position and name are announced (“3 of 8: Recipes”).',
    'FolderReveal is one link named by the folder; the fan opens on keyboard focus as well as hover.',
    'FlipCard turns on hover with a mouse, and with its button for keyboard and touch (aria-pressed); only the face in view is read out.',
    'ParallaxLayers is mouse-only decoration: it does not move on touch or with reduced motion, and should be aria-hidden unless its layers carry meaning.',
    'Reduced motion: the same states switch without travelling (FlipCard cross-fades).',
  ],
};
