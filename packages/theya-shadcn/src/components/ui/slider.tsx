'use client';

import { useState } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';

/**
 * Range input on @radix-ui/react-slider. Simpler than the Base UI
 * reference: Radix's Thumb is already a real focusable element with
 * role="slider" and its aria-* props settable directly (no inputRef
 * workaround needed to reach a nested native input for aria-invalid).
 * Supports multiple thumbs the same way (value/defaultValue arrays).
 */
export interface SliderProps
  extends Omit<React.ComponentProps<typeof SliderPrimitive.Root>, 'value' | 'defaultValue' | 'onValueChange'> {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  /** Map a thumb's numeric value to a human-readable string for aria-valuetext. */
  formatValue?: (value: number, index: number) => string;
  /** Marks the slider as invalid — track fill + thumb switch to danger colors. */
  invalid?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  formatValue,
  invalid = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  onValueChange,
  onValueCommit,
  onKeyDown,
  minStepsBetweenThumbs = 0,
  step = 1,
  ...props
}: SliderProps) {
  const { t } = useTheyaI18n();
  // Always drive Radix as controlled so Home/End below can set any thumb.
  const [internal, setInternal] = useState<number[]>(defaultValue ?? [min]);
  const values = value ?? internal;
  const thumbCount = values.length || 1;

  const change = (next: number[], commit: boolean) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
    if (commit) onValueCommit?.(next);
  };

  // Radix maps Home to the FIRST thumb and End to the LAST, whichever thumb has
  // focus — End on a range's minimum moved the maximum. APG: Home/End move the
  // focused thumb to its own lowest/highest allowed value.
  const onRootKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || thumbCount < 2 || props.disabled || (e.key !== 'Home' && e.key !== 'End')) return;
    const thumbs = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="slider"]'));
    const i = thumbs.indexOf(document.activeElement as HTMLElement);
    if (i === -1) return;
    e.preventDefault(); // stops Radix's own Home/End handling
    const gap = minStepsBetweenThumbs * step;
    const lowest = i === 0 ? min : values[i - 1] + gap;
    const highest = i === thumbCount - 1 ? max : values[i + 1] - gap;
    const next = [...values];
    next[i] = e.key === 'Home' ? lowest : highest;
    if (next[i] !== values[i]) change(next, true);
  };

  const thumbLabel = (index: number): string | undefined => {
    if (!ariaLabel) return undefined;
    if (thumbCount <= 1) return ariaLabel;
    if (thumbCount === 2) return index === 0 ? t.slider.minimum(ariaLabel) : t.slider.maximum(ariaLabel);
    return t.slider.value(ariaLabel, index + 1);
  };

  return (
    <SliderPrimitive.Root
      value={values}
      onValueChange={(v) => change(v, false)}
      onValueCommit={onValueCommit}
      onKeyDown={onRootKeyDown}
      minStepsBetweenThumbs={minStepsBetweenThumbs}
      step={step}
      min={min}
      max={max}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        'data-[orientation=vertical]:h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
        'data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          'relative grow rounded-full bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
          'forced-colors:forced-color-adjust-none forced-colors:bg-[GrayText]',
          'data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full',
          'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5',
        )}
      >
        <SliderPrimitive.Range
          className={cn(
            'absolute rounded-full',
            'data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full',
            invalid ? 'bg-[var(--color-bg-danger-bg-danger)]' : 'bg-[var(--color-bg-primary-bg-primary)]',
            'forced-colors:bg-[Highlight]',
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }, (_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          aria-label={thumbLabel(i)}
          aria-describedby={ariaDescribedby}
          aria-invalid={invalid || undefined}
          aria-valuetext={formatValue ? formatValue(values[i] ?? min, i) : undefined}
          className={cn(
            'relative block size-4 shrink-0 rounded-full border border-solid',
            'bg-[var(--color-bg-input-bg-input)] shadow-elevation-sm outline-none',
            'transition-[border-color,box-shadow] duration-standard ease-enter motion-reduce:transition-none',
            invalid ? 'border-[var(--color-border-border-danger)]' : 'border-[var(--color-border-border-primary)]',
            // Hover lifts the thumb; the ring is reserved for keyboard focus.
            'hover:shadow-elevation-md',
            'focus-visible:focus-ring',
            invalid && 'focus-visible:focus-ring-error',
            'data-[disabled]:pointer-events-none',
            // Extends the pointer/touch hit area to 44px (WCAG 2.5.8) without
            // visually growing the 16px dot.
            'before:absolute before:left-1/2 before:top-1/2 before:size-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[""]',
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
