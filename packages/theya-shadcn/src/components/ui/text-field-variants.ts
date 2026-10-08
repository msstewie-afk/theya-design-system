import { cva, type VariantProps } from 'class-variance-authority';
import type { InputHTMLAttributes, ReactNode } from 'react';

/**
 * Sourced directly from Figma (node 6709:7414 and sibling states) —
 * Type=Outline, Height=Large only for now (Medium/Filled/Flushed
 * deferred). Value/label text is body-m (14px, the project's actual
 * default) rather than Figma's literal body/l (16px) — that file
 * predates the current type scale. Height=Medium would map to
 * body-s (12px) if we ever add that size.
 *
 * widthSize is NOT applied here — it lives on the wrapper div in
 * text-field.tsx instead (see WIDTH_CLASSES there), so absolute-
 * positioned icons/buttons stay pinned to the actual field edges
 * instead of drifting to the edge of a full-width parent.
 *
 * The default->primary hover border is a compoundVariant (error:false,
 * success:false), not a base class — keeping it in base competed with
 * the error/success hover rules at equal CSS specificity, so which one
 * actually won on hover was down to generated-stylesheet order, not
 * intent (this is what caused error/success fields to hover blue
 * instead of their own darker shade).
 */
export const textFieldVariants = cva(
  [
    'box-border w-full rounded-[var(--theme-radius-field,var(--field-radius,var(--size-border-radius-border-radius-lg)))]', // --theme-radius-field: product profile override
    'ps-[var(--size-padding-padding-lg)] pe-[var(--size-padding-padding-xs)]',
    'bg-[var(--color-bg-input-bg-input)] border border-solid',
    'border-[var(--color-border-border)]',
    'text-[var(--color-text-text)] placeholder:text-[var(--color-text-text-subtler)]',
    'transition-[background-color,border-color,box-shadow] duration-150 ease-out motion-reduce:transition-none',
    'outline-none',
    'disabled:cursor-not-allowed disabled:bg-[var(--color-bg-neutral-bg-neutral-subtler)]',
    'disabled:border-[var(--color-border-border)] disabled:text-[var(--color-text-text-subtler)] disabled:italic',
    // Read-only: same bg as disabled but a different border, italic
    // text, and a normal (not not-allowed) cursor — the value is
    // still selectable/readable, just not editable. Also fully inert
    // on hover/focus (see not-read-only: guards on those rules below).
    'read-only:cursor-default read-only:italic',
    'read-only:bg-[var(--color-bg-neutral-bg-neutral-subtler)]',
    'read-only:border-[var(--color-border-border)]',
    'read-only:text-[var(--color-text-text-subtle)]',
  ],
  {
    variants: {
      error: {
        true: [
          'border-[var(--color-border-border-danger)]',
          'bg-[var(--color-bg-input-bg-input-danger)]',
          'text-[var(--color-text-text-danger)]',
          // The base placeholder:text-subtler rule has no invalid guard,
          // so a placeholder-only invalid field (no typed value) stayed
          // neutral gray instead of danger — same bug shape as Select's
          // and TextArea's placeholder-vs-error color conflicts.
          'placeholder:text-[var(--color-text-text-danger)]',
          'hover:not-disabled:not-read-only:not-focus:border-[var(--color-border-border-danger-hover)]',
          'focus-visible:not-read-only:border-[var(--color-border-border-danger)]',
          // One step denser than the idle/hover danger bg while actively
          // focused/being typed into.
          'focus-visible:not-read-only:bg-[var(--color-bg-input-bg-input-danger-pressed)]',
          'focus-visible:not-read-only:focus-ring-error',
        ],
        false: '',
      },
      success: {
        true: [
          'border-[var(--color-border-border-success)]',
          'bg-[var(--color-bg-input-bg-input-success)]',
          'hover:not-disabled:not-read-only:not-focus:border-[var(--color-border-border-success-hover)]',
          'focus-visible:not-read-only:border-[var(--color-border-border-success)]',
          'focus-visible:not-read-only:bg-[var(--color-bg-input-bg-input-success)]',
          'focus-visible:not-read-only:focus-ring-success',
        ],
        false: '',
      },
      // Renamed from Figma's Large/Medium to md (default)/sm so the
      // prop reads naturally: heightSize="sm" for the smaller field.
      // lg (48px) added 2026-09-27 to line up with Select/Filter's own
      // lg step — not in the original Figma spec, so it reuses body-m
      // (same as md) rather than inventing a new text size, matching
      // Select's own lg (taller control, same text size) precedent.
      heightSize: {
        // font-body is set explicitly too, not just text-body-m: an <input>
        // does not inherit typography from its ancestors by default (only a
        // reset like Tailwind Preflight makes it, and even then only what the
        // nearest non-form ancestor happens to set) — so without a class of
        // its own here, the value text silently took on whatever font-size
        // its wrapping container set instead of the fixed 14px this variant
        // is documented to be.
        md: 'h-[var(--size-size-control-size-control-2xl)] font-body text-body-m', // 40px (Figma "Large") — body-m (14px) value text, shared default row height
        // sm steps the radius down to md (4px) so a same-height md Button (6px)
        // stays rounder than the field (Мария, 2026-10-02).
        sm: 'h-[var(--size-size-control-size-control-lg)] font-body text-body-s [--field-radius:var(--size-border-radius-border-radius-md)]', // 32px (Figma "Medium") — body-s (12px) value text
        lg: 'h-[var(--size-size-control-size-control-4xl)] font-body text-body-m', // 48px — body-m text, same as md (matches Select's lg convention)
      },
    },
    compoundVariants: [
      {
        error: false,
        success: false,
        class: [
          'hover:not-disabled:not-read-only:not-focus:border-[var(--color-border-border-primary)]',
          'focus-visible:not-read-only:border-[var(--color-border-border-primary)]',
          'focus-visible:not-read-only:bg-[var(--color-bg-input-bg-input-active)]',
          // Figma spec uses the low-alpha token as-is (rgba(55,149,255,0.3)).
          'focus-visible:not-read-only:focus-ring',
        ],
      },
    ],
    defaultVariants: { error: false, success: false, heightSize: 'md' },
  },
);

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    Omit<VariantProps<typeof textFieldVariants>, 'error' | 'success'> {
  label?: ReactNode;
  /** Shows a small red asterisk after the label. */
  required?: boolean;
  /** Shows "(optional)" after the label. Ignored when `required`. */
  optional?: boolean;
  /** Helper text below the field. Hidden when `error` or `success` is set. */
  description?: ReactNode;
  /**
   * Error message shown below the field with a warning icon, and
   * switches the field to its error styling. Pass `true` for error
   * styling with no message, or a string/node for styling + message.
   */
  error?: boolean | ReactNode;
  /**
   * Success message shown below the field with a check icon, and
   * switches the field to its success styling. Pass `true` for success
   * styling with no message, or a string/node for styling + message.
   * Ignored when `error` is set.
   */
  success?: boolean | ReactNode;
}
