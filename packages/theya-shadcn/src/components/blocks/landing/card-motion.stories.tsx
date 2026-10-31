import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { DEMO_FEATURES, DEMO_FOLDERS, DemoFeatureVisual, DemoMiniLink } from './demo-data';
import { SectionHead } from './feature-shared';
import { CardMotionSection } from './card-motion.story-helpers';
import { FanCarousel, FlipCard, FolderReveal, ParallaxLayer, ParallaxLayers, RingCarousel } from './card-motion';
import { cardMotionGuidelines } from './card-motion.guidelines';
import { LandingCard, StatCard, type LandingCardHue } from './landing-cards';

const meta: Meta<typeof RingCarousel> = {
  title: 'Patterns: Landing/Card motion',
  component: RingCarousel,
  tags: ['autodocs'],
  parameters: { guidelines: cardMotionGuidelines, layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof RingCarousel>;

const HUES: LandingCardHue[] = ['primary', 'secondary', 'success', 'warning', 'info', 'neutral', 'primary', 'success'];
const TEMPLATES = ['Reading list', 'Research', 'Recipes', 'Trips', 'Design inspiration', 'Courses', 'Gift ideas', 'Job search'];

const TemplateCard = ({ i, compact = false }: { i: number; compact?: boolean }) =>
  compact ? (
    <LandingCard surface="tonal" hue={HUES[i]} className="h-36 justify-between gap-2 p-4">
      <p className="m-0 font-body text-body-xs font-medium tabular-nums">{String(i + 1).padStart(2, '0')}</p>
      <h3 className="m-0 font-heading text-body-m font-semibold">{TEMPLATES[i]}</h3>
    </LandingCard>
  ) : (
    <LandingCard surface="tonal" hue={HUES[i]} className="h-72 justify-between gap-4 p-6">
      <p className="m-0 font-body text-body-s font-medium tabular-nums">Template {String(i + 1).padStart(2, '0')}</p>
      <div className="flex flex-col gap-2">
        <h3 className="m-0 font-heading text-heading-xs font-semibold">{TEMPLATES[i]}</h3>
        <p className="m-0 font-body text-body-s">Folders, tags and rules, ready to fill.</p>
      </div>
    </LandingCard>
  );

/** Eight template cards standing in a ring. Drag it, use the arrows or the Arrow keys; it settles with a card facing you. */
export const Ring: Story = {
  render: () => (
    <CardMotionSection title="Start from a template">
      <RingCarousel aria-label="Templates">
        {TEMPLATES.map((_, i) => (
          <TemplateCard key={i} i={i} />
        ))}
      </RingCarousel>
    </CardMotionSection>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ring = canvas.getByRole('region', { name: 'Templates' });
    // Only the front card is exposed.
    await expect(within(ring).getAllByRole('heading', { level: 3 })).toHaveLength(1);
    await userEvent.click(within(ring).getByRole('button', { name: /next/i }));
    await expect(within(ring).getByRole('heading', { level: 3, name: TEMPLATES[1] })).toBeInTheDocument();
    // The stage is a named group with a hint about the arrow keys; the position names the slide.
    await expect(within(ring).getByRole('group', { name: 'Slides' })).toHaveAccessibleDescription(/arrow keys/);
    await waitFor(() => expect(within(ring).getByText(`2 of ${TEMPLATES.length}: ${TEMPLATES[1]}`)).toBeInTheDocument());
  },
};

/** The ring around a word: the cards pass behind and in front of it (from the reference video). */
export const RingAroundAWord: Story = {
  name: 'Ring around a word',
  render: () => (
    <CardMotionSection title="">
      <RingCarousel
        aria-label="Templates"
        // A steep lean and small cards: the near side of the ring passes under the word and
        // the far side over it, so the word stays readable as the cards go round.
        cardWidth={150}
        lean={30}
        center={<p className="m-0 whitespace-nowrap font-display-serif text-heading-3xl italic text-[var(--color-text-text)]">your library</p>}
      >
        {TEMPLATES.map((_, i) => (
          <TemplateCard key={i} i={i} compact />
        ))}
      </RingCarousel>
    </CardMotionSection>
  ),
};

/** The inside of the ring: a curved wall of cards, the edges swinging in toward you (coverflow, 3D card wall). Drag, arrows, Arrow keys. */
export const Wall: Story = {
  render: () => (
    <CardMotionSection title="Start from a template">
      <RingCarousel aria-label="Templates" shape="wall" cardWidth={240}>
        {TEMPLATES.map((_, i) => (
          <TemplateCard key={i} i={i} />
        ))}
      </RingCarousel>
    </CardMotionSection>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wall = canvas.getByRole('region', { name: 'Templates' });
    await expect(within(wall).getAllByRole('heading', { level: 3 })).toHaveLength(1);
    await userEvent.click(within(wall).getByRole('button', { name: /next/i }));
    await expect(within(wall).getByRole('heading', { level: 3, name: TEMPLATES[1] })).toBeInTheDocument();
    // The wall does not wrap: back past the first card stays on the first.
    await userEvent.click(within(wall).getByRole('button', { name: /previous/i }));
    await userEvent.click(within(wall).getByRole('button', { name: /previous/i }));
    await expect(within(wall).getByRole('heading', { level: 3, name: TEMPLATES[0] })).toBeInTheDocument();
  },
};

/** Cards on an arc, the middle one in focus. Drag, click a side card, or use the arrows (Fan Card Carousel). The first time it scrolls in, it deals itself out from the middle (PayCard). */
export const Fan: Story = {
  render: () => (
    <CardMotionSection title="Four things it does for you">
      <FanCarousel aria-label="Features">
        {DEMO_FEATURES.map((f, i) => (
          <LandingCard key={f.id} surface="tonal" hue={HUES[i]} className="h-[26rem] gap-6 p-6">
            <DemoFeatureVisual id={f.id} />
            <div className="flex flex-col gap-2">
              <h3 className="m-0 font-heading text-heading-xs font-semibold">{f.title}</h3>
              <p className="m-0 font-body text-body-s">{f.description}</p>
            </div>
          </LandingCard>
        ))}
      </FanCarousel>
    </CardMotionSection>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fan = canvas.getByRole('region', { name: 'Features' });
    await expect(within(fan).getAllByRole('heading', { level: 3 })).toHaveLength(1);
    await userEvent.click(within(fan).getByRole('button', { name: /previous/i }));
    await expect(within(fan).getByRole('heading', { level: 3, name: DEMO_FEATURES[1].title })).toBeInTheDocument();
  },
};

/** Folders with links in them: the links drop in as the folders scroll into view and fan out on hover or focus (WalletCards). */
export const Folders: Story = {
  render: () => (
    <CardMotionSection title="Your folders, at a glance">
      <div className="flex flex-wrap justify-center gap-x-10 gap-y-16 pt-24">
        {DEMO_FOLDERS.slice(0, 3).map((f, k) => (
          <FolderReveal key={f.id} href={`#${f.id}`} label={f.name} meta={`${f.count} links`} items={[0, 1, 2].map((j) => <DemoMiniLink key={j} index={k * 4 + j} />)} />
        ))}
      </div>
    </CardMotionSection>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: /Reading list/ })).toHaveAttribute('href', '#reading');
  },
};

