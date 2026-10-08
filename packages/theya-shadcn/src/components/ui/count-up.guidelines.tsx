import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { CountUp } from './count-up';

export const countUpGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['A headline figure on a landing page: “12,400 sites”, “99.98% uptime”, “3× faster”.'],
  whenNotToUse: [
    { text: 'A live value in product UI (it must read correctly the moment it’s seen)', instead: 'Stat' },
    { text: 'Numbers people compare in a table', instead: 'Table / DataTable' },
    { text: 'Time left until something', instead: 'Countdown' },
  ],
  anatomy: [
    { part: 'Number', description: <>tabular digits, formatted with <C>format</C> (Intl) in the provider’s locale.</> },
    { part: 'Prefix / suffix', description: <>text in the same line: <C>$</C>, <C>+</C>, <C>%</C>.</>, optional: true },
  ],
  doDont: [
    {
      do: { example: <span className="text-heading-m"><CountUp to={12400} /> sites</span>, caption: 'One figure, counted once when it comes into view.' },
      dont: { example: <span className="text-body-m">Disk: <CountUp to={78} suffix="%" /></span>, caption: 'Counting a live product value: for a second it shows a wrong number.' },
    },
  ],
  a11y: [
    'Screen readers get only the final value; the running digits are hidden from them.',
    'prefers-reduced-motion: the final value shows at once.',
    'Tabular digits keep the width steady while it counts, so nothing around it shifts.',
  ],
};
