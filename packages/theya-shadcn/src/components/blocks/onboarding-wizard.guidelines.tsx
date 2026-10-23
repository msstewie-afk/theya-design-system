import type { ComponentGuidelines } from '../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const onboardingWizardGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'A setup done in a few steps, in order: creating a site, connecting a domain, first-run configuration.',
  ],
  whenNotToUse: [
    { text: 'One form of a few fields', instead: 'ResourceForm' },
    { text: 'Showing what changed on a screen', instead: 'ProductTour' },
  ],
  anatomy: [
    { part: 'Title', description: 'what is being set up.' },
    { part: 'Stepper', description: 'the steps and where people are.' },
    { part: 'Step content', description: 'the fields or choices of the current step.' },
    { part: 'Actions', description: 'Back and Next; the last step finishes.' },
  ],
  doDont: [],
  a11y: [
    'The wizard is a group named by its title; the Stepper says which step is current.',
    'Steps you pass are kept, not reset, so Back returns to what was entered.',
  ],
};
