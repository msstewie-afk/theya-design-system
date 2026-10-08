import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Stepper } from './stepper';

export const stepperGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A process done in order over several screens: onboarding, checkout, a setup wizard.', '3–5 steps with short labels.'],
  whenNotToUse: [
    { text: 'Sections people visit in any order', instead: 'Tabs' },
    { text: 'Progress of a background task', instead: 'Progress' },
    { text: 'A location in a hierarchy', instead: 'Breadcrumb' },
  ],
  anatomy: [
    { part: 'Indicator', description: 'number, or a check when complete; color is never the only signal.' },
    { part: 'Label and description', description: <>short; <C>labelAlign</C> start or center.</> },
    { part: 'Orientation', description: <>horizontal, or vertical for long labels and narrow space.</> },
    { part: 'Back to a step', optional: true, description: <><C>onStepClick</C> makes completed steps clickable.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <Stepper
            className="w-[30rem] max-w-full"
            current={1}
            steps={[{ label: 'Account' }, { label: 'Plan' }, { label: 'Payment' }, { label: 'Review' }]}
          />
        ),
        caption: 'Four short steps; where you are and what’s left is clear at a glance.',
      },
      dont: {
        example: (
          <Stepper
            className="w-[30rem] max-w-full"
            current={3}
            steps={['Account', 'Email', 'Password', 'Company', 'Team', 'Plan', 'Billing', 'Payment', 'Review'].map((label) => ({ label }))}
          />
        ),
        caption: 'Nine steps: labels get crushed and the process feels endless — merge steps or go vertical.',
      },
    },
  ],
  a11y: [
    <>An ordered list; each step says its status in words (“completed”, “current step”), and the current one has <C>aria-current="step"</C>.</>,
    'Clickable completed steps are buttons; upcoming steps aren’t interactive.',
    'Move focus to the new step’s heading when the step changes.',
  ],
};
