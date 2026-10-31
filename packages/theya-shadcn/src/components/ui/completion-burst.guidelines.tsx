import { C, type ComponentGuidelines } from '../../docs/guidelines';

export const completionBurstGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'A moment worth marking at the end of a wait: a plan generated, an account set up, an import finished, onboarding complete.',
    'A full screen or a large panel given over to the wait (onboarding, a wizard’s last step).',
  ],
  whenNotToUse: [
    { text: 'Everyday saves and small actions', instead: 'SuccessCheck in a toast or an Alert' },
    { text: 'A wait with a known length or several steps', instead: 'Progress or ProgressRing' },
    { text: 'A failure', instead: 'Alert with the reason and a way to retry' },
  ],
  anatomy: [
    { part: 'Circle', description: <>an icon of what is being prepared (<C>icon</C>); the Spinner arc runs round it while busy.</> },
    { part: 'Burst', description: 'twelve short strokes thrown out once, as the tick draws itself.' },
    { part: 'Label', description: <><C>busyLabel</C>, then <C>doneLabel</C>; a role="status" line, so the change is read out.</> },
    { part: 'Description', description: 'one line of detail under the label.', optional: true },
  ],
  doDont: [],
  a11y: [
    <>Switch <C>status</C> to <C>done</C> when the work is really done — never on a timer that guesses.</>,
    'The label is a polite live region: “Preparing your plan” is read when it appears and “Your plan is ready” when it is done. The circle and the burst are decorative.',
    'Reduced motion: no burst and no drawing; the tick simply appears and the arc fades in and out instead of turning.',
    'Move focus to what comes next (a Continue button) yourself once it is done, if the flow continues on this screen.',
  ],
};
