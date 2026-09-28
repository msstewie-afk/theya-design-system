import { forwardRef, useId, useEffect } from 'react';
import type { TextareaHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

function ExclamationCircle({ className }: { className?: string }) {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden="true" className={className}>
      <circle cx="6" cy="6" r="6" fill="currentColor" />
      <rect x="5.25" y="2.5" width="1.5" height="4" rx="0.75" fill="white" />
      <circle cx="6" cy="8.5" r="0.9" fill="white" />
    </svg>
  );
}

/**
 * Carries over the TextField fixes: border-default (not border-subtle)
 * for enabled, box-border so padding/border don't inflate the size,
 * hover-darken for error scoped via compoundVariants (not a base
 * class — competing with the neutral hover rule at equal specificity
 * was the bug that made error fields hover blue in TextField), alpha
 * focus rings (not solid), and read-only styling. No success variant
 * here (removed per request) — TextField/Password keep it. No
 * leftIcon/rightIcon either — a multi-line field doesn't get the same
 * absolute-positioned icon/clear-button treatment as TextField.
 *
 * widthSize matches TextField's own scale/tokens (full/sm/md/lg/xl —
 * same pixel values, same keys). heightSize does NOT touch the box
 * height here — a textarea's height is its own thing (min-h-[80px] +
 * resize), unlike TextField's single-line control height. It only
 * switches the label/value text size (body-m/body-s), same as
 * TextField's heightSize does for typography.
 */
