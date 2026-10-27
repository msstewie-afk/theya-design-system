import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { ArrowRight } from 'iconoir-react';
import { Button } from '../../ui/button';
import { Link } from '../../ui/link';
import { MegaMenu } from '../navigation/mega-menu';
import { SiteFooter } from '../navigation/site-footer';
import { BookmarksLiveDemo } from './bookmarks-live-demo';
import { BookmarksPreview, DEMO_FEATURES, DEMO_LANDING_FOOTER, DEMO_LANDING_MENU, DemoFeatureVisual, DemoLogos, DemoProductLogo } from './demo-data';
import { FeatureShowcase } from './feature-showcase';
import { FeatureSplit } from './feature-split';
import { Hero, HeroAccent } from './hero';
import { LogoStrip } from './logo-strip';
import { SectionPanel } from './section-panel';
import { SiteHeader } from './site-header';

/**
 * The landing blocks put together as one page: a template to start a
 * product site from. Every section is a Theya block; the visuals are the
 * product built from Theya components, so the page follows the theme and
 * density and never goes stale like a screenshot.
 */
const meta: Meta = {
  title: 'Patterns: Landing/Landing page',
  parameters: {
    layout: 'fullscreen',
    // Same known false positive as MegaMenu: Radix's hidden focus proxy.
    a11y: { config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] } },
  },
};
export default meta;
type Story = StoryObj;

const learnMore = (href: string) => (
  <Link href={href} className="inline-flex items-center gap-1 font-medium">
    Learn more
    <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
  </Link>
);

/** Header, hero, logo band, features, a call to action and the footer. */
export const Bookmarks: Story = {
  render: () => (
    <div className="bg-[var(--color-bg-surface-bg-surface)]">
      <SiteHeader
        skipToId="main"
        logo={<DemoProductLogo />}
        nav={<MegaMenu items={DEMO_LANDING_MENU} drawerTrigger="icon" />}
        actions={
          <>
            <Button appearance="ghost" tone="neutral" className="max-sm:hidden">
              Log in
            </Button>
            <Button>Get started</Button>
          </>
        }
      />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero
          className="pt-12 lg:pt-16"
          title={
            <>
              Save what you read,
              <HeroAccent variant="serif" line>
                find it again
              </HeroAccent>
            </>
          }
          description="Import from any browser, sort into folders, and find any page again in a keystroke."
          actions={
            <>
              <Button size="2xl" rightIcon={<ArrowRight />}>
                Get started free
              </Button>
              <Button size="2xl" appearance="outlined">
                See how it works
              </Button>
            </>
          }
          note="Chrome, Firefox, Safari and Edge · Free for up to 1,000 links"
          media={<BookmarksPreview className="mx-auto max-w-[60rem]" />}
        />
        <SectionPanel tone="inverse" overlap padding="none">
          <LogoStrip label="Readers at more than 2,000 teams keep their links here">
            <DemoLogos />
          </LogoStrip>
        </SectionPanel>
        <FeatureShowcase
          variant="accordion"
          eyebrow="Features"
          title="Everything you saved, in order"
          description="Four things that keep a collection of thousands of links usable."
          items={DEMO_FEATURES.map((f) => ({ id: f.id, title: f.title, description: f.description, media: <DemoFeatureVisual id={f.id} /> }))}
        />
        <FeatureSplit
          layout="side"
          eyebrow="Search"
          title={DEMO_FEATURES[2].title}
          description={DEMO_FEATURES[2].description}
          link={learnMore('#search')}
          media={<BookmarksLiveDemo />}
        />
        <SectionPanel tone="primary" aria-labelledby="cta-title">
          <div className="container-display flex flex-col items-center gap-8 text-center">
            <h2 id="cta-title" className="m-0 max-w-[60rem] text-balance font-heading text-heading-3xl">
              Your reading list, finally in one place
            </h2>
            <Button size="2xl" rightIcon={<ArrowRight />}>
              Get started free
            </Button>
          </div>
        </SectionPanel>
      </main>
      <SiteFooter
        appName="Bookmarks"
        logo={<DemoProductLogo />}
        tagline="A calm home for everything you meant to read."
        columns={DEMO_LANDING_FOOTER}
        social={[
          { network: 'github', href: '#github' },
          { network: 'x', href: '#x' },
        ]}
        legal={[
          { label: 'Terms', href: '#terms' },
          { label: 'Privacy', href: '#privacy' },
        ]}
        year={2026}
        className="border-t-0"
        contentClassName="container-display"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // One h1 (the hero), landmarks in order: banner, main, contentinfo.
    await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    await expect(canvas.getByRole('banner')).toBeInTheDocument();
    await expect(canvas.getByRole('main')).toBeInTheDocument();
    await expect(canvas.getByRole('contentinfo')).toBeInTheDocument();
  },
};
