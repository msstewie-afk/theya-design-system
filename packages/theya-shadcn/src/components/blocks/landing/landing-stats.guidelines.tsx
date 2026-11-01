import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const landingStatsGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'StatsRow: three or four figures that speak for themselves (users, ratings, speed), after the logos or before the final CTA.',
    'CompareBars: one measure, two or three ways — the old way and the product’s way (time to find a page, words per minute).',
    'BeforeAfter: a few everyday tasks and how each one changes.',
    'For a single big number with its source, use StatCard; for a trend over time, the charts in Cards › Live bento.',
  ],
  whenNotToUse: [
    { text: 'Figures people need to compare closely or sort', instead: 'Table / DataTable' },
    { text: 'Numbers without a clear source or meaning', instead: 'leave them out — say where each figure comes from in a line under the block' },
  ],
  anatomy: [
    { part: 'StatsRow', description: 'a description list: big figures (heading-2xl) over their labels, a thin rule between them on wide screens, two columns on a phone. Values take a CountUp.' },
    { part: 'CompareBars', description: 'label and figure above each bar; bars as long as the amount, the product’s one in the accent; they grow from the start edge one by one as the list scrolls in.' },
    { part: 'BeforeAfter', description: 'a table: task (row header), Before, After; the After column on a tonal band, its figures larger.' },
  ],
  doDont: [],
  a11y: [
    'Every figure is text. CompareBars’ bars only repeat it and are aria-hidden, so they may stay light (WCAG 1.4.11).',
    'StatsRow is a description list: the label is read first, then its number.',
    'BeforeAfter is a real table with column and row headers; name it with aria-labelledby (the heading above) or `caption`. The After column is marked by its heading, not only by its color.',
    'Reduced motion: no counting and no growing bars — the final state is drawn.',
  ],
};