const textareaVariants = cva(
  [
    'box-border w-full min-h-[80px] rounded-[var(--size-border-radius-border-radius-md)]',
    'bg-[var(--color-bg-input-bg-input)] border border-solid',
    'border-[var(--color-border-border-default)]',
    'text-[var(--color-text-text)] placeholder:text-[var(--color-text-text-subtler)]',
    // 4px extra left padding vs the right side, per request.
    'pl-[calc(var(--size-margin-margin-xs)+4px)] pr-[var(--size-margin-margin-xs)] py-[var(--size-margin-margin-s)]',
    'transition-[background-color,border-color,box-shadow] duration-150 ease-out motion-reduce:transition-none',
    'outline-none resize',
    'disabled:cursor-not-allowed disabled:resize-none disabled:bg-[var(--color-bg-neutral-bg-neutral-subtler)]',
    'disabled:border-[var(--color-border-border-subtle)] disabled:text-[var(--color-text-text-subtler)] disabled:italic',
    'read-only:cursor-default read-only:italic read-only:resize-none',
    'read-only:bg-[var(--color-bg-neutral-bg-neutral-subtler)]',
    'read-only:border-[var(--color-border-border-subtle)]',
    'read-only:text-[var(--color-text-text-subtle)]',
  ],
  {
    variants: {
      error: {
        true: [
          'border-[var(--color-border-border-danger)]',
          'bg-[var(--color-bg-input-bg-input-danger)]',
          'text-[var(--color-text-text-danger)]',
          'hover:not-disabled:not-read-only:not-focus:border-[var(--color-border-border-danger-hover)]',
          'focus-visible:not-read-only:border-[var(--color-border-border-danger)]',
          // One step denser than the idle/hover danger bg while actively
          // focused/being typed into.
          'focus-visible:not-read-only:bg-[var(--color-bg-input-bg-input-danger-pressed)]',
          'focus-visible:not-read-only:shadow-[0_0_0_4px_var(--color-focus-focus-ring-error)]',
          // The base placeholder:text-subtler rule above has no invalid
          // guard, so an empty invalid field (the WithError story has no
          // defaultValue) showed its placeholder in neutral gray even
          // though the border/bg were already danger — same bug shape as
          // Select's placeholder-vs-error color conflict.
          'placeholder:text-[var(--color-text-text-danger)]',
        ],
        false: '',
      },
      widthSize: {
        full: 'w-full',
        sm: 'w-[var(--size-width-width-control-sm)]', // Figma "Small", 60px
        md: 'w-[var(--size-width-width-control-xl)]', // Figma "Medium", 240px
        lg: 'w-[var(--size-width-width-control-2xl)]', // Figma "Large", 348px
        xl: 'w-[var(--size-width-width-control-3xl)]', // Figma "XLarge", 500px
      },
      // Text size only — see the note above the cva() call for why this
      // doesn't touch the box height the way TextField's heightSize does.
      heightSize: {
        md: 'text-body-m',
        sm: 'text-body-s',
      },
    },
    compoundVariants: [
      {
        error: false,
        class: [
          'hover:not-disabled:not-read-only:not-focus:border-[var(--color-border-border-primary)]',
          'focus-visible:not-read-only:border-[var(--color-border-border-primary)]',
          // TextField's own focus state darkens the background too
          // (bg-input-active), not just border+ring — this rule was
          // missing here, so a focused TextArea never got the same
          // "active field" highlight TextField gets, just a ring.
          'focus-visible:not-read-only:bg-[var(--color-bg-input-bg-input-active)]',
          'focus-visible:not-read-only:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
        ],
      },
    ],
    defaultVariants: { error: false, widthSize: 'full', heightSize: 'md' },
  },
);

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    Omit<VariantProps<typeof textareaVariants>, 'error'> {
  label?: ReactNode;
  /** Shows a small red asterisk after the label. */
  required?: boolean;
  /** Helper text below the field. Hidden when `error` is set. */
  description?: ReactNode;
  /**
   * Error message shown below the field with a warning icon, and
   * switches the field to its error styling. Pass `true` for error
   * styling with no message, or a string/node for styling + message.
   */
  error?: boolean | ReactNode;
  /** 'top' (default) stacks label above the field. 'left' puts a fixed 216px label column beside it, matching TextField's horizontal Formfield layout. */
  labelPosition?: 'top' | 'left';
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    error,
    widthSize = 'full',
    heightSize = 'md',
    label,
    required,
    description,
    labelPosition = 'top',
    disabled,
    className,
    id,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  const hasError = Boolean(error);
  const errorMessage = error !== true ? error : undefined;

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!label && !ariaLabel) {
        console.warn('[TextArea] Missing accessible name: pass `label` or `aria-label`.');
      }
    }, [label, ariaLabel]);
  }

  const generatedId = useId();
  const resolvedId = id ?? generatedId;
  const messageId = errorMessage || description ? `${resolvedId}-message` : undefined;

  const field = (
    <textarea
      ref={ref}
      id={resolvedId}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={messageId}
      aria-invalid={hasError || undefined}
      className={cn(textareaVariants({ error: hasError, widthSize, heightSize }), className)}
      {...rest}
    />
  );

  if (!label) return field;

  const labelEl = (
    <label
      htmlFor={resolvedId}
      className={cn(
        'flex items-center gap-1',
        labelPosition === 'left' && 'shrink-0 w-[216px] pt-[9px]',
        disabled && 'opacity-50',
      )}
    >
      <span className={cn('font-body text-[var(--color-text-text)]', heightSize === 'sm' && 'text-body-s')}>{label}</span>
      {required && (
        <span className="text-[var(--color-text-text-danger)] leading-none" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );

  const messageEl = errorMessage ? (
    <div id={messageId} className="flex gap-1 items-start">
      <ExclamationCircle className="text-[var(--color-icon-icon-danger)] mt-px shrink-0" />
      <span className="font-body font-normal text-body-xs text-[var(--color-text-text-danger)]">{errorMessage}</span>
    </div>
  ) : description ? (
    <span id={messageId} className="font-body font-normal text-body-xs text-[var(--color-text-text-subtler)]">
      {description}
    </span>
  ) : null;

  if (labelPosition === 'left') {
    return (
      <div className="flex items-start gap-0">
        {labelEl}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          {field}
          {messageEl}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1 w-full">
      {labelEl}
      <div className="flex flex-col gap-1.5 w-full">
        {field}
        {messageEl}
      </div>
    </div>
  );
});
