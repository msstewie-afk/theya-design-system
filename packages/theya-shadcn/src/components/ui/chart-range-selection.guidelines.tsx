import { useState } from 'react';
import { Area, AreaChart, Bar, BarChart, XAxis } from 'recharts';
import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { ChartRangeSelection, type ChartSelectionRange } from './chart-range-selection';

const DAYS = [
  { label: 'Aug 1', v: 38 }, { label: 'Aug 2', v: 52 }, { label: 'Aug 3', v: 46 }, { label: 'Aug 4', v: 64 },
  { label: 'Aug 5', v: 59 }, { label: 'Aug 6', v: 78 }, { label: 'Aug 7', v: 71 },
];
const REGIONS = [{ label: 'eu-west-1', v: 42 }, { label: 'us-east-1', v: 31 }, { label: 'ap-south-1', v: 15 }, { label: 'sa-east-1', v: 12 }];
const tick = { fill: 'var(--color-text-text-subtler)', fontSize: 11 };
const NOTE = 'font-body text-body-s text-[var(--color-text-text-subtle)]';

function TimeRange() {
  const [range, setRange] = useState<ChartSelectionRange | null>(null);
  return (
    <div className="flex w-full flex-col gap-2">
      <ChartRangeSelection labels={DAYS.map((d) => d.label)} onRangeChange={setRange} height={140} aria-label="Requests by day, select a range">
        <AreaChart data={DAYS}>
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={tick} />
          <Area dataKey="v" stroke="var(--color-bg-chart-01)" fill="var(--color-bg-chart-01)" fillOpacity={0.15} />
        </AreaChart>
      </ChartRangeSelection>
      <p className={NOTE}>{range ? `Showing ${range.from} – ${range.to}` : 'Drag, or Shift+arrows, to select days'}</p>
    </div>
  );
}

function CategoryRange() {
  return (
    <ChartRangeSelection labels={REGIONS.map((d) => d.label)} height={140} aria-label="Load by region, select a range">
      <BarChart data={REGIONS}>
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={tick} />
        <Bar dataKey="v" fill="var(--color-bg-chart-01)" radius={4} />
      </BarChart>
    </ChartRangeSelection>
  );
}

export const chartRangeSelectionGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['Selecting a span on an ordered x-axis to zoom in or filter: “show errors from Aug 3 to Aug 6”.'],
  whenNotToUse: [
    { text: 'Unordered categories (regions, teams)', instead: 'Filter or a legend toggle' },
    { text: 'Picking dates precisely', instead: 'DateRangePicker' },
  ],
  anatomy: [
    { part: 'Wrapper', description: 'focusable; draws the selection band over the chart.' },
    { part: 'Child chart', description: 'a categorical Recharts chart whose x-axis matches labels.' },
    { part: 'Result', description: <><C>onRangeChange</C> → show the selected span in text and offer to clear it.</> },
  ],
  doDont: [
    {
      do: { example: <TimeRange />, caption: 'An ordered time axis; the selected span is written out under the chart.' },
      dont: { example: <CategoryRange />, caption: 'A “range” of regions means nothing — there’s no order between them.' },
    },
  ],
  a11y: [
    '←/→ move a cursor over the x-axis, Shift+←/→ extend a selection, Home/End jump, Esc clears (WCAG 2.1.1).',
    'Cursor moves and selections are announced in a live region.',
  ],
};
