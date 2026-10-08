import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Countdown } from './countdown';

const inTwoDays = () => Date.now() + (2 * 24 + 4) * 3600_000;

export const countdownGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['Time left until a deadline that matters to the user: a trial ending, a maintenance window starting, “resend code in 0:42”.', <>A promo end on a landing (<C>appearance="blocks"</C>).</>],
  whenNotToUse: [
    { text: 'The deadline is far away (weeks)', instead: 'the date: “Trial ends Nov 12”' },
    { text: 'Elapsed time or duration', instead: 'plain text or Timeline' },
    { text: 'Fake urgency', instead: 'nothing — don’t' },
  ],
  anatomy: [
    { part: 'Digits', description: <>inline <C>clock</C> (2d 04:12:09) or <C>compact</C> (2d 4h 12m), tiles in <C>blocks</C>, or a draining <C>ring</C> with the largest unit inside (give <C>from</C> so it knows the full span).</> },
    { part: 'Unit labels', description: 'under each tile in blocks.', optional: true },
    { part: 'Completed', description: <>what shows at zero (<C>completed</C>).</>, optional: true },
  ],
  doDont: [
    {
      do: { example: <p className="text-body-m">Trial ends in <Countdown to={inTwoDays()} format="compact" /></p>, caption: 'Inline, minutes are enough for a two-day deadline.' },
      dont: { example: <Countdown to={inTwoDays()} appearance="blocks" />, caption: 'Ticking seconds for a trial: noise that reads like pressure.' },
    },
  ],
  a11y: [
    <><C>role="timer"</C>; the spoken text is a sentence that changes once a minute — screen readers aren’t flooded every second.</>,
    'Give the deadline as a date too, near the countdown, for people who read it later.',
    'Don’t trigger anything irreversible at zero without telling people first.',
  ],
};
