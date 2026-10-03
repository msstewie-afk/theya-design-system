import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { BarChart } from './bar-chart';

const REGIONS = [
  { label: 'eu-west-1', value: 42 }, { label: 'us-east-1', value: 31 }, { label: 'ap-south-1', value: 15 }, { label: 'sa-east-1', value: 12 },
];
const SHUFFLED = [REGIONS[2], REGIONS[0], REGIONS[3], REGIONS[1]];

export const barChartGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Comparing a value across categories: load by region, deploys per day, tickets per team.', <><C>orientation="horizontal"</C> for a ranked breakdown with long labels.</>],
  whenNotToUse: [
    { text: 'Parts of a whole', instead: 'DonutChart (up to 7 parts)' },
    { text: 'Continuous time with many points', instead: 'AreaChart or LineChart' },
    { text: 'Several series per category', instead: 'LineChart, or separate charts' },
  ],
  anatomy: [
    { part: 'Bars', description: 'one brand color, rounded caps.' },
    { part: 'Value grid', description: <><C>valueStep</C>, <C>unit</C>, <C>format</C>.</> },
    { part: 'Tooltip', description: 'exact value per bar.' },
  ],
  doDont: [
    {
      do: {
        example: <div className="w-full"><BarChart data={REGIONS} orientation="horizontal" unit="%" valueStep={10} height={180} ariaLabel="Load by region, led by eu-west-1 at 42%." /></div>,
        caption: 'Sorted largest first, horizontal so the region names fit.',
      },
      dont: {
        example: <div className="w-full"><BarChart data={SHUFFLED} unit="%" valueStep={10} height={180} ariaLabel="Load by region." /></div>,
        caption: 'Unsorted columns: people have to compare heights to find the leader.',
      },
    },
  ],
  a11y: [
    <><C>ariaLabel</C> states the takeaway (“led by eu-west-1 at 42%”).</>,
    'One color for one series — color carries no meaning here, so it doesn’t need a legend.',
  ],
};
