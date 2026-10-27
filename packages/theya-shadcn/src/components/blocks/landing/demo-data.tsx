import { Bookmark, Book, Check, Compass, Copy, Flower, Hexagon, Infinite, Leaf, Planet, SunLight, Wind, Folder, Search, WarningTriangle } from 'iconoir-react';
import type { ComponentType, SVGProps } from 'react';
import { cn } from '../../../lib/utils';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Kbd } from '../../ui/kbd';
import { Progress } from '../../ui/progress';
import type { MegaItem } from '../navigation/mega-menu';
import type { FooterColumn } from '../navigation/site-footer';

// Demo content for the landing blocks: a bookmarks manager (Мария's first
// product, pr-01), so the landing stories and the product tell one story.

export const DEMO_FOLDERS = [
  { id: 'reading', name: 'Reading list', count: 128 },
  { id: 'design', name: 'Design systems', count: 64 },
  { id: 'recipes', name: 'Recipes', count: 37 },
  { id: 'trips', name: 'Trips', count: 21 },
] as const;

export type DemoFolderId = (typeof DEMO_FOLDERS)[number]['id'];

const LINKS = [
  { folder: 'reading', title: 'The case for slow software', domain: 'essays.example', tags: ['longread'], letter: 'E', hue: 'blue' },
  { folder: 'reading', title: 'How we read on screens', domain: 'research.example', tags: ['study'], letter: 'R', hue: 'teal' },
  { folder: 'reading', title: 'A year without notifications', domain: 'journal.example', tags: ['habits'], letter: 'J', hue: 'purple' },
  { folder: 'reading', title: 'Notes on attention', domain: 'letters.example', tags: ['longread'], letter: 'L', hue: 'orange' },
  { folder: 'design', title: 'Spacing in design systems', domain: 'designnotes.dev', tags: ['tokens'], letter: 'S', hue: 'blue' },
  { folder: 'design', title: 'Colour contrast, explained', domain: 'a11y-basics.org', tags: ['a11y'], letter: 'C', hue: 'teal' },
  { folder: 'design', title: 'Naming tokens that last', domain: 'designnotes.dev', tags: ['tokens'], letter: 'S', hue: 'blue' },
  { folder: 'design', title: 'Focus rings people can see', domain: 'a11y-basics.org', tags: ['a11y'], letter: 'C', hue: 'teal' },
  { folder: 'recipes', title: 'Slow-roasted tomatoes', domain: 'kitchen.example', tags: ['summer'], letter: 'K', hue: 'orange' },
  { folder: 'recipes', title: 'Banitsa, step by step', domain: 'kitchen.example', tags: ['baking'], letter: 'K', hue: 'orange' },
  { folder: 'recipes', title: 'Cold cucumber soup', domain: 'pantry.example', tags: ['summer'], letter: 'P', hue: 'teal' },
  { folder: 'recipes', title: 'Weeknight lentils', domain: 'pantry.example', tags: ['quick'], letter: 'P', hue: 'teal' },
  { folder: 'trips', title: 'Hiking the Rila lakes', domain: 'trails.example', tags: ['hiking'], letter: 'T', hue: 'purple' },
  { folder: 'trips', title: 'Night trains in Europe', domain: 'rails.example', tags: ['rail'], letter: 'R', hue: 'blue' },
  { folder: 'trips', title: 'Plovdiv in a weekend', domain: 'city.example', tags: ['city'], letter: 'C', hue: 'orange' },
  { folder: 'trips', title: 'Packing light, really', domain: 'trails.example', tags: ['gear'], letter: 'T', hue: 'purple' },
] as const;

const HUE: Record<(typeof LINKS)[number]['hue'], string> = {
  blue: 'bg-[var(--color-blue-blue-100)] text-[var(--color-blue-blue-700)]',
  teal: 'bg-[var(--color-teal-teal-100)] text-[var(--color-teal-teal-700)]',
  orange: 'bg-[var(--color-orange-orange-100)] text-[var(--color-orange-orange-700)]',
  purple: 'bg-[var(--color-purple-purple-100)] text-[var(--color-purple-purple-700)]',
};

/**
 * The hero visual of the landing stories: a slice of the bookmarks app
 * built from Theya components. It is a picture of the product, so it is one
 * image to assistive tech (role="img" + label) and holds no real controls.
 */
