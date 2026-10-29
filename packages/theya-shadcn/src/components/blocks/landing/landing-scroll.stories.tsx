import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Copy, Import, Lock, Search, Sparks, Group } from 'iconoir-react';
import { RevealGroup } from '../../ui/reveal';
import { DEMO_FEATURES, DemoFeatureVisual } from './demo-data';
import { SectionHead } from './feature-shared';
import { FeatureCard, LandingCard, StoryCard, type LandingCardHue } from './landing-cards';
import { CardRail, StickyStack, StickySteps } from './landing-scroll';
import { landingScrollGuidelines } from './landing-scroll.guidelines';

const meta: Meta<typeof CardRail> = {
  title: 'Patterns: Landing/Scroll',
  component: CardRail,
  tags: ['autodocs'],
  parameters: { guidelines: landingScrollGuidelines, layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof CardRail>;

const HUES: LandingCardHue[] = ['primary', 'secondary', 'success', 'warning'];

/** Big cards that pile up as you scroll: each sticks a little lower, the next slides over it. Scroll the canvas. */
export const Stack: Story = {
  render: () => (
    <section data-scale="display" className="section-display" aria-labelledby="stack-title">
      <div className="container-display flex flex-col gap-12">
        <div id="stack-title">
          <SectionHead title="From a mess of tabs to a library" description="Four steps, about ten minutes." />
        </div>
        <StickyStack>
          {DEMO_FEATURES.map((f, i) => (
            <LandingCard key={f.id} surface="tonal" hue={HUES[i]} className="grid min-h-[24rem] items-center gap-8 p-6 lg:grid-cols-2 lg:p-12">
              <div className="flex flex-col gap-4">
                <p className="m-0 font-body text-body-s font-medium tabular-nums">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="m-0 font-heading text-heading-xl">{f.title}</h3>
                <p className="m-0 font-body text-body-l">{f.description}</p>
              </div>
              <DemoFeatureVisual id={f.id} />
            </LandingCard>
          ))}
        </StickyStack>
      </div>
    </section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Every card is in the list, in reading order.
    await expect(canvas.getAllByRole('listitem').length).toBeGreaterThanOrEqual(4);
    await expect(canvas.getByRole('heading', { level: 3, name: DEMO_FEATURES[3].title })).toBeInTheDocument();
  },
};

const STORIES = [
  { company: 'Fieldnote', label: 'Research', id: 'search', stat: { value: '40%', label: 'less time finding sources' } },
  { company: 'Greenhouse', label: 'Publishing', id: 'folders', stat: { value: '3×', label: 'more articles linked per issue' } },
  { company: 'Northwind', label: 'Design', id: 'duplicates', stat: { value: '18k', label: 'duplicates merged in a week' } },
  { company: 'Lumen', label: 'Education', id: 'import', stat: { value: '1,200', label: 'students on one reading list' } },
  { company: 'Kestrel', label: 'Engineering', id: 'search', stat: { value: '2 min', label: 'to find any spec' } },
  { company: 'Bloom', label: 'Marketing', id: 'folders', stat: { value: '9', label: 'campaign folders shared with agencies' } },
] as const;

/** More cards than fit a row: the next one peeks in; arrows at the top, drag, or Arrow keys (monday customer stories). */
export const Rail: Story = {
  render: () => (
    <CardRail eyebrow="Customers" title="Teams that found their links again" description="Six stories, from research labs to agencies.">
      {STORIES.map((s) => (
        <StoryCard key={s.company} hover="lift" media={<DemoFeatureVisual id={s.id} />} company={s.company} label={s.label} stat={s.stat} href={`#${s.company.toLowerCase()}`} />
      ))}
    </CardRail>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Teams that found their links again' })).toBeInTheDocument();
    await expect(canvas.getByRole('group', { name: '1 of 6' })).toBeInTheDocument();
    const next = canvas.getByRole('button', { name: /next/i });
    const prev = canvas.getByRole('button', { name: /previous/i });
    // The arrows switch on once the carousel has measured its slides.
    await waitFor(() => expect(next).not.toHaveAttribute('aria-disabled', 'true'));
    await expect(prev).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(next);
    await waitFor(() => expect(prev).not.toHaveAttribute('aria-disabled', 'true'));
  },
};

/** A numbered process: the heading and the step list stay put while the steps scroll by; the one in view is marked (LaunchDarkly). */
export const Steps: Story = {
  render: () => (
    <StickySteps
      eyebrow="How it works"
      title="Ten minutes to a clean library"
      description="No setup call, no migration plan."
      steps={DEMO_FEATURES.map((f) => ({ id: f.id, title: f.title, description: f.description, media: <DemoFeatureVisual id={f.id} /> }))}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    if (window.matchMedia('(max-width: 1023.98px)').matches) return; // the step list shows from lg up
    const nav = canvas.getByRole('navigation', { name: 'Steps' });
    await expect(within(nav).getAllByRole('link')).toHaveLength(4);
    await expect(within(nav).getByRole('link', { name: /Bring everything over/ })).toHaveAttribute('aria-current', 'step');
  },
};

/** Cards ease in one after another the first time they scroll into view; with reduced motion they are simply there. */
export const Reveal: Story = {
  render: () => (
    <section data-scale="display" className="section-display" aria-labelledby="reveal-title">
      <div className="container-display flex flex-col gap-10">
        <h2 id="reveal-title" className="m-0 font-heading text-heading-2xl text-[var(--color-text-text)]">
          Built for big collections
        </h2>
        <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6" stagger={90}>
          <FeatureCard icon={<Import />} title="Import from anywhere" description="Every browser at once, or a bookmarks file." />
          <FeatureCard icon={<Search />} title="Full-text search" description="Find a page by a phrase inside it." />
          <FeatureCard icon={<Copy />} title="No duplicates" description="The same link saved twice is merged." />
          <FeatureCard icon={<Group />} title="Shared folders" description="One reading list for the whole team." />
          <FeatureCard icon={<Sparks />} title="Rules" description="New links land in the right folder." />
          <FeatureCard icon={<Lock />} title="Private by default" description="No tracking, no ads, export any time." />
        </RevealGroup>
      </div>
    </section>
  ),
};
