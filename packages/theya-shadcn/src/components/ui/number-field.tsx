import { forwardRef, useState, useCallback, useId } from 'react';
import { Minus, Plus } from 'iconoir-react';
import { cn } from '@/lib/utils';

const WIDTH_CLASSES = {
  full: 'w-full',
  sm: 'w-[var(--size-width-width-control-sm)]', // Figma "Small", 60px
  md: 'w-[var(--size-width-width-control-xl)]', // Figma "Medium", 240px
  lg: 'w-[var(--size-width-width-control-2xl)]', // Figma "Large", 348px
  xl: 'w-[var(--size-width-width-control-3xl)]', // Figma "XLarge", 500px
} as const;

/**
 * No Radix (or any headless-primitive) equivalent exists for this — Base
 * UI has its own NumberField but Radix doesn't, so this is built from
 * scratch rather than ported. Draft v1: click +/- buttons, Up/Down arrow
 * keys (Shift = 10x step), and min/max clamping.
 *
 * Typing edits a draft string: nothing is clamped and onValueChange does
 * not fire until the edit is committed on blur or Enter (parsed, clamped,
 * reported once). Empty or non-numeric input reverts to the last value;
 * Escape discards the draft. Arrow keys and the +/- buttons still change
 * the value immediately. Before 2026-09-29 every keystroke was clamped,
 * so with min=5 typing "12" produced 5, then 52 -> max, and the field
 * could not be emptied. Same commit model as React Aria's NumberField and
 * a native <input type="number">. Deferred: Alt for a
 * smaller step, Home/End jump-to-bound, and press-and-hold repeat on the
 * buttons — the reference component supports all three via Base UI.
 */
export interface NumberFieldProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
  /** Matches TextField's width scale. Defaults to 'full' (previous, unconditional behavior). */
  widthSize?: keyof typeof WIDTH_CLASSES;
  decrementLabel?: string;
  incrementLabel?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
}

