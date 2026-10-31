import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { Copy, Group, Import, Lock, Search, Sparks } from 'iconoir-react';
import { BookmarksPreview, DEMO_FEATURES, DemoFeatureVisual, DemoMiniLink } from './demo-data';
import { SectionHead } from './feature-shared';
import { FeatureCard, LandingCard, QuoteCard, StatCard, type LandingCardHue } from './landing-cards';
import { Button } from '../../ui/button';
import { CardDeck, DepthTunnel, FanOut, HorizontalScroll, MasonryDrift, ScrollHighlight, ScrollMaskReveal, TiltIn } from './scroll-effects';
import { scrollEffectsGuidelines } from './scroll-effects.guidelines';

const meta: Meta<typeof CardDeck> = {
  title: 'Patterns: Landing/Scroll effects',
  component: CardDeck,
  tags: ['autodocs'],
  parameters: { guidelines: scrollEffectsGuidelines, layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof CardDeck>;

/** Room to scroll before and after an effect, so it can be seen playing in the canvas. */
const Spacer = ({ label }: { label: string }) => (
  <div aria-hidden className="flex h-[70vh] items-center justify-center font-body text-body-m text-[var(--color-text-text-subtle)]">
    {label}
  </div>
);

const HUES: LandingCardHue[] = ['primary', 'secondary', 'success', 'warning', 'info'];
const DECK = [
  ...DEMO_FEATURES,
  { id: 'teams', title: 'Shared with your team', description: 'Shared folders, comments on links and a weekly digest of what everyone saved.' },
] as const;

/**
 * The deck: big cards standing one behind another. Scroll — the front card
 * falls toward you and the next comes forward out of the depth. Scroll back
 * and it all comes back.
 */
export const Deck: Story = {
  render: () => (
    <div className="bg-[var(--color-bg-surface-bg-surface)]">
      <Spacer label="Scroll down" />
      <CardDeck aria-label="Product tour" header={<SectionHead eyebrow="Tour" title="Five things your bookmarks never did" />}>
        {DECK.map((f, i) => (
          <LandingCard key={f.id} surface="tonal" hue={HUES[i]} className="grid items-center gap-8 p-8 shadow-elevation-lg lg:grid-cols-2 lg:p-16">
            <div className="flex flex-col gap-4">
              <p className="m-0 font-body text-body-s font-medium tabular-nums">{String(i + 1).padStart(2, '0')} / 05</p>
              <h3 className="m-0 font-heading text-heading-2xl">{f.title}</h3>
              <p className="m-0 font-body text-body-l">{f.description}</p>
            </div>
            <div className="max-lg:hidden">{'Visual' in f ? <DemoFeatureVisual id={f.id} /> : <BookmarksPreview floating={false} />}</div>
          </LandingCard>
        ))}
      </CardDeck>
      <Spacer label="The end of the deck" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The tests run with reduced motion: the deck is a plain list of all five cards.
    const deck = canvas.getByRole('region', { name: 'Product tour' });
    await expect(within(deck).getAllByRole('heading', { level: 3 })).toHaveLength(5);
  },
};

/** The product starts tilted back like a screen on a desk and stands up as it scrolls in (Linear, Stripe). */
export const Tilt: Story = {
  render: () => (
    <div className="bg-[var(--color-bg-surface-bg-surface)]">
      <Spacer label="Scroll down" />
      <section data-scale="display" className="section-display">
        <div className="container-display flex flex-col items-center gap-12 text-center">
          <SectionHead align="center" title="Your whole library, at a glance" description="Scroll: the app stands up." />
          <TiltIn className="w-full max-w-[60rem]">
            <BookmarksPreview />
          </TiltIn>
        </div>
      </section>
      <Spacer label="" />
    </div>
  ),
};

/** A statement whose words light up as you read down the page (Apple, Linear). Dim words stay readable. */
export const Highlight: Story = {
  render: () => (
    <div className="bg-[var(--color-bg-surface-bg-surface)]">
      <Spacer label="Scroll down" />
      <section data-scale="display" className="section-display">
        <div className="container-display-narrow">
          <ScrollHighlight>
            We built Bookmarks for people with too many tabs: save anything in a click, find it again by a word you remember, and share a reading list without sending fifty links.
          </ScrollHighlight>
        </div>
      </section>
      <Spacer label="" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // One plain paragraph with the whole sentence (the words are spans inside it).
    const p = canvasElement.querySelector('p[data-slot="scroll-highlight"]');
    await expect(p?.textContent).toMatch(/^We built Bookmarks for people with too many tabs/);
  },
};

/** Six cards start as a pile in the middle and deal themselves out into the grid as it scrolls in (lg and up). */
export const Deal: Story = {
  render: () => (
    <div className="bg-[var(--color-bg-surface-bg-surface)]">
      <Spacer label="Scroll down" />
      <section data-scale="display" className="section-display" aria-labelledby="deal-title">
        <div className="container-display flex flex-col gap-10">
          <h2 id="deal-title" className="m-0 font-heading text-heading-2xl text-[var(--color-text-text)]">
            Built for big collections
          </h2>
          <FanOut>
            <FeatureCard icon={<Import />} title="Import from anywhere" description="Every browser at once, or a bookmarks file." />
            <FeatureCard surface="tonal" hue="primary" icon={<Search />} title="Full-text search" description="Find a page by a phrase inside it." />
            <FeatureCard icon={<Copy />} title="No duplicates" description="The same link saved twice is merged." />
            <FeatureCard surface="tonal" hue="success" icon={<Group />} title="Shared folders" description="One reading list for the whole team." />
            <FeatureCard icon={<Sparks />} title="Rules" description="New links land in the right folder." />
            <FeatureCard surface="tonal" hue="warning" icon={<Lock />} title="Private by default" description="No tracking, no ads, export any time." />
          </FanOut>
        </div>
      </section>
      <Spacer label="" />
    </div>
  ),
};

/** Saved links fly toward you out of the depth while the message stays put in the middle (a warp shot). Scroll. */
export const Tunnel: Story = {
  render: () => (
    <div className="bg-[var(--color-bg-surface-bg-surface)]">
      <Spacer label="Scroll down" />
      <DepthTunnel items={Array.from({ length: 16 }, (_, i) => <DemoMiniLink key={i} index={i} />)}>
        <h2 className="m-0 text-balance font-heading text-heading-3xl text-[var(--color-text-text)]">Every link you ever saved</h2>
        <p className="m-0 mt-6 font-body text-body-l text-[var(--color-text-text-subtle)]">Twelve years of tabs, in one place you can search.</p>
      </DepthTunnel>
      <Spacer label="" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 2, name: 'Every link you ever saved' })).toBeVisible();
  },
};

