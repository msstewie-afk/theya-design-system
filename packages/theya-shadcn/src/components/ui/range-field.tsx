import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';
import { NumberField } from './number-field';
import { Slider } from './slider';

/**
 * A numeric range — price, size, date span in days — set two ways at once:
 * a two-thumb slider for a quick rough pick, and two number fields for an
 * exact bound (dragging is imprecise, typing isn't). Both stay in sync.
 *
 * - `onValueChange` fires live while dragging; `onValueCommit` fires once
 *   per finished change (thumb released, or a typed bound committed on
 *   Enter/blur) — use it to filter or fetch, so a drag doesn't trigger
 *   twenty requests.
 * - The two bounds can't cross: "From" is capped at "To" and vice versa,
 *   `minDistance` keeps a gap.
 * - Optional `histogram` draws how many items fall in each bucket above
 *   the track, with the selected span highlighted — people see where the
 *   results are before they drag.
 */
export type RangeValue = [number, number];

export interface RangeFieldProps {
  label: ReactNode;
  min: number;
  max: number;
  step?: number;
  value?: RangeValue;
  defaultValue?: RangeValue;
  /** Live, on every drag tick and committed input. */
  onValueChange?: (value: RangeValue) => void;
  /** Once per finished change — thumb released or a bound committed. */
  onValueCommit?: (value: RangeValue) => void;
  /** Smallest allowed gap between the two bounds, in value units. */
  minDistance?: number;
  /** Formats values for the summary and for screen readers, e.g. `(v) => \`€${v}\``. */
  formatValue?: (value: number) => string;
  /** Visible labels over the two inputs. */
  fromLabel?: string;
  toLabel?: string;
  /** Counts per equal-width bucket from min to max, drawn above the track. */
  histogram?: number[];
  description?: ReactNode;
  heightSize?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
}

export function RangeField({
  label,
  min,
  max,
  step = 1,
  value: valueProp,
  defaultValue,
  onValueChange,
  onValueCommit,
  minDistance = 0,
  formatValue = (v) => String(v),
  fromLabel = 'From',
  toLabel = 'To',
  histogram,
  description,
  heightSize = 'md',
  disabled = false,
  className,
}: RangeFieldProps) {
  const [internal, setInternal] = useState<RangeValue>(defaultValue ?? [min, max]);
  const value = valueProp ?? internal;
  const labelId = useId();
  const fromId = useId();
  const toId = useId();
  const descriptionId = useId();

  const set = (next: RangeValue, commit: boolean) => {
    if (valueProp === undefined) setInternal(next);
    onValueChange?.(next);
    if (commit) onValueCommit?.(next);
  };

  const [from, to] = value;
  const span = max - min || 1;
  const summary = from === min && to === max ? 'Any' : `${formatValue(from)} – ${formatValue(to)}`;

  return (
    <div role="group" aria-labelledby={labelId} aria-describedby={description ? descriptionId : undefined} data-slot="range-field" className={cn('flex w-full flex-col gap-3', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span id={labelId} className={cn('font-body text-[var(--color-text-text)]', heightSize === 'sm' ? 'text-body-s' : 'text-body-m')}>
          {label}
        </span>
        {/* Live summary; not announced on every drag tick (the thumbs' own aria-valuetext does that). */}
        <span className="font-body text-body-s tabular-nums text-[var(--color-text-text-subtler)]">{summary}</span>
      </div>

      {histogram && histogram.length > 0 && (
        <div aria-hidden="true" className="flex h-12 items-end gap-px px-2">
          {histogram.map((count, i) => {
            const peak = Math.max(...histogram, 1);
            const bucketStart = min + (span * i) / histogram.length;
            const bucketEnd = min + (span * (i + 1)) / histogram.length;
            const inRange = bucketEnd > from && bucketStart < to;
            return (
              <div
                key={i}
                className={cn(
                  'min-h-px flex-1 rounded-t-[var(--size-border-radius-border-radius-sm)] transition-colors duration-150 motion-reduce:transition-none',
                  inRange ? 'bg-[var(--color-bg-primary-bg-primary-subtle-hover)]' : 'bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
                )}
                style={{ height: `${(count / peak) * 100}%` }}
              />
            );
          })}
        </div>
      )}

      {/* px-2 keeps the 16px thumbs inside the field's edges at min/max. */}
      <div className="px-2">
        <Slider
          min={min}
          max={max}
          step={step}
          minStepsBetweenThumbs={Math.ceil(minDistance / step)}
          value={value}
          disabled={disabled}
          onValueChange={(v) => set([v[0], v[1]], false)}
          onValueCommit={(v) => onValueCommit?.([v[0], v[1]])}
          aria-label={typeof label === 'string' ? label : 'Range'}
          formatValue={(v) => formatValue(v)}
        />
      </div>

      <div className="flex items-end gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Label htmlFor={fromId} className="text-body-xs text-[var(--color-text-text-subtler)]">
            {fromLabel}
          </Label>
          <NumberField
            id={fromId}
            value={from}
            min={min}
            max={to - minDistance}
            step={step}
            disabled={disabled}
            heightSize={heightSize}
            widthSize="full"
            onValueChange={(v) => set([v, to], true)}
          />
        </div>
        <span aria-hidden="true" className={cn('shrink-0 text-[var(--color-text-text-subtler)]', heightSize === 'sm' ? 'pb-1.5' : 'pb-2.5')}>
          –
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Label htmlFor={toId} className="text-body-xs text-[var(--color-text-text-subtler)]">
            {toLabel}
          </Label>
          <NumberField
            id={toId}
            value={to}
            min={from + minDistance}
            max={max}
            step={step}
            disabled={disabled}
            heightSize={heightSize}
            widthSize="full"
            onValueChange={(v) => set([from, v], true)}
          />
        </div>
      </div>

      {description && (
        <span id={descriptionId} className="font-body text-body-xs font-normal text-[var(--color-text-text-subtler)]">
          {description}
        </span>
      )}
    </div>
  );
}
