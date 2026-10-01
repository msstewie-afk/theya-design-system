import { forwardRef, useId, useRef, useState, useCallback } from 'react';
import { useMissingNameWarning } from '@/lib/a11y-dev';
import type { ReactNode } from 'react';
import { Xmark, Check } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { textFieldVariants, type TextFieldProps as BaseTextFieldProps } from './text-field-variants';

// Wrapper width lives here (not on the input itself) so absolute-
// positioned icons/buttons stay pinned to the actual field edges
// instead of a full-width parent. Figma's state names (Small/Medium/
// Large/XLarge) don't line up with the token suffixes (sm/lg/2xl/3xl —
// mapped by matching pixel value, not by name.
const WIDTH_CLASSES = {
  full: 'w-full',
  sm: 'w-[var(--size-width-width-control-sm)]', // Figma "Small", 60px
  md: 'w-[var(--size-width-width-control-xl)]', // Figma "Medium", 240px
  lg: 'w-[var(--size-width-width-control-2xl)]', // Figma "Large", 348px
  xl: 'w-[var(--size-width-width-control-3xl)]', // Figma "XLarge", 500px
} as const;

function ExclamationCircle({ className }: { className?: string }) {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden="true" className={className}>
      <circle cx="6" cy="6" r="6" fill="currentColor" />
      <rect x="5.25" y="2.5" width="1.5" height="4" rx="0.75" fill="white" />
      <circle cx="6" cy="8.5" r="0.9" fill="white" />
    </svg>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden="true" className={className}>
      <circle cx="6" cy="6" r="6" fill="currentColor" />
      <path d="M3.5 6.2L5.1 7.8L8.5 4.2" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export interface TextFieldProps extends BaseTextFieldProps {
  /** Icon shown at the start of the field (16px, decorative). */
  leftIcon?: ReactNode;
  /** Icon shown at the end of the field. Overrides the built-in clear button, error, and success icons when set. */
  rightIcon?: ReactNode;
  widthSize?: keyof typeof WIDTH_CLASSES;
  /** 'top' (default) stacks label above the field. 'left' puts a fixed 216px label column beside it, matching Figma's horizontal Formfield layout. */
  labelPosition?: 'top' | 'left';
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    error,
    success,
    label,
    required,
    description,
    leftIcon,
    rightIcon,
    widthSize = 'md',
    heightSize = 'md',
    labelPosition = 'top',
    disabled,
    className,
    id,
    value,
    defaultValue,
    onChange,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedby,
    // Defaults to "off" so a plain TextField (search boxes, filters, any
    // non-credential field) doesn't get mistaken for a login field by a
    // password-manager extension when there's no real autocomplete
    // semantic to give it (Мария caught this live, 2026-09-26: a filter
    // input was showing a "use suggested password" prompt). A real field
    // that needs autofill (email, current-password, etc.) still works —
    // just pass an explicit `autoComplete` prop, as login-form.tsx already
    // does, and it overrides this default.
    autoComplete = 'off',
    ...rest
  },
  ref,
) {
  const hasError = Boolean(error);
  const hasSuccess = !hasError && Boolean(success);
  const errorMessage = error !== true ? error : undefined;
  const successMessage = success !== true ? success : undefined;


  const generatedId = useId();
  const resolvedId = id ?? generatedId;
  useMissingNameWarning('TextField', resolvedId);
  const messageId = errorMessage || successMessage || description ? `${resolvedId}-message` : undefined;

  const innerRef = useRef<HTMLInputElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const isControlled = value !== undefined;
  const [uncontrolledHasValue, setUncontrolledHasValue] = useState(Boolean(defaultValue));
  const hasValue = isControlled ? Boolean(value) : uncontrolledHasValue;

  const handleClear = () => {
    if (isControlled) {
      onChange?.({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    } else if (innerRef.current) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      setter?.call(innerRef.current, '');
      innerRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      setUncontrolledHasValue(false);
    }
    innerRef.current?.focus();
  };

  const input = (
    // max-w-full so a fixed widthSize (sm/md/lg/xl) never forces this
    // wrapper past whatever width its own parent actually has (e.g. a
    // PropertyGrid cell narrower than the field's nominal px width) —
    // without it, the field's explicit width just overflowed the parent
    // instead of shrinking to fit.
    <div className={cn('relative max-w-full', WIDTH_CLASSES[widthSize])}>
      {leftIcon && (
        <span
          className={cn(
            'absolute left-[var(--size-padding-padding-lg)] top-1/2 -translate-y-1/2 flex items-center justify-center size-4',
            // Stayed neutral icon-subtle regardless of error before.
            hasError ? 'text-[var(--color-icon-icon-danger)]' : 'text-[var(--color-icon-icon-subtle)]',
          )}
          aria-hidden="true"
        >
          {leftIcon}
        </span>
      )}
      <input
        ref={setRefs}
        id={resolvedId}
        disabled={disabled}
        // Was destructured and only used for the visual asterisk (which is
        // aria-hidden), never passed down: screen readers didn't hear
        // "required" and native form validation ignored it (3.3.2 / 4.1.2).
        required={required}
        value={value}
        defaultValue={defaultValue}
        onChange={(e) => {
          if (!isControlled) setUncontrolledHasValue(Boolean(e.target.value));
          onChange?.(e);
        }}
        aria-label={ariaLabel}
        // Merged, not overwritten: a consumer's aria-describedby used to
        // sit in `rest` after this and replace messageId (even when
        // undefined), cutting the field off from its own error message.
        aria-describedby={[messageId, ariaDescribedby].filter(Boolean).join(' ') || undefined}
        aria-invalid={hasError || undefined}
        autoComplete={autoComplete}
        className={cn(
          textFieldVariants({ error: hasError, success: hasSuccess, heightSize: heightSize as 'md' | 'sm' | 'lg' }),
          leftIcon && 'pl-9',
          (rightIcon || hasError || hasSuccess || hasValue) && !disabled && '!pr-9',
          !((rightIcon || hasError || hasSuccess || hasValue) && !disabled) && '!pr-4',
          className,
        )}
        {...rest}
      />
      {rightIcon ? (
        // No aria-hidden here — unlike the error/success icons below,
        // rightIcon can be a real interactive control (Password's
        // show/hide toggle); a decorative icon should mark itself
        // aria-hidden individually rather than this wrapper hiding
        // everything, interactive or not, from assistive tech.
        <span className="absolute right-[var(--size-padding-padding-xs)] top-1/2 -translate-y-1/2 flex items-center justify-center size-6 text-[var(--color-icon-icon-subtle)]">
          {rightIcon}
        </span>
      ) : hasError ? (
        <span
          className="absolute right-[var(--size-padding-padding-xs)] top-1/2 -translate-y-1/2 flex items-center justify-center size-6 text-[var(--color-icon-icon-danger)]"
          aria-hidden="true"
        >
          <ExclamationCircle className="size-4" />
        </span>
      ) : hasSuccess ? (
        <span
          className="absolute right-[var(--size-padding-padding-xs)] top-1/2 -translate-y-1/2 flex items-center justify-center size-6 text-[var(--color-icon-icon-success)]"
          aria-hidden="true"
        >
          <CheckCircle className="size-4" />
        </span>
      ) : (
        hasValue &&
        !disabled &&
        !rest.readOnly && (
          <Button
            appearance="ghost"
            size="sm"
            iconOnly
            onClick={handleClear}
            aria-label="Clear input"
            leftIcon={<Xmark />}
            className="absolute right-[var(--size-padding-padding-xs)] top-1/2 -translate-y-1/2"
          />
        )
      )}
    </div>
  );

  const labelEl = (
    <label
      htmlFor={resolvedId}
      className={cn(
        'flex items-center gap-1',
        labelPosition === 'left' && 'shrink-0 w-[216px] pt-[9px]',
        disabled && 'opacity-50',
      )}
    >
      <span className={cn('font-body text-[var(--color-text-text)]', heightSize === 'sm' && 'text-body-s')}>
        {label}
      </span>
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
  ) : successMessage ? (
    <div id={messageId} className="flex gap-1 items-start">
      <CheckCircle className="text-[var(--color-icon-icon-success)] mt-px shrink-0" />
      <span className="font-body font-normal text-body-xs text-[var(--color-text-text-success)]">{successMessage}</span>
    </div>
  ) : description ? (
    <span id={messageId} className="font-body font-normal text-body-xs text-[var(--color-text-text-subtler)]">
      {description}
    </span>
  ) : null;

  // No visible label (aria-label only): still render the message. This
  // used to return the bare input, so error/description text was never
  // shown or announced — the field was flagged by its red border alone.
  //
  // The wrapper is ALWAYS rendered — `display: contents` (layout-
  // transparent, same as the bare field) while there's no message. It used
  // to be `messageEl ? <div>…</div> : input`, so the root element type
  // flipped whenever an error appeared or cleared and React remounted the
  // field: focus moved onto it was lost, and in an uncontrolled field the
  // first keystroke (which typically clears the error) wiped the typed
  // value. Found by the SettingsScreen password test, 2026-10-01.
  if (!label) {
    return (
      <div className={messageEl ? 'flex flex-col gap-1.5 w-full' : 'contents'}>
        {input}
        {messageEl}
      </div>
    );
  }

  if (labelPosition === 'left') {
    return (
      <div className="flex items-start gap-0">
        {labelEl}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          {input}
          {messageEl}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1 w-full">
      {labelEl}
      <div className="flex flex-col gap-1.5 w-full">
        {input}
        {messageEl}
      </div>
    </div>
  );
});
