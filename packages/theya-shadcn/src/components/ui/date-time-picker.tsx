import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DatePicker } from './date-picker';
import { TimeField } from './time-field';

/**
 * Pick a date and a time together, composing DatePicker (a Calendar
 * popover) with TimeField (a time list). The value is a single Date;
 * choosing a date keeps the current time, choosing a time applies it
 * to the chosen date (or today if none set yet). Stacks on a phone,
 * sits side by side from sm up.
 */
function pad(n: number) {
  return String(n).padStart(2, '0');
}

export interface DateTimePickerProps {
  value?: Date;
  defaultValue?: Date;
  onChange?: (value: Date | undefined) => void;
  step?: number;
  hourCycle?: 12 | 24;
  datePlaceholder?: string;
  timePlaceholder?: string;
  /** Show the inline clear button in the date field. Default false. */
  showClear?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  dateClassName?: string;
  timeClassName?: string;
  calendarProps?: React.ComponentProps<typeof DatePicker>['calendarProps'];
  'aria-label'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
  'aria-describedby'?: string;
}

export function DateTimePicker({
  value,
  defaultValue,
  onChange,
  step = 30,
  hourCycle = 12,
  datePlaceholder = 'Pick a date',
  timePlaceholder = 'Select time',
  showClear = false,
  disabled,
  id,
  className,
  dateClassName,
  timeClassName,
  calendarProps,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
}: DateTimePickerProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<Date | undefined>(defaultValue);
  const current = isControlled ? value : internal;

  const set = (next: Date | undefined) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  const timeValue = current ? `${pad(current.getHours())}:${pad(current.getMinutes())}` : undefined;

  const onDate = (d: Date | undefined) => {
    if (!d) {
      set(undefined);
      return;
    }
    const next = new Date(d);
    if (current) next.setHours(current.getHours(), current.getMinutes(), 0, 0);
    else next.setHours(0, 0, 0, 0);
    set(next);
  };

  const onTime = (t: string) => {
    if (!t) return;
    const [h, m] = t.split(':').map(Number);
    const base = current ? new Date(current) : new Date();
    base.setHours(h, m, 0, 0);
    set(base);
  };

  return (
    <div className={cn('flex flex-col gap-2 sm:flex-row', className)}>
      <DatePicker
        value={current}
        onChange={onDate}
        placeholder={datePlaceholder}
        showClear={showClear}
        disabled={disabled}
        id={id}
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
        calendarProps={calendarProps}
        className={cn('sm:flex-1', dateClassName)}
      />
      <TimeField
        value={timeValue}
        onChange={onTime}
        step={step}
        hourCycle={hourCycle}
        placeholder={timePlaceholder}
        disabled={disabled}
        aria-label={ariaLabel ? `${ariaLabel} time` : 'Time'}
        className={cn('sm:w-40', timeClassName)}
      />
    </div>
  );
}
