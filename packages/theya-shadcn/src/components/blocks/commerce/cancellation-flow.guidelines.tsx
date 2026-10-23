import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const cancellationFlowGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'Cancelling a plan or subscription: what happens and when, the alternatives, then a confirmation that states the end date.',
    'Any self-serve cancel path where keeping the plan should stay one click away on every step.',
  ],
  whenNotToUse: [
    { text: 'Moving to another plan people pick from a list', instead: 'PlanComparison' },
    { text: 'Deleting something in a single step', instead: 'ConfirmDialog' },
  ],
  anatomy: [
    { part: 'What happens', description: 'a description list of what stays, what ends and what it costs, by date.' },
    { part: 'Alternatives', description: 'a cheaper plan and a pause as option cards, with cancel selected, and an optional reason. Either alternative can be left out.' },
    { part: 'Confirmation', description: 'a warning with the end date, a summary and the danger Cancel plan button.' },
    { part: 'Actions', description: 'Keep my plan on every step, beside the step’s own action.' },
    { part: 'Done screen', description: 'the outcome and its date; after a cancel, Resume plan and Download your data.' },
  ],
  doDont: [],
  a11y: [
    'Each step shows “Step 2 of 3”, and moving to it puts focus on its heading, so screen-reader users hear where they are.',
    'The final button says what it does — Cancel plan, Pause plan, Switch to Starter — and the end date is stated before anything is confirmed.',
    'A cancellation can be undone from the done screen with Resume plan.',
  ],
};
