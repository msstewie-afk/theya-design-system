import { createContext, useContext, useState, useRef, useLayoutEffect, useCallback, useId } from 'react';
import type { ReactNode } from 'react';
import { Search } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { ToneIcon } from './tone-icon';
import type { StatusTone } from './status-dot';

/**
 * The ⌘K palette primitive. Not built on Base UI Autocomplete (we
 * don't use Base UI) or cmdk (same reasoning as Combobox — avoid the
 * extra dependency) — a self-contained inline list with our own
 * substring filtering and keyboard nav (↑/↓/Enter/Esc), matching
 * cmdk's shaped API (CommandItem value/keywords/onSelect, CommandGroup
 * heading, CommandInput value/onValueChange). A non-matching item
 * unmounts itself; a group with no remaining item hides via `:has()`.
 */
interface CommandContextValue {
  search: string;
  setSearch: (v: string) => void;
  matches: (text: string) => boolean;
  loading?: boolean;
  label?: string;
  listRef: React.RefObject<HTMLDivElement | null>;
  activeValue: string | null;
  setActiveValue: (v: string | null) => void;
}

const CommandContext = createContext<CommandContextValue | null>(null);

function useCommandContext(part: string) {
  const ctx = useContext(CommandContext);
  if (!ctx) throw new Error(`${part} must be used within <Command>`);
  return ctx;
}

export interface CommandProps extends Omit<React.ComponentProps<'div'>, 'onChange'> {
  label?: string;
  shouldFilter?: boolean;
  loading?: boolean;
}

