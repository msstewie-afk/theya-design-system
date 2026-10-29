import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { Copy, Group, Import, Lock, Search, Sparks } from 'iconoir-react';
import { BookmarksPreview, DEMO_FEATURES, DemoFeatureVisual, DemoMiniLink } from './demo-data';
import { SectionHead } from './feature-shared';
import { FeatureCard, LandingCard, type LandingCardHue } from './landing-cards';
import { CardDeck, DepthTunnel, FanOut, ScrollHighlight, TiltIn } from './scroll-effects';
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