/** Cards that turn over from the edge the pointer comes in by, with a glass back (LiquidGlass FlipCard). The corner button turns them for keyboard and touch. */
export const Flip: Story = {
  render: () => (
    <CardMotionSection title="Numbers, and where they come from">
      <div className="grid w-full gap-6 sm:grid-cols-3">
        {[
          { v: '41%', l: 'less time looking for a page', b: 'From a survey of 1,240 readers in September 2026, comparing the week before and the month after switching.' },
          { v: '12M', l: 'links saved and searchable', b: 'Every link across all accounts, with the text of the page indexed for search.' },
          { v: '4.8', l: 'average rating', b: 'Chrome, Firefox and Edge extension stores, October 2026.' },
        ].map((s, i) => (
          <FlipCard
            key={s.v}
            flipLabel={`Where “${s.v}” comes from`}
            front={<StatCard surface={i === 0 ? 'primary' : 'tonal'} hue={HUES[i]} value={s.v} label={s.l} source="The source is on the back of the card" />}
            back={
              <div className="flex h-full flex-col justify-end gap-2">
                <p className="m-0 font-heading text-heading-xl font-semibold text-[var(--color-text-text)]">{s.v}</p>
                <p className="m-0 font-body text-body-m text-[var(--color-text-text)]">{s.b}</p>
              </div>
            }
          />
        ))}
      </div>
    </CardMotionSection>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Where “41%” comes from' });
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByText(/From a survey of 1,240 readers/)).toBeInTheDocument();
    // Unpin it again, so the story is left as it opens (a pinned card ignores hover).
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'false');
  },
};


/** Glass cards over a soft arch that drift with the mouse, each layer by its own depth (a hero visual). */
export const Parallax: Story = {
  render: () => (
    <CardMotionSection title="Depth for a hero visual">
      <ParallaxLayers aria-hidden className="h-[28rem] w-full max-w-[44rem]">
        <ParallaxLayer depth={-0.3} className="absolute inset-x-[22%] bottom-0 top-6 rounded-t-full bg-[var(--color-bg-primary-bg-primary-subtle)]" />
        {[
          { i: 2, depth: 0.35, pos: 'end-[8%] top-[14%] rotate-[-6deg]' },
          { i: 5, depth: 0.6, pos: 'start-[30%] top-[34%] rotate-[-3deg]' },
          { i: 0, depth: 1, pos: 'start-[10%] top-[52%]' },
        ].map((c) => (
          <ParallaxLayer key={c.i} depth={c.depth} className={`absolute ${c.pos}`}>
            <div className="rounded-[var(--size-border-radius-border-radius-3xl)] border border-solid border-[color-mix(in_srgb,white_40%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-surface-bg-surface)_60%,transparent)] p-2 shadow-elevation-lg backdrop-blur-xl">
              <DemoMiniLink index={c.i} />
            </div>
          </ParallaxLayer>
        ))}
      </ParallaxLayers>
    </CardMotionSection>
  ),
};
