import { resetFocus } from '../../../test/keyboard';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { ArrowRight } from 'iconoir-react';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { DeviceFrame } from './device-frame';
import { Hero, HeroAccent } from './hero';
import { SectionPanel } from './section-panel';
import { StoreButtons } from './store-buttons';
import { HeroTexture } from './hero-texture';
import { BookmarksPreview, DEMO_FOLDERS, type DemoFolderId } from './demo-data';
import { heroGuidelines } from './hero.guidelines';

const meta: Meta<typeof Hero> = {
  title: 'Patterns: Landing/Hero',
  component: Hero,
  tags: ['autodocs'],
  parameters: {
    guidelines: heroGuidelines,
    layout: 'fullscreen',
  },
  args: {
    eyebrow: 'Bookmarks',
    description: 'Import from any browser, sort into folders, and find any page again in a keystroke — even the ones you forgot you saved.',
    actions: (
      <>
        <Button size="2xl" rightIcon={<ArrowRight />}>
          Get started free
        </Button>
        <Button size="2xl" appearance="outlined">
          See how it works
        </Button>
      </>
    ),
    note: 'Chrome, Firefox, Safari and Edge · Free for up to 1,000 links',
  },
};
export default meta;
type Story = StoryObj<typeof Hero>;

/**
 * Two lines, two faces: a Geologica statement and a serif italic answer. The
 * lines differ in length (about 860 / 490 px at 1440) so the title tapers
 * instead of reading as two equal blocks. The product below.
 */
export const Centered: Story = {
  args: {
    layout: 'centered',
    title: (
      <>
        Save what you read,
        <HeroAccent variant="serif" line>
          find it again
        </HeroAccent>
      </>
    ),
    media: <BookmarksPreview className="mx-auto max-w-[60rem]" />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 1, name: 'Save what you read, find it again' })).toBeVisible();
    // The product visual is one image to assistive tech, with no controls inside.
    const visual = canvas.getByRole('img', { name: /The Bookmarks app/ });
    await expect(within(visual).queryAllByRole('button')).toHaveLength(0);
  },
};

/**
 * Text beside the product, with chips above the action that switch what the
 * product shows (as monday does by role). Tabs variant="chips" carries the
 * switching; the preview is the tab panel.
 */
