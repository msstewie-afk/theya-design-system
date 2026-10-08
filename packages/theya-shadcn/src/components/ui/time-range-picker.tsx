'use client';

import { useState } from 'react';
import { cn } from '../../lib/utils';
import { TimeField } from './time-field';
import { useTheyaI18n } from '../../lib/i18n';

/**
 * A start + end time pair, composed from two TimeFields with a "to"
 * separator. The end field's earliest option follows the chosen
 * start, so you can't pick an end before the start.
 */
export type TimeRange = { start?: string; end?: string };

export interface TimeRangePickerProps {
  value?: TimeRange;
  defaultValue?: TimeRange;
  onChange?: (value: TimeRange) => void;
  step?: number;
  hourCycle?: 12 | 24;
  min?: string;
  max?: string;
  disabled?: boolean;
  startLabel?: string;
  endLabel?: string;
  /** Names the pair as a group (role="group"), e.g. "Maintenance window". */
  'aria-label'?: string;
  /** Id of a visible label that names the pair as a group. */
  'aria-labelledby'?: string;
  className?: string;
}

export function TimeRangePicker({
  value,
  defaultValue,
  onChange,
  step = 30,
  hourCycle = 12,
  min = '00:00',
  max = '23:59',
  disabled,
  startLabel,
  endLabel,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  className,
}: TimeRangePickerProps) {
  const { t } = useTheyaI18n();
  if (startLabel === undefined) startLabel = t.timeRangePicker.start;
  if (endLabel === undefined) endLabel = t.timeRangePicker.end;
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<TimeRange>(defaultValue ?? {});
  const range = isControlled ? value! : internal;

  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const set = (next: TimeRange) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <div
      // A group so a visible label can name the pair; without it the
      // "Maintenance window" label in the stories named nothing.
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={cn('flex items-center gap-2', className)}
    >
      <TimeField
        aria-label={startLabel}
        // Always controlled: `undefined` would flip TimeField into its
        // uncontrolled mode.
        value={range.start ?? ''}
        onChange={(v) => {
          const start = v || undefined;
          // Moving the start past the end left an inverted range that the
          // end field's min no longer allowed; drop the stale end instead.
          const end = start && range.end && toMinutes(range.end) < toMinutes(start) ? undefined : range.end;
          set({ start, end });
        }}
        step={step}
        hourCycle={hourCycle}
        min={min}
        max={max}
        disabled={disabled}
        // min-w-0: an <input> keeps a ~20ch minimum otherwise, and two of
        // them plus "to" overflow a phone-width row.
        className="min-w-0 flex-1"
      />
      <span aria-hidden="true" className="shrink-0 font-body text-body-s text-[var(--color-text-text-subtler)]">
        {t.timeRangePicker.to}
      </span>
      <TimeField
        aria-label={endLabel}
        value={range.end ?? ''}
        onChange={(v) => set({ start: range.start, end: v || undefined })}
        step={step}
        hourCycle={hourCycle}
        min={range.start ?? min}
        max={max}
        disabled={disabled}
        className="min-w-0 flex-1"
      />
    </div>
  );
}
