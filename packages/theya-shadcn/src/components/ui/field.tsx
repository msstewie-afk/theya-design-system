import { cn } from '@/lib/utils';

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
 * Simplified vs a Base UI Field reference: there's no automatic
 * id/aria-describedby/aria-invalid context wiring here (Radix has no
 * equivalent primitive for that). Our TextField/TextArea/Select/etc
 * already carry their own full visual chrome, so there's no separate
 * FieldControl wrapper either — the caller computes ids itself (one
 * useId per field) and passes id/aria-describedby/aria-invalid
 * directly to whichever control it renders, same pattern already
 * used throughout DataTableCell.
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
      className={cn('flex flex-col gap-2', className)}
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
    <p role="alert" className={cn('font-body text-body-s font-medium text-[var(--color-text-text-danger)]', className)} {...props}>
      {children}
    </p>
  );
}
