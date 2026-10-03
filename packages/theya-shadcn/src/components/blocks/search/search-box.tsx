import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { ArrowRight, ClockRotateRight, Search } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Kbd } from '@/components/ui/kbd';
import { TextField } from '@/components/ui/text-field';
import { TYPE_META, TypeIcon, search } from './shared';
import type { SearchItem } from './types';

type Option =
  | { kind: 'recent'; id: string; text: string }
  | { kind: 'suggestion'; id: string; text: string }
  | { kind: 'item'; id: string; item: SearchItem }
  | { kind: 'all'; id: string; text: string };

export interface SearchBoxProps {
  index: SearchItem[];
  /** Recent searches, newest first. */
  defaultRecent?: string[];
  onRecentChange?: (recent: string[]) => void;
  /** Runs a full search (Enter, a suggestion, a recent search). */
  onSearch?: (query: string) => void;
  /** Opens one item directly from the "Go to" group. */
  onNavigate?: (item: SearchItem) => void;
  placeholder?: string;
  /** Focus the field with "/" from anywhere on the page. Default true. */
  shortcut?: boolean;
  maxSuggestions?: number;
  maxItems?: number;
  className?: string;
}

/**
 * Query completions: earlier searches first, then single words from the
 * index. Not whole item names — those are already offered under "Go to",
 * and repeating them as suggestions only doubles the list.
 */
function completions(index: SearchItem[], recent: string[], q: string, max: number): string[] {
  const lower = q.trim().toLowerCase();
  if (!lower) return [];
  const words = index.flatMap((i) => `${i.title} ${i.context ?? ''}`.toLowerCase().split(/[^\p{L}\p{N}-]+/u)).filter((w) => w.length >= 3);
  return [...new Set([...recent, ...words])].filter((p) => p.startsWith(lower) && p !== lower).slice(0, max);
}

/**
 * The header search: a combobox that helps before and while you type.
 * Empty, it offers recent searches. Typing, it offers completions (the
 * part you didn't type is the emphasised part, so the difference between
 * suggestions is what stands out) and direct "Go to" matches, then a
 * plain "Search for …". Enter always searches what's in the field unless
 * an option is highlighted. Arrow keys move, Escape closes, then clears.
 */
