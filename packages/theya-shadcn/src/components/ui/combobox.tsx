import { useState, useRef, useId, useMemo, useEffect } from 'react';
import type { ReactNode, KeyboardEvent } from 'react';
import { NavArrowDown, Check, Xmark, Plus } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverAnchor, PopoverContent } from './popover';
import { Chip, ChipRemove } from './chip';
import { ScrollArea } from './scroll-area';

/**
 * No Radix combobox primitive exists — built on our own Popover, per
 * explicit choice to avoid a cmdk dependency. Ported from a Base UI
 * reference that's grown into a full multi-select-with-chips picker.
 * Two things intentionally NOT ported:
 *  - Chip reorder/removal FLIP animation — the reference itself has
 *    this disabled (`CHIP_LAYOUT_ANIMATION_ENABLED = false`,
 *    "temporarily disabled for visual evaluation"), so it was dead
 *    code there too; not worth reimplementing something even the
 *    source has turned off.
 *  - `wrap={false}` (single-line horizontal-scroll chip strip with
 *    its own keyboard navigation) — a genuinely separate, complex UX
 *    on top of everything else here. Deferred; `wrap` always behaves
 *    as `true` (chips wrap to new lines) in this draft.
 */
export interface ComboboxOption {
  value: string;
  label: string;
  /** Additional terms included in the default local match. */
  keywords?: string[];
  disabled?: boolean;
}

interface ComboboxCommonProps {
  options: ComboboxOption[];
  /** Matches TextField's own heightSize: 'md' (40px, body-m) or 'sm' (32px, body-s) — the dropdown's own text size follows it too. */
  heightSize?: 'md' | 'sm';
  placeholder?: string;
  emptyMessage?: ReactNode;
  loading?: boolean;
  loadingMessage?: ReactNode;
  /** Allow the current input to be committed even if it matches no option. */
  allowCreate?: boolean;
  /** In multiple mode, commit the current input as a chip when space or comma is typed. */
  createOnDelimiter?: boolean;
  /** Label for the create-option row in multiple mode. Defaults to `Create "{query}"`. */
  createOptionLabel?: (query: string) => ReactNode;
  createOptionIcon?: ReactNode;
  clearLabel?: string;
  triggerLabel?: string;
  showClear?: boolean;
  showTrigger?: boolean;
  disabled?: boolean;
  /** Presentation-only: no border/fill/hover, no chevron/clear/chip-remove. Chips always wrap. */
  readOnly?: boolean;
  id?: string;
  className?: string;
  contentClassName?: string;
  renderOption?: (option: ComboboxOption) => ReactNode;
  renderChip?: (option: ComboboxOption) => ReactNode;
  filter?: (option: ComboboxOption, query: string) => boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
  'aria-describedby'?: string;
}

