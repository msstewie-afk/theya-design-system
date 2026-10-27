import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { ArrowRight } from 'iconoir-react';
import { Button } from '../../ui/button';
import { BookmarksPreview, DemoLogos } from './demo-data';
import { Hero, HeroAccent } from './hero';
import { LogoStrip } from './logo-strip';
import { logoStripGuidelines } from './logo-strip.guidelines';
import { SectionPanel } from './section-panel';

const meta: Meta<typeof LogoStrip> = {
  title: 'Patterns: Landing/LogoStrip',
  component: LogoStrip,
  tags: ['autodocs'],
  parameters: {
    guidelines: logoStripGuidelines,
    layout: 'fullscreen',
  },
  argTypes: {
    motion: { control: 'inline-radio', options: ['marquee', 'static'] },
    duration: { control: 'number' },
    children: { control: false },
  },
  args: {
    label: 'Readers at more than 2,000 teams keep their links here',
    motion: 'marquee',
    duration: 40,
  },
};
export default meta;
type Story = StoryObj<typeof LogoStrip>;

/** Nine logos looping on the page surface, with the pause button at the end. */
export const Marquee: Story = {
  render: (args) => (
    <LogoStrip {...args}>
      <DemoLogos />
    </LogoStrip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: /Readers at more than 2,000 teams/ })).toBeInTheDocument();
    // Each logo is met once by assistive tech (the looping copy is hidden).
    await expect(canvas.getAllByText('Northwind', { ignore: '[aria-hidden="true"] *' })).toHaveLength(1);
    const pause = canvas.queryByRole('button', { name: 'Pause animation' });
    if (!pause) return; // hidden under prefers-reduced-motion: nothing moves
    await userEvent.click(pause);
    await expect(canvas.getByRole('button', { name: 'Play animation' })).toBeInTheDocument();
  },
};

/** Five logos in one centred row: nothing moves, nothing to pause. */
export const Static: Story = {
  args: { motion: 'static', label: 'Trusted by teams at' },
  render: (args) => (
    <LogoStrip {...args}>
      <DemoLogos count={5} />
    </LogoStrip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};

/**
 * The Wispr pattern: the hero on the page, then the logos on a dark band
 * laid over its end. SectionPanel tone="inverse" carries the dark theme;
 * the strip itself has no dark variant.
 */
export const DarkBandAfterHero: Story = {
  name: 'Dark band after the hero',
  render: (args) => (
    <div className="bg-[var(--color-bg-surface-bg-surface)]">
      <Hero
        eyebrow="Bookmarks"
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
        media={<BookmarksPreview className="mx-auto max-w-[60rem]" />}
      />
      <SectionPanel tone="inverse" overlap padding="none">
        <LogoStrip {...args}>
          <DemoLogos />
        </LogoStrip>
      </SectionPanel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const strip = canvas.getByRole('region', { name: /Readers at more than 2,000 teams/ });
    await expect(strip.closest('[data-theme="dark"]')).not.toBeNull();
  },
};
