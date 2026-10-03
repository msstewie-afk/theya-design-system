import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Search } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchNoResults } from './no-results';
import { Highlight, TYPE_META, TYPE_ORDER, TypeIcon, search, suggestSpelling } from './shared';
import type { SearchItem, SearchType } from './types';

export interface SearchResultsProps {
  /** Everything searchable. */
  index: SearchItem[];
  /** The query the page opened with. */
  defaultQuery?: string;
  defaultScope?: SearchType | 'all';
  /** Results per group on "All". */
  groupSize?: number;
  /** Results per "Show more" in one scope. */
  pageSize?: number;
  popular?: SearchItem[];
  onSearch?: (query: string) => void;
  className?: string;
}

/**
 * A results page that keeps the query in the field (so it can be refined,
 * not retyped), counts every type, and only offers scopes that have
 * results. "All" shows the best few of each type with "View all N";
 * one type shows a flat list with "Show more". An obvious typo is
 * corrected automatically — with a notice and a way to search the
 * original — and an empty result never ends the path.
 */
export function SearchResults({ index, defaultQuery = '', defaultScope = 'all', groupSize = 3, pageSize = 10, popular = [], onSearch, className }: SearchResultsProps) {
  const [draft, setDraft] = useState(defaultQuery);
  const [query, setQuery] = useState(defaultQuery);
  const [exact, setExact] = useState(false);
  const [scope, setScope] = useState<SearchType | 'all'>(defaultScope);
  const [visible, setVisible] = useState(pageSize);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const uid = useId();

  const direct = useMemo(() => search(index, query), [index, query]);
  const correction = useMemo(() => (!exact && !direct.length && query.trim() ? suggestSpelling(index, query) : null), [exact, direct.length, index, query]);
  const shownQuery = correction ?? query;
  const results = correction ? search(index, correction) : direct;

  const counts = TYPE_ORDER.map((type) => ({ type, count: results.filter((r) => r.type === type).length })).filter((c) => c.count > 0);
  const inScope = scope === 'all' ? results : results.filter((r) => r.type === scope);

  const run = (q: string, opts: { exact?: boolean } = {}) => {
    setQuery(q);
    setDraft(q);
    setExact(!!opts.exact);
    setScope('all');
    setVisible(pageSize);
    onSearch?.(q);
  };
  const changeScope = (s: SearchType | 'all') => {
    setScope(s);
    setVisible(pageSize);
  };

  // After a new search the heading (with the count) gets focus, so a
  // screen reader hears what happened and the next Tab starts on results.
  const searched = useRef(false);
  useEffect(() => {
    if (searched.current) headingRef.current?.focus();
    searched.current = true;
  }, [query, exact]);

  const plural = (n: number) => (n === 1 ? 'result' : 'results');

  return (
    <div className={cn('@container flex w-full flex-col gap-6', className)}>
      <form
        role="search"
        aria-label="Site"
        className="flex max-w-2xl gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) run(draft.trim());
        }}
      >
        <TextField
          type="search"
          aria-label="Search"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          leftIcon={<Search />}
          widthSize="full"
          className="[&::-webkit-search-cancel-button]:hidden"
        />
        <Button type="submit" appearance="filled" tone="primary">
          Search
        </Button>
      </form>

      {query.trim() !== '' && (
        <div className="flex flex-col gap-1">
          <h1 ref={headingRef} tabIndex={-1} className="rounded-[var(--size-border-radius-border-radius-sm)] font-body text-heading-s font-semibold text-[var(--color-text-text)] outline-none">
            {results.length ? `${results.length} ${plural(results.length)} for “${shownQuery}”` : `No results for “${query}”`}
          </h1>
          {correction && (
            <p className="font-body text-body-m text-[var(--color-text-text-subtle)]">
              {`No results for “${query}”, so we searched for “${correction}”. `}
              <button
                type="button"
                onClick={() => run(query, { exact: true })}
                className="cursor-pointer rounded-[var(--size-border-radius-border-radius-sm)] font-medium text-[var(--color-text-text-link)] underline-offset-4 outline-none hover:underline focus-visible:focus-ring"
              >
                {`Search only for “${query}”`}
              </button>
            </p>
          )}
        </div>
      )}

      {query.trim() !== '' && !results.length && (
        <SearchNoResults hideTitle query={query} didYouMean={exact ? suggestSpelling(index, query) : null} popular={popular} onSearch={(q) => run(q)} />
      )}

      {results.length > 0 && (
        // Tabs as the scope switch: they scroll sideways instead of
        // wrapping, and only scopes with results get a tab.
        <Tabs value={scope} onValueChange={(v) => changeScope(v as SearchType | 'all')}>
          <TabsList aria-label="Show results for">
            <TabsTrigger value="all">
              All <Count n={results.length} />
            </TabsTrigger>
            {counts.map((c) => (
              <TabsTrigger key={c.type} value={c.type}>
                {TYPE_META[c.type].many} <Count n={c.count} />
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={scope} className="pt-5">
            {scope === 'all' ? (
              <div className="flex flex-col gap-8">
                {counts.map((c) => {
                  const groupId = `${uid}-${c.type}`;
                  return (
                    <section key={c.type} aria-labelledby={groupId} className="flex flex-col gap-2">
                      <div className="flex items-baseline justify-between gap-3">
                        <h2 id={groupId} className="font-heading text-heading-2xs uppercase tracking-[0.07em] text-[var(--color-text-text-subtler)]">
                          {TYPE_META[c.type].many}
                        </h2>
                        {c.count > groupSize && (
                          <Button appearance="ghost" tone="primary" size="sm" onClick={() => changeScope(c.type)}>
                            {`View all ${c.count}`}
                            <span className="sr-only">{` ${TYPE_META[c.type].many.toLowerCase()}`}</span>
                          </Button>
                        )}
                      </div>
                      <ResultList items={results.filter((r) => r.type === c.type).slice(0, groupSize)} query={shownQuery} />
                    </section>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <ResultList items={inScope.slice(0, visible)} query={shownQuery} />
                {visible < inScope.length && (
                  <div className="flex flex-col items-center gap-2">
                    <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">{`Showing ${visible} of ${inScope.length}`}</p>
                    <Button appearance="outlined" tone="secondary" onClick={() => setVisible((v) => v + pageSize)}>
                      {`Show ${Math.min(pageSize, inScope.length - visible)} more`}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function Count({ n }: { n: number }) {
  return <span className="ml-1 tabular-nums text-[var(--color-text-text-subtler)]">{n}</span>;
}

/** One result per row: type, name with the matched words marked, where it lives, a line of text, a fact. */
export function ResultList({ items, query, className }: { items: SearchItem[]; query: string; className?: string }) {
  return (
    <ul className={cn('flex flex-col', className)}>
      {items.map((item) => (
        <li key={item.id} className="relative -mx-3 flex items-start gap-3 rounded-[var(--size-border-radius-border-radius-lg)] px-3 py-3 has-[a:hover]:bg-[var(--color-bg-neutral-bg-neutral-subtler)] has-[a:focus-visible]:focus-ring">
          <TypeIcon type={item.type} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {/* The title link stretches over the whole row; the ring is drawn on the row. */}
            <a href={item.href} className="font-body text-body-m font-medium text-[var(--color-text-text)] outline-none after:absolute after:inset-0 after:content-['']">
              <Highlight text={item.title} query={query} />
              <span className="sr-only">{`, ${TYPE_META[item.type].one}`}</span>
            </a>
            {item.context && (
              <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">
                <Highlight text={item.context} query={query} />
              </p>
            )}
            {item.snippet && (
              <p className="font-body text-body-m text-[var(--color-text-text-subtle)]">
                <Highlight text={item.snippet} query={query} />
              </p>
            )}
          </div>
          {item.meta && <span className="shrink-0 pt-1.5 font-body text-body-s tabular-nums text-[var(--color-text-text-subtle)]">{item.meta}</span>}
        </li>
      ))}
    </ul>
  );
}
