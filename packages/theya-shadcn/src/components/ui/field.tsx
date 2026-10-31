import { cn } from '../../lib/utils';
import { FieldErrorIcon } from './field-error-icon';

/**
 * Lightweight structural pieces for a labelled form field: Field
 * (the vertical stack), FieldDescription, FieldError. Use the base
 * Label component directly for the label — Field no longer has its
 * own FieldLabel; it was a near-duplicate of Label with a different
 * font size and its own separate required-handling, which just meant
 * two label implementations that could quietly drift apart. Pass
 * `required` straight to Label (and to Field, for `data-invalid`/
 * general field-level attributes) — a couple of characters repeated
 * beats two components doing the same job.
 *
 * Field does no automatic id/aria-describedby/aria-invalid wiring
 * through context, and Radix has no primitive for it. Our TextField/
 * TextArea/Select/etc already carry their own visual chrome, so there
 * is no control wrapper either: the caller makes the ids (one useId per
 * field) and passes id/aria-describedby/aria-invalid straight to the
 * control it renders, the same pattern DataTableCell uses.
 */
export function Field({
  className,
  invalid,
  required,
  disabled,
  ...props
}: React.ComponentProps<'div'> & { invalid?: boolean; required?: boolean; disabled?: boolean }) {
  return (
    <div
      data-invalid={invalid || undefined}
      data-required={required || undefined}
      data-disabled={disabled || undefined}
      className={cn('flex flex-col gap-1', className)}
      {...props}
    />
  );
}

export function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('font-body text-body-s text-[var(--color-text-text-subtler)]', className)} {...props} />;
}

export function FieldError({ className, children, ...props }: React.ComponentProps<'p'>) {
  if (!children) return null;
  return (
    // The icon, like TextField's own message: the error doesn't rest on the red alone (WCAG 1.4.1).
    <p role="alert" className={cn('flex items-start gap-1 font-body text-body-s font-medium text-[var(--color-text-text-danger)]', className)} {...props}>
      <FieldErrorIcon className="mt-0.5 shrink-0 text-[var(--color-icon-icon-danger)]" />
      <span>{children}</span>
    </p>
  );
}
