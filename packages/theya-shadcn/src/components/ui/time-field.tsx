import { useMemo, useState } from 'react';
import { Combobox, type ComboboxOption } from './combobox';

/**
 * A time picker built on our Combobox: a typeahead field over a list
 * of times generated from min/max at a step (minutes). The value is a
 * 24-hour "HH:MM" string; typing a full time off the step grid (e.g.
 * "9:47 AM") commits directly via allowCreate — it doesn't have to be
 * one of the generated options.
 *
 * For a start/end pair use TimeRangePicker; to pick a date and time
 * together use DateTimePicker.
 */
function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toMinutes(value: string) {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
}

/** Format a 24h "HH:MM" string per the hour cycle (e.g. "9:30 AM" or "09:30"). */
export function formatTime(value: string, hourCycle: 12 | 24) {
  const [h, m] = value.split(':').map(Number);
  if (hourCycle === 24) return `${pad(h)}:${pad(m)}`;
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad(m)} ${period}`;
}

function buildTimeOptions(min: string, max: string, step: number, hourCycle: 12 | 24): ComboboxOption[] {
  const start = toMinutes(min);
  const end = toMinutes(max);
  const out: ComboboxOption[] = [];
  for (let t = start; t <= end; t += step) {
    const value = `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
    out.push({ value, label: formatTime(value, hourCycle) });
  }
  return out;
}

/**
 * Parse free-typed text ("9:47 am", "21:15", "9:05") into a 24-hour
 * "HH:MM" string, so a time off the step grid still commits instead
 * of being read as a filter with no match. Returns "" for a cleared
 * field, or null when unrecognizable or outside min/max.
 */
function parseTimeInput(raw: string, min: string, max: string): string | null {
  const trimmed = raw.trim();
  if (trimmed === '') return '';

  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*([ap]m)?$/i);
  if (!match) return null;

  const minutes = Number(match[2]);
  if (minutes > 59) return null;

  let hours = Number(match[1]);
  const period = match[3]?.toLowerCase();
  if (period) {
    if (hours < 1 || hours > 12) return null;
    hours = period === 'am' ? (hours === 12 ? 0 : hours) : hours === 12 ? 12 : hours + 12;
  } else if (hours > 23) {
    return null;
  }

  const value = `${pad(hours)}:${pad(minutes)}`;
  const total = hours * 60 + minutes;
  if (total < toMinutes(min) || total > toMinutes(max)) return null;
  return value;
}

export interface TimeFieldProps {
  /** Controlled value as a 24-hour "HH:MM" string. */
  value?: string;
  /** Uncontrolled initial value as a 24-hour "HH:MM" string. */
  defaultValue?: string;
  /** Called with the selected "HH:MM" value (or "" when cleared). */
  onChange?: (value: string) => void;
  /** Minutes between options. Defaults to 30. */
  step?: number;
  /** Earliest time offered, "HH:MM". Defaults to "00:00". */
  min?: string;
  /** Latest time offered, "HH:MM". Defaults to "23:59". */
  max?: string;
  /** 12-hour (AM/PM) or 24-hour labels. Defaults to 12. */
  hourCycle?: 12 | 24;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  contentClassName?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
  'aria-describedby'?: string;
}

export function TimeField({
  value,
  defaultValue,
  onChange,
  step = 30,
  min = '00:00',
  max = '23:59',
  hourCycle = 12,
  placeholder = 'Select time',
  disabled,
  id,
  className,
  contentClassName,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
}: TimeFieldProps) {
  const isControlled = value !== undefined;
  // Uncontrolled mode needs its own state: the Combobox below is always
  // driven by `current`, so reading defaultValue here directly froze the
  // field on its initial value and ignored every pick.
  const [internal, setInternal] = useState(defaultValue ?? '');
  const current = isControlled ? (value ?? '') : internal;

  const options = useMemo(() => {
    const base = buildTimeOptions(min, max, step, hourCycle);
    if (!current || base.some((option) => option.value === current)) return base;
    // A value off the step grid (typed directly) — inject it so it
    // displays with the same hourCycle formatting, kept in order.
    const custom: ComboboxOption = { value: current, label: formatTime(current, hourCycle) };
    return [...base, custom].sort((a, b) => toMinutes(a.value) - toMinutes(b.value));
  }, [min, max, step, hourCycle, current]);

  return (
    <Combobox
      options={options}
      value={current}
      onValueChange={(next) => {
        const parsed = parseTimeInput(next, min, max);
        if (parsed === null) return;
        if (!isControlled) setInternal(parsed);
        onChange?.(parsed);
      }}
      allowCreate
      placeholder={placeholder}
      emptyMessage="No matching time."
      disabled={disabled}
      id={id}
      className={className}
      contentClassName={contentClassName}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedby}
    />
  );
}