export const SplitWithChips: Story = {
  name: 'Split with chips',
  render: function Render(args) {
    const [folder, setFolder] = useState<DemoFolderId>('reading');
    return (
      <Tabs value={folder} onValueChange={(v) => setFolder(v as DemoFolderId)}>
        <Hero
          {...args}
          layout="split"
          eyebrow={undefined}
          title={
            <>
              Bookmarks for people with <HeroAccent>too many tabs</HeroAccent>
            </>
          }
          filters={
            <TabsList variant="chips" aria-label="Show a folder">
              {DEMO_FOLDERS.map((f) => (
                <TabsTrigger key={f.id} value={f.id}>
                  {f.name}
                </TabsTrigger>
              ))}
            </TabsList>
          }
          actions={
            <Button size="2xl" rightIcon={<ArrowRight />}>
              Get started free
            </Button>
          }
          media={DEMO_FOLDERS.map((f) => (
            <TabsContent key={f.id} value={f.id} className="mt-0">
              <BookmarksPreview folder={f.id} />
            </TabsContent>
          ))}
        />
      </Tabs>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getAllByRole('tab')[0];
    await userEvent.click(canvas.getByRole('tab', { name: 'Recipes' }));
    await waitFor(() => expect(canvas.getByRole('img', { name: /Recipes folder/ })).toBeVisible());
    // Back to the first chip, so the story opens as a reader would see it.
    await userEvent.click(first);
    // Leave no focus ring behind: the story opens at rest, as a reader would see it.
    resetFocus();
  },
};

/**
 * A serif title with an italic line — the editorial look (Wispr, Granola).
 * Short line over a long one, the reverse of Centered.
 */
export const SerifTitle: Story = {
  name: 'Serif title',
  args: {
    layout: 'centered',
    titleFont: 'display-serif',
    title: (
      <>
        Fewer tabs,
        <HeroAccent variant="italic" line>
          more of what matters
        </HeroAccent>
      </>
    ),
    media: undefined,
  },
};

/** A rounded card inside the page gutter, the media filling it behind a scrim; an announcement pill as the eyebrow. */
export const Inset: Story = {
  args: {
    layout: 'inset',
    eyebrow: (
      <a
        href="#teams"
        className="inline-flex items-center gap-2 rounded-full border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] py-1 ps-1 pe-3 font-body text-body-s text-[var(--color-text-text)] no-underline outline-none hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] focus-visible:focus-ring"
      >
        <span className="rounded-full bg-[var(--color-bg-primary-bg-primary)] px-2 py-0.5 text-body-xs font-semibold text-[var(--color-text-text-on-primary)]">New</span>
        Shared folders for teams
        <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
      </a>
    ),
    title: (
      <>
        Share what your team <HeroAccent variant="serif">reads</HeroAccent>
      </>
    ),
    description: 'Shared folders, comments on links and a weekly digest of what everyone saved.',
    note: undefined,
    // A decorative scene; in a product this is a photo (<img> fills the card).
    media: (
      <div aria-hidden className="size-full bg-[radial-gradient(circle_at_75%_30%,var(--color-blue-blue-500),transparent_45%),radial-gradient(circle_at_90%_85%,var(--color-purple-purple-500),transparent_40%),radial-gradient(circle_at_55%_95%,var(--color-teal-teal-500),transparent_35%)]" />
    ),
  },
};

/** Title, one action, the quiet line — the leanest hero. */
export const TitleOnly: Story = {
  name: 'Title only',
  args: {
    layout: 'centered',
    eyebrow: undefined,
    description: undefined,
    title: 'Every link you ever saved, finally in one place',
    actions: <Button size="2xl">Get started free</Button>,
    media: undefined,
  },
};

/**
 * A phrase over a full-bleed scene (ld-02): the statement sits at the bottom
 * in display type over a scrim, one or two actions at the end. Dark in both
 * themes. Media is an image or a video that fills the section.
 */
export const Statement: Story = {
  args: {
    layout: 'statement',
    eyebrow: 'Bookmarks · 2026',
    title: 'Everything you meant to read',
    description: 'One calm library for every link, with a readable copy of each page kept for you.',
    actions: (
      <Button size="2xl" rightIcon={<ArrowRight />}>
        Get started free
      </Button>
    ),
    note: undefined,
    media: <img src="/asset-examples/silk/1-dark.webp" alt="" />,
  },
};

/**
 * The name across the full width, then the page in numbered columns
 * (ld-02). The wordmark is the h1 and fits its container at any width;
 * `title` is plain text. With the brand's display face (profile
 * `displayFont`) it takes that family, width and weight.
 */
export const Wordmark: Story = {
  args: {
    layout: 'wordmark',
    eyebrow: undefined,
    title: 'Bookmarks',
    description: 'Import from any browser, sort into folders, and find any page again in a keystroke.',
    links: [
      { label: 'Library', href: '#library' },
      { label: 'Search', href: '#search' },
      { label: 'Teams', href: '#teams' },
      { label: 'Pricing', href: '#pricing' },
    ],
    actions: <Button size="xl">Get started free</Button>,
    note: undefined,
  },
};

/**
 * The same wordmark in a display face with a width axis: Archivo at 75%
 * width and weight 700, set here on the wrapper with the variables a brand
 * profile's `displayFont` writes (--font-display, --display-stretch,
 * --display-weight).
 */
export const WordmarkDisplayFace: Story = {
  name: 'Wordmark, display face',
  args: Wordmark.args,
  decorators: [
    (Story) => (
      <div style={{ ['--font-display' as string]: "'Archivo', Geologica, sans-serif", ['--display-stretch' as string]: '75%', ['--display-weight' as string]: '700' }}>
        <Story />
      </div>
    ),
  ],
};

/** The three textures behind a centered hero: dither, halftone, particles (which stand still under reduced motion). */
export const Textures: Story = {
  render: (args) => (
    <div>
      {(['dither', 'halftone', 'particles'] as const).map((v) => (
        <Hero key={v} {...args} titleAs={v === 'dither' ? 'h1' : 'h2'} layout="centered" eyebrow={v} title="Save what you read, find it again" backdrop={<HeroTexture variant={v} />} media={undefined} note={undefined} />
      ))}
    </div>
  ),
};

/**
 * A product name as the title (titleSize="display": the display scale in the
 * theme's display face), one large subtitle that says what it does, and short
 * points. The first-screen setup for an app launch.
 */
export const NameSubtitlePoints: Story = {
  parameters: { globals: { brand: 'ember' } },
  args: {
    layout: 'split',
    eyebrow: 'Bookmarks for reading',
    title: 'Bookmarks',
    titleSize: 'display',
    description: undefined,
    subtitle: 'Everything you meant to read, saved in one place and found by a word.',
    points: [
      <>
        <strong>Save from anywhere.</strong> The share sheet, the browser, a forwarded email.
      </>,
      <>
        <strong>Find by a word you remember.</strong> Full-text search of every saved page.
      </>,
      <>
        <strong>Read later, everywhere.</strong> Your list on the phone, the laptop and offline.
      </>,
    ],
    actions: (
      <>
        <Button size="xl">Start for free</Button>
        <Button size="xl" appearance="outlined" tone="secondary">
          See pricing
        </Button>
      </>
    ),
    note: 'Free for one person. Mac, Windows, iPhone, Android.',
    media: <BookmarksPreview />,
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { level: 1, name: 'Bookmarks' })).toBeInTheDocument();
    await expect(within(canvasElement.querySelector('[data-slot=hero-points]') as HTMLElement).getAllByRole('listitem')).toHaveLength(3);
  },
};

