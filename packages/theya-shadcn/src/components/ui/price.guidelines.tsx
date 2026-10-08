import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Price } from './price';

export const priceGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['Any amount of money in the UI: plan cards, checkout, invoices, add-ons.', <>A discount (<C>compareAt</C>), a “from” price, a billing period.</>],
  whenNotToUse: [
    { text: 'A column of amounts in a table', instead: 'formatPrice in a right-aligned cell' },
    { text: 'Charts and totals over time', instead: 'a chart with formatted axis' },
  ],
  anatomy: [
    { part: 'From', description: <>“From” before the amount (<C>from</C>).</>, optional: true },
    { part: 'Amount', description: <>Intl-formatted for <C>currency</C> and <C>locale</C>; whole amounts drop .00; zero shows “Free”.</> },
    { part: 'Period', description: <>“/mo” (<C>period</C>).</>, optional: true },
    { part: 'Previous price + discount', description: <>struck-through <C>compareAt</C> and a −N% badge.</>, optional: true },
  ],
  doDont: [
    {
      do: { example: <Price amount={19.99} compareAt={24.99} currency="EUR" locale="de-DE" period="mo" size="lg" />, caption: 'Formatted for the locale, with period and the old price.' },
      dont: { example: <span className="text-heading-m">19.99EUR/month (was 24.99)</span>, caption: 'Hand-typed: wrong for German readers, and read aloud as fragments.' },
    },
  ],
  a11y: [
    'Screen readers hear one sentence: “From €19.99 per month, was €24.99”; the visual pieces are hidden.',
    'The old price is never the only discount signal — the badge and the sentence say it too.',
    <>Pass the real <C>locale</C>; the symbol position and separators follow it.</>,
  ],
};
