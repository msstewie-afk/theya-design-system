import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { LineChart } from './line-chart';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const two = DAYS.map((label, i) => ({ label, downloaded: [32, 41, 38, 55, 61, 44, 36][i], opened: [51, 53, 52, 58, 63, 60, 55][i] }));
const STUDIO_NAMES = ['Helios Studio', 'Selene Weddings', 'Eos Portraits', 'Phoebe Light Lab', 'Othrys Lodge'];
const many = DAYS.map((label, i) => ({
  label,
  a: 20 + ((i * 7) % 30), b: 30 + ((i * 11) % 25), c: 25 + ((i * 5) % 35), d: 40 + ((i * 13) % 20), e: 35 + ((i * 3) % 30),
}));

export const lineChartGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Comparing a few trends over the same time: downloads vs views, this week vs last.', 'Up to 5 series; each gets a palette color and a legend entry with its name.'],
  whenNotToUse: [
    { text: 'One series where volume matters', instead: 'AreaChart' },
    { text: 'More than 5 series', instead: 'small multiples, or let people pick series' },
    { text: 'Categories with no order', instead: 'BarChart' },
  ],
  anatomy: [
    { part: 'Lines', description: <>one per <C>series</C> (key + name).</> },
    { part: 'Legend', description: 'repeats each name beside its swatch.' },
    { part: 'Tooltip', description: 'all series at the hovered point, with names.' },
  ],
  doDont: [
    {
      do: {
        example: <div className="w-full"><LineChart data={two} series={[{ key: 'downloaded', name: 'Downloaded' }, { key: 'opened', name: 'Opened' }]} unit="%" height={200} ariaLabel="Galleries downloaded and opened this week, both peaking on Friday." /></div>,
        caption: 'Two trends that are easy to tell apart and compare.',
      },
      dont: {
        example: (
          <div className="w-full">
            <LineChart
              data={many}
              series={['a', 'b', 'c', 'd', 'e'].map((k) => ({ key: k, name: STUDIO_NAMES['abcde'.indexOf(k)] }))}
              unit="%"
              height={200}
              ariaLabel="Download rate per studio this week."
            />
          </div>
        ),
        caption: 'Five crossing lines: a tangle where no single studio can be followed.',
      },
    },
  ],
  a11y: [
    <><C>ariaLabel</C> says what to take away, not “Line chart”.</>,
    'Series are named in the legend and tooltip, so color isn’t the only way to tell them apart.',
  ],
};
