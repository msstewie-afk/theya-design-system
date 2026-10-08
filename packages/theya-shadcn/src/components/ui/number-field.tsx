'use client';

import { forwardRef, useState, useCallback, useId, useRef } from 'react';
import { Minus, Plus } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';

const WIDTH_CLASSES = {
  full: 'w-full',
  // 128px: both step buttons (2×36) + ~5 digits. Was the TextField sm token
  // (60px) — narrower than the two buttons alone, so the input collapsed to
  // 0px and the buttons clipped. No size token at this step yet (scale jumps
  // 100 → 200), hence the raw rem value.
  sm: 'w-32',
  md: 'w-[var(--size-width-width-control-xl)] max-w-full', // 224px
  lg: 'w-[var(--size-width-width-control-2xl)] max-w-full', // 348px
  xl: 'w-[var(--size-width-width-control-3xl)] max-w-full', // 500px
} as const;

/**
 * Theya's numeric stepper. Radix has no number-field primitive, so this
 * is a plain <input role="spinbutton"> between two step buttons. Draft
 * v1: click +/- buttons, Up/Down arrow keys (Shift = 10x step), and
 * min/max clamping.
 *
 * Typing edits a draft string: nothing is clamped and onValueChange does
 * not fire until the edit is committed on blur or Enter (parsed, clamped,
 * reported once). Empty or non-numeric input reverts to the last value;
 * Escape discards the draft. Arrow keys and the +/- buttons still change
 * the value immediately. Before 2026-09-29 every keystroke was clamped,
 * so with min=5 typing "12" produced 5, then 52 -> max, and the field
 * could not be emptied. Same commit model as a native
 * <input type="number">. Deferred: Alt for a smaller step, Home/End
 * jump-to-bound, and press-and-hold repeat on the buttons.
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
  /**
   * sm 128px (default — a stepper holds a short number), md 224, lg 348,
   * xl 500, full = 100% of the container. Until 2026-10-03 the default was
   * 'full', so the field took whatever width its parent had (stretched in
   * forms, every consumer wrapped it in its own fixed-width div), and sm was
   * 60px, too narrow for the buttons.
   */
  widthSize?: keyof typeof WIDTH_CLASSES;
  /** Matches TextField's heightSize: md 40px (default), sm 32px with 12px text and the 4px radius — for dense rows (cart quantities, table cells). */
  heightSize?: 'sm' | 'md';
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
    widthSize = 'sm',
    heightSize = 'md',
    decrementLabel,
    incrementLabel,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-invalid': ariaInvalid,
  },
  ref,
) {
  const { t } = useTheyaI18n();
  if (decrementLabel === undefined) decrementLabel = t.numberField.decrement;
  if (incrementLabel === undefined) incrementLabel = t.numberField.increment;
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
    const next = clamp(base + delta, min, max);
    setValue(base + delta);
    if (next !== current) pop();
  };

  // A step makes the number pop (Kinetics' Quantity Stepper, MIT); typing doesn't.
  const inputRef = useRef<HTMLInputElement | null>(null);
  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );
  const pop = () => {
    const input = inputRef.current;
    if (!input?.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    input.animate([{ scale: 1 }, { scale: 1.3, offset: 0.4 }, { scale: 1 }], { duration: 350, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
  };

  const isInvalid = ariaInvalid === true || ariaInvalid === 'true';

  // Step buttons' own focus ring didn't know about the field's aria-invalid
  // — tabbing to +/- while the field was invalid showed the primary ring
  // instead of the error one. Fixed 2026-09-26.
  const stepButtonClass = cn(
    'flex shrink-0 items-center justify-center',
    heightSize === 'sm' ? 'w-8 [&_svg]:size-3.5' : 'w-9',
    'outline-none cursor-pointer',
    'transition-colors duration-standard ease-enter motion-reduce:transition-none',
    // +/- glyph stayed neutral icon-subtle regardless of invalid before —
    // matching the field's own danger treatment now.
    isInvalid
      ? 'text-[var(--color-icon-icon-danger)] hover:not-disabled:bg-[var(--color-bg-danger-bg-danger-subtler-hover)]'
      : 'text-[var(--color-icon-icon-subtle)] hover:not-disabled:bg-[var(--color-bg-neutral-bg-neutral-subtle)] hover:not-disabled:text-[var(--color-icon-icon)]',
    'focus-visible:relative focus-visible:z-10 focus-visible:outline-none',
    isInvalid
      ? 'focus-visible:focus-ring-error'
      : 'focus-visible:focus-ring',
    'disabled:pointer-events-none disabled:opacity-40',
    '[&_svg]:size-4 [&_svg]:shrink-0',
  );

  return (
    <div
      className={cn(
        // min-w-min: overflow-hidden turns a flex item's automatic min-width
        // into 0, so in a flex row the field used to squeeze until the input
        // disappeared. Now it never goes below buttons + the input's minimum.
        'inline-flex min-w-min items-stretch overflow-hidden',
        heightSize === 'sm' ? 'h-[var(--size-size-control-size-control-lg)] rounded-[var(--size-border-radius-border-radius-md)]' : 'h-[var(--size-size-control-size-control-2xl)] rounded-[var(--size-border-radius-border-radius-lg)]',
        WIDTH_CLASSES[widthSize],
        'border border-solid',
        'border-[var(--color-border-border)] bg-[var(--color-bg-input-bg-input)]',
        'transition-[border-color,background-color,box-shadow] duration-standard ease-enter motion-reduce:transition-none',
        'has-[input:hover]:not-has-[input:disabled]:not-has-[input[aria-invalid=true]]:border-[var(--color-border-border-primary)]',
        'has-[input:focus-visible]:not-has-[input[aria-invalid=true]]:border-[var(--color-border-border-primary)]',
        'has-[input:focus-visible]:bg-[var(--color-bg-input-bg-input-active)]',
        'has-[input:focus-visible]:focus-ring',
        // Matches TextField's 5-point disabled spec exactly (border,
        // bg, text, italic — no opacity).
        'has-[input:disabled]:border-[var(--color-border-border)]',
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
        'has-[input[aria-invalid=true]]:has-[input:focus-visible]:focus-ring-error',
        className,
      )}
    >
      <button
        type="button"
        aria-label={decrementLabel}
        disabled={disabled || (min !== undefined && current <= min)}
        onClick={() => stepFrom(-step)}
        className={cn(
          stepButtonClass,
          'border-e border-solid',
          // Divider between button and input didn't know about invalid —
          // stayed the neutral (blue-violet-tinted) subtle border even in
          // an all-red invalid field. Fixed 2026-09-26.
          isInvalid ? 'border-[var(--color-border-border-danger)]' : 'border-[var(--color-border-border-subtler)]',
        )}
      >
        <Minus />
      </button>
      <input
        ref={setInputRef}
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
          // w-0 + min-w-12: an <input> has an intrinsic ~20ch width; without w-0 that
          // becomes the field's minimum and every size below ~250px is ignored.
          'h-full w-0 min-w-12 flex-1 bg-transparent px-2 text-center outline-none',
          heightSize === 'sm' ? 'text-body-s' : 'text-body-m',
          'tabular-nums text-[var(--color-text-text)]',
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
        onClick={() => stepFrom(step)}
        className={cn(
          stepButtonClass,
          'border-s border-solid',
          isInvalid ? 'border-[var(--color-border-border-danger)]' : 'border-[var(--color-border-border-subtler)]',
        )}
      >
        <Plus />
      </button>
    </div>
  );
});
