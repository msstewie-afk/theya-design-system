import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/**
 * No library dependency — a native <fieldset>/<legend> pair. Assistive
 * tech announces the group name on entry, and the native `disabled`
 * attribute cascades to every control inside for free.
 */
export interface FieldsetProps extends React.ComponentProps<'fieldset'> {
  /** Group caption, rendered as the <legend>. */
  legend?: ReactNode;
  /** Supporting line below the legend. */
  description?: ReactNode;
}

function Fieldset({ legend, description, className, children, ...props }: FieldsetProps) {
  const hasHeader = Boolean(legend || description);
  return (
    <fieldset className={cn('m-0 min-w-0 border-0 p-0', className)} {...props}>
      {legend && (
        // Matches ResourceForm's own section-heading pattern exactly
        // (font-body text-body-l font-semibold) — was body-m/medium,
        // a drift from the reference this component's doc comment
        // claims to follow. Fixed 2026-09-26.
        <legend className="font-body text-body-l font-semibold text-[var(--color-text-text)]">{legend}</legend>
      )}
      {description && (
        <p className="mt-0.5 font-body text-body-s font-normal text-[var(--color-text-text-subtler)]">
          {description}
        </p>
      )}
      <div className={cn('flex flex-col gap-4', hasHeader && 'mt-4')}>{children}</div>
    </fieldset>
  );
}

export { Fieldset };