export function SearchBox({
  index,
  defaultRecent = [],
  onRecentChange,
  onSearch,
  onNavigate,
  placeholder = 'Search domains, mail, settings, help…',
  shortcut = true,
  maxSuggestions = 3,
  maxItems = 4,
  className,
}: SearchBoxProps) {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState(defaultRecent);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const listId = `${uid}-list`;
  const q = value.trim();

  const groups = useMemo(() => {
    if (!q) return recent.length ? [{ id: 'recent', label: 'Recent searches', options: recent.map<Option>((text, i) => ({ kind: 'recent', id: `${uid}-r${i}`, text })) }] : [];
    const sugg = completions(index, recent, q, maxSuggestions).map<Option>((text, i) => ({ kind: 'suggestion', id: `${uid}-s${i}`, text }));
    const items = search(index, q)
      .slice(0, maxItems)
      .map<Option>((item) => ({ kind: 'item', id: `${uid}-i${item.id}`, item }));
    return [
      ...(sugg.length ? [{ id: 'sugg', label: 'Suggestions', options: sugg }] : []),
      ...(items.length ? [{ id: 'goto', label: 'Go to', options: items }] : []),
      { id: 'all', label: null, options: [{ kind: 'all', id: `${uid}-all`, text: q } as Option] },
    ];
  }, [q, recent, index, maxSuggestions, maxItems, uid]);
  const options = groups.flatMap((g) => g.options);
  const expanded = open && options.length > 0;
  const activeOption = expanded && active >= 0 ? options[active] : undefined;

  const remember = (text: string) => {
    const next = [text, ...recent.filter((r) => r !== text)].slice(0, 5);
    setRecent(next);
    onRecentChange?.(next);
  };
  const submit = (text: string) => {
    if (!text.trim()) return;
    setValue(text);
    setOpen(false);
    remember(text);
    onSearch?.(text);
  };
  const choose = (o: Option) => {
    if (o.kind === 'item') {
      setOpen(false);
      onNavigate?.(o.item);
    } else submit(o.text);
  };

  useEffect(() => setActive(-1), [q]);
  useEffect(() => {
    if (activeOption) document.getElementById(activeOption.id)?.scrollIntoView({ block: 'nearest' });
  }, [activeOption]);
  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey || t.closest('input, textarea, select, [contenteditable="true"]')) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shortcut]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!expanded) {
        setOpen(true);
        return;
      }
      const n = options.length;
      setActive((a) => (e.key === 'ArrowDown' ? (a + 1 >= n ? -1 : a + 1) : a <= -1 ? n - 1 : a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeOption) choose(activeOption);
      else submit(q);
    } else if (e.key === 'Escape') {
      if (expanded) {
        e.preventDefault();
        setOpen(false);
      } else if (value) {
        e.preventDefault();
        setValue('');
      }
    }
  };

  return (
    <div
      ref={rootRef}
      role="search"
      className={cn('relative w-full max-w-xl', className)}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <TextField
        ref={inputRef}
        type="text"
        role="combobox"
        aria-label="Search"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeOption?.id}
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onKeyDown={onKeyDown}
        leftIcon={<Search />}
        rightIcon={shortcut && !value ? <Kbd aria-hidden="true">/</Kbd> : undefined}
        widthSize="full"
      />

      <div
        className={cn(
          'absolute inset-x-0 top-full z-20 mt-1 flex max-h-[min(70vh,28rem)] flex-col overflow-hidden rounded-[var(--size-border-radius-border-radius-xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] shadow-elevation-lg',
          !expanded && 'hidden',
        )}
      >
        {/* Thin thumb, no track — until the overlay scrollbar lands for all popups. */}
        <ul id={listId} role="listbox" aria-label="Search suggestions" className="flex flex-col overflow-y-auto p-1 [scrollbar-color:var(--color-border-border-default)_transparent] [scrollbar-width:thin]">
          {groups.map((g) => (
            <li key={g.id} role="presentation">
              {g.label && (
                <div id={`${uid}-${g.id}`} className="px-2.5 pb-1 pt-2 font-heading text-heading-3xs uppercase tracking-[0.07em] text-[var(--color-text-text-subtler)]">
                  {g.label}
                </div>
              )}
              <ul role="group" aria-labelledby={g.label ? `${uid}-${g.id}` : undefined} aria-label={g.label ? undefined : 'Search'}>
                {g.options.map((o) => {
                  const i = options.indexOf(o);
                  return (
                    <li
                      key={o.id}
                      id={o.id}
                      role="option"
                      aria-selected={i === active}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseMove={() => setActive(i)}
                      onClick={() => choose(o)}
                      className={cn(
                        'flex min-h-10 cursor-pointer items-center gap-3 rounded-[var(--size-border-radius-border-radius-md)] px-2.5 py-1.5 font-body text-body-m text-[var(--color-text-text)]',
                        i === active && 'bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
                      )}
                    >
                      <OptionBody option={o} typed={q} />
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
        {!q && recent.length > 0 && (
          <div className="flex justify-end border-t border-solid border-[var(--color-border-border-subtler)] px-2 py-1.5">
            <button
              type="button"
              onClick={() => {
                setRecent([]);
                onRecentChange?.([]);
                inputRef.current?.focus();
              }}
              className="cursor-pointer rounded-[var(--size-border-radius-border-radius-sm)] px-1 font-body text-body-s font-medium text-[var(--color-text-text-link)] underline-offset-4 outline-none hover:underline focus-visible:focus-ring"
            >
              Clear recent searches
            </button>
          </div>
        )}
      </div>
      <p role="status" className="sr-only">
        {expanded ? `${options.length} ${options.length === 1 ? 'option' : 'options'}. Use up and down arrows to choose.` : ''}
      </p>
    </div>
  );
}

function OptionBody({ option: o, typed }: { option: Option; typed: string }): ReactNode {
  const icon = 'shrink-0 text-[var(--color-icon-icon-subtle)] [&_svg]:size-4';
  if (o.kind === 'recent')
    return (
      <>
        <span aria-hidden="true" className={icon}>
          <ClockRotateRight />
        </span>
        <span className="min-w-0 flex-1 truncate">{o.text}</span>
      </>
    );
  if (o.kind === 'suggestion') {
    // What you typed stays regular; the completion is the emphasised part.
    const rest = o.text.slice(typed.length);
    return (
      <>
        <span aria-hidden="true" className={icon}>
          <Search />
        </span>
        <span className="min-w-0 flex-1 truncate">
          {o.text.slice(0, typed.length)}
          <span className="font-semibold">{rest}</span>
        </span>
      </>
    );
  }
  if (o.kind === 'item')
    return (
      <>
        <TypeIcon type={o.item.type} className="size-7" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{o.item.title}</span>
          {o.item.context && <span className="block truncate font-body text-body-s text-[var(--color-text-text-subtler)]">{o.item.context}</span>}
        </span>
        <span className="shrink-0 font-body text-body-s text-[var(--color-text-text-subtler)]">{TYPE_META[o.item.type].one}</span>
      </>
    );
  return (
    <>
      <span aria-hidden="true" className={icon}>
        <ArrowRight />
      </span>
      <span className="min-w-0 flex-1 truncate">
        {'Search everything for '}
        <span className="font-semibold">{`“${o.text}”`}</span>
      </span>
    </>
  );
}