export type ComboboxSingleProps = ComboboxCommonProps & {
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export type ComboboxMultipleProps = ComboboxCommonProps & {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps;

function defaultFilter(option: ComboboxOption, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const candidates = [option.label, ...(option.keywords ?? [])];
  return candidates.some((c) => {
    const lc = c.toLowerCase();
    if (lc.startsWith(q)) return true;
    return lc.split(/[^a-z0-9]+/i).some((word) => word.startsWith(q));
  });
}

export function Combobox(props: ComboboxProps) {
  const {
    options,
    placeholder = 'Select…',
    heightSize = 'md',
    emptyMessage = 'No results.',
    loading = false,
    loadingMessage = 'Loading…',
    allowCreate = false,
    createOnDelimiter = false,
    createOptionLabel = (q: string) => `Create "${q}"`,
    createOptionIcon = <Plus width={14} height={14} />,
    clearLabel = 'Clear selection',
    triggerLabel = 'Open options',
    showClear = false,
    showTrigger = true,
    disabled = false,
    readOnly = false,
    id,
    className,
    contentClassName,
    renderOption,
    renderChip,
    filter = defaultFilter,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedby,
  } = props;
  const multiple = props.multiple === true;
  const isInvalid = ariaInvalid === true || ariaInvalid === 'true';

  const isControlled = props.value !== undefined;
  const [internalSingle, setInternalSingle] = useState((!multiple ? (props as ComboboxSingleProps).defaultValue : undefined) ?? '');
  const [internalMultiple, setInternalMultiple] = useState<string[]>((multiple ? (props as ComboboxMultipleProps).defaultValue : undefined) ?? []);
  const currentSingle = !multiple ? ((isControlled ? (props as ComboboxSingleProps).value : internalSingle) ?? '') : '';
  const currentMultiple = multiple ? ((isControlled ? (props as ComboboxMultipleProps).value : internalMultiple) ?? []) : [];

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  // Keep the keyboard highlight visible: ArrowDown past the visible rows
  // used to move the highlight out of view without scrolling the list.
  useEffect(() => {
    if (!open) return;
    document.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, open]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const showClearControl = showClear && !readOnly;
  const showTriggerControl = showTrigger && !readOnly;

  const selectedSingleOption = options.find((o) => o.value === currentSingle);
  const selectedMultipleOptions = currentMultiple
    .map((v) => options.find((o) => o.value === v) ?? (allowCreate ? { value: v, label: v } : undefined))
    .filter((o): o is ComboboxOption => Boolean(o));

  // Sync the visible text with the committed value when NOT actively
  // editing (closed) — mirrors it, but never fights the user's own
  // in-progress typing while the popup is open.
  useEffect(() => {
    if (open) return;
    if (multiple) {
      setQuery('');
    } else {
      setQuery(selectedSingleOption?.label ?? (allowCreate && currentSingle ? currentSingle : ''));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSingle, open, multiple]);

  const notifySingle = (next: string) => {
    if (!isControlled) setInternalSingle(next);
    (props as ComboboxSingleProps).onValueChange?.(next);
  };
  const notifyMultiple = (next: string[]) => {
    if (!isControlled) setInternalMultiple(next);
    (props as ComboboxMultipleProps).onValueChange?.(next);
  };

  const filtered = useMemo(() => {
    const unselected = multiple ? options.filter((o) => !currentMultiple.includes(o.value)) : options;
    if (!query) return unselected;
    return unselected.filter((o) => filter(o, query));
  }, [options, query, multiple, currentMultiple, filter]);

  const trimmedQuery = query.trim();
  const hasExactMatch = trimmedQuery.length > 0 && filtered.some((o) => o.label.toLowerCase() === trimmedQuery.toLowerCase());
  const showCreateRow = allowCreate && multiple && trimmedQuery.length > 0 && !hasExactMatch;
  const items: ComboboxOption[] = showCreateRow ? [{ value: trimmedQuery, label: trimmedQuery }, ...filtered] : filtered;

  const commitSingle = (option: ComboboxOption) => {
    notifySingle(option.value);
    setQuery(option.label);
    setOpen(false);
    inputRef.current?.focus();
  };

  const addChip = (option: ComboboxOption) => {
    if (currentMultiple.includes(option.value)) return;
    notifyMultiple([...currentMultiple, option.value]);
    setQuery('');
    setActiveIndex(0);
  };

  const removeChipAt = (index: number) => {
    notifyMultiple(currentMultiple.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = items[activeIndex];
      // Disabled options are skipped by pointer (pointer-events-none) but
      // Enter used to commit them anyway when the highlight landed on one.
      if (item && !item.disabled) {
        if (multiple) addChip(item);
        else commitSingle(item);
      } else if (allowCreate && !multiple) {
        notifySingle(query);
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      if (!multiple) setQuery(selectedSingleOption?.label ?? (allowCreate ? currentSingle : ''));
    } else if (
      multiple &&
      createOnDelimiter &&
      allowCreate &&
      (e.key === ' ' || e.key === ',') &&
      trimmedQuery.length > 0
    ) {
      e.preventDefault();
      const existing = options.find((o) => o.label.toLowerCase() === trimmedQuery.toLowerCase());
      addChip(existing ?? { value: trimmedQuery, label: trimmedQuery });
    } else if (multiple && e.key === 'Backspace' && query === '' && currentMultiple.length > 0) {
      removeChipAt(currentMultiple.length - 1);
    }
  };

  return (
    <Popover open={open && !readOnly && !disabled} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          className={cn(
            'relative flex w-full flex-wrap items-center gap-1',
            heightSize === 'sm' ? 'min-h-[var(--size-size-control-size-control-lg)]' : 'min-h-[var(--size-size-control-size-control-2xl)]', // 32px / 40px, matches TextField
            'rounded-[var(--size-border-radius-border-radius-lg)] border border-solid pl-2 pr-1 py-1',
            // Read-only: same visible-but-muted treatment as TextField/
            // Autocomplete (a distinct bg + subtle border), not fully
            // transparent — a transparent border+bg made the whole field
            // disappear instead of reading as "here, but not editable".
            readOnly
              ? 'border-[var(--color-border-border-subtle)] bg-[var(--color-bg-neutral-bg-neutral-subtler)]'
              : 'border-[var(--color-border-border-default)] bg-[var(--color-bg-input-bg-input)]',
            // hover:not-disabled: was a no-op here — this div is never
            // itself :disabled (only the nested input is), so the hover
            // rule fired even while disabled. Gate on the actual JS prop.
            // aria-invalid lives on the nested <input>, not this wrapper —
            // `aria-[invalid=true]` was checking the wrapper's OWN (never
            // set) attribute and never matched. Fixed to has-[input[...]],
            // and hover/focus-within gated off it so they can't paint over
            // the danger border once it actually works (2026-09-26 fix).
            !readOnly && !disabled && 'hover:not-has-[input[aria-invalid=true]]:border-[var(--color-border-border-primary)]',
            !readOnly && 'focus-within:not-has-[input[aria-invalid=true]]:border-[var(--color-border-border-primary)]',
            // Guarded the same way as the border rule above — unguarded,
            // this could still paint the neutral "active" blue bg over an
            // invalid combobox on focus.
            !readOnly && 'focus-within:not-has-[input[aria-invalid=true]]:bg-[var(--color-bg-input-bg-input-active)]',
            !readOnly && 'focus-within:focus-ring',
            // Both border AND bg change together on error, matching
            // TextField's own danger pairing.
            'has-[input[aria-invalid=true]]:border-[var(--color-border-border-danger)]',
            'has-[input[aria-invalid=true]]:bg-[var(--color-bg-input-bg-input-danger)]',
            'has-[input[aria-invalid=true]]:hover:border-[var(--color-border-border-danger-hover)]',
            'has-[input[aria-invalid=true]]:focus-within:border-[var(--color-border-border-danger)]',
            // One step denser than the idle/hover danger bg while the
            // inner input is actively focused.
            'has-[input[aria-invalid=true]]:focus-within:bg-[var(--color-bg-input-bg-input-danger-pressed)]',
            'has-[input[aria-invalid=true]]:focus-within:focus-ring-error',
            'transition-[border-color,background-color,box-shadow] duration-standard ease-enter motion-reduce:transition-none',
            disabled && 'border-[var(--color-border-border-subtle)] bg-[var(--color-bg-neutral-bg-neutral-subtler)] text-[var(--color-text-text-subtler)] italic',
            (showClearControl || showTriggerControl) && 'pr-9',
            className,
          )}
        >
          {multiple &&
            selectedMultipleOptions.map((option, index) => (
              // Inside-input chip — always `size="sm"` regardless of the
              // field's own heightSize (Combobox's compact/default control
              // height is a separate axis from chip size: chips *inside* an
              // input are always S, chips standalone elsewhere default M).
              <Chip key={option.value} size="sm" interactive={false} className="max-w-full">
                <span className="max-w-[10rem] truncate">{renderChip?.(option) ?? option.label}</span>
                {!readOnly && <ChipRemove aria-label={`Remove ${option.label}`} onClick={() => removeChipAt(index)} />}
              </Chip>
            ))}
          <input
            ref={inputRef}
            id={id}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            // Tells assistive tech which option the arrow keys highlighted —
            // focus stays in the input, so without this the highlight was
            // visual only and screen readers announced nothing on ArrowDown.
            aria-activedescendant={open && !loading && items[activeIndex] ? `${listId}-${activeIndex}` : undefined}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledby}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedby}
            tabIndex={readOnly ? -1 : 0}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={multiple ? (selectedMultipleOptions.length === 0 ? placeholder : undefined) : placeholder}
            value={query}
            onFocus={() => {
              if (readOnly || disabled) return;
              setOpen(true);
              // Opening via focus/click (not typing) should show the full
              // option list, not filter it down to the currently displayed
              // label — query otherwise still holds that label from the
              // sync effect below, collapsing the list to near-one match.
              if (!multiple) setQuery('');
            }}
            onChange={(e) => {
              const next = e.target.value;
              setQuery(next);
              setActiveIndex(0);
              if (!open) setOpen(true);
              if (!multiple && allowCreate) notifySingle(next);
            }}
            onKeyDown={handleKeyDown}
            className={cn(
              'min-w-[4rem] flex-1 bg-transparent outline-none',
              'font-body text-[var(--color-text-text)] placeholder:text-[var(--color-text-text-subtler)]',
              // Value AND placeholder both go danger when invalid, matching
              // the wrapper's own border/bg.
              'aria-[invalid=true]:text-[var(--color-text-text-danger)]',
              'aria-[invalid=true]:placeholder:text-[var(--color-text-text-danger)]',
              heightSize === 'sm' ? 'text-body-s' : 'text-body-m',
              'px-1 py-0.5',
              readOnly && 'italic cursor-default',
            )}
          />
          {(showClearControl || showTriggerControl) && (
            <div
              className={cn(
                'absolute top-1/2 -translate-y-1/2 flex items-center',
                // Matches the vertical gap (container height minus the
                // 24px button, halved) exactly at each heightSize, so the
                // gap to the right edge equals the gap to top/bottom:
                // m: (40-24)/2 = 8px -> right-2. s: (32-24)/2 = 4px -> right-1.
                heightSize === 'sm' ? 'right-1' : 'right-2',
              )}
            >
              {showClearControl && (currentSingle || currentMultiple.length > 0) && (
                <button
                  type="button"
                  aria-label={clearLabel}
                  onClick={() => {
                    if (multiple) notifyMultiple([]);
                    else {
                      notifySingle('');
                      setQuery('');
                    }
                  }}
                  className={cn(
                    'flex items-center justify-center size-6 rounded-[var(--size-border-radius-border-radius-md)]',
                    isInvalid
                      ? 'text-[var(--color-icon-icon-danger)] hover:bg-[var(--color-bg-danger-bg-danger-subtler-hover)]'
                      : 'text-[var(--color-icon-icon-subtle)] hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
                  )}
                >
                  <Xmark width={14} height={14} aria-hidden="true" />
                </button>
              )}
              {showTriggerControl && (
                <button
                  type="button"
                  aria-label={triggerLabel}
                  disabled={disabled}
                  onClick={() => {
                    setOpen((o) => {
                      const next = !o;
                      // Same reasoning as onFocus above: opening without
                      // typing should show the full list, not filter it
                      // down to the currently displayed label.
                      if (next && !multiple) setQuery('');
                      return next;
                    });
                    inputRef.current?.focus();
                  }}
                  className={cn(
                    'flex items-center justify-center size-6 rounded-[var(--size-border-radius-border-radius-md)]',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    isInvalid
                      ? 'text-[var(--color-icon-icon-danger)] hover:not-disabled:bg-[var(--color-bg-danger-bg-danger-subtler-hover)]'
                      : 'text-[var(--color-icon-icon-subtle)] hover:not-disabled:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
                  )}
                >
                  <NavArrowDown width={14} height={14} aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent
        // Anchor-opened (no Radix Trigger), so PopoverContent can't label
        // itself by one; without this the panel was an unnamed "dialog".
        aria-labelledby={ariaLabelledby}
        aria-label={ariaLabelledby ? undefined : (ariaLabel ?? 'Options')}
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        // Opening via `onFocus` on the input (no Radix `Trigger`, unlike
        // the dropdown-arrow button below, which toggles state itself and
        // never hits this) means Radix's own "ignore the interaction that
        // just opened me" exemption never applies — it only checks
        // `context.triggerRef`. Without these guards, the very
        // pointerdown/focus that opens the popover can immediately be
        // re-seen as an outside interaction and close it again — a visible
        // open-then-instantly-closed flash on the FIRST click into the
        // field. Same fix as Autocomplete's identical Anchor+onFocus
        // pattern (confirmed live, Sep 2026).
        onPointerDownOutside={(e) => {
          if (e.target === inputRef.current) e.preventDefault();
        }}
        onFocusOutside={(e) => {
          if (e.target === inputRef.current) e.preventDefault();
        }}
        className={cn('w-[var(--radix-popover-trigger-width)] p-1', contentClassName)}
      >
        {loading ? (
          <div className={cn('flex h-16 items-center justify-center gap-2 font-body text-[var(--color-text-text-subtler)]', heightSize === 'sm' ? 'text-body-s' : 'text-body-m')}>
            <span className="size-3 rounded-full border-2 border-[var(--color-border-border-default)] border-t-[var(--color-icon-icon-primary)] animate-spin" />
            {loadingMessage}
          </div>
        ) : items.length === 0 ? (
          <div className={cn('flex h-16 items-center justify-center font-body text-[var(--color-text-text-subtler)]', heightSize === 'sm' ? 'text-body-s' : 'text-body-m')}>
            {emptyMessage}
          </div>
        ) : (
          <ScrollArea focusable={false} className="max-h-60">
          <ul id={listId} role="listbox">
            {items.map((option, index) => {
              const isCreateRow = showCreateRow && index === 0;
              const isSelected = multiple
                ? currentMultiple.includes(option.value)
                : option.value === currentSingle;
              return (
                <li
                  key={option.value}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (option.disabled) return;
                    if (multiple) addChip(option);
                    else commitSingle(option);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    'relative flex cursor-default select-none items-center gap-2',
                    'rounded-[var(--size-border-radius-border-radius-md)]',
                    'px-[var(--size-margin-margin-s)] py-[var(--size-margin-margin-xs)]',
                    heightSize === 'sm' ? 'text-body-s' : 'text-body-m', 'text-[var(--color-text-text)]',
                    index === activeIndex && 'bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
                    option.disabled && 'pointer-events-none opacity-50',
                  )}
                >
                  {isCreateRow && (
                    <span className="flex items-center justify-center size-4 shrink-0 text-[var(--color-icon-icon-subtle)]">
                      {createOptionIcon}
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate">
                    {isCreateRow ? createOptionLabel(trimmedQuery) : (renderOption?.(option) ?? option.label)}
                  </span>
                  {!isCreateRow && isSelected && (
                    <Check width={14} height={14} className="text-[var(--color-icon-icon-primary)] shrink-0" aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
