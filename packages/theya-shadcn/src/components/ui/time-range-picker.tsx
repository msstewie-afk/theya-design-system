import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TimeField } from './time-field';

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
  startLabel = 'Start time',
  endLabel = 'End time',
  className,
}: TimeRangePickerProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<TimeRange>(defaultValue ?? {});
  const range = isControlled ? value! : internal;

  const set = (next: TimeRange) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <TimeField
        aria-label={startLabel}
        value={range.start}
        onChange={(v) => set({ start: v || undefined, end: range.end })}
        step={step}
        hourCycle={hourCycle}
        min={min}
        max={max}
        disabled={disabled}
        className="flex-1"
      />
      <span aria-hidden="true" className="shrink-0 font-body text-body-s text-[var(--color-text-text-subtler)]">
        to
      </span>
      <TimeField
        aria-label={endLabel}
        value={range.end}
        onChange={(v) => set({ start: range.start, end: v || undefined })}
        step={step}
        hourCycle={hourCycle}
        min={range.start ?? min}
        max={max}
        disabled={disabled}
        className="flex-1"
      />
    </div>
  );
}
