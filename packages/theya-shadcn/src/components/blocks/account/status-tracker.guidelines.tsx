import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const statusTrackerGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'The page for one long operation — a migration, a deploy, an order being set up — that people check on, leave and come back to.',
    'An operation that can stop partway, where people need to know why and what to do next.',
  ],
  whenNotToUse: [
    { text: 'Steps people fill in themselves', instead: 'OnboardingWizard' },
    { text: 'A short wait inside a page', instead: 'Progress' },
    { text: 'A history of events with no current state', instead: 'Timeline' },
  ],
  anatomy: [
    { part: 'Header', description: 'the title, a reference to quote to support, the start time and a state badge.' },
    { part: 'Current state', description: 'where it is and how long is left, a progress bar when the percent is known, and Cancel while it runs.' },
    { part: 'Steps', description: 'every step by name, marked done, in progress, failed or not started.' },
    { part: 'Failure', description: 'why it stopped, with Retry from that step and Contact support with the reference.', optional: true },
    { part: 'Activity', description: 'the log of what happened, newest first.', optional: true },
  ],
  doDont: [],
  a11y: [
    'The current step is marked as the current step, and every step states its progress in text, not only with its icon.',
    'Step changes and the final result are announced as a status message.',
    'The pulsing dot on the current step stays still under reduced motion.',
  ],
};
