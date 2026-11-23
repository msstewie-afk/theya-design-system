import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const storeButtonsGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'The download action of a mobile app landing: in the Hero actions, the CtaBand, the footer.',
    'Leave `show="device"` (the default): a phone sees one button, its own store; a computer sees both.',
    'Before launch, pass the official badges through `badges`: the stores ask for their own artwork.',
  ],
  whenNotToUse: [
    { text: 'A web app or a desktop download', instead: 'Button' },
    { text: 'Inside the app itself', instead: 'nothing: they already have it' },
  ],
  anatomy: [
    {
      part: 'Store button',
      description: 'a link, black with a gray hairline in every theme: the store mark, a small line ("Download on the") and the store name.',
    },
  ],
  doDont: [],
  a11y: [
    'Each button is a link named with its visible text ("Download on the App Store").',
    'The device choice happens after the page loads; both buttons render first, so a computer sees no shift.',
    'In forced colors the black fill drops and the edge takes the link color.',
  ],
};
