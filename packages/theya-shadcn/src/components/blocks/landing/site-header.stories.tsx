import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { ArrowRight } from 'iconoir-react';
import { Button } from '../../ui/button';
import { MegaMenu } from '../navigation/mega-menu';
import { BookmarksPreview, DEMO_LANDING_MENU, DemoLogos, DemoProductLogo } from './demo-data';
import { Hero, HeroAccent } from './hero';
import { LogoStrip } from './logo-strip';
import { SectionPanel } from './section-panel';
import { SiteHeader } from './site-header';
import { siteHeaderGuidelines } from './site-header.guidelines';

const meta: Meta<typeof SiteHeader> = {
  title: 'Patterns: Landing/SiteHeader',
  component: SiteHeader,
  tags: ['autodocs'],
  parameters: {
    guidelines: siteHeaderGuidelines,
    layout: 'fullscreen',
    // Same known false positive as MegaMenu: Radix's hidden focus proxy.
    a11y: { config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] } },
  },
  argTypes: { logo: { control: false }, nav: { control: false }, actions: { control: false } },
  args: {
    logo: <DemoProductLogo />,
    nav: <MegaMenu items={DEMO_LANDING_MENU} drawerTrigger="icon" />,
    actions: (
      <>
        <Button appearance="ghost" tone="neutral" className="max-sm:hidden">
          Log in
        </Button>
        <Button>Get started</Button>
      </>
    ),
    skipToId: 'main',
  },
};
export default meta;
type Story = StoryObj<typeof SiteHeader>;

/** The bar alone: logo, the navigation (panels from md up), "Log in" and the main action. */
export const Default: Story = {
  render: (args) => (
    <div className="min-h-[34rem]">
      <SiteHeader {...args} />
      <main id="main" tabIndex={-1} className="container-display py-16 outline-none">
        <p className="m-0 font-body text-body-m text-[var(--color-text-text-subtle)]">Page content</p>
      </main>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('banner')).toBeInTheDocument();
    // The skip link is the first Tab stop and points at the main content.
    await userEvent.tab();
    const skip = canvas.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toHaveFocus();
    await expect(skip).toHaveAttribute('href', '#main');
    // While focused it sits over the logo; the next Tab moves on and it slides away.
    await userEvent.tab();
    await expect(skip).not.toHaveFocus();
  },
};

/**
 * The top of a whole landing page: the bar over the hero, then the logo band.
 * Scroll it: the bar is transparent over the hero and takes the surface color
 * with a hairline once the page moves.
 */
export const OnTheLandingPage: Story = {
  name: 'On the landing page',
  render: (args) => (
    <div className="bg-[var(--color-bg-surface-bg-surface)]">
      <SiteHeader {...args} />
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
            <Button size="2xl" rightIcon={<ArrowRight />}>
              Get started free
            </Button>
          }
          note="Chrome, Firefox, Safari and Edge · Free for up to 1,000 links"
          media={<BookmarksPreview className="mx-auto max-w-[60rem]" />}
        />
        <SectionPanel tone="inverse" overlap padding="none">
          <LogoStrip label="Readers at more than 2,000 teams keep their links here">
            <DemoLogos />
          </LogoStrip>
        </SectionPanel>
        <div className="h-[60rem]" aria-hidden />
      </main>
    </div>
  ),
};
