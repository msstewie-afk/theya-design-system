import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { AreaChart } from './area-chart';

const WEEK = [
  { label: 'Mon', value: 3.0 }, { label: 'Tue', value: 3.4 }, { label: 'Wed', value: 2.9 }, { label: 'Thu', value: 4.1 },
  { label: 'Fri', value: 4.8 }, { label: 'Sat', value: 3.6 }, { label: 'Sun', value: 3.2 },
];
const REGIONS = [
  { label: 'eu-west-1', value: 42 }, { label: 'us-east-1', value: 31 }, { label: 'ap-south-1', value: 15 }, { label: 'sa-east-1', value: 12 },
];

export const areaChartGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['One quantity over time where the volume matters: traffic, requests, storage used.', <>A few stacked series that add up to a total (<C>series</C> + <C>stacked</C>).</>],
  whenNotToUse: [
    { text: 'Comparing several trends that don’t add up', instead: 'LineChart' },
    { text: 'Categories with no order', instead: 'BarChart' },
    { text: 'A trend inside a row or card', instead: 'Sparkline' },
  ],
  anatomy: [
    { part: 'Area and line', description: 'soft gradient fill, 2px line; dots on the peak and latest point.' },
    { part: 'Axes and grid', description: <><C>yStep</C>, <C>unit</C>, <C>format</C>; <C>floatingAxis</C> for compact cards.</> },
    { part: 'Tooltip', description: 'crosshair with the exact value.' },
    { part: 'States', description: <><C>loading</C> skeleton; an empty frame for no data.</> },
  ],
  doDont: [
    {
      do: {
        example: <div className="w-full"><AreaChart data={WEEK} unit="k" height={180} ariaLabel="Requests this week, peak 4.8k on Friday." /></div>,
        caption: 'Requests over a week — the shape of the volume is the point.',
      },
      dont: {
        example: <div className="w-full"><AreaChart data={REGIONS} unit="%" height={180} ariaLabel="Load by region." /></div>,
        caption: 'Regions joined by a filled line imply a trend between them that doesn’t exist — use a bar chart.',
      },
    },
  ],
  a11y: [
    <>Always pass <C>ariaLabel</C> with the takeaway (“Requests this week, peak 4.8k on Friday”), not “Area chart”.</>,
    'Give the key number in text near the chart too; the tooltip is pointer-only.',
  ],
};
