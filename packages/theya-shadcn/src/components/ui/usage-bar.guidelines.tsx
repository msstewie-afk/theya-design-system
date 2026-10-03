import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { UsageBar } from './usage-bar';

const gb = (n: number) => `${n} GB`;

export const usageBarGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A total split into up to four parts: storage by type, bandwidth by site, seats by role.', 'Showing parts against a limit (total) — used vs. free.'],
  whenNotToUse: [
    { text: 'One value in a range', instead: 'Meter' },
    { text: 'Task progress', instead: 'Progress' },
    { text: 'Many parts or comparing over time', instead: 'DonutChart or BarChart' },
  ],
  anatomy: [
    { part: 'Bar', description: <>segments sized by <C>value</C>; the remainder up to <C>total</C> stays empty.</> },
    { part: 'Legend', description: <>color, label and formatted value for each segment (<C>formatValue</C>).</> },
  ],
  doDont: [
    {
      do: {
        example: <div className="w-80"><UsageBar total={50} formatValue={gb} segments={[{ label: 'Files', value: 18 }, { label: 'Databases', value: 9 }, { label: 'Email', value: 4 }]} /></div>,
        caption: 'A few parts with a legend — easy to compare.',
      },
      dont: {
        example: (
          <div className="w-80">
            <UsageBar total={50} formatValue={gb} segments={['Files', 'DB', 'Email', 'Logs', 'Backups', 'Cache', 'Tmp', 'Other'].map((label, i) => ({ label, value: 6 - (i % 3) }))} />
          </div>
        ),
        caption: 'Eight parts on a four-color palette: colors repeat and the legend can’t be matched. Keep to four, group the rest into “Other”.',
      },
    },
  ],
  a11y: ['The bar is one image with a text summary of all segments; the legend repeats every value as text.', 'Segment colors are told apart by the legend text, not color alone.'],
};
