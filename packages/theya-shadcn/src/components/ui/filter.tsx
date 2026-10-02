import { useState, useMemo, useRef, useId } from 'react';
import { NavArrowDown } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { TextField } from './text-field';
import { Popover, PopoverTrigger, PopoverContent } from './popover';

/**
 * A faceted filter control: a SelectTrigger-styled trigger button
 * (with an active-choice count badge) that opens a Popover of
 * checkbox options to narrow a list or table by one facet. Compose
 * several side by side to build a filter bar. Distinct from
 * MultiSelect (an inline form control that IS the value) and Combobox
 * (pick one option): this narrows a view, so it reads as button +
 * popover and clears back to "no filter". Uses a plain <button>
 * copying SelectTrigger's own classes rather than SelectTrigger
 * itself — Radix Select assumes an option-list popup, not this
 * checkbox-list content.
 *
 * The trigger sizes to its own content (`w-fit` + `whitespace-nowrap`),
 * not a fixed `--size-width-width-control-lg` — that fixed width was
 * wrapping the label onto a second line whenever it didn't happen to
 * match the value text's own width (worse the more facets sit side by
 * side in a filter bar with different label lengths).
 */
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterProps extends Omit<React.ComponentProps<'button'>, 'value' | 'defaultValue' | 'children'> {
  /** The facet name shown on the trigger, e.g. "Status". */
  label: string;
  options: FilterOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Show a search box above the list (for facets with many options). */
  searchable?: boolean;
  align?: 'start' | 'center' | 'end';
  /** Trigger height (and search-field height, when `searchable`) — matches TextField/Select/Toggle/Button's shared scale. sm 32px, body-s | md (default) 40px, body-m | lg 48px, body-m. */
  heightSize?: 'sm' | 'md' | 'lg';
}

export function Filter({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  searchable = false,
  align = 'start',
  heightSize = 'md',
  className,
  disabled,
  ...props
}: FilterProps) {
  const [internal, setInternal] = useState<string[]>(defaultValue ?? []);
  const selected = value ?? internal;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const optionIdPrefix = useId();

  const setSelected = (next: string[]) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  const toggle = (v: string) => {
    setSelected(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  };

  const shown = useMemo(
    () => (searchable ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase())) : options),
    [options, searchable, query],
  );

  const count = selected.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          data-active={count > 0 || undefined}
          // The badge alone made the name "2 Status"; the count is spoken
          // after the facet name instead. Set as one string — an sr-only
          // span added a stray space ("Status , 2 selected").
          aria-label={count > 0 ? `${label}, ${count} selected` : undefined}
          className={cn(
            'flex w-fit items-center gap-2 whitespace-nowrap',
            'rounded-[var(--size-border-radius-border-radius-lg)] border border-solid',
            'border-[var(--color-border-border-default)] bg-[var(--color-bg-input-bg-input)]',
            'px-[var(--size-margin-margin-s)] text-[var(--color-text-text)]',
            heightSize === 'sm'
              ? 'h-[var(--size-size-control-size-control-lg)] text-body-s'
              : heightSize === 'lg'
                ? 'h-[var(--size-size-control-size-control-4xl)] text-body-m'
                : 'h-[var(--size-size-control-size-control-2xl)] text-body-m',
            'transition-[border-color,background-color,box-shadow] duration-standard ease-enter motion-reduce:transition-none outline-none',
            'hover:not-disabled:border-[var(--color-border-border-primary)]',
            'focus-visible:border-[var(--color-border-border-primary)]',
            'focus-visible:bg-[var(--color-bg-input-bg-input-active)]',
            'focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
            'disabled:cursor-not-allowed disabled:border-[var(--color-border-border-subtle)] disabled:bg-[var(--color-bg-neutral-bg-neutral-subtler)] disabled:text-[var(--color-text-text-subtler)] disabled:italic',
            'data-[state=open]:border-[var(--color-border-border-primary)]',
            'data-[state=open]:bg-[var(--color-bg-input-bg-input-active)]',
            count > 0 && 'border-[var(--color-border-border-primary)]',
            '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
            '[&_svg]:text-[var(--color-icon-icon)] disabled:[&_svg]:text-[var(--color-icon-icon-subtle)]',
            className,
          )}
          {...props}
        >
          {count > 0 && (
            <span aria-hidden="true" className="flex size-[22px] items-center justify-center rounded-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-primary-bg-primary)] font-body text-body-xs text-[var(--color-text-text-on-primary)]">
              {count}
            </span>
          )}
          <span className="text-left">{label}</span>
          <NavArrowDown />
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-60 p-0">
        {searchable && (
          <div className="border-b border-solid border-[var(--color-border-border-subtler)] p-2">
            <TextField
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}…`}
              heightSize={heightSize}
              widthSize="full"
              aria-label={`Search ${label}`}
            />
          </div>
        )}
        <div ref={listRef} role="group" aria-label={label} className="max-h-64 overflow-y-auto p-1">
          {shown.length === 0 ? (
            <p className="px-2 py-6 text-center font-body text-body-s text-[var(--color-text-text-subtler)]">No options</p>
          ) : (
            shown.map((o) => {
              const isOn = selected.includes(o.value);
              const optionLabelId = `${optionIdPrefix}-${o.value}`;
              return (
                <label
                  key={o.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-[var(--size-border-radius-border-radius-md)]',
                    'px-2 py-1.5 font-body text-body-m text-[var(--color-text-text)]',
                    'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] has-[:focus-visible]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
                  )}
                >
                  {/* Named by the option text only — the wrapping <label> also
                      pulled the count in ("Active 24") and Checkbox's own
                      dev check can't see a wrapping label. */}
                  <Checkbox checked={isOn} onCheckedChange={() => toggle(o.value)} aria-labelledby={optionLabelId} />
                  <span id={optionLabelId} className="min-w-0 flex-1 truncate">
                    {o.label}
                  </span>
                  {o.count != null && <span className="tabular-nums text-body-xs text-[var(--color-text-text-subtler)]">{o.count}</span>}
                </label>
              );
            })
          )}
        </div>
        {count > 0 && (
          <div className="border-t border-solid border-[var(--color-border-border-subtler)] p-1">
            <Button
              appearance="ghost"
              size="md"
              onClick={() => {
                setSelected([]);
                // This button unmounts once nothing is selected; without
                // this, focus fell out of the popover to <body>.
                listRef.current?.querySelector<HTMLElement>('[role="checkbox"]')?.focus();
              }}
              className="w-full justify-start !pl-2 text-[var(--color-text-text-subtler)]"
            >
              Clear {count} selected
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
