'use client';

import { useId, useState } from 'react';
import { Folder, Search } from 'iconoir-react';
import { cn } from '../../../lib/utils';
import { Badge } from '../../ui/badge';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../../ui/input-group';
import { ToggleGroup, ToggleGroupItem } from '../../ui/toggle-group';
import { DEMO_FOLDERS, DEMO_LINKS, type DemoFolderId } from './demo-data';

/**
 * A working slice of the bookmarks product for a landing page: the search
 * really filters, the folders really switch. Unlike BookmarksPreview (a
 * picture, role="img"), this is a labelled region with real controls —
 * keyboard reachable, and the result count is announced as it changes.
 */
export function BookmarksLiveDemo({ className }: { className?: string }) {
  const uid = useId();
  const [query, setQuery] = useState('');
  const [folder, setFolder] = useState<DemoFolderId | 'all'>('all');
  const q = query.trim().toLowerCase();
  const results = DEMO_LINKS.filter(
    (l) => (folder === 'all' || l.folder === folder) && (!q || `${l.title} ${l.domain} ${l.tags.join(' ')}`.toLowerCase().includes(q)),
  );

  // Mark every occurrence of the query in a title.
  const mark = (text: string) => {
    if (!q) return text;
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'));
    return parts.map((p, i) =>
      p.toLowerCase() === q ? (
        <mark key={i} className="rounded-[var(--size-border-radius-border-radius-sm)] bg-[var(--color-bg-warning-bg-warning-subtle)] px-0.5 text-[var(--color-text-text)]">
          {p}
        </mark>
      ) : (
        p
      ),
    );
  };

  return (
    <section
      aria-labelledby={`${uid}-title`}
      className={cn(
        'w-full max-w-[40rem] overflow-hidden rounded-[var(--size-border-radius-border-radius-4xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] shadow-elevation-md',
        className,
      )}
    >
      <h3 id={`${uid}-title`} className="sr-only">
        Try it: search the demo bookmarks
      </h3>
      <div className="border-b border-solid border-[var(--color-border-border-subtler)] p-4">
        <label htmlFor={`${uid}-q`} className="sr-only">
          Search links
        </label>
        <InputGroup>
          <InputGroupAddon position="start" divider={false}>
            <Search aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput id={`${uid}-q`} type="search" placeholder="Try “attention”" value={query} onChange={(e) => setQuery(e.target.value)} aria-describedby={`${uid}-count`} />
        </InputGroup>
      </div>
      <div className="grid sm:grid-cols-[11rem_minmax(0,1fr)]">
        <ToggleGroup
          type="single"
          size="sm"
          value={folder}
          onValueChange={(v) => v && setFolder(v as DemoFolderId | 'all')}
          aria-label="Folder"
          className="flex w-full flex-row flex-wrap items-stretch gap-1 border-b border-solid border-[var(--color-border-border-subtler)] p-2 sm:flex-col sm:flex-nowrap sm:border-e sm:border-b-0"
        >
          <ToggleGroupItem value="all" className="justify-start rounded-[var(--size-border-radius-border-radius-md)] px-3 sm:w-full">
            All links
          </ToggleGroupItem>
          {DEMO_FOLDERS.map((f) => (
            <ToggleGroupItem key={f.id} value={f.id} className="justify-start rounded-[var(--size-border-radius-border-radius-md)] px-3 sm:w-full">
              <Folder aria-hidden className="size-4 shrink-0" />
              <span className="truncate">{f.name}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="flex min-h-[16rem] flex-col p-2">
          <p id={`${uid}-count`} aria-live="polite" className="m-0 px-2 py-1 font-body text-body-s text-[var(--color-text-text-subtle)]">
            {results.length === 0 ? 'No links match' : `${results.length} ${results.length === 1 ? 'link' : 'links'}`}
          </p>
          <ul className="m-0 flex list-none flex-col p-0">
            {results.map((l) => (
              <li key={`${l.folder}-${l.title}`} className="flex items-center gap-3 border-b border-solid border-[var(--color-border-border-subtler)] px-2 py-2.5 last:border-b-0">
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-body text-body-s font-semibold text-[var(--color-text-text)]">{mark(l.title)}</span>
                  <span className="truncate font-body text-body-xs text-[var(--color-text-text-subtle)]">{l.domain}</span>
                </span>
                {l.tags.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