export function Command({ className, label, shouldFilter = true, loading = false, children, ...props }: CommandProps) {
  const [search, setSearch] = useState('');
  const [activeValue, setActiveValue] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const matches = useCallback(
    (text: string) => !shouldFilter || search.trim() === '' || text.toLowerCase().includes(search.trim().toLowerCase()),
    [search, shouldFilter],
  );

  // Keep the highlight on a visible item — if the active value filtered
  // out (or nothing is active yet), fall back to the first visible one.
  useLayoutEffect(() => {
    const items = listRef.current?.querySelectorAll<HTMLElement>('[data-command-item]');
    if (!items || items.length === 0) {
      setActiveValue(null);
      return;
    }
    const values = Array.from(items).map((el) => el.dataset.value ?? '');
    if (!activeValue || !values.includes(activeValue)) setActiveValue(values[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, children]);

  return (
    <CommandContext.Provider value={{ search, setSearch, matches, loading, label, listRef, activeValue, setActiveValue }}>
      <div className={cn('flex h-full w-full flex-col overflow-hidden rounded-[var(--size-border-radius-border-radius-xl)] bg-[var(--color-bg-surface-bg-surface-overlay)] text-[var(--color-text-text)]', className)} {...props}>
        {children}
      </div>
    </CommandContext.Provider>
  );
}

export interface CommandDialogProps extends Omit<React.ComponentProps<typeof Dialog>, 'children'> {
  title?: string;
  description?: string;
  className?: string;
  children?: ReactNode;
}

export function CommandDialog({
  title = 'Command palette',
  description = 'Search for pages and actions, or run a command.',
  children,
  className,
  ...props
}: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent showCloseButton={false} className={cn('overflow-hidden p-0', className)}>
        {/* Visually hidden but accessible title/description (Dialog requires
            both for a11y). `sr-only` alone loses this fight: DialogHeader's
            own layout classes (`relative flex flex-col gap-1 px-6 pt-6 pb-4`)
            and `sr-only`'s reset (`position:absolute; padding:0; …`) are all
            plain (non-!important) utilities on the same element, and
            Tailwind orders its generated CSS by its own internal utility
            grouping, not by className string order — so `px-6 pt-6 pb-4`
            and the base `relative` were winning over `sr-only`'s override,
            leaving a real 48×40px padded box floating above the search
            input (confirmed via computed style: position was still
            `relative`, padding still `24px 24px 16px`). `!sr-only` forces
            every property `!important`, which wins regardless of source
            order. `showDivider={false}` also skips the header's bottom-line
            pseudo-element entirely, rather than relying on `sr-only`'s own
            `overflow:hidden`/`clip` to hide it. */}
        <DialogHeader className="!sr-only" showDivider={false}>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Command label={title}>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}

export interface CommandInputProps extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> {
  value?: string;
  onValueChange?: (value: string) => void;
}

export function CommandInput({ className, value, onValueChange, ...props }: CommandInputProps) {
  const { search, setSearch, listRef, activeValue, setActiveValue, label } = useCommandContext('CommandInput');
  const current = value ?? search;

  // A controlled `value` only ever drove this input's own display — Command's
  // filtering (`matches`, in CommandContext) always reads its own internal
  // `search` state, which a controlled/readOnly CommandInput never touches
  // (no onChange ever fires). Result: a pre-seeded `value` like the Empty
  // story's "no-such-command" rendered in the box but filtered nothing, so
  // every CommandItem stayed mounted and CommandEmpty never showed. Sync
  // the controlled value into `search` so filtering follows it too.
  useLayoutEffect(() => {
    if (value !== undefined) setSearch(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const moveHighlight = (dir: 1 | -1) => {
    const items = listRef.current?.querySelectorAll<HTMLElement>('[data-command-item]');
    if (!items || items.length === 0) return;
    const values = Array.from(items).map((el) => el.dataset.value ?? '');
    const index = Math.max(values.indexOf(activeValue ?? ''), 0);
    const next = Math.min(Math.max(index + dir, 0), values.length - 1);
    setActiveValue(values[next]);
    items[next]?.scrollIntoView({ block: 'nearest' });
  };

  return (
    <div className="flex h-12 items-center gap-2.5 border-b border-solid border-[var(--color-border-border-subtle)] px-3.5">
      <Search width={16} height={16} className="shrink-0 text-[var(--color-icon-icon-subtle)]" aria-hidden="true" />
      <input
        role="combobox"
        aria-expanded="true"
        aria-label={props['aria-label'] ?? label}
        value={current}
        onChange={(e) => {
          setSearch(e.target.value);
          onValueChange?.(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            moveHighlight(1);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            moveHighlight(-1);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            const el = listRef.current?.querySelector<HTMLElement>(`[data-command-item][data-value="${CSS.escape(activeValue ?? '')}"]`);
            el?.click();
          } else if (e.key === 'Escape') {
            // Clear the query rather than stopPropagation — a CommandDialog's
            // own Escape-to-close still bubbles up and fires afterward.
            e.preventDefault();
            setSearch('');
            onValueChange?.('');
          }
        }}
        className={cn(
          'flex h-10 w-full cursor-text bg-transparent font-body text-body-m text-[var(--color-text-text)] outline-none',
          'placeholder:text-[var(--color-text-text-subtler)] disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function CommandList({ className, ...props }: React.ComponentProps<'div'>) {
  const { listRef } = useCommandContext('CommandList');
  return <div ref={listRef as React.RefObject<HTMLDivElement>} role="listbox" className={cn('max-h-[20.75rem] scroll-py-1 overflow-y-auto overflow-x-hidden', className)} {...props} />;
}

export function CommandEmpty({ className, ...props }: React.ComponentProps<'div'>) {
  const { loading } = useCommandContext('CommandEmpty');
  if (loading) return null;
  return (
    <div
      className={cn(
        'py-8 text-center font-body text-body-s text-[var(--color-text-text-subtler)]',
        '[[role=listbox]:has([data-command-item])_&]:hidden',
        className,
      )}
      {...props}
    />
  );
}

export function CommandLoading({ className, children, ...props }: React.ComponentProps<'div'>) {
  const { loading } = useCommandContext('CommandLoading');
  if (!loading) return null;
  return (
    <div role="status" aria-live="polite" className={cn('flex items-center justify-center gap-2 py-8 font-body text-body-s text-[var(--color-text-text-subtler)]', className)} {...props}>
      {children ?? (
        <>
          <span className="size-3 rounded-full border-2 border-[var(--color-border-border-default)] border-t-[var(--color-icon-icon-primary)] animate-spin motion-reduce:animate-none" />
          Loading…
        </>
      )}
    </div>
  );
}

export interface CommandGroupProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  heading?: ReactNode;
  children?: ReactNode;
}

export function CommandGroup({ className, heading, children, ...props }: CommandGroupProps) {
  return (
    <div className={cn('overflow-hidden p-1 text-[var(--color-text-text)]', '[&:not(:has([data-command-item]))]:hidden', className)} {...props}>
      {heading != null && <div className="px-2.5 pb-1 pt-2 font-body text-body-xs font-medium uppercase tracking-[0.05em] text-[var(--color-text-text-subtler)]">{heading}</div>}
      {children}
    </div>
  );
}

export function CommandSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  return <div role="separator" className={cn('-mx-1 my-1 h-px bg-[var(--color-border-border-subtle)]', className)} {...props} />;
}

export interface CommandItemProps extends Omit<React.ComponentProps<'div'>, 'value' | 'onClick' | 'onSelect'> {
  value?: string;
  keywords?: string[];
  onSelect?: (value: string) => void;
  disabled?: boolean;
  /** Icon before the label — 16px, decorative. Mutually exclusive with `toneIcon` (same slot). You can still embed an icon directly in `children` instead (existing pattern) if you don't need `description`. */
  icon?: ReactNode;
  /** Tone-tinted glyph before the label instead of `icon` — same slot. */
  toneIcon?: { tone: StatusTone; icon?: ReactNode; shape?: 'circle' | 'square' };
  /** Second line under the label, smaller and subtler. When set (or `breadcrumb` is set), `children` is treated as the label only — don't also embed a leading icon or trailing CommandShortcut in children; use the `icon`/`toneIcon` props instead. */
  description?: ReactNode;
  /** Path/context line ABOVE the label, smaller and subtler — e.g. "Settings > Review". */
  breadcrumb?: ReactNode;
}

export function CommandItem({ className, value, keywords, onSelect, disabled, icon, toneIcon, description, breadcrumb, children, ...props }: CommandItemProps) {
  const ctx = useCommandContext('CommandItem');
  const reactId = useId();
  const itemValue = value ?? reactId;
  const text = `${value ?? ''} ${(keywords ?? []).join(' ')}`.trim();

  if (!ctx.matches(text)) return null;

  const isHighlighted = ctx.activeValue === itemValue;

  return (
    <div
      role="option"
      aria-selected={isHighlighted}
      data-command-item=""
      data-value={itemValue}
      data-highlighted={isHighlighted || undefined}
      aria-disabled={disabled}
      onMouseEnter={() => !disabled && ctx.setActiveValue(itemValue)}
      onClick={() => !disabled && onSelect?.(value ?? itemValue)}
      className={cn(
        'relative flex cursor-default select-none items-center gap-2.5 rounded-[var(--size-border-radius-border-radius-md)]',
        'px-2.5 py-2 font-body text-body-m text-[var(--color-text-text)] outline-none',
        // Plain bg fill, matching Select's own dropdown-item highlight convention — no extra ring.
        'data-[highlighted]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        disabled && 'pointer-events-none opacity-50',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4 [&_svg]:text-[var(--color-icon-icon-subtle)]',
        className,
      )}
      {...props}
    >
      {(icon || toneIcon) && (
        <span className="flex shrink-0 items-center justify-center">
          {toneIcon ? <ToneIcon tone={toneIcon.tone} icon={toneIcon.icon} shape={toneIcon.shape} size="sm" /> : icon}
        </span>
      )}
      {description || breadcrumb ? (
        <span className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {breadcrumb && <span className="min-w-0 truncate text-body-xs font-normal text-[var(--color-text-text-subtler)]">{breadcrumb}</span>}
          <span className="min-w-0 truncate">{children}</span>
          {description && <span className="min-w-0 truncate text-body-xs font-normal text-[var(--color-text-text-subtler)]">{description}</span>}
        </span>
      ) : (
        children
      )}
    </div>
  );
}

export function CommandShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={cn('ml-auto font-mono text-[0.6875rem] tracking-widest text-[var(--color-text-text-subtler)]', className)} {...props} />;
}

/** Keyboard-hint footer — ↑/↓ Navigate, ↵ Select, Esc Close by default. Pass `children` to customize (e.g. add ⌘↵ "Open in new tab" for a link-like palette). */
export function CommandFooter({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 border-t border-solid border-[var(--color-border-border-subtle)]',
        'px-3.5 py-2 font-body text-body-xs text-[var(--color-text-text-subtler)]',
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <span className="flex items-center gap-1">
            <kbd className="rounded-[var(--size-border-radius-border-radius-sm)] border border-solid border-[var(--color-border-border-subtle)] px-1 py-0.5 font-sans text-[0.6875rem]">↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded-[var(--size-border-radius-border-radius-sm)] border border-solid border-[var(--color-border-border-subtle)] px-1 py-0.5 font-sans text-[0.6875rem]">↵</kbd>
            Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded-[var(--size-border-radius-border-radius-sm)] border border-solid border-[var(--color-border-border-subtle)] px-1 py-0.5 font-sans text-[0.6875rem]">Esc</kbd>
            Close
          </span>
        </>
      )}
    </div>
  );
}
