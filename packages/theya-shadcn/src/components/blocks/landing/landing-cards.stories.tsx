import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Book, Copy, Folder, Import, Lock, Search, Group, Sparks } from 'iconoir-react';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { CountUp } from '../../ui/count-up';
import { BookmarksPreview, DemoFeatureVisual } from './demo-data';
import { BentoGrid, BentoItem, FeatureCard, LandingCard, LinkCard, MediaCard, QuoteCard, StatCard, StoryCard, type LandingCardHover, type LandingCardSurface } from './landing-cards';
import { landingCardsGuidelines } from './landing-cards.guidelines';
import { GrowBars, ProgressRing, TrendChart } from './landing-viz';

const meta: Meta<typeof FeatureCard> = {
  title: 'Patterns: Landing/Cards',
  component: FeatureCard,
  tags: ['autodocs'],
  parameters: { guidelines: landingCardsGuidelines, layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof FeatureCard>;

/** A display-scale section around the cards, as on a page. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section data-scale="display" className="section-display" aria-labelledby="cards-title">
      <div className="container-display flex flex-col gap-10">
        <h2 id="cards-title" className="m-0 font-heading text-heading-2xl text-[var(--color-text-text)]">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

const initials = (s: string) => (
  <Avatar size="md" outline="none">
    <AvatarFallback>{s}</AvatarFallback>
  </Avatar>
);

/** Icon, title, a sentence and a link, three across; the whole card is the link and lifts on hover (GitHub). */
export const Features: Story = {
  render: () => (
    <Section title="Built for big collections">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        <FeatureCard hover="lift" icon={<Import />} title="Import from anywhere" description="Every browser at once, or a bookmarks file. Folders come with it." href="#import" linkLabel="Learn more" />
        <FeatureCard hover="lift" icon={<Search />} title="Full-text search" description="Find a page by a phrase inside it, not just by its title." href="#search" linkLabel="Learn more" />
        <FeatureCard hover="lift" icon={<Copy />} title="No duplicates" description="The same link saved twice is merged, with its tags and notes." href="#duplicates" linkLabel="Learn more" />
      </div>
    </Section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // One link per card, named by its title.
    const link = canvas.getByRole('link', { name: 'Full-text search' });
    await expect(link).toHaveAttribute('href', '#search');
    await expect(canvas.getAllByRole('link')).toHaveLength(3);
  },
};

/** monday's pastel cards: tonal fills, and the description folds out on hover or focus (always open on touch). */
export const TonalExpanding: Story = {
  name: 'Tonal, expanding',
  render: () => (
    <Section title="Made for the way you read">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FeatureCard surface="tonal" hue="primary" expand icon={<Book />} title="Reading list" description="Long reads sort themselves in, so the list is ready for the weekend." href="#reading" linkLabel="Explore" />
        <FeatureCard surface="tonal" hue="secondary" expand icon={<Folder />} title="Research" description="Sources, quotes and notes per project, shareable with one link." href="#research" linkLabel="Explore" />
        <FeatureCard surface="tonal" hue="success" expand icon={<Group />} title="Teams" description="Shared folders and comments on links, with roles for who edits." href="#teams" linkLabel="Explore" />
        <FeatureCard surface="tonal" hue="warning" expand icon={<Sparks />} title="Rules" description="Sort by site, tag or length; new links land in the right place." href="#rules" linkLabel="Explore" />
      </div>
    </Section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Keyboard focus opens the folded description too.
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Reading list' })).toHaveFocus();
    await expect(canvas.getByText(/Long reads sort themselves in/)).toBeVisible();
  },
};

/** A slice of the product on top, the caption below; the second puts the media at the bottom (Clerk, Atlassian). */
export const Media: Story = {
  render: () => (
    <Section title="See it before you sign up">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        <MediaCard media={<DemoFeatureVisual id="import" />} eyebrow="Import" title="Bring everything over" description="Chrome, Firefox, Safari and Edge at once." href="#import" hover="lift" />
        <MediaCard media={<DemoFeatureVisual id="folders" />} mediaPosition="bottom" eyebrow="Folders" title="Folders that sort themselves" href="#folders" hover="lift" />
        <MediaCard media={<DemoFeatureVisual id="duplicates" />} eyebrow="Duplicates" title="One copy of everything" description="Merged with their tags and notes." href="#duplicates" hover="lift" />
      </div>
    </Section>
  ),
};

/** Big numbers with what they measure and where they come from; one on the brand fill (monday ROI, Miro). */
export const Stats: Story = {
  render: () => (
    <Section title="Numbers from our readers">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard surface="primary" value={<CountUp to={2000} suffix="+" />} label="teams keep their links here" source="Active teams, October 2026" />
        <StatCard surface="sunken" value={<CountUp to={41} suffix="%" />} label="less time looking for a page" source="Reader survey, n = 1,240" />
        <StatCard surface="sunken" value={<CountUp to={12} suffix="M" />} label="links saved and searchable" source="All accounts" />
        <StatCard surface="sunken" value="4.8" label="average rating in the extension stores" source="Chrome, Firefox and Edge stores" />
      </div>
    </Section>
  ),
};

/** Customer stories: the visual, who, the result as a number, a line in their words (monday). */
export const CustomerStories: Story = {
  name: 'Customer stories',
  render: () => (
    <Section title="Teams that found their links again">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        <StoryCard
          hover="lift"
          media={<DemoFeatureVisual id="search" />}
          label="Research"
          company="Fieldnote"
          stat={{ value: '40%', label: 'less time finding sources' }}
          quote="“We stopped asking each other for that link from last week.”"
          cite="Lena Petrova, research lead"
          href="#fieldnote"
        />
        <StoryCard
          hover="lift"
          media={<DemoFeatureVisual id="folders" />}
          label="Publishing"
          company="Greenhouse"
          stat={{ value: '3×', label: 'more articles linked per issue' }}
          quote="“The rules do the filing; we just read.”"
          cite="Tom Ivanov, editor"
          href="#greenhouse"
        />
        <StoryCard
          hover="lift"
          media={<DemoFeatureVisual id="duplicates" />}
          label="Design"
          company="Northwind"
          stat={{ value: '18k', label: 'duplicates merged in a week' }}
          quote="“Ten years of bookmarks, clean in an afternoon.”"
          cite="Ana Costa, design ops"
          href="#northwind"
        />
      </div>
    </Section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The link is named by the company, with the action for screen readers.
    await expect(canvas.getByRole('link', { name: 'Fieldnote: read the story' })).toHaveAttribute('href', '#fieldnote');
  },
};

/** Testimonials: plain, in the display serif (Wispr), and on a dark card. */
export const Quotes: Story = {
  render: () => (
    <Section title="What readers say">
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <QuoteCard quote="I used to have 200 tabs open “to read later”. Now I have zero and I actually read." name="Mira Novak" title="Product designer" avatar={initials('MN')} />
        <QuoteCard serif surface="sunken" quote="The search finds things I only half remember. That alone is worth it." name="Daniel Ross" title="PhD student" avatar={initials('DR')} />
        <QuoteCard surface="inverse" quote="We moved the whole team over in a day. Shared folders replaced a wiki page nobody updated." name="Yuki Sato" title="Engineering manager, Quartz" avatar={initials('YS')} />
      </div>
    </Section>
  ),
};

/** The whole card is the link, a big title and an arrow in the corner — next steps at the end of a page. */
export const Links: Story = {
  render: () => (
    <Section title="Where to next">
      <div className="grid gap-4 sm:grid-cols-3 lg:gap-6">
        <LinkCard eyebrow="Guide" title="Moving from your browser" description="A ten-minute import, step by step." href="#guide" hover="lift" />
        <LinkCard eyebrow="Teams" surface="tonal" hue="info" title="Shared folders" description="Plans for teams of any size." href="#teams" hover="lift" />
        <LinkCard eyebrow="Download" surface="primary" title="Get the extension" description="Chrome, Firefox, Safari and Edge." href="#download" hover="lift" />
      </div>
    </Section>
  ),
};

/** Cards of different sizes in one grid: one wide card carries the point, the small ones support it (Clerk, Linear). */
export const Bento: Story = {
  render: () => (
    <Section title="Everything in one place">
      <BentoGrid columns={3}>
        <BentoItem colSpan={2} rowSpan={2}>
          <MediaCard
            hover="spotlight"
            className="h-full"
            media={<BookmarksPreview floating={false} className="w-full" />}
            eyebrow="Library"
            title="Thousands of links, one calm list"
            description="Folders on the side, tags on each link, search on top."
          />
        </BentoItem>
        <BentoItem>
          <StatCard surface="primary" value={<CountUp to={12} suffix="M" />} label="links saved and searchable" />
        </BentoItem>
        <BentoItem>
          <FeatureCard surface="tonal" hue="success" icon={<Lock />} title="Private by default" description="Your links are yours: no tracking, no ads, export any time." />
        </BentoItem>
        <BentoItem>
          <QuoteCard serif surface="sunken" quote="Ten years of bookmarks, clean in an afternoon." name="Ana Costa" title="Design ops, Northwind" />
        </BentoItem>
        <BentoItem colSpan={2}>
          <MediaCard hover="spotlight" className="h-full" mediaPosition="bottom" media={<DemoFeatureVisual id="search" />} eyebrow="Search" title="Search the words, not just the titles" />
        </BentoItem>
      </BentoGrid>
    </Section>
  ),
};

const WEEKS = [180, 196, 188, 214, 230, 221, 247, 262, 255, 281, 298, 290, 318, 334, 327, 352, 371, 365, 398, 412, 433, 451, 470, 528, 602, 587];

/** A bento that comes alive as it scrolls in: numbers count up, bars grow, the ring fills; scrub the trend with the mouse (User Growth, KPI bentos). */
export const LiveBento: Story = {
  name: 'Live bento',
  render: () => (
    <Section title="A week in your library">
      <BentoGrid columns={3}>
        <BentoItem colSpan={2}>
          <LandingCard surface="tonal" hue="secondary" className="h-full justify-between gap-6 p-6 lg:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="m-0 font-heading text-heading-xs font-semibold">Links saved per week</h3>
                <p className="m-0 font-body text-body-s">Move the mouse across the chart</p>
              </div>
              <p className="m-0 font-heading text-heading-xl font-semibold tabular-nums">
                <CountUp to={587} />
              </p>
            </div>
            <TrendChart
              values={WEEKS}
              periods={WEEKS.map((_, i) => `Week ${i + 1}`)}
              label="Links saved per week over 26 weeks: from 180 to 587, with a peak of 602 in week 25."
            />
          </LandingCard>
        </BentoItem>
        <BentoItem>
          <LandingCard surface="outlined" className="h-full items-center justify-center gap-4 p-6 text-center">
            <ProgressRing value={75} label="Links sorted automatically" />
            <p className="m-0 font-body text-body-m">of new links sorted by your rules</p>
          </LandingCard>
        </BentoItem>
        {[
          { hue: 'success' as const, to: 15, label: 'Faster to find', bars: [3, 4, 4, 6, 7, 9, 11, 15] },
          { hue: 'primary' as const, to: 41, label: 'More links read', bars: [8, 12, 15, 21, 26, 30, 36, 41] },
          { hue: 'info' as const, to: 32, label: 'Fewer duplicates', bars: [30, 26, 24, 20, 14, 12, 8, 5] },
        ].map((t) => (
          <BentoItem key={t.label}>
            <LandingCard surface="tonal" hue={t.hue} className="h-full justify-between gap-6 p-6">
              <div className="flex flex-col gap-1">
                <p className="m-0 font-heading text-heading-xl font-semibold tabular-nums">
                  <CountUp to={t.to} prefix={t.label === 'Fewer duplicates' ? '−' : '+'} suffix="%" />
                </p>
                <h3 className="m-0 font-body text-body-m font-semibold">{t.label}</h3>
              </div>
              <GrowBars values={t.bars} label={`${t.label}, eight weeks: ${t.bars[0]} to ${t.bars[t.bars.length - 1]}`} />
            </LandingCard>
          </BentoItem>
        ))}
      </BentoGrid>
    </Section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Each chart is one picture with the whole story in its name.
    await expect(canvas.getByRole('img', { name: /Links saved per week over 26 weeks/ })).toBeInTheDocument();
    await expect(canvas.getByRole('img', { name: /Links sorted automatically: 75/ })).toBeInTheDocument();
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(4);
  },
};

const HOVERS: { hover: LandingCardHover; note: string }[] = [
  { hover: 'lift', note: 'Rises with a larger shadow.' },
  { hover: 'spotlight', note: 'A soft glow follows the pointer.' },
  { hover: 'beam', note: 'A light runs round the border while hovered or focused.' },
  { hover: 'shine', note: 'A streak of light sweeps across.' },
  { hover: 'tilt', note: 'Turns slightly toward the pointer.' },
  { hover: 'none', note: 'No effect: for cards that are not links.' },
];

/** Every hover behaviour on the same card. Pointer only; all of them are off under reduced motion. */
export const HoverEffects: Story = {
  name: 'Hover effects',
  render: () => (
    <Section title="Hover behaviours">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {HOVERS.map(({ hover, note }) => (
          <FeatureCard key={hover} hover={hover} icon={<Sparks />} title={hover} description={note} href={`#${hover}`} linkLabel="Try it" />
        ))}
      </div>
    </Section>
  ),
};

const SURFACES: LandingCardSurface[] = ['outlined', 'sunken', 'tonal', 'inverse', 'primary'];

/** The five surfaces: outlined, sunken, tonal, inverse (a dark card in both themes) and the brand fill. */
export const Surfaces: Story = {
  render: () => (
    <Section title="Surfaces">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {SURFACES.map((surface) => (
          <LandingCard key={surface} surface={surface} className="gap-2 p-6">
            <h3 className="m-0 font-heading text-heading-xs font-semibold">{surface}</h3>
            <p className="m-0 font-body text-body-m text-[var(--color-text-text-subtle)]">Text and links keep their contrast on every surface.</p>
          </LandingCard>
        ))}
      </div>
    </Section>
  ),
};