export function BookmarksPreview({ className, floating = true, folder = 'reading' }: { className?: string; floating?: boolean; folder?: DemoFolderId }) {
  const current = DEMO_FOLDERS.find((f) => f.id === folder)!;
  return (
    <div
      role="img"
      aria-label={`The Bookmarks app showing the ${current.name} folder: saved links with tags, and a notice that three duplicates were found.`}
      className={cn('relative', className)}
    >
      {/* Nested radius: the search field's 6px plus the 12px band padding ≈ 16px (4xl), so the corners stay concentric. */}
      <div className="overflow-hidden rounded-[var(--size-border-radius-border-radius-4xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] shadow-elevation-lg">
        <div className="flex items-center gap-3 border-b border-solid border-[var(--color-border-border-subtler)] px-4 py-3">
          <div className="flex h-8 flex-1 items-center gap-2 rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border)] px-3 text-body-s text-[var(--color-text-text-subtler)]">
            <Search className="size-4 shrink-0" />
            <span className="flex-1 truncate">Search 250 links</span>
            <Kbd>⌘K</Kbd>
          </div>
        </div>
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,5fr)]">
          <ul className="m-0 hidden list-none flex-col gap-0.5 border-e border-solid border-[var(--color-border-border-subtler)] p-2 sm:flex">
            {DEMO_FOLDERS.map((f) => (
              <li
                key={f.name}
                className={cn(
                  'flex items-center gap-2 rounded-[var(--size-border-radius-border-radius-md)] px-2 py-1.5 text-body-s',
                  f.id === folder ? 'bg-[var(--color-bg-primary-bg-primary-subtle)] font-semibold text-[var(--color-text-text-link-on-tonal)]' : 'text-[var(--color-text-text)]',
                )}
              >
                <Folder className="size-4 shrink-0" />
                <span className="flex-1 truncate">{f.name}</span>
                <span className="text-body-xs text-[var(--color-text-text-subtle)]">{f.count}</span>
              </li>
            ))}
          </ul>
          <ul className="col-span-2 m-0 flex list-none flex-col p-2 sm:col-span-1">
            {LINKS.filter((l) => l.folder === folder).map((l) => (
              <li key={l.title} className="flex items-center gap-3 border-b border-solid border-[var(--color-border-border-subtler)] px-2 py-2.5 last:border-b-0">
                <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-[var(--size-border-radius-border-radius-md)] text-body-s font-semibold', HUE[l.hue])}>
                  {l.letter}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-body-s font-semibold text-[var(--color-text-text)]">{l.title}</span>
                  <span className="truncate text-body-xs text-[var(--color-text-text-subtle)]">{l.domain}</span>
                </span>
                <span className="hidden gap-1 md:flex">
                  {l.tags.map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {floating && (
        <div className="absolute -bottom-6 end-4 flex items-center gap-3 rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface-overlay)] py-2 ps-3 pe-2 shadow-elevation-lg sm:-end-6">
          <WarningTriangle className="size-4 shrink-0 text-[var(--color-icon-icon-warning)]" />
          <span className="text-body-s text-[var(--color-text-text)]">3 duplicates found</span>
          {/* Part of the picture: a span styled as a button, never a real control
              inside role="img" (axe nested-interactive). */}
          <Button asChild size="sm" appearance="tonal">
            <span>Review</span>
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Made-up customer logos for LogoStrip: a mark and a wordmark, set in a few
 * different styles the way real logo rows are. No real brands (Theya rule).
 */
const DEMO_LOGOS: { name: string; icon: ComponentType<SVGProps<SVGSVGElement>>; style: string }[] = [
  { name: 'Northwind', icon: Wind, style: 'font-heading font-semibold' },
  { name: 'Fieldnote', icon: Book, style: 'font-display-serif font-semibold italic text-[1.25em]' },
  { name: 'Quartz', icon: Hexagon, style: 'font-heading font-bold uppercase tracking-[0.12em] text-[0.85em]' },
  { name: 'Lumen', icon: SunLight, style: 'font-heading font-medium' },
  { name: 'Kestrel', icon: Compass, style: 'font-heading font-bold' },
  { name: 'Orbitly', icon: Planet, style: 'font-heading font-semibold lowercase' },
  { name: 'Greenhouse', icon: Leaf, style: 'font-display-serif font-semibold text-[1.25em]' },
  { name: 'Loop & Co', icon: Infinite, style: 'font-heading font-medium' },
  { name: 'Bloom', icon: Flower, style: 'font-heading font-bold' },
];

/** The first `count` demo logos (all nine by default). */
export function DemoLogos({ count = DEMO_LOGOS.length }: { count?: number }) {
  return (
    <>
      {DEMO_LOGOS.slice(0, count).map(({ name, icon: Icon, style }) => (
        <span key={name} data-slot="demo-logo" className={cn('inline-flex items-center gap-2 whitespace-nowrap text-heading-s', style)}>
          <Icon aria-hidden className="size-7 shrink-0" />
          {name}
        </span>
      ))}
    </>
  );
}

/** The product mark for the landing stories: a link home. */
export function DemoProductLogo({ href = '#top' }: { href?: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-[var(--size-border-radius-border-radius-md)] font-heading text-heading-xs font-semibold text-[var(--color-text-text)] no-underline outline-none focus-visible:focus-ring"
    >
      <span className="flex size-8 items-center justify-center rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-primary-bg-primary)] text-[var(--color-text-text-on-primary)]">
        <Bookmark aria-hidden className="size-5" />
      </span>
      Bookmarks
    </a>
  );
}

/** Site navigation of the bookmarks product's landing page (for SiteHeader + MegaMenu). */
export const DEMO_LANDING_MENU: MegaItem[] = [
  {
    id: 'product',
    label: 'Product',
    overview: { label: 'Product tour', href: '#tour' },
    columns: [
      {
        title: 'Features',
        links: [
          { label: 'Import', href: '#import', description: 'From any browser or a bookmarks file' },
          { label: 'Folders and tags', href: '#folders', description: 'Sort by hand, or let rules do it' },
          { label: 'Search', href: '#search', description: 'Titles, notes and the text of every page' },
          { label: 'Duplicates', href: '#duplicates', badge: 'New' },
        ],
      },
      {
        title: 'Works with',
        links: [
          { label: 'Chrome', href: '#chrome' },
          { label: 'Firefox', href: '#firefox' },
          { label: 'Safari', href: '#safari' },
          { label: 'Edge', href: '#edge' },
        ],
      },
    ],
    featured: { title: 'Shared folders for teams', description: 'One reading list for the whole team, with comments on links.', href: '#teams', cta: 'See team plans' },
  },
  { id: 'pricing', label: 'Pricing', href: '#pricing' },
  { id: 'changelog', label: 'Changelog', href: '#changelog' },
  { id: 'blog', label: 'Blog', href: '#blog' },
];

// ---------------------------------------------------------------------------
// Feature visuals (FeatureSplit / FeatureShowcase): one slice of the product per
// feature, built from Theya components. Each is a picture: role="img" with a
// label, and no real controls inside.

const card =
  'w-full max-w-[32rem] overflow-hidden rounded-[var(--size-border-radius-border-radius-4xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-4 shadow-elevation-md';
const row = 'flex items-center gap-3 border-b border-solid border-[var(--color-border-border-subtler)] py-3 last:border-b-0';

function ImportVisual() {
  const browsers = [
    { name: 'Chrome', done: 412, total: 412 },
    { name: 'Firefox', done: 168, total: 230 },
    { name: 'Safari', done: 0, total: 96 },
  ];
  return (
    <div className={card}>
      <p className="m-0 mb-1 font-body text-body-m font-semibold text-[var(--color-text-text)]">Importing bookmarks</p>
      <p className="m-0 mb-2 font-body text-body-s text-[var(--color-text-text-subtle)]">580 of 738 links</p>
      {browsers.map((b) => (
        <div key={b.name} className={row}>
          <span className="w-16 shrink-0 font-body text-body-s text-[var(--color-text-text)]">{b.name}</span>
          <Progress value={(b.done / b.total) * 100} aria-label={`${b.name} import`} className="flex-1" />
          <span className="w-16 shrink-0 text-end font-body text-body-s tabular-nums text-[var(--color-text-text-subtle)]">
            {b.done === b.total ? <Check aria-hidden className="ms-auto size-4 text-[var(--color-icon-icon-success)]" /> : `${b.done}/${b.total}`}
          </span>
        </div>
      ))}
    </div>
  );
}

function FoldersVisual() {
  return (
    <div className={card}>
      {DEMO_FOLDERS.map((f, i) => (
        <div key={f.id} className={row}>
          <Folder aria-hidden className="size-4 shrink-0 text-[var(--color-icon-icon-subtle)]" />
          <span className="flex-1 truncate font-body text-body-m text-[var(--color-text-text)]">{f.name}</span>
          <Badge tone={i === 0 ? 'primary' : 'neutral'}>{['auto: longreads', 'tokens', 'summer', 'hiking'][i]}</Badge>
          <span className="w-8 text-end font-body text-body-s tabular-nums text-[var(--color-text-text-subtle)]">{f.count}</span>
        </div>
      ))}
    </div>
  );
}

function SearchVisual() {
  return (
    <div className={card}>
      <div className="mb-2 flex h-10 items-center gap-2 rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border)] px-3 font-body text-body-m text-[var(--color-text-text)]">
        <Search aria-hidden className="size-4 shrink-0 text-[var(--color-icon-icon-subtle)]" />
        attention
      </div>
      {[
        { t: 'Notes on attention', d: 'letters.example', q: '…what we give our attention to becomes…' },
        { t: 'A year without notifications', d: 'journal.example', q: '…my attention came back slowly…' },
        { t: 'How we read on screens', d: 'research.example', q: '…attention drops after the first…' },
      ].map((r) => (
        <div key={r.t} className="flex flex-col gap-0.5 border-b border-solid border-[var(--color-border-border-subtler)] py-3 last:border-b-0">
          <span className="font-body text-body-m font-semibold text-[var(--color-text-text)]">{r.t}</span>
          <span className="font-body text-body-s text-[var(--color-text-text-subtle)]">
            {r.q.split('attention').map((part, i, all) => (
              <span key={i}>
                {part}
                {i < all.length - 1 && <mark className="rounded-[var(--size-border-radius-border-radius-sm)] bg-[var(--color-bg-warning-bg-warning-subtle)] px-0.5 font-medium text-[var(--color-text-text)]">attention</mark>}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

function DuplicatesVisual() {
  return (
    <div className={card}>
      <div className="mb-3 flex items-center gap-2 font-body text-body-m font-semibold text-[var(--color-text-text)]">
        <Copy aria-hidden className="size-4 text-[var(--color-icon-icon-warning)]" />3 duplicates found
      </div>
      {[
        ['Notes on attention', 'Reading list', 'keep'],
        ['Notes on attention', 'Design systems', 'merge'],
        ['Cold cucumber soup', 'Recipes', 'keep'],
      ].map(([t, folder, action], i) => (
        <div key={i} className={row}>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-body text-body-m text-[var(--color-text-text)]">{t}</span>
            <span className="font-body text-body-s text-[var(--color-text-text-subtle)]">{folder}</span>
          </span>
          <Badge tone={action === 'keep' ? 'success' : 'warning'}>{action}</Badge>
        </div>
      ))}
    </div>
  );
}

export const DEMO_FEATURES = [
  {
    id: 'import',
    title: 'Bring everything over',
    description: 'Import from Chrome, Firefox, Safari and Edge at once, or from a bookmarks file. Folders come with it.',
    label: 'Import in progress: Chrome done, Firefox 168 of 230 links, Safari waiting.',
    Visual: ImportVisual,
  },
  {
    id: 'folders',
    title: 'Folders that sort themselves',
    description: 'Set a rule once (by site, by tag, by length) and new links land in the right folder.',
    label: 'Four folders with tags; Reading list sorts long reads in automatically.',
    Visual: FoldersVisual,
  },
  {
    id: 'search',
    title: 'Search the words, not just the titles',
    description: 'Every saved page is indexed, so a phrase you half remember finds it.',
    label: 'Searching “attention” finds three pages, with the word highlighted inside each.',
    Visual: SearchVisual,
  },
  {
    id: 'duplicates',
    title: 'One copy of everything',
    description: 'The same link saved twice is spotted and merged, with its tags and notes.',
    label: 'Three duplicates found: two to keep and one to merge.',
    Visual: DuplicatesVisual,
  },
] as const;

export type DemoFeatureId = (typeof DEMO_FEATURES)[number]['id'];

/** A feature's visual as one labelled picture. */
export function DemoFeatureVisual({ id }: { id: DemoFeatureId }) {
  const f = DEMO_FEATURES.find((x) => x.id === id)!;
  return (
    <div role="img" aria-label={f.label} className="flex w-full justify-center">
      <f.Visual />
    </div>
  );
}

/** Footer columns of the bookmarks product's landing page (for SiteFooter). */
export const DEMO_LANDING_FOOTER: FooterColumn[] = [
  { title: 'Product', links: [{ label: 'Import', href: '#import' }, { label: 'Search', href: '#search' }, { label: 'Teams', href: '#teams' }, { label: 'Pricing', href: '#pricing' }] },
  { title: 'Get the app', links: [{ label: 'Chrome', href: '#chrome' }, { label: 'Firefox', href: '#firefox' }, { label: 'Safari', href: '#safari' }, { label: 'Edge', href: '#edge' }] },
  { title: 'Resources', links: [{ label: 'Help centre', href: '#help' }, { label: 'Changelog', href: '#changelog' }, { label: 'Blog', href: '#blog' }] },
  { title: 'Company', links: [{ label: 'About', href: '#about' }, { label: 'Careers', href: '#careers' }, { label: 'Contact', href: '#contact' }] },
];
