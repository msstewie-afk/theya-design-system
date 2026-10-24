'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Label } from './label';

/**
 * A wheel for a short ordered list — an interval, a duration, a size (Kinetics'
 * Momentum Picker, MIT). Scrolling, dragging or the arrow keys roll it to the next
 * detent on a spring; the chosen row sits in a raised band, the others fade back.
 *
 * For assistive tech it is a listbox: ↑ ↓ move, Home / End jump, the chosen option is
 * aria-selected. Prefer RadioGroup for up to five options shown at once, Select for
 * long or unordered lists. With reduced motion the wheel jumps instead of rolling.
 */
export interface WheelPickerOption {
  value: string;
  label: string;
}

export interface WheelPickerProps extends Omit<React.ComponentProps<'div'>, 'onChange' | 'defaultValue'> {
  options: WheelPickerOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Rows visible at once: 3 (default) or 5. */
  rows?: 3 | 5;
  disabled?: boolean;
  /** Visible label above the wheel, naming the list (WCAG 3.3.2). Without it, use aria-label. */
  label?: ReactNode;
}

const ROW = 36;

export function WheelPicker({ options, value, defaultValue, onValueChange, rows = 3, disabled = false, label, className, 'aria-label': ariaLabel, ...props }: WheelPickerProps) {
  const id = useId();
  const labelId = useId();
  const [internal, setInternal] = useState(defaultValue ?? options[0]?.value);
  const current = value ?? internal;
  const index = Math.max(0, options.findIndex((o) => o.value === current));
  const box = useRef<HTMLDivElement>(null);
  const indexRef = useRef(index);
  indexRef.current = index;

  const select = (next: number) => {
    const clamped = Math.min(options.length - 1, Math.max(0, next));
    if (clamped === indexRef.current || disabled) return;
    const v = options[clamped].value;
    if (value === undefined) setInternal(v);
    onValueChange?.(v);
  };
  const selectRef = useRef(select);
  selectRef.current = select;

  // Wheel: one detent per notch, throttled so a trackpad flick doesn't spin the whole list.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let last = 0;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const now = performance.now();
      if (now - last < 140 || Math.abs(event.deltaY) < 4) return;
      last = now;
      selectRef.current(indexRef.current + (event.deltaY > 0 ? 1 : -1));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Drag: one row per 36px moved.
  const drag = useRef<{ y: number; from: number; moved: boolean } | null>(null);
  const middle = (rows - 1) / 2;

  const wheel = (
    <div
      ref={box}
      role="listbox"
      tabIndex={disabled ? -1 : 0}
      aria-label={label ? undefined : ariaLabel}
      aria-labelledby={label ? labelId : undefined}
      aria-disabled={disabled || undefined}
      aria-activedescendant={options.length ? `${id}-${index}` : undefined}
      data-slot="wheel-picker"
      onKeyDown={(event) => {
        const keys: Record<string, number> = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: options.length - 1, PageDown: index + rows, PageUp: index - rows };
        if (!(event.key in keys)) return;
        event.preventDefault();
        select(keys[event.key]);
      }}
      onPointerDown={(event) => {
        if (disabled) return;
        drag.current = { y: event.clientY, from: index, moved: false };
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!drag.current) return;
        if (Math.abs(drag.current.y - event.clientY) > 4) drag.current.moved = true;
        select(drag.current.from + Math.round((drag.current.y - event.clientY) / ROW));
      }}
      onPointerUp={(event) => {
        // Pointer capture retargets the click to the listbox, so an option's
        // onClick never fires: a press without movement picks the row under
        // the pointer here instead — choosing without dragging (WCAG 2.5.7).
        if (drag.current && !drag.current.moved) {
          const top = event.currentTarget.getBoundingClientRect().top;
          select(index + Math.floor((event.clientY - top) / ROW) - middle);
        }
        drag.current = null;
      }}
      onPointerCancel={() => (drag.current = null)}
      className={cn(
        'relative w-40 shrink-0 cursor-ns-resize touch-none select-none overflow-hidden rounded-[var(--size-border-radius-border-radius-xl)] bg-[var(--color-bg-surface-bg-surface-sunken)]',
        '[mask-image:linear-gradient(transparent,black_30%,black_70%,transparent)] forced-colors:[mask-image:none] forced-colors:border forced-colors:border-solid forced-colors:border-[CanvasText]',
        'focus-visible:outline-none focus-visible:focus-ring',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      style={{ height: rows * ROW }}
      {...props}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-2 rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-surface-bg-surface)] shadow-elevation-sm forced-colors:border forced-colors:border-solid forced-colors:border-[Highlight]"
        style={{ top: middle * ROW, height: ROW }}
      />
      <div className="relative transition-transform duration-[580ms] ease-spring motion-reduce:transition-none" style={{ transform: `translateY(${(middle - index) * ROW}px)` }}>
        {options.map((option, n) => (
          <div
            key={option.value}
            id={`${id}-${n}`}
            role="option"
            aria-selected={n === index}
            onClick={() => select(n)}
            className={cn(
              'flex items-center justify-center px-3 font-body text-body-m tabular-nums transition-[opacity,scale] duration-slow ease-enter motion-reduce:transition-none',
              n === index ? 'font-medium text-[var(--color-text-text)]' : 'scale-[.88] text-[var(--color-text-text-subtle)] opacity-60',
            )}
            style={{ height: ROW }}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
  if (!label) return wheel;
  return (
    <div className="inline-flex flex-col gap-1">
      {/* Like a <label for>: a click on it focuses the wheel. */}
      <Label id={labelId} onClick={() => !disabled && box.current?.focus()}>
        {label}
      </Label>
      {wheel}
    </div>
  );
}
