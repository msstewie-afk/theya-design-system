import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { CountUp } from '../../ui/count-up';
import { SectionHead } from './feature-shared';
import { BeforeAfter, CompareBars, StatsRow } from './landing-stats';
import { landingStatsGuidelines } from './landing-stats.guidelines';
import { SectionPanel } from './section-panel';

const meta: Meta<typeof StatsRow> = {
  title: 'Patterns: Landing/Stats',
  component: StatsRow,
  tags: ['autodocs'],
  parameters: { guidelines: landingStatsGuidelines, layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof StatsRow>;

const NUMBERS = [
  { value: <CountUp to={12} suffix="M" />, label: 'links saved this year' },
  { value: <CountUp to={2000} suffix="+" />, label: 'teams keep their links here' },
  { value: <CountUp to={4.8} format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }} />, label: 'average rating in the stores' },
  { value: '6 s', label: 'to find any saved page' },
];

/** A row of big numbers under a heading, a thin rule between them; two columns on a phone (Miro). */
export const Row: Story = {
  render: () => (
    <section data-scale="display" className="section-display">
      <div className="container-display flex flex-col gap-12">
        <SectionHead title="A library people come back to" />
        <StatsRow items={NUMBERS} />
      </div>
    </section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // A description list: each label is a term with its number.
    await expect(canvas.getAllByRole('term')).toHaveLength(4);
    await expect(canvas.getByText('to find any saved page')).toBeVisible();
  },
};

/** The same row, centred, in a dark band. */
export const RowInADarkBand: Story = {
  name: 'Row in a dark band',
  render: () => (
    <SectionPanel tone="inverse">
      <div className="container-display">
        <StatsRow items={NUMBERS.slice(0, 3)} align="center" />
      </div>
    </SectionPanel>
  ),
};

/** The old way against the product's way, as bars as long as the time it takes (Wispr: typing vs speaking). The numbers are text; the bars repeat them. */
export const Bars: Story = {
  render: () => (
    <section data-scale="display" className="section-display">
      <div className="container-display grid gap-12 lg:grid-cols-2 lg:items-center">
        <SectionHead title="Find it in seconds, not minutes" description="The time it takes to get back to a page you saved last month." />
        <CompareBars
          items={[
            { label: 'Scrolling through browser bookmarks', amount: 94, value: '94 s' },
            { label: 'Searching your history', amount: 41, value: '41 s' },
            { label: 'Search in Bookmarks', amount: 6, value: '6 s', highlight: true },
          ]}
        />
      </div>
    </section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list');
    await expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    // The figures are text, read with their labels.
    await expect(within(list).getAllByRole('listitem')[2]).toHaveTextContent('Search in Bookmarks6 s');
  },
};

/** Before and after, task by task: a real table, the "after" column on a tonal band. */
export const BeforeAndAfter: Story = {
  name: 'Before and after',
  render: () => (
    <section data-scale="display" className="section-display" aria-labelledby="ba-title">
      <div className="container-display flex flex-col gap-12">
        <SectionHead title={<span id="ba-title">What changes in a week</span>} />
        <BeforeAfter
          aria-labelledby="ba-title"
          taskLabel="Task"
          beforeLabel="Before"
          afterLabel="With Bookmarks"
          rows={[
            { task: 'Finding a link you saved', before: '2 min, if at all', after: '6 s' },
            { task: 'Sorting new links', before: 'Every Friday, by hand', after: 'Done by your rules' },
            { task: 'Duplicates in the library', before: '1 in 7 links', after: 'Merged on save' },
            { task: 'Sharing a reading list', before: 'A doc of pasted URLs', after: 'One link' },
          ]}
        />
      </div>
    </section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole('table', { name: 'What changes in a week' });
    await expect(within(table).getAllByRole('row')).toHaveLength(5);
    await expect(within(table).getByRole('rowheader', { name: 'Sorting new links' })).toBeInTheDocument();
    await expect(within(table).getByRole('columnheader', { name: 'With Bookmarks' })).toBeInTheDocument();
  },
};