/**
 * A first screen on a bright gradient, edge to edge: SectionPanel
 * tone="gradient" shape="bleed" on Ember, whose canvas has dark ink (profile
 * `gradient.ink`). The title is display type in Ember's display face
 * (Playfair Display 900). The phone screen keeps the theme's own surface.
 */
export const OnBrightGradient: Story = {
  parameters: { layout: 'fullscreen', globals: { brand: 'ember' } },
  render: () => (
    <SectionPanel tone="gradient" shape="bleed" padding="none">
      <Hero
        layout="split"
        eyebrow="Recipes for recovery"
        title="Mealwise"
        titleSize="display"
        subtitle="What to eat after surgery, in one app, planned for every stage."
        points={[
          <>
            <strong>Three stages.</strong> The menu grows with you, week by week.
          </>,
          <>
            <strong>Clinical guidance.</strong> Portions and textures follow published diets.
          </>,
          <>
            <strong>Grams and steps.</strong> Every recipe weighed and timed.
          </>,
        ]}
        actions={<StoreButtons appStore="#app-store" googlePlay="#google-play" />}
        note="Talk to your care team before changing what you eat."
        media={
          <DeviceFrame className="mx-auto w-[280px]">
            <div className="flex h-full flex-col gap-3 px-4 pb-4 pt-12">
              <p className="m-0 font-body text-body-s text-[var(--color-text-text-subtle)]">Stage 2 · Expanding</p>
              <p className="m-0 font-heading text-heading-m">Today</p>
              {['Oat porridge with banana', 'Soft white fish, mashed potato', 'Rice pudding'].map((dish, i) => (
                <div key={dish} className="rounded-[var(--size-border-radius-border-radius-xl)] bg-[var(--color-bg-surface-bg-surface)] p-3 shadow-elevation-xs">
                  <p className="m-0 font-body text-body-xs text-[var(--color-text-text-subtle)]">{['Breakfast', 'Lunch', 'Dessert'][i]}</p>
                  <p className="m-0 font-body text-body-s font-semibold">{dish}</p>
                </div>
              ))}
            </div>
          </DeviceFrame>
        }
      />
    </SectionPanel>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { level: 1, name: 'Mealwise' })).toBeInTheDocument();
    // The title takes the canvas's ink (dark on Ember, white on the dark gradient themes).
    const canvas = canvasElement.querySelector('[data-canvas=gradient]') as HTMLElement;
    await expect(getComputedStyle(c.getByRole('heading', { level: 1 })).color).toBe(getComputedStyle(canvas).color);
  },
};