const clamp = (n: number, min?: number, max?: number) => {
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
};

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(function NumberField(
  {
    value,
    defaultValue,
    onValueChange,
    min,
    max,
    step = 1,
    disabled,
    placeholder,
    id,
    className,
    widthSize = 'full',
    decrementLabel = 'Decrease',
    incrementLabel = 'Increase',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-invalid': ariaInvalid,
  },
  ref,
) {
  const generatedId = useId();
  const resolvedId = id ?? generatedId;
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? min ?? 0);
  const current = isControlled ? value : internal;

  const setValue = useCallback(
    (next: number) => {
      const clamped = clamp(next, min, max);
      if (!isControlled) setInternal(clamped);
      onValueChange?.(clamped);
    },
    [isControlled, min, max, onValueChange],
  );

  // What the user is typing, before it's committed. null = not editing.
  const [draft, setDraft] = useState<string | null>(null);
  const parseDraft = (text: string | null) => {
    if (text === null || text.trim() === '') return undefined;
    const n = Number(text.trim().replace(',', '.'));
    return Number.isFinite(n) ? n : undefined;
  };
  const commitDraft = () => {
    if (draft === null) return;
    const parsed = parseDraft(draft);
    setDraft(null);
    if (parsed !== undefined && clamp(parsed, min, max) !== current) setValue(parsed);
  };
  // Arrows step from what's on screen, including an uncommitted draft.
  const stepFrom = (delta: number) => {
    const base = parseDraft(draft) ?? current;
    setDraft(null);
    setValue(base + delta);
  };

  const isInvalid = ariaInvalid === true || ariaInvalid === 'true';

  // Step buttons' own focus ring didn't know about the field's aria-invalid
  // — tabbing to +/- while the field was invalid showed the primary ring
  // instead of the error one. Fixed 2026-09-26.
  const stepButtonClass = cn(
    'flex w-9 shrink-0 items-center justify-center',
    'outline-none cursor-pointer',
    'transition-colors duration-standard ease-enter motion-reduce:transition-none',
    // +/- glyph stayed neutral icon-subtle regardless of invalid before —
    // matching the field's own danger treatment now.
    isInvalid
      ? 'text-[var(--color-icon-icon-danger)] hover:not-disabled:bg-[var(--color-bg-danger-bg-danger-subtler-hover)]'
      : 'text-[var(--color-icon-icon-subtle)] hover:not-disabled:bg-[var(--color-bg-neutral-bg-neutral-subtle)] hover:not-disabled:text-[var(--color-icon-icon)]',
    'focus-visible:relative focus-visible:z-10 focus-visible:outline-none',
    isInvalid
      ? 'focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring-error)]'
      : 'focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
    'disabled:pointer-events-none disabled:opacity-40',
    '[&_svg]:size-4 [&_svg]:shrink-0',
  );

  return (
    <div
      className={cn(
        'inline-flex h-[var(--size-size-control-size-control-2xl)] items-stretch overflow-hidden',
        WIDTH_CLASSES[widthSize],
        'rounded-[var(--size-border-radius-border-radius-lg)] border border-solid',
        'border-[var(--color-border-border-default)] bg-[var(--color-bg-input-bg-input)]',
        'transition-[border-color,background-color,box-shadow] duration-standard ease-enter motion-reduce:transition-none',
        'has-[input:hover]:not-has-[input:disabled]:not-has-[input[aria-invalid=true]]:border-[var(--color-border-border-primary)]',
        'has-[input:focus-visible]:not-has-[input[aria-invalid=true]]:border-[var(--color-border-border-primary)]',
        'has-[input:focus-visible]:bg-[var(--color-bg-input-bg-input-active)]',
        'has-[input:focus-visible]:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
        // Matches TextField's 5-point disabled spec exactly (border,
        // bg, text, italic — no opacity).
        'has-[input:disabled]:border-[var(--color-border-border-subtle)]',
        'has-[input:disabled]:bg-[var(--color-bg-neutral-bg-neutral-subtler)]',
        'has-[input[aria-invalid=true]]:border-[var(--color-border-border-danger)]',
        'has-[input[aria-invalid=true]]:bg-[var(--color-bg-input-bg-input-danger)]',
        // Invalid gets its own hover/focus shade (was a flat, unchanging
        // danger border with no interaction feedback) — named explicitly,
        // same fix pattern as Select/DatePicker/InputGroup.
        'has-[input[aria-invalid=true]]:has-[input:hover]:border-[var(--color-border-border-danger-hover)]',
        'has-[input[aria-invalid=true]]:has-[input:focus-visible]:border-[var(--color-border-border-danger)]',
        // One step denser than the idle/hover danger bg while the inner
        // input is actively focused.
        'has-[input[aria-invalid=true]]:has-[input:focus-visible]:bg-[var(--color-bg-input-bg-input-danger-pressed)]',
        'has-[input[aria-invalid=true]]:has-[input:focus-visible]:shadow-[0_0_0_4px_var(--color-focus-focus-ring-error)]',
        className,
      )}
    >
      <button
        type="button"
        aria-label={decrementLabel}
        disabled={disabled || (min !== undefined && current <= min)}
        onClick={() => setValue(current - step)}
        className={cn(
          stepButtonClass,
          'border-r border-solid',
          // Divider between button and input didn't know about invalid —
          // stayed the neutral (blue-violet-tinted) subtle border even in
          // an all-red invalid field. Fixed 2026-09-26.
          isInvalid ? 'border-[var(--color-border-border-danger)]' : 'border-[var(--color-border-border-subtler)]',
        )}
      >
        <Minus />
      </button>
      <input
        ref={ref}
        id={resolvedId}
        type="text"
        inputMode="numeric"
        role="spinbutton"
        aria-valuenow={current}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        aria-invalid={ariaInvalid}
        disabled={disabled}
        placeholder={placeholder}
        value={draft ?? String(current)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitDraft}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            stepFrom(e.shiftKey ? step * 10 : step);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            stepFrom(-(e.shiftKey ? step * 10 : step));
          } else if (e.key === 'Enter') {
            // Commit, but let Enter still submit a surrounding form.
            commitDraft();
          } else if (e.key === 'Escape' && draft !== null) {
            e.preventDefault();
            setDraft(null);
          }
        }}
        className={cn(
          'h-full min-w-0 flex-1 bg-transparent px-2 text-center outline-none',
          'text-body-m tabular-nums text-[var(--color-text-text)]',
          'placeholder:text-[var(--color-text-text-subtler)]',
          // Value AND placeholder both go danger when invalid — this input
          // never got either, so an invalid NumberField's number (or its
          // empty-state placeholder) stayed neutral gray even with a
          // danger border all around it.
          'aria-[invalid=true]:text-[var(--color-text-text-danger)]',
          'aria-[invalid=true]:placeholder:text-[var(--color-text-text-danger)]',
          'disabled:cursor-not-allowed disabled:text-[var(--color-text-text-disabled)] disabled:italic',
        )}
      />
      <button
        type="button"
        aria-label={incrementLabel}
        disabled={disabled || (max !== undefined && current >= max)}
        onClick={() => setValue(current + step)}
        className={cn(
          stepButtonClass,
          'border-l border-solid',
          isInvalid ? 'border-[var(--color-border-border-danger)]' : 'border-[var(--color-border-border-subtler)]',
        )}
      >
        <Plus />
      </button>
    </div>
  );
});
