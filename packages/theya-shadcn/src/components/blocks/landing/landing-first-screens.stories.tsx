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
 *
 * Brand names are invented (Nordhall, Maré, Sift, Daybook, Ferro, Verdeal, Larkfield);
 * the sites they follow are listed only in the project docs. Webflow references for each: claude/landing-references-webflow.md.
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
 * 01 · Wordmark across the width. An 8-column grid
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
 * 06 · Centered, with a change of face. A
 * Didone in caps set narrow and tight (Bodoni Moda, line-height 0.87,
 * −0.03em), one word in a script laid over the line, a wide grotesque in
 * small caps for the caption, one action, and a band of image at the foot.
 */
export const CenterTypeSwitch: Story = {
  name: '06 · Centered, change of face',
  render: () => (
    <div className="flex min-h-svh flex-col bg-[var(--color-bg-surface-bg-surface-sunken)] text-[var(--color-text-text)]">
      <header className="grid grid-cols-3 items-center px-[var(--display-gutter)] py-4">
        <span className="font-display-wide text-[13px] font-[600] uppercase tracking-[0.12em] [font-stretch:125%]">Maré</span>
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
 * 04 · Swiss bento on hairlines. Panels without
 * radius or shadow, divided by 1px lines (the grid's gap over a line
 * color): a large statement, a dithered field, one black panel with a
 * number and a mono action, one panel in the brand color.
 */
export const SwissBento: Story = {
  name: '04 · Swiss bento on hairlines',
  render: () => (
    <div className="grid min-h-svh grid-cols-1 gap-px bg-[var(--color-border-border)] text-[var(--color-text-text)] lg:grid-cols-4 lg:grid-rows-[auto_1fr_1fr]">
      <header className="flex items-center justify-between bg-[var(--color-bg-surface-bg-surface)] px-5 py-3 lg:col-span-4">
        <span className="font-display-tight text-[20px] font-[700] tracking-[-0.03em]">sift</span>
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
        aria-labelledby="sift-title"
        className="flex flex-col justify-between gap-10 bg-[var(--color-bg-surface-bg-surface)] p-5 lg:col-span-2 lg:row-span-2 lg:p-8"
      >
        <p className="m-0 caption-mono text-[var(--color-text-text-subtle)]">Fig. 00 — Search</p>
        <div className="flex flex-col gap-6">
          <h1 id="sift-title" className="m-0 max-w-[13ch] font-display-tight text-[clamp(44px,6.2vw,96px)] font-[600] leading-[0.98] tracking-[-0.045em]">
            Search that reads the way you think
          </h1>
          <p className="m-0 max-w-[40ch] font-body text-body-l text-[var(--color-text-text-subtle)]">
            Ask in a sentence. Sift reads every document your team keeps and answers with the passage, not a list of links.
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

/* ------------------------------------------------------------------------ */

const NOHO_TILES = [
  { bg: 'bg-[var(--color-bg-primary-bg-primary-subtle)]', img: '/asset-examples/silk/1-square.webp', offset: '' },
  { bg: 'bg-[var(--color-bg-warning-bg-warning-subtle)]', img: '/asset-examples/silk/4-square.webp', offset: 'sm:translate-y-[50%]' },
  { bg: 'bg-[var(--color-bg-success-bg-success-subtle)]', img: '/asset-examples/silk/5-square.webp', offset: '' },
  { bg: 'bg-[var(--color-bg-danger-bg-danger-subtle)]', img: '/asset-examples/silk/6-square.webp', offset: 'sm:translate-y-[50%]' },
  { bg: 'bg-[var(--color-bg-neutral-bg-neutral-subtle)]', img: '/asset-examples/silk/3-square.webp', offset: '' },
  { bg: 'bg-[var(--color-bg-primary-bg-primary-subtle)]', img: '/asset-examples/silk/2-square.webp', offset: 'sm:translate-y-[50%]' },
];

/**
 * 03 · Split: a phrase and a mosaic (the restrained reference). Two
 * columns: on the left a sentence in Inter Tight 600 at line-height 1.0 and
 * −0.04em with a caption at the foot, sticky while the right column, a
 * stepped mosaic of square pictures each on its own colored ground, runs
 * past it.
 */
export const SplitMosaic: Story = {
  name: '03 · Split, phrase and mosaic',
  render: () => (
    <div className="grid bg-[var(--color-bg-surface-bg-surface)] text-[var(--color-text-text)] md:grid-cols-2">
      <div className="flex flex-col justify-between gap-12 p-[var(--display-gutter)] md:sticky md:top-0 md:h-svh">
        <div className="flex items-center justify-between">
          <span className="font-display-tight text-[22px] font-[700] tracking-[-0.04em]">daybook</span>
          <Button size="sm" appearance="outlined" tone="neutral">
            Get the app
          </Button>
        </div>
        <h1 className="m-0 max-w-[12ch] font-display-tight text-[clamp(40px,4.4vw,64px)] font-[600] leading-[1] tracking-[-0.04em]">
          Notes that keep the shape of your day
        </h1>
        <div className="flex flex-col gap-6">
          <p className="m-0 max-w-[34ch] font-body text-body-l text-[var(--color-text-text-subtle)]">
            Write, sketch and file in one place. Daybook sorts your pages by the day they belong to.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="xl">Download for iPhone</Button>
            <span className="caption-mono text-[var(--color-text-text-subtle)]">Free · iOS 18+</span>
          </div>
        </div>
      </div>
      <ul
        aria-label="Daybook, pictures of the app"
        className="m-0 grid list-none grid-cols-2 gap-3 p-[var(--display-gutter)] pb-[calc(var(--display-gutter)+25%)] md:pt-[20svh]"
      >
        {NOHO_TILES.map((t, i) => (
          <li key={i} className={`${t.bg} ${t.offset} aspect-square p-[12%]`}>
            <img src={t.img} alt="" className="size-full object-cover" />
          </li>
        ))}
      </ul>
    </div>
  ),
  play: hasOneH1,
};

/* ------------------------------------------------------------------------ */

/**
 * 05 · Manifesto across the measure. Mono navigation
 * in six columns under a hairline with the local time, then one statement
 * in caps justified to both edges (text-align-last too), Archivo at 78%
 * width, its key words switching to 800 at 118% width.
 */
export const Manifesto: Story = {
  name: '05 · Manifesto across the measure',
  render: () => (
    <div className="flex min-h-svh flex-col bg-[var(--color-bg-surface-bg-surface)] px-[var(--display-gutter)] text-[var(--color-text-text)]">
      <nav aria-label="Main" className="border-b border-solid border-[var(--color-text-text)] py-3">
        <ul className="m-0 grid list-none grid-cols-3 gap-x-5 gap-y-1 p-0 md:grid-cols-6">
          {['Ferro', 'Work', 'Studio', 'Process', 'Contact'].map((l, i) => (
            <li key={l}>
              <a href={`#${l.toLowerCase()}`} className="caption-mono text-[var(--color-text-text)] no-underline hover:text-[var(--color-text-text-subtle)]">
                {i === 0 ? '●' : `0${i}`} {l}
              </a>
            </li>
          ))}
          <li className="caption-mono text-[var(--color-text-text-subtle)] md:text-end">
            <time dateTime="18:42">Sofia 18:42</time>
          </li>
        </ul>
      </nav>
      <div className="flex flex-1 items-center py-16">
        <h1 className="m-0 w-full font-display-wide text-[clamp(26px,5vw,76px)] font-[400] uppercase leading-[0.98] tracking-[-0.01em] [font-stretch:78%] [text-align-last:justify] [text-align:justify] [hyphens:none]">
          ● Ferro is an <b className="font-[800] [font-stretch:118%]">independent</b> interface &amp; experience{' '}
          <b className="font-[800] [font-stretch:118%]">design studio</b> crafting digital products for people who read the small print
        </h1>
      </div>
      <div className="flex flex-col items-center gap-1 pb-[var(--display-gutter)] text-center">
        <p className="m-0 caption-mono text-[var(--color-text-text-subtle)]">Available from March 2027</p>
        <a href="#contact" className="caption-mono text-[var(--color-text-text)] no-underline hover:text-[var(--color-text-text-subtle)]">
          hello@ferro.studio
        </a>
      </div>
    </div>
  ),
  play: hasOneH1,
};

/* ------------------------------------------------------------------------ */

const FLOEMA_ITEMS = [
  { x: 22, y: 14, w: 9, img: '1-portrait' },
  { x: 47, y: 8, w: 7, img: '3-square' },
  { x: 72, y: 20, w: 8, img: '5-portrait' },
  { x: 8, y: 42, w: 10, img: '6-square' },
  { x: 37, y: 48, w: 8, img: '2-square' },
  { x: 61, y: 42, w: 9, img: '4-portrait' },
  { x: 85, y: 52, w: 8, img: '6-portrait' },
  { x: 2, y: 74, w: 9, img: '5-square' },
  { x: 26, y: 78, w: 7, img: '4-square' },
  { x: 52, y: 76, w: 9, img: '1-square-dark' },
];

/**
 * 07 · Collage field. Small product pictures scattered over a light
 * field at different sizes, the navigation a single pill, and a modest
 * title (≈4.6vw, Inter Tight 400) below the field rather than over it.
 */
export const CollageField: Story = {
  name: '07 · Collage field',
  render: () => (
    <div className="bg-[var(--color-bg-surface-bg-surface-sunken)] text-[var(--color-text-text)]">
      <header className="flex items-center justify-between px-[var(--display-gutter)] py-4">
        <span className="font-display-tight text-[18px] font-[600] tracking-[-0.02em]">Verdeal</span>
        <nav
          aria-label="Main"
          className="rounded-full border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] px-2 py-1"
        >
          <ul className="m-0 flex list-none gap-1 p-0">
            {['Shop', 'Rituals', 'About'].map((l) => (
              <li key={l}>
                <Button size="sm" appearance="ghost" tone="neutral">
                  {l}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <ul aria-label="Verdeal products" className="relative m-0 h-[78svh] list-none overflow-hidden p-0">
        {FLOEMA_ITEMS.map((it) => (
          <li key={it.img} className="absolute" style={{ left: `${it.x}%`, top: `${it.y}%`, width: `max(${it.w}vw, 64px)` }}>
            <img src={`/asset-examples/silk/${it.img}.webp`} alt="" className="block w-full object-cover" />
          </li>
        ))}
      </ul>
      <div className="grid gap-6 px-[var(--display-gutter)] pb-[var(--display-gutter)] pt-10 md:grid-cols-[2fr_1fr] md:items-end">
        <h1 className="m-0 max-w-[16ch] font-display-tight text-[clamp(32px,4.6vw,68px)] font-[400] leading-[1.05] tracking-[-0.04em]">
          Skin care grown slowly, in small batches
        </h1>
        <div className="flex flex-col items-start gap-4">
          <p className="m-0 font-body text-body-m text-[var(--color-text-text-subtle)]">Nine products, each from one plant. Made to order in Porto.</p>
          <Button size="xl" appearance="outlined" tone="neutral" rightIcon={<ArrowRight />}>
            Shop the field
          </Button>
        </div>
      </div>
    </div>
  ),
  play: hasOneH1,
};

/* ------------------------------------------------------------------------ */

const LF2_SPECS = [
  { number: '01', label: 'Span', value: '1 240 mm', x: 72, y: 44, leader: 'M88 44H102' },
  { number: '02', label: 'Weight', value: '3.9 kg', x: 56, y: 208, leader: 'M72 208H198L280 184' },
  { number: '03', label: 'Flight time', value: '52 min', x: 398, y: 92, leader: 'M382 92H362L340 142' },
  { number: '04', label: 'LiDAR', value: '240 000 pts/s', x: 390, y: 314, leader: 'M374 314H346L328 244' },
  { number: '05', label: 'Accuracy', value: '±2 cm', x: 56, y: 332, leader: 'M72 332H244L310 244' },
];

const LF2_NAV = [
  { label: 'Product', href: '#lf2-product' },
  { label: 'Field data', href: '#lf2-field-data' },
  { label: 'Specs', href: '#lf2-specs' },
  { label: 'Contact', href: 'mailto:hello@larkfield.example' },
];

/**
 * 08 · Technical drawing. A 12-column grid pairs a five-column Inter Tight
 * title with a seven-column orthographic drawing of the product on a 24px
 * measured grid: sheet labels on top, two dimensions, five numbered
 * callouts, and from lg up the spec table set as the drawing's title block
 * under it (rows on phones). Mono carries the navigation, callouts and
 * values; one dimension and its callout are in the link color. Units stay
 * lowercase (mm, kg, cm): the mono caption is caps, so values opt out.
 */
export const TechnicalDrawing08: Story = {
  name: '08 · Technical drawing',
  render: () => (
    <div className="flex min-h-svh flex-col bg-[var(--color-bg-surface-bg-surface)] px-5 text-[var(--color-text-text)] lg:px-8">
      <header className="mx-auto flex w-full max-w-[1440px] items-center justify-between border-b border-solid border-[var(--color-border-border-subtle)] py-4 lg:grid lg:grid-cols-12 lg:gap-6">
        <span className="font-display-tight text-[24px] font-[700] leading-none tracking-[-0.04em] lg:col-span-5">larkfield</span>
        <nav aria-label="Main" className="lg:col-span-7 lg:justify-self-end">
          <ul className="m-0 flex list-none gap-6 p-0">
            {LF2_NAV.map(({ label, href }, i) => (
              <li key={label} className="max-sm:[&:not(:last-child)]:hidden">
                <a href={href} className="caption-mono text-[var(--color-text-text)] no-underline hover:text-[var(--color-text-text-subtle)]">
                  {String(i + 1).padStart(2, '0')} {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <div className="mx-auto grid w-full max-w-[1440px] flex-1 content-center gap-6 py-6 lg:grid-cols-12 lg:items-center lg:py-8">
        <section id="lf2-product" aria-labelledby="lf2-title" className="flex min-w-0 flex-col items-start gap-6 lg:col-span-5">
          <p className="m-0 caption-mono text-[var(--color-text-text-subtle)]">Fig. 00 — LF-2 survey drone</p>
          <h1 id="lf2-title" className="m-0 max-w-[13ch] font-display-tight text-[clamp(44px,6vw,96px)] font-[600] leading-[0.98] tracking-[-0.04em]">
            Map the ground in detail
          </h1>
          <p className="m-0 max-w-[40ch] font-body text-body-l text-[var(--color-text-text-subtle)]">
            The Larkfield LF-2 is a LiDAR survey drone that captures terrain and structures as 3D point clouds for field mapping.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="xl">
              <a href="#lf2-specs">View specs</a>
            </Button>
            <Button asChild size="xl" appearance="outlined" tone="neutral">
              <a href="mailto:hello@larkfield.example">Contact sales</a>
            </Button>
          </div>
        </section>
        <div className="grid min-w-0 lg:col-span-7">
          <figure
            id="lf2-field-data"
            className="m-0 border border-solid border-[var(--color-border-border-subtle)] [background-image:linear-gradient(to_right,var(--color-border-border-subtler)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border-border-subtler)_1px,transparent_1px)] bg-[length:24px_24px]"
          >
            <div className="flex justify-between gap-4 px-3 py-2 caption-mono text-[var(--color-text-text-subtle)]">
              <span>Top view · 1:10</span>
              <span>Sheet 1 / 1</span>
            </div>
            <svg
              aria-hidden="true"
              viewBox="0 0 640 368"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinejoin="round"
              className="mx-auto block h-auto w-full max-w-[640px] [&_circle]:[vector-effect:non-scaling-stroke] [&_path]:[vector-effect:non-scaling-stroke] [&_rect]:[vector-effect:non-scaling-stroke]"
            >
              <path d="M320 80V288M88 200H536" strokeDasharray="6 6" opacity=".45" />

              {/* Arms, fuselage, battery bay and LiDAR housing */}
              <path d="M281 170L156 114L144 130L280 192M359 170L484 114L496 130L360 192M280 210L144 272L156 288L282 232M360 210L496 272L484 288L358 232" />
              <path d="M304 120H336L360 148V224L344 264H296L280 224V148Z" />
              <path d="M304 120L292 150V224L304 264M336 120L348 150V224L336 264" opacity=".55" />
              <rect x="300" y="142" width="40" height="56" rx="4" />
              <path d="M308 154H332M308 162H332M308 170H332" opacity=".55" />
              <circle cx="320" cy="228" r="18" />
              <circle cx="320" cy="228" r="10" />

              {/* Rotor sweep, blades and hubs */}
              {[[150, 122], [490, 122], [150, 280], [490, 280]].map(([x, y], i) => (
                <g key={i} transform={`translate(${x} ${y})`}>
                  <circle r="48" strokeDasharray="3 4" opacity=".65" />
                  <g transform={`rotate(${i === 0 || i === 3 ? -26 : 26})`}>
                    <path d="M-7 -2C-19 -11 -34 -13 -40 -7C-39 0 -24 5 -7 3M7 2C19 11 34 13 40 7C39 0 24 -5 7 -3" />
                  </g>
                  <circle r="7" />
                  <circle r="2" />
                </g>
              ))}

              {/* Overall span and longitudinal motor spacing */}
              <g className="text-[var(--color-text-text-link)]">
                <path d="M102 36V122M538 36V122M102 44H248M392 44H538M114 39L102 44L114 49M526 39L538 44L526 49" />
                <text x="320" y="44" className="caption-mono normal-case text-[16px] max-sm:text-[23px]" fill="currentColor" stroke="none" textAnchor="middle" dominantBaseline="central">
                  {LF2_SPECS[0].value}
                </text>
              </g>
              <path d="M542 122H584M542 280H584M576 122V280M571 134L576 122L581 134M571 268L576 280L581 268" />
              <text x="600" y="201" transform="rotate(-90 600 201)" className="caption-mono normal-case text-[16px] max-sm:text-[23px]" fill="currentColor" stroke="none" textAnchor="middle" dominantBaseline="central">
                450 mm
              </text>

              {LF2_SPECS.map(({ number, x, y, leader }) => (
                <g key={number} className={number === '01' ? 'text-[var(--color-text-text-link)]' : undefined}>
                  <path d={leader} />
                  <circle cx={x} cy={y} r="16" />
                  <text x={x} y={y} className="caption-mono text-[16px] max-sm:text-[23px]" fill="currentColor" stroke="none" textAnchor="middle" dominantBaseline="central">
                    {number}
                  </text>
                </g>
              ))}
            </svg>
            <figcaption className="border-t border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] px-3 py-2 font-body text-body-s text-[var(--color-text-text-subtle)]">
              Fig. 01 — Top view · 450 mm motor spacing
            </figcaption>
          </figure>
          <dl id="lf2-specs" aria-label="LF-2 specifications" className="m-0 grid grid-cols-1 lg:grid-cols-5 lg:border-x lg:border-b lg:border-solid lg:border-[var(--color-border-border-subtle)]">
            {LF2_SPECS.map(({ number, label, value }, i) => (
              <div
                key={number}
                className={`grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 border-b border-solid border-[var(--color-border-border-subtle)] px-3 py-2 lg:flex lg:flex-col lg:gap-2 lg:border-b-0 lg:py-3 ${
                  i > 0 ? 'lg:border-s' : ''
                }`}
              >
                <dt className="caption-mono text-[var(--color-text-text-subtle)]">
                  <span className={`me-2 ${i === 0 ? 'text-[var(--color-text-text-link)]' : ''}`}>{number}</span>
                  {label}
                </dt>
                <dd className="m-0 text-end font-mono text-body-s font-medium tabular-nums lg:text-start">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  ),
  play: hasOneH1,
};