/** The picture starts as a capsule and opens to fill the screen as you scroll; the text comes up over it (Nexacard). */
export const MaskReveal: Story = {
  name: 'Mask reveal',
  render: () => (
    <div className="bg-[var(--color-bg-surface-bg-surface)]">
      <Spacer label="Scroll down" />
      <ScrollMaskReveal aria-labelledby="reveal-title" media={<img src="/asset-examples/login-carousel-01.jpg" alt="" />}>
        <div className="flex max-w-[34rem] flex-col items-start gap-6 rounded-[var(--size-border-radius-border-radius-4xl)] bg-[var(--color-bg-surface-bg-surface)] p-8 shadow-elevation-lg">
          <h2 id="reveal-title" className="m-0 text-balance font-heading text-heading-2xl text-[var(--color-text-text)]">
            Room for everything you read
          </h2>
          <Button>Start free</Button>
        </div>
      </ScrollMaskReveal>
      <Spacer label="" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Reduced motion in the tests: a rounded panel with the text and button on it.
    await expect(canvas.getByRole('heading', { level: 2, name: 'Room for everything you read' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Start free' })).toBeVisible();
  },
};

const CONTROL = [
  { title: 'Alerts', description: 'A nudge when a saved page changes or a link breaks.' },
  { title: 'Read later', description: 'A queue that empties itself as you read.' },
  { title: 'Highlights', description: 'Mark a line, find it again by searching for it.' },
  { title: 'Shared folders', description: 'One reading list for the whole team.' },
  { title: 'Rules', description: 'New links land in the right folder on their own.' },
  { title: 'Export', description: 'Everything as HTML, CSV or JSON, any time.' },
];

/** Scroll down and the row of cards slides sideways under the heading until the last one is in (Klarna). Below lg: a row you swipe. */
export const Sideways: Story = {
  render: () => (
    <div className="bg-[var(--color-bg-surface-bg-surface)]">
      <Spacer label="Scroll down" />
      <HorizontalScroll aria-label="Features" header={<SectionHead eyebrow="Features" title="In control, all the time" />}>
        {CONTROL.map((c, i) => (
          <LandingCard key={c.title} surface="tonal" hue={HUES[i % HUES.length]} className="h-[26rem] w-[min(22rem,80vw)] justify-between gap-6 p-6">
            <div className="flex flex-col gap-2">
              <h3 className="m-0 font-heading text-heading-xs font-semibold">{c.title}</h3>
              <p className="m-0 font-body text-body-s">{c.description}</p>
            </div>
            <DemoFeatureVisual id={DEMO_FEATURES[i % DEMO_FEATURES.length].id} />
          </LandingCard>
        ))}
      </HorizontalScroll>
      <Spacer label="" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list', { name: 'Features' });
    await expect(within(list).getAllByRole('heading', { level: 3 })).toHaveLength(6);
  },
};

const PHOTOS = ['login-carousel-01', 'nova-web', 'login-carousel-02', 'product-router', 'login-carousel-03', 'product-ssd'];
const RATIOS = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-[3/2]', 'aspect-[2/3]', 'aspect-[5/4]'];

/** A Pinterest-like wall: columns of saved things drift past each other as you scroll (odd up, even down). Tab into it and it stops and opens. */
export const Masonry: Story = {
  render: () => {
    const items = [
      ...PHOTOS.map((p, i) => (
        <LandingCard key={p} surface="sunken" className="overflow-hidden">
          <img src={`/asset-examples/${p}.jpg`} alt="" className={`${RATIOS[i]} w-full object-cover`} />
          <p className="m-0 p-4 font-body text-body-s font-semibold">{['Blue hour', 'Studio site', 'Stairs study', 'Home network', 'Tall blocks', 'Storage'][i]}</p>
        </LandingCard>
      )),
      <QuoteCard key="q1" serif surface="tonal" hue="secondary" quote="My whole moodboard, finally in one place." name="Lea Brandt" title="Illustrator" />,
      <StatCard key="s1" surface="primary" value="12M" label="things saved this year" />,
      <div key="m1" className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <DemoMiniLink key={i} index={i + 4} />
        ))}
      </div>,
      <QuoteCard key="q2" surface="outlined" quote="I save a recipe on the phone and it is on the laptop by dinner." name="Tom Ide" title="Home cook" />,
      <StatCard key="s2" surface="tonal" hue="success" value="4.8" label="average rating" />,
      <QuoteCard key="q3" serif surface="tonal" hue="warning" quote="Search by a word inside the page. Magic." name="Ana Costa" title="Researcher" />,
    ];
    // Interleave photos and the rest so each column gets a mix.
    const mixed = items.slice(0, 6).flatMap((p, i) => [p, items[6 + i]]).filter(Boolean);
    return (
      <div className="bg-[var(--color-bg-surface-bg-surface)]">
        <Spacer label="Scroll down" />
        <section data-scale="display" className="section-display">
          <div className="container-display flex flex-col gap-10">
            <SectionHead align="center" title="Everything you keep" description="Photos, quotes, recipes, links: one wall." />
            <MasonryDrift aria-label="Everything you keep" items={mixed} />
          </div>
        </section>
        <Spacer label="" />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Reduced motion in the tests: a plain masonry, every card in it.
    const wall = canvasElement.querySelector('[data-slot="masonry-drift"]') as HTMLElement;
    await expect(within(wall).getAllByRole('listitem')).toHaveLength(12);
    await expect(canvas.getByText('My whole moodboard, finally in one place.')).toBeVisible();
  },
};
