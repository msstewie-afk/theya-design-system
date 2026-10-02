import { useState, useEffect, useId, useRef } from 'react';
import { Calendar as CalendarIcon, NavArrowDown, Xmark } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Calendar } from './calendar';
import { Popover, PopoverTrigger, PopoverContent } from './popover';

/**
 * Trigger classes shared by DatePicker and DateRangePicker so both read as
 * the same SelectTrigger-style form field (border, hover/focus ring,
 * height, disabled and error treatment). Right padding is added by the
 * caller depending on whether the clear button is shown.
 */
export const dateFieldTriggerClassName = cn(
  'flex w-full items-center gap-2',
  'rounded-[var(--size-border-radius-border-radius-lg)] border border-solid',
  'border-[var(--color-border-border-default)] bg-[var(--color-bg-input-bg-input)]',
  'px-[var(--size-margin-margin-s)] text-[var(--color-text-text)]',
  'h-[var(--size-size-control-size-control-2xl)] text-body-m',
  'transition-[border-color,background-color,box-shadow] duration-standard ease-enter motion-reduce:transition-none outline-none',
  'hover:not-disabled:not-data-[error=true]:border-[var(--color-border-border-primary)]',
  'focus-visible:not-data-[error=true]:border-[var(--color-border-border-primary)]',
  // Same equal-specificity clash as the border rules above —
  // this unconditional focus bg was never guarded, so it could
  // still win over the invalid trigger's danger bg on focus.
  'focus-visible:not-data-[error=true]:bg-[var(--color-bg-input-bg-input-active)]',
  'focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
  'disabled:cursor-not-allowed disabled:border-[var(--color-border-border-subtle)] disabled:bg-[var(--color-bg-neutral-bg-neutral-subtler)] disabled:text-[var(--color-text-text-disabled)] disabled:italic',
  'data-[state=open]:not-data-[error=true]:border-[var(--color-border-border-primary)]',
  'data-[state=open]:bg-[var(--color-bg-input-bg-input-active)]',
  // Text color never had an error override at all — the
  // selected date (or placeholder) stayed neutral gray
  // regardless of the danger border/bg around it.
  'data-[error=true]:border-[var(--color-border-border-danger)] data-[error=true]:bg-[var(--color-bg-input-bg-input-danger)] data-[error=true]:text-[var(--color-text-text-danger)]',
  // Named explicitly too (belt-and-suspenders alongside the
  // :not() guards above) — same fix pattern as Select/InputGroup.
  'data-[error=true]:hover:border-[var(--color-border-border-danger-hover)]',
  'data-[error=true]:focus-visible:border-[var(--color-border-border-danger)]',
  // One step denser than the idle/hover danger bg while
  // actively focused (keyboard) or with its own popup open.
  'data-[error=true]:focus-visible:bg-[var(--color-bg-input-bg-input-danger-pressed)]',
  'data-[error=true]:focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring-error)]',
  'data-[error=true]:data-[state=open]:border-[var(--color-border-border-danger)]',
  'data-[error=true]:data-[state=open]:bg-[var(--color-bg-input-bg-input-danger-pressed)]',
  '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  '[&_svg]:text-[var(--color-icon-icon)] disabled:[&_svg]:text-[var(--color-icon-icon-subtle)]',
  // Calendar icon stayed neutral regardless of error before.
  'data-[error=true]:[&_svg]:text-[var(--color-icon-icon-danger)]',
);

/**
 * Single-date field composing a SelectTrigger-styled button + Popover +
 * Calendar. The trigger copies SelectTrigger's own classes verbatim
 * (border, hover/focus ring, height, disabled/error treatment) so it
 * reads as a form field rather than a generic button — calendar icon
 * leading, chevron trailing, same as Select's own chevron. It's a
 * plain <button>, not SelectTrigger itself: Radix's Select primitive
 * is built around an option-list popup (role="option" children), not
 * arbitrary content like a Calendar, so the real primitive can't be
 * reused here — only its visual treatment.
 *
 * The trailing chevron and optional clear button live in a sibling
 * pointer-events-none overlay (clear itself is pointer-events-auto),
 * not inside the trigger's own DOM — nesting an interactive clear
 * button inside the trigger <button> would be invalid HTML (button
 * inside button).
 *
 * Controlled with value/onChange, or uncontrolled with defaultValue.
 * SSR note: Intl resolves to the host locale (can differ server vs
 * browser) — the label is pinned to "en-US" until after mount, then
 * upgrades to the visitor's locale, avoiding a hydration mismatch.
 */
export interface DatePickerProps {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  /** Show an inline clear button when a date is selected. Default false. */
  showClear?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  'aria-label'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
  'aria-describedby'?: string;
  calendarProps?: Omit<React.ComponentProps<typeof Calendar>, 'mode' | 'selected' | 'onSelect'>;
}

export function DatePicker({
  value,
  defaultValue,
  onChange,
  placeholder = 'Pick a date',
  showClear = false,
  disabled,
  id,
  className,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
  calendarProps,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // The trigger's accessible name comes from aria-label or a <label for>,
  // both of which REPLACE the button's own text — so the chosen date (or
  // placeholder) was never announced. The value span is wired in as the
  // accessible description instead ("Start date, button, Jun 16, 2026").
  const valueId = useId();
  const [internal, setInternal] = useState<Date | undefined>(defaultValue);
  const selected = value !== undefined ? value : internal;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const commit = (next: Date | undefined) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  const label = selected
    ? new Intl.DateTimeFormat(mounted ? undefined : 'en-US', { dateStyle: 'medium' }).format(selected)
    : '';

  const isError = ariaInvalid === true || ariaInvalid === 'true';
  const showClearControl = showClear && !disabled && Boolean(selected);

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
            aria-invalid={ariaInvalid}
            aria-describedby={[valueId, ariaDescribedby].filter(Boolean).join(' ')}
            data-error={isError || undefined}
            className={cn(
              dateFieldTriggerClassName,
              showClearControl ? 'pr-16' : 'pr-9',
            )}
          >
            <CalendarIcon />
            <span
              id={valueId}
              className={cn(
                'min-w-0 flex-1 truncate text-left',
                // The placeholder branch set its own explicit color, which
                // otherwise always wins over the trigger's inherited
                // text-danger — same "placeholder ignores invalid" bug as
                // Select/TextField, just with an explicit class instead of
                // a `placeholder:` pseudo-class.
                !selected && (isError ? 'text-[var(--color-text-text-danger)]' : 'text-[var(--color-text-text-subtler)]'),
              )}
            >
              {selected ? label : placeholder}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            // Open on the selected date's month (react-day-picker defaults to
            // today's month, so a June value opened on September and
            // autoFocus landed on today instead of the chosen day).
            defaultMonth={selected}
            onSelect={(next) => {
              commit(next);
              setOpen(false);
            }}
            autoFocus
            {...calendarProps}
          />
        </PopoverContent>
      </Popover>
      <div className="pointer-events-none absolute inset-y-0 right-[var(--size-margin-margin-s)] flex items-center gap-1">
        {showClearControl && (
          <button
            type="button"
            aria-label="Clear date"
            onClick={(e) => {
              e.stopPropagation();
              commit(undefined);
              // The clear button unmounts once the value is gone; without
              // this, focus fell to <body>.
              triggerRef.current?.focus();
            }}
            className={cn(
              'pointer-events-auto flex items-center justify-center size-6 rounded-[var(--size-border-radius-border-radius-md)]',
              'text-[var(--color-icon-icon-subtle)] hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
              'transition-colors duration-standard ease-enter motion-reduce:transition-none',
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
