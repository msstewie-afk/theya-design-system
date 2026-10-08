'use client';

import { useState, useRef, useId, useMemo, useEffect } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { Xmark } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { Spinner } from './spinner';
import { ScrollArea } from './scroll-area';
import { Popover, PopoverAnchor, PopoverContent } from './popover';
import { useTheyaI18n } from '../../lib/i18n';

/**
 * A free-text input with filtered suggestions, built on Theya's Popover.
 * The value is the TEXT the user typed; picking a suggestion fills the
 * input with that option's label, but typing something matching no
 * option keeps whatever was typed (shows emptyMessage, never clears).
 * Unlike Combobox, the value never has to resolve to one of the options.
 */
export interface AutocompleteOption {
  value: string;
  label: ReactNode;
  /** Small trailing note next to the label, e.g. why a match already appears elsewhere. */
  note?: ReactNode;
}

export interface AutocompleteProps {
  options: AutocompleteOption[];
  /** Matches TextField's own heightSize: 'md' (40px, body-m) or 'sm' (32px, body-s) — the dropdown's own text size follows it too. */
  heightSize?: 'md' | 'sm';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  emptyMessage?: string;
  loading?: boolean;
  loadingMessage?: string;
  /** Turn off local filtering when the parent supplies already-filtered options (async). */
  disableFilter?: boolean;
  /** Show the clear (x) button when there is text. Defaults to true. */
  showClear?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  className?: string;
  contentClassName?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
  'aria-describedby'?: string;
}

