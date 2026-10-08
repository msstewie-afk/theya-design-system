'use client';

import { useId } from 'react';
import { Search } from 'iconoir-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/button';
import { TYPE_META, TypeIcon } from './shared';
import type { SearchItem, SearchType } from './types';

export interface SearchNoResultsProps {
  query: string;
  /** The scope that came back empty, when the search was narrowed to one type. */
  scope?: SearchType;
  /** Hits in the other scopes — offered as the way out of an empty scope. */
  elsewhere?: { type: SearchType; count: number }[];
  /** A close spelling that does have results. */
  didYouMean?: string | null;
  /** The pages people look for most. */
  popular?: SearchItem[];
  onSearch?: (query: string) => void;
  onScopeChange?: (scope: SearchType | 'all') => void;
  /** Leave out the "Nothing matches" line when the page heading already says it. */
  hideTitle?: boolean;
  className?: string;
}

const linkButton =
  'cursor-pointer rounded-[var(--size-border-radius-border-radius-sm)] font-medium text-[var(--color-text-text-link)] underline-offset-4 outline-none hover:underline focus-visible:focus-ring';

/**
 * Never a dead end: says plainly that nothing matched (with the query, so
 * a typo is visible), then offers the most likely next step first — a
 * close spelling, the same query in the scopes that do have hits — and
 * only then generic tips and the most-visited pages.
 */
export function SearchNoResults({ query, scope, elsewhere = [], didYouMean, popular = [], onSearch, onScopeChange, hideTitle, className }: SearchNoResultsProps) {
  const others = elsewhere.filter((e) => e.count > 0 && e.type !== scope);
  const popularId = useId();
  // Without its own title the block sits flush under the page heading.
  const indent = hideTitle ? '' : 'ps-14';
  const where = scope ? TYPE_META[scope].many.toLowerCase() : null;
  return (
    <div className={cn('flex max-w-2xl flex-col gap-6', className)}>
      <div className={cn('flex items-start gap-4', hideTitle && !didYouMean && !(scope && others.length) && 'hidden')}>
        <span aria-hidden="true" className={cn(hideTitle && 'hidden', 'grid size-10 shrink-0 place-items-center rounded-full bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-[var(--color-icon-icon-subtle)] [&_svg]:size-5')}>
          <Search />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          {!hideTitle && <p className="font-body text-body-l font-semibold text-[var(--color-text-text)]">{where ? `No ${where} match “${query}”` : `Nothing matches “${query}”`}</p>}
          {didYouMean && (
            <p className="font-body text-body-m text-[var(--color-text-text-subtle)]">
              {'Did you mean '}
              <button type="button" className={linkButton} onClick={() => onSearch?.(didYouMean)}>
                {didYouMean}
              </button>
              ?
            </p>
          )}
          {scope && others.length > 0 && (
            <p className="font-body text-body-m text-[var(--color-text-text-subtle)]">
              {'But there are matches in '}
              {others.map((o, i) => (
                <span key={o.type}>
                  {i > 0 && (i === others.length - 1 ? ' and ' : ', ')}
                  <button type="button" className={linkButton} onClick={() => onScopeChange?.(o.type)}>
                    {`${TYPE_META[o.type].many.toLowerCase()} (${o.count})`}
                  </button>
                </span>
              ))}
              .
            </p>
          )}
        </div>
      </div>

      <div className={cn('flex flex-col gap-2', indent)}>
        <p className="font-body text-body-m font-medium text-[var(--color-text-text)]">Try:</p>
        <ul className="flex list-disc flex-col gap-1 ps-5 font-body text-body-m text-[var(--color-text-text-subtle)]">
          <li>Checking the spelling</li>
          <li>Fewer or more general words — “backup” instead of “nightly backup job”</li>
          <li>A name, domain or email address as it appears in the panel</li>
        </ul>
        {scope && (
          <Button appearance="outlined" tone="secondary" className="mt-2 self-start" onClick={() => onScopeChange?.('all')}>
            Search everything
          </Button>
        )}
      </div>

      {popular.length > 0 && (
        <section aria-labelledby={popularId} className={cn('flex flex-col gap-3', indent)}>
          <h2 id={popularId} className="font-heading text-heading-2xs uppercase tracking-[0.07em] text-[var(--color-text-text-subtler)]">
            Popular pages
          </h2>
          <ul className="flex flex-col gap-1">
            {popular.map((p) => (
              <li key={p.id}>
                <a href={p.href} className="-mx-2 flex items-center gap-3 rounded-[var(--size-border-radius-border-radius-md)] px-2 py-1.5 outline-none hover:bg-[var(--color-bg-neutral-bg-neutral-subtler)] focus-visible:focus-ring">
                  <TypeIcon type={p.type} />
                  <span className="min-w-0">
                    <span className="block font-body text-body-m font-medium text-[var(--color-text-text)]">{p.title}</span>
                    {p.context && <span className="block font-body text-body-s text-[var(--color-text-text-subtler)]">{p.context}</span>}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
