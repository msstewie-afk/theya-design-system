import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { ArrowRight } from 'iconoir-react';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Hero, HeroAccent } from './hero';
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

/** Two lines, two faces: a Geologica statement and a serif italic answer. The product below. */
export const Centered: Story = {
  args: {
    layout: 'centered',
    title: (
      <>
        Save what you read.
        <HeroAccent variant="serif" line>
          Find it in a keystroke.
        </HeroAccent>
      </>
    ),
    media: <BookmarksPreview className="mx-auto max-w-[60rem]" />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 1, name: 'Save what you read. Find it in a keystroke.' })).toBeVisible();
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
    await userEvent.click(canvas.getByRole('tab', { name: 'Recipes' }));
    await expect(canvas.getByRole('img', { name: /Recipes folder/ })).toBeVisible();
  },
};

/** A serif title with an italic accent — the editorial look (Wispr, Granola). */
export const SerifTitle: Story = {
  name: 'Serif title',
  args: {
    layout: 'centered',
    titleFont: 'serif',
    title: (
      <>
        Don’t hoard tabs, <HeroAccent variant="italic">keep what matters.</HeroAccent>
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
        <ArrowRight className="size-4" />
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
