import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { DEMO_FEATURES, DEMO_FOLDERS, DemoFeatureVisual, DemoMiniLink } from './demo-data';
import { SectionHead } from './feature-shared';
import { CardMotionSection } from './card-motion.story-helpers';
import { FanCarousel, FlipCard, FolderReveal, RingCarousel } from './card-motion';
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

const TemplateCard = ({ i }: { i: number }) => (
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
  },
};

/** The ring around a word: the cards pass behind and in front of it (from the reference video). */
export const RingAroundAWord: Story = {
  name: 'Ring around a word',
  render: () => (
    <CardMotionSection title="">
      <RingCarousel
        aria-label="Templates"
        cardWidth={200}
        lean={14}
        center={<p className="m-0 font-display-serif text-heading-2xl italic text-[var(--color-text-text)]">your library</p>}
      >
        {TEMPLATES.map((_, i) => (
          <TemplateCard key={i} i={i} />
        ))}
      </RingCarousel>
    </CardMotionSection>
  ),
};

/** Cards on an arc, the middle one in focus. Drag, click a side card, or use the arrows (Fan Card Carousel). */
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
      <div className="grid gap-6 sm:grid-cols-3">
        {[
          { v: '41%', l: 'less time looking for a page', b: 'From a survey of 1,240 readers in September 2026, comparing the week before and the month after switching.' },
          { v: '12M', l: 'links saved and searchable', b: 'Every link across all accounts, with the text of the page indexed for search.' },
          { v: '4.8', l: 'average rating', b: 'Chrome, Firefox and Edge extension stores, October 2026.' },
        ].map((s, i) => (
          <FlipCard
            key={s.v}
            flipLabel={`Where “${s.v}” comes from`}
            front={<StatCard surface={i === 0 ? 'primary' : 'tonal'} hue={HUES[i]} value={s.v} label={s.l} source="Hover or press ⟳ for the source" />}
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
  },
};

