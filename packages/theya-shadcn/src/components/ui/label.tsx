import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

/**
 * Standalone Label — the piece Field/Form compose on top of. Cascades
 * disabled styling from a peer/group native control the same way
 * shadcn's own Label does. `required` renders the same asterisk mark
 * everywhere a label appears (Field/FieldLabel and Form/FormLabel both
 * forward it here instead of each drawing their own).
 */
function Label({
  className,
  required,
  children,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & { 'data-error'?: boolean; required?: boolean }) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'flex items-center gap-1 font-body text-body-m text-[var(--color-text-text)]',
        'peer-disabled:cursor-not-allowed peer-disabled:text-[var(--color-text-text-disabled)]',
        'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:text-[var(--color-text-text-disabled)]',
        'data-[error=true]:text-[var(--color-text-text-danger)]',
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="text-[var(--color-text-text-danger)]">
          *
        </span>
      )}
    </LabelPrimitive.Root>
  );
}

export { Label };
