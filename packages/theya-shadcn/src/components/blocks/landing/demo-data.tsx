import { Book, Compass, Flower, Hexagon, Infinite, Leaf, Planet, SunLight, Wind, Folder, Search, WarningTriangle } from 'iconoir-react';
import type { ComponentType, SVGProps } from 'react';
import { cn } from '../../../lib/utils';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Kbd } from '../../ui/kbd';

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
