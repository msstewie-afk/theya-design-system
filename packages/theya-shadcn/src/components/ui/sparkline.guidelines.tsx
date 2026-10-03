import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Sparkline } from './sparkline';

const TILE = 'flex w-64 items-center justify-between gap-4 rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border-subtle)] p-3';

export const sparklineGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['The shape of a trend next to its number: a stat card, a table cell, a list row.'],
  whenNotToUse: [
    { text: 'When people need values, axes or comparisons', instead: 'AreaChart or LineChart' },
    { text: 'Without a number beside it', instead: 'show the number, or a full chart' },
  ],
  anatomy: [
    { part: 'Line', description: <><C>tone</C> (brand, success, warning, danger, info, muted); optional <C>area</C>.</> },
    { part: 'Last point', optional: true, description: <><C>showLast</C> dot on the latest value.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className={TILE}>
            <div className="flex flex-col">
              <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">Requests</span>
              <span className="font-body text-heading-xs font-semibold tabular-nums text-[var(--color-text-text)]">4.2M</span>
            </div>
            <Sparkline data={[3, 5, 4, 6, 5, 7, 9]} width={96} ariaLabel="Requests trending up over 7 days." />
          </div>
        ),
        caption: 'The number says how much, the line says which way.',
      },
      dont: {
        example: (
          <div className={TILE}>
            <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">Requests</span>
            <Sparkline data={[3, 5, 4, 6, 5, 7, 9]} width={96} ariaLabel="Requests." />
          </div>
        ),
        caption: 'A line with no number: up — from what, to what?',
      },
    },
  ],
  a11y: [
    <>One <C>role="img"</C>: its <C>ariaLabel</C> must say the trend (“trending up over 7 days”).</>,
    'The value lives in text beside it — the sparkline has no tooltip.',
  ],
};
