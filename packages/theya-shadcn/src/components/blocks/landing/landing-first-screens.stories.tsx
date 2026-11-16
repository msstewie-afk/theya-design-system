import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { ArrowRight, ArrowUpRight } from 'iconoir-react';
import { Button } from '../../ui/button';
import { HeroTexture } from './hero-texture';
import { Wordmark } from './wordmark';

/**
 * The eight first screens of the Awwwards 2026 atlas (project doc
 * landing-trends-2026-11-15 and the "Awwwards 2026 Landing Atlas" artifact,
 * ld-02), each its own composition with its own type pair and grid, built
 * from Theya tokens and blocks. Brands are invented. Each screen fills the
 * viewport; text never waits for motion.
 */
const meta: Meta = {
  title: 'Patterns: Landing/First screens',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

const hasOneH1: Story['play'] = async ({ canvasElement }) => {
  await expect(within(canvasElement).getAllByRole('heading', { level: 1 })).toHaveLength(1);
};

/* ------------------------------------------------------------------------ */

const NORDHALL_NAV = ['Houses', 'Public', 'Interiors', 'Process', 'Studio', 'Journal', 'Contact'];

/**
 * 01 · Wordmark across the width (SANTAL, FORMAT, Oryzo). An 8-column grid
 * with a 1.1vw gutter: meta in mono along the top, the name in Archivo at
 * 72% width cut at the top edge, a hairline, the menu one item per column
 * with its number, and an empty field with one calm line at the bottom.
 */
export const Wordmark01: Story = {
  name: '01 · Wordmark across the width',
  render: () => (
    <div className="flex min-h-svh flex-col bg-[var(--color-bg-surface-bg-surface)] px-[1.1vw] text-[var(--color-text-text)]">
      <div className="grid grid-cols-4 gap-x-[1.1vw] py-3 caption-mono text-[var(--color-text-text-subtle)] md:grid-cols-8">
        <span>Nordhall</span>
        <span className="max-md:hidden">Architecture</span>
        <span className="md:col-start-5">Oslo — Sofia</span>
        <span className="max-md:hidden">59.91° N</span>
        <span className="text-end md:col-start-8">Est. 2011</span>
      </div>
      <Wordmark as="h1" crop="top" textClassName="font-display-wide [font-stretch:72%] font-[800] tracking-[-0.03em]">
        Nordhall
      </Wordmark>
      <nav aria-label="Main" className="border-t border-solid border-[var(--color-text-text)]">
        <ol className="m-0 grid list-none grid-cols-2 gap-x-[1.1vw] p-0 pt-2 sm:grid-cols-4 md:grid-cols-8">
          {NORDHALL_NAV.map((item, i) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase()}`}
                className="flex gap-2 py-1 font-body text-body-s font-medium text-[var(--color-text-text)] no-underline hover:text-[var(--color-text-text-subtle)]"
              >
                <span>{item}</span>
                <span aria-hidden className="caption-mono text-[var(--color-text-text-subtle)]">
                  {i + 1}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="mt-auto grid grid-cols-4 items-end gap-x-[1.1vw] gap-y-6 pb-[1.1vw] pt-24 md:grid-cols-8">
        <p className="col-span-4 m-0 max-w-[20ch] font-display-tight text-[clamp(28px,3.4vw,52px)] font-[600] leading-[1.02] tracking-[-0.035em] md:col-span-3">
          Houses that age with the people in them
        </p>
        <img src="/asset-examples/silk/3-square-dark.webp" alt="" className="col-span-2 aspect-[4/5] w-full object-cover md:col-span-1 md:col-start-8" />
      </div>
    </div>
  ),
  play: hasOneH1,
};

/* ------------------------------------------------------------------------ */

/**
 * 06 · Centered, with a change of face (ERA Residence, Extrafazant). A
 * Didone in caps set narrow and tight (Bodoni Moda, line-height 0.87,
 * −0.03em), one word in a script laid over the line, a wide grotesque in
 * small caps for the caption, one action, and a band of image at the foot.
 */
export const CenterTypeSwitch: Story = {
  name: '06 · Centered, change of face',
  render: () => (
    <div className="flex min-h-svh flex-col bg-[var(--color-bg-surface-bg-surface-sunken)] text-[var(--color-text-text)]">
      <header className="grid grid-cols-3 items-center px-[var(--display-gutter)] py-4">
        <span className="font-display-wide text-[13px] font-[600] uppercase tracking-[0.12em] [font-stretch:125%]">ERA</span>
        <nav aria-label="Main" className="justify-self-center max-sm:hidden">
          <ul className="m-0 flex list-none gap-6 p-0">
            {['Residences', 'Place', 'Journal'].map((l) => (
              <li key={l}>
                <a
                  href={`#${l.toLowerCase()}`}
                  className="font-display-wide text-[12px] font-[500] uppercase tracking-[0.12em] text-[var(--color-text-text)] no-underline [font-stretch:115%] hover:text-[var(--color-text-text-subtle)]"
                >
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <Button size="sm" appearance="outlined" tone="neutral" className="justify-self-end">
          Enquire
        </Button>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-[var(--display-gutter)] py-16 text-center">
        <p className="m-0 caption-mono text-[var(--color-text-text-subtle)]">Lisbon · 32 residences · 2027</p>
        <h1 className="m-0 font-display-didone text-[clamp(52px,10.5vw,160px)] font-[400] uppercase leading-[0.87] tracking-[-0.03em]">
          The coast
          <br />
          you wanted{' '}
          <span className="relative inline-block font-display-script text-[0.62em] text-[var(--color-text-text-link)] [transform:translateY(-0.08em)]">
            yours
          </span>
        </h1>
        <p className="m-0 font-display-wide text-[12px] font-[500] uppercase leading-[1.5] tracking-[0.14em] text-[var(--color-text-text-subtle)] [font-stretch:125%]">
          Thirty-two homes above the Atlantic
        </p>
        <Button size="xl" rightIcon={<ArrowRight />}>
          See the residences
        </Button>
      </div>
      <img src="/asset-examples/silk/6-dark.webp" alt="" className="h-[26svh] w-full object-cover" />
    </div>
  ),
  play: hasOneH1,
};

/* ------------------------------------------------------------------------ */

/**
 * 04 · Swiss bento on hairlines (Aspen Search, Heron AI). Panels without
 * radius or shadow, divided by 1px lines (the grid's gap over a line
 * color): a large statement, a dithered field, one black panel with a
 * number and a mono action, one panel in the brand color.
 */
export const SwissBento: Story = {
  name: '04 · Swiss bento on hairlines',
  render: () => (
    <div className="grid min-h-svh grid-cols-1 gap-px bg-[var(--color-border-border)] text-[var(--color-text-text)] lg:grid-cols-4 lg:grid-rows-[auto_1fr_1fr]">
      <header className="flex items-center justify-between bg-[var(--color-bg-surface-bg-surface)] px-5 py-3 lg:col-span-4">
        <span className="font-display-tight text-[20px] font-[700] tracking-[-0.03em]">aspen</span>
        <nav aria-label="Main">
          <ul className="m-0 flex list-none gap-6 p-0">
            {['Product', 'Research', 'Pricing'].map((l, i) => (
              <li key={l} className="max-sm:[&:not(:last-child)]:hidden">
                <a href={`#${l.toLowerCase()}`} className="caption-mono text-[var(--color-text-text)] no-underline hover:text-[var(--color-text-text-subtle)]">
                  {String(i + 1).padStart(2, '0')} {l}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <section
        aria-labelledby="aspen-title"
        className="flex flex-col justify-between gap-10 bg-[var(--color-bg-surface-bg-surface)] p-5 lg:col-span-2 lg:row-span-2 lg:p-8"
      >
        <p className="m-0 caption-mono text-[var(--color-text-text-subtle)]">Fig. 00 — Search</p>
        <div className="flex flex-col gap-6">
          <h1 id="aspen-title" className="m-0 max-w-[13ch] font-display-tight text-[clamp(44px,6.2vw,96px)] font-[600] leading-[0.98] tracking-[-0.045em]">
            Search that reads the way you think
          </h1>
          <p className="m-0 max-w-[40ch] font-body text-body-l text-[var(--color-text-text-subtle)]">
            Ask in a sentence. Aspen reads every document your team keeps and answers with the passage, not a list of links.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="xl">Request access</Button>
            <Button size="xl" appearance="outlined" tone="neutral">
              Read the paper
            </Button>
          </div>
        </div>
      </section>
      <div className="relative min-h-64 overflow-hidden bg-[var(--color-bg-surface-bg-surface)] lg:col-span-2">
        <HeroTexture variant="dither" focus={{ x: 62, y: 44 }} cell={3} className="opacity-90 text-[var(--color-text-text)]" />
        <p className="absolute bottom-3 left-5 m-0 caption-mono text-[var(--color-text-text-subtle)]">Fig. 01 — A query, 2.4M passages</p>
      </div>
      <div
        data-theme="dark"
        className="flex flex-col justify-between gap-6 bg-[var(--color-bg-surface-bg-surface)] p-5 text-[var(--color-text-text)] [color-scheme:dark] lg:p-8"
      >
        <p className="m-0 caption-mono text-[var(--color-text-text-subtle)]">Median answer</p>
        <p className="m-0 font-display-tight text-[clamp(56px,6vw,96px)] font-[500] leading-[0.9] tracking-[-0.06em]">0.3 s</p>
        <a href="#try" className="caption-mono flex items-center gap-2 text-[var(--color-text-text)] no-underline hover:text-[var(--color-text-text-subtle)]">
          Try a query <ArrowUpRight className="size-3.5" aria-hidden />
        </a>
      </div>
      <div className="flex flex-col justify-between gap-6 bg-[var(--color-bg-primary-bg-primary)] p-5 text-[var(--color-text-text-on-primary)] lg:p-8">
        <p className="m-0 caption-mono">Private by default</p>
        <p className="m-0 font-display-tight text-[clamp(24px,2.2vw,32px)] font-[500] leading-[1.1] tracking-[-0.03em]">
          Your documents never train a model. They stay in your region.
        </p>
      </div>
    </div>
  ),
  play: hasOneH1,
};
