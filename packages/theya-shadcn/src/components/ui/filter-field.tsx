import { useState, useRef, useId, useMemo, useEffect } from 'react';
import type { ReactNode, KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { DateRange } from 'react-day-picker';
import { ArrowLeft, Type, List, Calendar as CalendarDaysIcon, Hashtag, Search, FilterList, Check } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { TextField } from './text-field';
import { NumberField } from './number-field';
import { Calendar } from './calendar';
import { Chip, ChipRemove } from './chip';
import { Kbd } from './kbd';
import { StatusDot, type StatusTone } from './status-dot';
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from './command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Popover, PopoverAnchor, PopoverTrigger, PopoverContent } from './popover';

/**
 * One compact field combining keyword search and attribute-based
 * filtering, per the reference's "Filters & Search UX pattern". Not
 * built on Base UI Autocomplete/Popover — ported onto our Radix
 * Popover, whose per-reason dismiss callbacks (onFocusOutside/
 * onPointerDownOutside) replace the reference's single onOpenChange
 * event-details veto, and whose onOpenAutoFocus (fires once per open
 * transition) replaces Base UI's initialFocus. A plain effect keyed
 * on activeKey covers focus when step two opens while the popover was
 * ALREADY open (a mouse click on an attribute row) — onOpenAutoFocus
 * only fires on the closed→open edge, not on that later transition.
 *
 * Step one is a hand-rolled role="listbox"/"option" pairing (not
 * Command): the field's own input must stay focused throughout, and
 * Command expects to own the input it navigates from. Step two's
 * searchable select still uses Command — that's a legitimate second,
 * distinct query over that attribute's own option list.
 */
export interface FilterFieldOption {
  value: string;
  label: string;
  tone?: StatusTone;
}

export type FilterAttribute =
  | { key: string; label: string; type: 'text'; placeholder?: string; operators?: boolean; icon?: ReactNode }
  | { key: string; label: string; type: 'select'; options: FilterFieldOption[]; multiple?: boolean; searchable?: boolean; icon?: ReactNode }
  | { key: string; label: string; type: 'date'; range?: boolean; icon?: ReactNode }
  | { key: string; label: string; type: 'number'; icon?: ReactNode };

export interface AppliedFilter {
  key: string;
  value: string;
  operator?: TextFilterOperator;
}

export type TextFilterOperator = 'contains' | 'equals' | 'is-present' | 'is-missing';

const TEXT_OPERATOR_LABEL: Record<TextFilterOperator, string> = {
  contains: 'Contains',
  equals: 'Equals',
  'is-present': 'Is present',
  'is-missing': 'Is missing',
};

const RANGE_SEPARATOR = '..';

const ATTRIBUTE_ICON = { text: Type, select: List, date: CalendarDaysIcon, number: Hashtag } as const;

/** Reserved AppliedFilter.key for a committed search query. */
export const FILTER_FIELD_SEARCH_KEY = '__search__';

function toISODate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fromISODate(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return undefined;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function encodeDate(selection: Date | DateRange | undefined): string {
  if (!selection) return '';
  if (selection instanceof Date) return toISODate(selection);
  if (!selection.from) return '';
  const from = toISODate(selection.from);
  const to = selection.to ? toISODate(selection.to) : from;
  return to === from ? from : `${from}${RANGE_SEPARATOR}${to}`;
}

function decodeDate(value: string): DateRange | undefined {
  const [from, to] = value.split(RANGE_SEPARATOR);
  const start = from ? fromISODate(from) : undefined;
  if (!start) return undefined;
  return { from: start, to: to ? fromISODate(to) : undefined };
}

/** Parse a `date` filter value into inclusive local-time bounds. */
export function parseFilterDate(value: string): { from: Date; to: Date } | undefined {
  const decoded = decodeDate(value);
  if (!decoded?.from) return undefined;
  const from = new Date(decoded.from);
  from.setHours(0, 0, 0, 0);
  const to = new Date(decoded.to ?? decoded.from);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

function parseNumberPart(part: string | undefined): number | undefined {
  if (!part || part.trim() === '') return undefined;
  const parsed = Number(part);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function encodeNumberRange(min: number | undefined, max: number | undefined): string {
  return `${min ?? ''}${RANGE_SEPARATOR}${max ?? ''}`;
}

function decodeNumberRange(value: string): { min: number | undefined; max: number | undefined } {
  const [minRaw, maxRaw] = value.split(RANGE_SEPARATOR);
  return { min: parseNumberPart(minRaw), max: parseNumberPart(maxRaw) };
}

/** Parse a `number` filter value into its bounds — either side undefined when open-ended. */
export function parseFilterNumber(value: string): { min: number | undefined; max: number | undefined } {
  return decodeNumberRange(value);
}

export interface FilterFieldProps {
  attributes: FilterAttribute[];
  value?: AppliedFilter[];
  defaultValue?: AppliedFilter[];
  onValueChange?: (value: AppliedFilter[]) => void;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  placeholder?: string;
  addLabel?: string;
  attributeLabel?: string;
  emptyMessage?: string;
  searchTipLabel?: string;
  applyLabel?: string;
  disabled?: boolean;
  align?: 'start' | 'center' | 'end';
  id?: string;
  className?: string;
  inputClassName?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export function FilterField({
  attributes,
  value,
  defaultValue,
  onValueChange,
  query,
  defaultQuery,
  onQueryChange,
  placeholder = 'Filter or search…',
  addLabel = 'Add filter',
  attributeLabel = 'Filter by…',
  emptyMessage = 'No attributes.',
  searchTipLabel = 'Search for',
  applyLabel = 'Apply',
  disabled,
  align = 'start',
  id,
  className,
  inputClassName,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
}: FilterFieldProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<AppliedFilter[]>(defaultValue ?? []);
  const filters = isControlled ? value! : internal;

  const isQueryControlled = query !== undefined;
  const [internalQuery, setInternalQuery] = useState(defaultQuery ?? '');
  const text = isQueryControlled ? query! : internalQuery;

  const [open, setOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [textOperator, setTextOperator] = useState<TextFilterOperator>('contains');
  const textOperatorNeedsValue = textOperator !== 'is-present' && textOperator !== 'is-missing';
  const [dateDraft, setDateDraft] = useState<DateRange | undefined>(undefined);
  const [numberDraft, setNumberDraft] = useState<{ min: number | undefined; max: number | undefined }>({ min: undefined, max: undefined });
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const [optionHighlighted, setOptionHighlighted] = useState(0);
  const optionListboxId = useId();
  const stepTwoRef = useRef<HTMLDivElement>(null);
  const [allSelected, setAllSelected] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat(mounted ? undefined : 'en-US', { dateStyle: 'medium', timeZone: mounted ? undefined : 'UTC' }),
    [mounted],
  );

  const byKey = useMemo(() => {
    const map = new Map<string, FilterAttribute>();
    for (const attribute of attributes) map.set(attribute.key, attribute);
    return map;
  }, [attributes]);

  const active = activeKey != null ? byKey.get(activeKey) : undefined;

  const normalizedQuery = text.trim();
  const filteredAttributes = useMemo(() => {
    if (!normalizedQuery) return attributes;
    const q = normalizedQuery.toLowerCase();
    return attributes.filter((attribute) => attribute.label.toLowerCase().includes(q));
  }, [attributes, normalizedQuery]);

  const [highlighted, setHighlighted] = useState(0);
  useEffect(() => {
    setHighlighted(0);
  }, [normalizedQuery, open, activeKey]);

  const setFilters = (next: AppliedFilter[]) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };
  const setQuery = (next: string) => {
    if (!isQueryControlled) setInternalQuery(next);
    onQueryChange?.(next);
  };

  const displayValue = (key: string, raw: string) => {
    const attribute = byKey.get(key);
    if (attribute?.type === 'select') return attribute.options.find((o) => o.value === raw)?.label ?? raw;
    if (attribute?.type === 'date') {
      const decoded = decodeDate(raw);
      if (!decoded?.from) return raw;
      return decoded.to ? `${dateFormat.format(decoded.from)} – ${dateFormat.format(decoded.to)}` : dateFormat.format(decoded.from);
    }
    if (attribute?.type === 'number') {
      const { min, max } = decodeNumberRange(raw);
      if (min == null && max == null) return raw;
      if (min != null && max != null) return `${min} – ${max}`;
      return min != null ? `${min}+` : `≤${max}`;
    }
    return raw;
  };

  const chipLabel = (filter: AppliedFilter) =>
    filter.operator
      ? `${byKey.get(filter.key)?.label ?? filter.key}: ${TEXT_OPERATOR_LABEL[filter.operator]}${filter.value ? ` ${displayValue(filter.key, filter.value)}` : ''}`
      : `${byKey.get(filter.key)?.label ?? filter.key}: ${displayValue(filter.key, filter.value)}`;

  const closePopover = () => {
    setOpen(false);
    setActiveKey(null);
    setDraft('');
    setTextOperator('contains');
    setDateDraft(undefined);
    setNumberDraft({ min: undefined, max: undefined });
  };

  const applyFilter = (key: string, raw: string, keepOpen = false, operator?: TextFilterOperator) => {
    const attribute = byKey.get(key);
    const next = raw.trim();
    const isPresenceOperator = operator === 'is-present' || operator === 'is-missing';
    if (!attribute || (!next && !isPresenceOperator)) return;

    if (attribute.type === 'select' && attribute.multiple) {
      const applied = filters.some((f) => f.key === key && f.value === next);
      setFilters(applied ? filters.filter((f) => !(f.key === key && f.value === next)) : [...filters, { key, value: next }]);
      return;
    }

    setFilters([...filters.filter((f) => f.key !== key), { key, value: isPresenceOperator ? '' : next, ...(operator ? { operator } : {}) }]);
    if (!keepOpen) closePopover();
  };

  const removeAt = (index: number) => {
    setAllSelected(false);
    setFilters(filters.filter((_, i) => i !== index));
  };

  const commitSearch = () => {
    const next = normalizedQuery;
    if (!next) return;
    setAllSelected(false);
    setFilters([...filters, { key: FILTER_FIELD_SEARCH_KEY, value: next }]);
    setQuery('');
    setHighlighted(0);
    inputRef.current?.focus();
  };

  const openStep = (key: string) => {
    setAllSelected(false);
    const attribute = byKey.get(key);
    const current = filters.find((f) => f.key === key);
    const applied = current?.value;
    setDraft(attribute?.type === 'text' ? (applied ?? '') : '');
    setTextOperator(current?.operator ?? 'contains');
    setDateDraft(attribute?.type === 'date' && applied ? decodeDate(applied) : undefined);
    setNumberDraft(attribute?.type === 'number' && applied ? decodeNumberRange(applied) : { min: undefined, max: undefined });
    setOptionHighlighted(0);
    setActiveKey(key);
  };

  // Covers step two opening while the popover was ALREADY open (a mouse
  // click on an attribute row) — onOpenAutoFocus below only fires on the
  // closed→open edge, not on this later activeKey change.
  const wasOpenRef = useRef(open);
  useEffect(() => {
    const openedJustNow = open && !wasOpenRef.current;
    wasOpenRef.current = open;
    // A closed->open jump straight into step two (a chip click while the
    // popover was shut) is that same transition, already handled by the
    // onOpenAutoFocus prop below — skip it here to avoid double-handling.
    if (!open || activeKey == null || openedJustNow) return;
    const target = stepTwoRef.current?.querySelector<HTMLElement>(
      'input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), button:not([disabled]):not([aria-label="Back to attributes"])',
    );
    target?.focus();
  }, [activeKey, open]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    const isSelectAll = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a';
    if (isSelectAll && filters.length > 0) {
      event.preventDefault();
      setAllSelected(true);
      return;
    }
    if (allSelected) {
      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();
        setFilters([]);
        setAllSelected(false);
        return;
      }
      setAllSelected(false);
    }
    if (event.key === 'Backspace' && text === '' && filters.length > 0) {
      event.preventDefault();
      removeAt(filters.length - 1);
      return;
    }
    if (!open || activeKey !== null) return;
    const lastIndex = filteredAttributes.length;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted((h) => Math.min(h + 1, lastIndex));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (highlighted === 0) commitSearch();
      else {
        const attribute = filteredAttributes[highlighted - 1];
        if (attribute) openStep(attribute.key);
      }
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setOpen(true);
          setAllSelected(false);
          return;
        }
        closePopover();
      }}
    >
      <PopoverAnchor asChild>
        <div
          ref={fieldRef}
          data-disabled={disabled || undefined}
          className={cn(
            'flex min-h-[var(--size-size-control-size-control-2xl)] w-[25rem] max-w-full shrink flex-wrap items-center gap-[3px]',
            'rounded-[var(--size-border-radius-border-radius-lg)] border border-solid px-[3px] py-[3px]',
            'border-[var(--color-border-border-default)] bg-[var(--color-bg-input-bg-input)]',
            'transition-[border-color,box-shadow] duration-150 ease-out motion-reduce:transition-none',
            'hover:not-data-[disabled]:border-[var(--color-border-border-primary)]',
            'focus-within:border-[var(--color-border-border-primary)]',
            'focus-within:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
            disabled && 'cursor-not-allowed bg-[var(--color-bg-neutral-bg-neutral-subtler)] opacity-70',
            className,
          )}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !disabled) {
              event.preventDefault();
              inputRef.current?.focus();
              setOpen(true);
            }
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={addLabel}
              disabled={disabled}
              className={cn(
                'grid size-6 shrink-0 place-items-center rounded-[var(--size-border-radius-border-radius-md)] text-[var(--color-icon-icon-subtle)]',
                'transition-colors duration-150 ease-out motion-reduce:transition-none',
                'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] hover:text-[var(--color-icon-icon)]',
                'focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
                'disabled:pointer-events-none',
              )}
            >
              <FilterList width={16} height={16} />
            </button>
          </PopoverTrigger>

          {filters.map((filter, index) => {
            const isSearch = filter.key === FILTER_FIELD_SEARCH_KEY;
            const label = isSearch ? filter.value : chipLabel(filter);
            return (
              <Chip
                key={`${filter.key}-${filter.value}-${index}`}
                // Inside-input chip (this field renders as a bordered
                // input surface, same as Combobox) — always size="sm".
                size="sm"
                interactive={!isSearch}
                pressed={false}
                disabled={disabled}
                className={allSelected ? 'shadow-[0_0_0_2px_var(--color-border-border-primary)]' : undefined}
                aria-label={isSearch ? undefined : label}
                onClick={
                  isSearch || disabled
                    ? undefined
                    : () => {
                        openStep(filter.key);
                        setOpen(true);
                      }
                }
                onKeyDown={
                  isSearch || disabled
                    ? undefined
                    : (event) => {
                        if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                          event.preventDefault();
                          openStep(filter.key);
                          setOpen(true);
                        }
                      }
                }
              >
                {isSearch && <Search width={14} height={14} aria-hidden="true" />}
                <span className="min-w-0 truncate">{label}</span>
                <ChipRemove
                  aria-label={isSearch ? `Remove search "${filter.value}"` : `Remove filter ${label}`}
                  tabIndex={disabled ? -1 : 0}
                  disabled={disabled}
                  onClick={() => {
                    removeAt(index);
                    inputRef.current?.focus();
                  }}
                />
              </Chip>
            );
          })}

          <input
            ref={inputRef}
            id={id}
            type="text"
            value={text}
            disabled={disabled}
            placeholder={filters.length > 0 ? undefined : placeholder}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            onClick={() => setOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              if (!open) setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => setAllSelected(false)}
            aria-label={ariaLabel ?? placeholder}
            aria-labelledby={ariaLabelledby}
            aria-describedby={ariaDescribedby}
            className={cn(
              'h-6 w-auto min-w-10 flex-1 border-0 bg-transparent px-0 py-0 outline-none',
              'font-body text-body-m text-[var(--color-text-text)] placeholder:text-[var(--color-text-text-subtler)]',
              'disabled:bg-transparent disabled:opacity-100',
              inputClassName,
            )}
          />

          <span className="sr-only" role="status">
            {allSelected
              ? `${filters.length} ${filters.length === 1 ? 'filter' : 'filters'} selected. Press Backspace or Delete to remove.`
              : filters.length === 0
                ? 'No filters applied'
                : `${filters.length} ${filters.length === 1 ? 'filter' : 'filters'} applied`}
          </span>
        </div>
      </PopoverAnchor>

      <PopoverContent
        align={align}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          if (activeKey == null) {
            inputRef.current?.focus();
            return;
          }
          const target = stepTwoRef.current?.querySelector<HTMLElement>(
            'input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), button:not([disabled]):not([aria-label="Back to attributes"])',
          );
          target?.focus();
        }}
        onFocusOutside={(event) => {
          if (fieldRef.current?.contains(event.target as Node)) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (fieldRef.current?.contains(event.target as Node)) event.preventDefault();
        }}
        className={cn('max-h-[var(--radix-popover-content-available-height)] overflow-y-auto p-0', active?.type === 'date' ? 'w-auto' : 'w-fit min-w-72 max-w-[var(--radix-popover-trigger-width)]')}
      >
        {active === undefined ? (
          <div id={listboxId} role="listbox" aria-label={attributeLabel} className="max-h-64 overflow-y-auto p-1">
            <div
              role="option"
              aria-selected={highlighted === 0}
              aria-disabled={normalizedQuery === '' || undefined}
              onMouseEnter={() => setHighlighted(0)}
              onClick={commitSearch}
              className={cn(
                'flex cursor-default select-none items-center gap-2.5 rounded-[var(--size-border-radius-border-radius-md)]',
                'px-2.5 py-2 font-body text-body-s outline-none',
                '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-[var(--color-icon-icon-subtle)]',
                normalizedQuery === ''
                  ? 'pointer-events-none text-[var(--color-text-text-subtler)] opacity-70'
                  : cn('cursor-pointer text-[var(--color-text-text)]', highlighted === 0 && 'bg-[var(--color-bg-neutral-bg-neutral-subtle)]'),
              )}
            >
              <Search width={16} height={16} aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">{normalizedQuery === '' ? searchTipLabel : `${searchTipLabel} "${normalizedQuery}"`}</span>
              <Kbd className="ml-auto shrink-0">Enter</Kbd>
            </div>
            <span className="sr-only" role="status">
              {filteredAttributes.length === 0 ? emptyMessage : null}
            </span>
            {filteredAttributes.map((attribute, index) => {
              const Icon = ATTRIBUTE_ICON[attribute.type];
              const isHighlighted = highlighted === index + 1;
              return (
                <div
                  key={attribute.key}
                  role="option"
                  aria-selected={isHighlighted}
                  onMouseEnter={() => setHighlighted(index + 1)}
                  onClick={() => openStep(attribute.key)}
                  className={cn(
                    'flex cursor-pointer select-none items-center gap-2.5 rounded-[var(--size-border-radius-border-radius-md)]',
                    'px-2.5 py-2 font-body text-body-s text-[var(--color-text-text)] outline-none',
                    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-[var(--color-icon-icon-subtle)]',
                    isHighlighted && 'bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
                  )}
                >
                  {attribute.icon ?? <Icon width={16} height={16} aria-hidden="true" />}
                  <span className="min-w-0 truncate">{attribute.label}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div ref={stepTwoRef}>
            <div className="flex items-center gap-1 border-b border-solid border-[var(--color-border-border-subtle)] p-1.5">
              <button
                type="button"
                aria-label="Back to attributes"
                onClick={() => {
                  setActiveKey(null);
                  setDraft('');
                  inputRef.current?.focus();
                }}
                className={cn(
                  'grid size-6 shrink-0 place-items-center rounded-[var(--size-border-radius-border-radius-md)] text-[var(--color-icon-icon-subtle)]',
                  'transition-colors duration-150 ease-out motion-reduce:transition-none',
                  'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] hover:text-[var(--color-icon-icon)]',
                  'focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
                )}
              >
                <ArrowLeft width={16} height={16} />
              </button>
              <span className="min-w-0 truncate font-body text-body-s font-medium text-[var(--color-text-text)]">{active.label}</span>
            </div>

            {active.type === 'text' ? (
              <div className="flex flex-col gap-2 p-2">
                <div className="flex items-center gap-2">
                  {active.operators && (
                    <Select heightSize="sm" value={textOperator} onValueChange={(v) => setTextOperator(v as TextFilterOperator)}>
                      <SelectTrigger className={cn('shrink-0', textOperatorNeedsValue ? 'w-[8.5rem]' : 'w-full')} aria-label={`${active.label} operator`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="is-present">Is present</SelectItem>
                        <SelectItem value="is-missing">Is missing</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {(!active.operators || textOperatorNeedsValue) && (
                    <TextField
                      value={draft}
                      placeholder={active.operators ? 'Value…' : (active.placeholder ?? 'Contains…')}
                      aria-label={`${active.label} ${TEXT_OPERATOR_LABEL[textOperator].toLowerCase()}`}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          applyFilter(active.key, draft, false, active.operators ? textOperator : undefined);
                        }
                      }}
                      widthSize="full"
                      heightSize="sm"
                    />
                  )}
                </div>
                <div className="flex justify-end">
                  <Button
                    appearance="filled"
                    tone="primary"
                    size="md"
                    disabled={textOperatorNeedsValue && draft.trim() === ''}
                    onClick={() => applyFilter(active.key, draft, false, active.operators ? textOperator : undefined)}
                  >
                    {applyLabel}
                  </Button>
                </div>
              </div>
            ) : active.type === 'select' && active.searchable === false ? (
              <div
                id={optionListboxId}
                role="listbox"
                aria-label={active.label}
                tabIndex={0}
                aria-activedescendant={`${optionListboxId}-${optionHighlighted}`}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    setOptionHighlighted((i) => Math.min(i + 1, active.options.length - 1));
                  } else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    setOptionHighlighted((i) => Math.max(i - 1, 0));
                  } else if (event.key === 'Enter') {
                    event.preventDefault();
                    const option = active.options[optionHighlighted];
                    if (option) applyFilter(active.key, option.value);
                  }
                }}
                className="max-h-64 overflow-y-auto p-1 outline-none"
              >
                {active.options.map((option, index) => (
                  <div
                    key={option.value}
                    id={`${optionListboxId}-${index}`}
                    role="option"
                    aria-selected={filters.some((f) => f.key === active.key && f.value === option.value)}
                    onMouseEnter={() => setOptionHighlighted(index)}
                    onClick={() => applyFilter(active.key, option.value)}
                    className={cn(
                      'flex cursor-default select-none items-center gap-2.5 rounded-[var(--size-border-radius-border-radius-md)]',
                      'px-2.5 py-2 font-body text-body-s text-[var(--color-text-text)] outline-none',
                      index === optionHighlighted && 'bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
                    )}
                  >
                    {option.tone && <StatusDot tone={option.tone} aria-hidden="true" />}
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    {filters.some((f) => f.key === active.key && f.value === option.value) && <Check width={14} height={14} aria-hidden="true" />}
                  </div>
                ))}
              </div>
            ) : active.type === 'select' ? (
              <Command label={`Search ${active.label.toLowerCase()}`}>
                <CommandInput placeholder={`Search ${active.label.toLowerCase()}`} />
                <CommandList className="max-h-64 p-1">
                  <CommandEmpty>No options.</CommandEmpty>
                  {active.options.map((option) => (
                    <CommandItem key={option.value} value={option.value} keywords={[option.label]} onSelect={() => applyFilter(active.key, option.value)}>
                      {option.tone && <StatusDot tone={option.tone} aria-hidden="true" />}
                      <span className="min-w-0 flex-1 truncate">{option.label}</span>
                      {filters.some((f) => f.key === active.key && f.value === option.value) && <Check width={14} height={14} aria-hidden="true" />}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            ) : active.type === 'number' ? (
              <div className="flex flex-col gap-2 p-2">
                <div className="flex flex-col gap-2">
                  <NumberField
                    value={numberDraft.min}
                    onValueChange={(min) => setNumberDraft((prev) => ({ ...prev, min }))}
                    placeholder="Min"
                    aria-label={`${active.label} minimum`}
                    decrementLabel={`Decrease ${active.label.toLowerCase()} minimum`}
                    incrementLabel={`Increase ${active.label.toLowerCase()} minimum`}
                    className="w-full"
                  />
                  <NumberField
                    value={numberDraft.max}
                    onValueChange={(max) => setNumberDraft((prev) => ({ ...prev, max }))}
                    placeholder="Max"
                    aria-label={`${active.label} maximum`}
                    decrementLabel={`Decrease ${active.label.toLowerCase()} maximum`}
                    incrementLabel={`Increase ${active.label.toLowerCase()} maximum`}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    appearance="filled"
                    tone="primary"
                    size="md"
                    disabled={numberDraft.min == null && numberDraft.max == null}
                    onClick={() => applyFilter(active.key, encodeNumberRange(numberDraft.min, numberDraft.max))}
                  >
                    {applyLabel}
                  </Button>
                </div>
              </div>
            ) : active.range ? (
              <Calendar
                mode="range"
                selected={dateDraft}
                onSelect={(next) => {
                  setDateDraft(next);
                  if (next?.from) applyFilter(active.key, encodeDate(next), true);
                }}
              />
            ) : (
              <Calendar
                mode="single"
                selected={dateDraft?.from}
                onSelect={(next) => {
                  if (next) applyFilter(active.key, encodeDate(next));
                }}
              />
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
