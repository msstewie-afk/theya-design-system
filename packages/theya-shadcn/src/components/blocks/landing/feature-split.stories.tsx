import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { ArrowRight } from 'iconoir-react';
import { Link } from '../../ui/link';
import { BookmarksPreview, DEMO_FEATURES, DemoFeatureVisual } from './demo-data';
import { FeatureSplit } from './feature-split';
import { featureSplitGuidelines } from './feature-split.guidelines';

const meta: Meta<typeof FeatureSplit> = {
  title: 'Patterns: Landing/FeatureSplit',
  component: FeatureSplit,
  tags: ['autodocs'],
  parameters: { guidelines: featureSplitGuidelines, layout: 'fullscreen' },
  argTypes: {
    layout: { control: 'inline-radio', options: ['stacked', 'side'] },
    media: { control: false },
    link: { control: false },
  },
};
export default meta;
type Story = StoryObj<typeof FeatureSplit>;

const learnMore = (
  <Link href="#search" className="inline-flex items-center gap-1 font-medium">
    Learn more
    <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
  </Link>
);

/** Title on the start side, text and link on the end side, the product full width below (Linear). */
export const Stacked: Story = {
  args: {
    layout: 'stacked',
    eyebrow: 'Search',
    title: 'Find the page you half remember',
    description: 'Search reads every saved page, not just its title: type a phrase you remember and the page comes up, with the words highlighted.',
    link: learnMore,
    media: <BookmarksPreview floating={false} className="w-full max-w-[60rem]" />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 2, name: 'Find the page you half remember' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Learn more' })).toHaveAttribute('href', '#search');
  },
};

/** Text beside the visual; two in a row with `reverse` on the second, as they alternate down a page. */
export const SideBySide: Story = {
  name: 'Side by side',
  render: () => (
    <>
      <FeatureSplit
        layout="side"
        eyebrow="Import"
        title={DEMO_FEATURES[0].title}
        description={DEMO_FEATURES[0].description}
        link={learnMore}
        media={<DemoFeatureVisual id="import" />}
      />
      <FeatureSplit
        layout="side"
        reverse
        eyebrow="Duplicates"
        title={DEMO_FEATURES[3].title}
        description={DEMO_FEATURES[3].description}
        media={<DemoFeatureVisual id="duplicates" />}
      />
    </>
  ),
};
