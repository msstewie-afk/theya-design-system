'use client';

import { useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { DatePicker } from './date-picker';
import { TimeField } from './time-field';
import { useTheyaI18n } from '../../lib/i18n';

/**
 * Pick a date and a time together, composing DatePicker (a Calendar
 * popover) with TimeField (a time list). The value is a single Date;
 * choosing a date keeps the current time, choosing a time applies it
 * to the chosen date (or today if none set yet). Stacks on a phone,
 * sits side by side from sm up.
 *
 * Date before time: the Date still needs *some* time, so it carries
 * 00:00 — but the time field stays empty (placeholder) until the user
 * picks a time, instead of showing a "12:00 AM" nobody chose. onChange's
 * second argument says whether the time was actually set, so a form can
 * ask for it rather than accept a silent midnight. A value that arrives
 * from outside (value/defaultValue) counts as having its time set, so a
 * real midnight still shows as 12:00 AM.
 */
function pad(n: number) {
  return String(n).padStart(2, '0');
}

export interface DateTimePickerProps {
  value?: Date;
  defaultValue?: Date;
  /** `timeSet` is false while only the date was picked — the Date then carries a placeholder 00:00. */
  onChange?: (value: Date | undefined, meta: { timeSet: boolean }) => void;
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
  datePlaceholder,
  timePlaceholder,
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
  const { t } = useTheyaI18n();
  if (datePlaceholder === undefined) datePlaceholder = t.datePicker.placeholder;
  if (timePlaceholder === undefined) timePlaceholder = t.timeField.placeholder;
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<Date | undefined>(defaultValue);
  const current = isControlled ? value : internal;
  const [timeSet, setTimeSet] = useState(() => (value ?? defaultValue) !== undefined);

  // A controlled value we didn't emit came from the parent (a reset, a
  // loaded record): treat its time as set, or unset if it's cleared.
  // Adjusted during render (React's "storing info from previous renders"
  // pattern) so the time field never flashes a stale state.
  const emittedRef = useRef<Date | undefined>(undefined);
  const [prevValue, setPrevValue] = useState(value);
  if (isControlled && value !== prevValue) {
    setPrevValue(value);
    if (value !== emittedRef.current) setTimeSet(value !== undefined);
  }

  const set = (next: Date | undefined, nextTimeSet: boolean) => {
    emittedRef.current = next;
    setTimeSet(nextTimeSet);
    if (!isControlled) setInternal(next);
    onChange?.(next, { timeSet: nextTimeSet });
  };

  const timeValue = current && timeSet ? `${pad(current.getHours())}:${pad(current.getMinutes())}` : undefined;

  const onDate = (d: Date | undefined) => {
    if (!d) {
      set(undefined, false);
      return;
    }
    const next = new Date(d);
    if (current && timeSet) next.setHours(current.getHours(), current.getMinutes(), 0, 0);
    else next.setHours(0, 0, 0, 0);
    set(next, timeSet);
  };

  const onTime = (t: string) => {
    if (!t) return;
    const [h, m] = t.split(':').map(Number);
    const base = current ? new Date(current) : new Date();
    base.setHours(h, m, 0, 0);
    set(base, true);
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
        // Always controlled: `undefined` would flip TimeField into its
        // uncontrolled mode, where it keeps a pick the parent never took.
        value={timeValue ?? ''}
        onChange={onTime}
        step={step}
        hourCycle={hourCycle}
        placeholder={timePlaceholder}
        disabled={disabled}
        aria-label={ariaLabel ? t.timeField.timeOf(ariaLabel) : t.timeField.time}
        // The error applies to the whole date+time value, so both fields
        // show it (only the date field did before).
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
        className={cn('sm:w-40', timeClassName)}
      />
    </div>
  );
}