export function Autocomplete({
  options,
  heightSize = 'md',
  placeholder,
  value,
  defaultValue,
  onValueChange,
  emptyMessage,
  loading = false,
  loadingMessage,
  disableFilter = false,
  showClear = true,
  disabled,
  readOnly,
  required,
  id,
  name,
  className,
  contentClassName,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
}: AutocompleteProps) {
  const { t } = useTheyaI18n();
  if (emptyMessage === undefined) emptyMessage = t.common.noResults;
  if (loadingMessage === undefined) loadingMessage = t.common.loading;
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? '');
  const current = isControlled ? (value ?? '') : internal;
  const isInvalid = ariaInvalid === true || ariaInvalid === 'true';
  const [open, setOpen] = useState(false);
  // Keyboard highlight. -1 = nothing highlighted: this is a free-text
  // field, so Enter with no highlight must keep what was typed (and let
  // the key reach a surrounding form) instead of picking the first match.
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const generatedId = useId();
  const resolvedId = id ?? generatedId;
  const listId = `${resolvedId}-listbox`;

  const setValue = (next: string) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };

  // Label-prefix match: a query reaches labels that start with it, not
  // mid-label substrings. (Combobox's default filter is looser — it also
  // matches the start of any word and an option's keywords.)
  const filtered = useMemo(() => {
    if (disableFilter || !current) return options;
    const q = current.toLowerCase();
    return options.filter((o) => String(o.label).toLowerCase().startsWith(q));
  }, [options, current, disableFilter]);

  const listVisible = open && !readOnly && !loading && filtered.length > 0;
  const activeOptionId = listVisible && activeIndex >= 0 && activeIndex < filtered.length
    ? `${listId}-${activeIndex}`
    : undefined;

  // Keep the highlighted option in view when arrowing through a long list.
  useEffect(() => {
    if (!activeOptionId) return;
    listRef.current?.querySelector(`#${CSS.escape(activeOptionId)}`)?.scrollIntoView({ block: 'nearest' });
  }, [activeOptionId]);

  const pick = (option: AutocompleteOption) => {
    setValue(String(option.label));
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  // Keyboard support (WCAG 2.1.1): suggestions used to be reachable by
  // mouse only — the input handled Escape and nothing else.
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!readOnly) setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (activeOptionId) {
        e.preventDefault();
        pick(filtered[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <Popover open={open && !readOnly} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className={cn('relative', className)}>
          <input
            ref={inputRef}
            id={resolvedId}
            name={name}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeOptionId}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledby}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedby}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            placeholder={placeholder}
            value={current}
            onFocus={() => {
              if (readOnly) return;
              setOpen(true);
              setActiveIndex(-1);
            }}
            onChange={(e) => {
              setValue(e.target.value);
              setActiveIndex(-1);
              if (!readOnly) setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            className={cn(
              'w-full rounded-[var(--size-border-radius-border-radius-lg)] border border-solid',
              'border-[var(--color-border-border)] bg-[var(--color-bg-input-bg-input)]',
              'ps-[var(--size-padding-padding-lg)] text-[var(--color-text-text)]',
              // Same two steps as TextField's own heightSize, so a field
              // set to "sm" next to it reads as the same control.
              heightSize === 'sm'
                ? 'h-[var(--size-size-control-size-control-lg)] text-body-s' // 32px
                : 'h-[var(--size-size-control-size-control-2xl)] text-body-m', // 40px
              'placeholder:text-[var(--color-text-text-subtler)] outline-none',
              // Value AND placeholder both go danger when invalid.
              'aria-[invalid=true]:text-[var(--color-text-text-danger)]',
              'aria-[invalid=true]:placeholder:text-[var(--color-text-text-danger)]',
              showClear && current && !disabled ? 'pe-9' : 'pe-[var(--size-padding-padding-xs)]',
              'transition-[border-color,background-color,box-shadow] duration-standard ease-enter motion-reduce:transition-none',
              'hover:not-disabled:not-read-only:not-aria-[invalid=true]:border-[var(--color-border-border-primary)]',
              'focus-visible:not-read-only:not-aria-[invalid=true]:border-[var(--color-border-border-primary)]',
              // Guarded the same way as the border rule above — this bg
              // rule sits at equal specificity with the invalid bg rules
              // below, so unguarded it could still paint the neutral
              // "active" blue over an invalid field on focus.
              'focus-visible:not-read-only:not-aria-[invalid=true]:bg-[var(--color-bg-input-bg-input-active)]',
              'focus-visible:not-read-only:focus-ring',
              // Both border AND bg change together on error, matching
              // TextField's own danger pairing.
              'aria-[invalid=true]:border-[var(--color-border-border-danger)]',
              'aria-[invalid=true]:bg-[var(--color-bg-input-bg-input-danger)]',
              // Named explicitly too — same fix pattern as Select/InputGroup.
              'aria-[invalid=true]:hover:border-[var(--color-border-border-danger-hover)]',
              'aria-[invalid=true]:focus-visible:border-[var(--color-border-border-danger)]',
              // One step denser than the idle/hover danger bg while
              // actively focused.
              'aria-[invalid=true]:focus-visible:bg-[var(--color-bg-input-bg-input-danger-pressed)]',
              'aria-[invalid=true]:focus-visible:focus-ring-error',
              'disabled:cursor-not-allowed disabled:border-[var(--color-border-border)]',
              'disabled:bg-[var(--color-bg-neutral-bg-neutral-subtler)] disabled:text-[var(--color-text-text-disabled)] disabled:italic',
              'read-only:cursor-default read-only:italic read-only:bg-[var(--color-bg-neutral-bg-neutral-subtler)]',
            )}
          />
          {showClear && current && !disabled && !readOnly && (
            <button
              type="button"
              aria-label={t.common.clear}
              onClick={() => {
                setValue('');
                inputRef.current?.focus();
              }}
              className={cn(
                'absolute end-2 top-1/2 -translate-y-1/2',
                'flex items-center justify-center size-6 rounded-[var(--size-border-radius-border-radius-lg)]',
                isInvalid
                  ? 'text-[var(--color-icon-icon-danger)] hover:bg-[var(--color-bg-danger-bg-danger-subtler-hover)]'
                  : 'text-[var(--color-icon-icon-subtle)] hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
              )}
            >
              <Xmark width={12} height={12} aria-hidden="true" />
            </button>
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent
        // Anchor-opened (no Radix Trigger), so PopoverContent can't label
        // itself by one; without this the panel was an unnamed "dialog".
        aria-labelledby={ariaLabelledby}
        aria-label={ariaLabelledby ? undefined : (ariaLabel ?? t.autocomplete.suggestions)}
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        // Opening via `onFocus` on the input (no Radix `Trigger`) means
        // Radix's DismissableLayer has no built-in way to recognize "this
        // outside pointerdown is the very click that just opened me" — that
        // exemption is normally wired through `Trigger`. Without it, a
        // mouse click on the input opens the popover and is then
        // immediately re-interpreted as a click OUTSIDE the content on its
        // trailing phase, closing it again on the same click — a visible
        // open-then-close flash. Guard explicitly: if the "outside"
        // pointerdown target is our own input, it's not actually outside.
        onPointerDownOutside={(e) => {
          if (e.target === inputRef.current) e.preventDefault();
        }}
        // Same reasoning as onPointerDownOutside above, but for the
        // FOCUS_OUTSIDE path (`useFocusOutside` in Radix's
        // DismissableLayer): opening is triggered by `onFocus` on the
        // input, not a click on a Radix `Trigger`, so Radix's own
        // "ignore my own opening interaction" exemption (which only
        // checks `context.triggerRef`) never applies here either. Without
        // this guard, the very focus event that opens the popover can be
        // (re)seen as a focus landing outside the content and close it
        // immediately — the open-then-instantly-closed flash reported live.
        onFocusOutside={(e) => {
          if (e.target === inputRef.current) e.preventDefault();
        }}
        className={cn('w-[var(--radix-popover-trigger-width)] p-1', contentClassName)}
      >
        {loading ? (
          <div className={cn("px-3 py-2 flex items-center gap-2 font-body text-[var(--color-text-text-subtler)]", heightSize === 'sm' ? 'text-body-s' : 'text-body-m')}>
            <Spinner className="size-3.5 text-[var(--color-icon-icon-primary)]" />
            {loadingMessage}
          </div>
        ) : filtered.length === 0 ? (
          <div className={cn("px-3 py-2 font-body text-[var(--color-text-text-subtler)]", heightSize === 'sm' ? 'text-body-s' : 'text-body-m')}>{emptyMessage}</div>
        ) : (
          <ScrollArea focusable={false} className="max-h-60">
          <ul ref={listRef} id={listId} role="listbox">
            {filtered.map((option, index) => (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={String(option.label) === current}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => pick(option)}
                className={cn(
                  'flex items-center gap-2.5 cursor-default select-none',
                  'rounded-[var(--size-border-radius-border-radius-md)]',
                  'px-[var(--size-margin-margin-s)] py-[var(--size-margin-margin-xs)]',
                  // Matches the input's own heightSize-driven text size.
                  heightSize === 'sm' ? 'text-body-s' : 'text-body-m',
                  'text-[var(--color-text-text)]',
                  index === activeIndex && 'bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
                )}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {option.note && (
                  <span
                    title={typeof option.note === 'string' ? option.note : undefined}
                    className="ms-auto max-w-[60%] shrink-0 truncate font-body text-body-xs text-[var(--color-text-text-subtler)]"
                  >
                    {option.note}
                  </span>
                )}
              </li>
            ))}
          </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
