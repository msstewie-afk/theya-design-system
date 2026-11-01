import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { DonutChart } from './donut-chart';

export const donutChartGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Parts of one whole, up to 7: storage by file type, plan mix, downloads by source.', 'When the total matters too — it sits in the center.'],
  whenNotToUse: [
    { text: 'Comparing values that aren’t parts of a whole', instead: 'BarChart' },
    { text: 'More than 7 parts, or many tiny slices', instead: 'BarChart, or group into “Other”' },
    { text: 'Change over time', instead: 'AreaChart or LineChart' },
  ],
  anatomy: [
    { part: 'Ring', description: <>slices in palette order; <C>thickness</C> default/thin.</> },
    { part: 'Center', description: <>total by default; <C>centerLabel</C>/<C>centerValue</C>.</> },
    { part: 'Legend', description: <>name and value per slice; <C>layout</C> vertical/horizontal.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <DonutChart
            data={[{ label: 'RAW files', value: 62 }, { label: 'JPEGs', value: 24 }, { label: 'Exports', value: 14 }]}
            unit=" GB"
            layout="horizontal"
            height={160}
            ariaLabel="Storage by file type: RAW files 62 GB of 100 GB."
          />
        ),
        caption: 'Three parts of one total, named in the legend.',
      },
      dont: {
        example: (
          <DonutChart
            data={[
              { label: 'Golden hour', value: 22 }, { label: 'Blue hour', value: 18 }, { label: 'First light', value: 16 },
              { label: 'Moonrise over Othrys', value: 14 }, { label: 'Wide-shining', value: 11 }, { label: 'Isthmian Five', value: 10 }, { label: 'Portfolio', value: 9 },
            ]}
            unit="%"
            layout="horizontal"
            height={160}
            ariaLabel="Downloads by gallery."
          />
        ),
        caption: 'Seven similar slices: angles this close can’t be compared — a sorted bar chart can.',
      },
    },
  ],
  a11y: [
    <><C>ariaLabel</C> states the takeaway; the legend repeats every name and value as text.</>,
    'Slice colors aren’t the only cue — the legend order matches the ring.',
  ],
};
