import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { BarChart } from './bar-chart';

const STUDIOS = [
  { label: 'Selene Weddings', value: 42 }, { label: 'Helios Studio', value: 31 }, { label: 'Eos Portraits', value: 15 }, { label: 'Othrys Lodge', value: 12 },
];
const SHUFFLED = [STUDIOS[2], STUDIOS[0], STUDIOS[3], STUDIOS[1]];

export const barChartGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Comparing a value across categories: storage by studio, exports per day, photos per album.', <><C>orientation="horizontal"</C> for a ranked breakdown with long labels.</>],
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
        example: <div className="w-full"><BarChart data={STUDIOS} orientation="horizontal" unit="%" valueStep={10} height={180} ariaLabel="Storage by studio, led by Selene Weddings at 42%." /></div>,
        caption: 'Sorted largest first, horizontal so the studio names fit.',
      },
      dont: {
        example: <div className="w-full"><BarChart data={SHUFFLED} unit="%" valueStep={10} height={180} ariaLabel="Storage by studio." /></div>,
        caption: 'Unsorted columns: people have to compare heights to find the leader.',
      },
    },
  ],
  a11y: [
    <><C>ariaLabel</C> states the takeaway (“led by Selene Weddings at 42%”).</>,
    'One color for one series — color carries no meaning here, so it doesn’t need a legend.',
  ],
};
