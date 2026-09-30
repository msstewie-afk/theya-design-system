import { useState, useEffect, useId, useRef } from 'react';
import { Calendar as CalendarIcon, NavArrowDown, Xmark } from 'iconoir-react';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Calendar } from './calendar';
import { dateFieldTriggerClassName } from './date-picker';
import { Popover, PopoverTrigger, PopoverContent } from './popover';

/**
 * Start/end date field composing the same SelectTrigger-style trigger as
 * DatePicker + Popover + a range Calendar. Stays open through selection
 * (a range needs two clicks); close by clicking away or Esc. Two months by
 * default (numberOfMonths), stack vertically below md.
 *
 * It used to render an outlined Button instead, so it didn't match
 * DatePicker, had no error styling, and ignored `showClear` (documented in
 * the stories but never implemented). Now it mirrors DatePicker: the
 * range is the trigger's accessible description (aria-label / <label for>
 * replace the button text), the calendar opens on the selected range's
 * month, and clearing returns focus to the trigger.
 */
export interface DateRangePickerProps {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  /** Show an inline clear button when a range is selected. Default false. */
  showClear?: boolean;
  numberOfMonths?: number;
  disabled?: boolean;
  id?: string;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
  'aria-describedby'?: string;
  calendarProps?: Omit<React.ComponentProps<typeof Calendar>, 'mode' | 'selected' | 'onSelect' | 'numberOfMonths'>;
}

export function DateRangePicker({
  value,
  defaultValue,
  onChange,
  placeholder = 'Pick a date range',
  showClear = false,
  numberOfMonths = 2,
  disabled,
  id,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
  calendarProps,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const valueId = useId();
  const [internal, setInternal] = useState<DateRange | undefined>(defaultValue);
  const selected = value !== undefined ? value : internal;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const commit = (next: DateRange | undefined) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  const fmt = new Intl.DateTimeFormat(mounted ? undefined : 'en-US', { dateStyle: 'medium' });
  // react-day-picker v9 sets from === to on the first click; showing
  // "Sep 29, 2026 – Sep 29, 2026" mid-selection (or for a one-day range)
  // reads as a mistake, so a same-day range shows a single date.
  const sameDay = selected?.from && selected.to && selected.from.toDateString() === selected.to.toDateString();
  const label = selected?.from
    ? selected.to && !sameDay
      ? `${fmt.format(selected.from)} – ${fmt.format(selected.to)}`
      : fmt.format(selected.from)
    : '';

  const isError = ariaInvalid === true || ariaInvalid === 'true';
  const showClearControl = showClear && !disabled && Boolean(selected?.from);

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            type="button"
            id={id}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledby}
            aria-invalid={ariaInvalid}
            aria-describedby={[valueId, ariaDescribedby].filter(Boolean).join(' ')}
            data-error={isError || undefined}
            className={cn(dateFieldTriggerClassName, showClearControl ? 'pr-16' : 'pr-9')}
          >
            <CalendarIcon />
            <span
              id={valueId}
              className={cn(
                'min-w-0 flex-1 truncate text-left',
                !selected?.from && (isError ? 'text-[var(--color-text-text-danger)]' : 'text-[var(--color-text-text-subtler)]'),
              )}
            >
              {selected?.from ? label : placeholder}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="max-h-[var(--radix-popover-content-available-height)] w-auto overflow-y-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={selected}
            onSelect={commit}
            numberOfMonths={numberOfMonths}
            // Open on the range's month, not today's.
            defaultMonth={selected?.from}
            autoFocus
            {...calendarProps}
          />
        </PopoverContent>
      </Popover>
      <div className="pointer-events-none absolute inset-y-0 right-[var(--size-margin-margin-s)] flex items-center gap-1">
        {showClearControl && (
          <button
            type="button"
            aria-label="Clear date range"
            onClick={(e) => {
              e.stopPropagation();
              commit(undefined);
              // The clear button unmounts once the range is gone; keep focus.
              triggerRef.current?.focus();
            }}
            className={cn(
              'pointer-events-auto flex items-center justify-center size-6 rounded-[var(--size-border-radius-border-radius-md)]',
              'text-[var(--color-icon-icon-subtle)] hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
              'transition-colors duration-150 ease-out motion-reduce:transition-none',
            )}
          >
            <Xmark width={14} height={14} aria-hidden="true" />
          </button>
        )}
        <NavArrowDown width={16} height={16} className={cn('text-[var(--color-icon-icon-subtle)]', disabled && 'opacity-50')} aria-hidden="true" />
      </div>
    </div>
  );
}
