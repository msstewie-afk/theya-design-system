import { cn } from '@/lib/utils';

/**
 * No library dependency — data table primitives. Header sits on a
 * subtle surface with a hairline; rows hover to a subtle fill. For
 * row-as-link, wrap the whole row in a Link or add onClick + role;
 * keep inner action buttons stopPropagation. Numeric columns: add
 * `className="text-right tabular-nums"` to head + cell.
 */
type TableProps = React.ComponentProps<'table'> & {
  /**
   * Optional accessible name for the scroll container. When set, the
   * container becomes a `role="region"` landmark with this label. The
   * container is always keyboard-focusable (`tabIndex={0}`) so a
   * keyboard/switch user can scroll a table wider than the viewport —
   * WCAG 2.1.1 / axe's scrollable-region-focusable. Previously this
   * container had no tab stop at all: a table too wide for its box was
   * only scrollable by mouse drag or trackpad.
   */
  containerLabel?: string;
};

export function Table({ className, containerLabel, ...props }: TableProps) {
  return (
    <div
      data-slot="table-container"
      tabIndex={0}
      // focus-visible:shadow inset, not the outer 4px ring used elsewhere
      // (Button, Checkbox, DataTableColumnHeader) — this container clips
      // its own contents on the scrolling axis (overflow-x-auto), so an
      // outer ring would be cut off on that side. Inset keeps the whole
      // ring visible regardless.
      //
      // --wp-row-h/--wp-row-h-2: same values DataTable's own container
      // sets (2.75rem/3.5rem) — defined here too so a DataTableCell
      // composed straight into a bare Table (no DataTable) still gets a
      // real 44/56px row height instead of silently falling through to
      // auto (the var chain it reads is otherwise undefined here).
      className="relative isolate w-full overflow-x-auto overflow-y-hidden rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] outline-none [--wp-row-h:2.75rem] [--wp-row-h-2:3.5rem] focus-visible:shadow-[inset_0_0_0_4px_var(--color-focus-focus-ring)]"
      {...(containerLabel ? { role: 'region', 'aria-label': containerLabel } : {})}
    >
      <table data-slot="table" className={cn('w-full border-collapse font-body text-body-m', className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={className} {...props} />;
}

export function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={className} {...props} />;
}

export function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        // Named so the last row's cells can round their outer corners.
        'group/row',
        // Inset shadow, not a border: border-collapse resolves a real
        // border into the shared grid rather than painting it as part
        // of this row's own hoverable box.
        'shadow-[inset_0_-1px_0_0_var(--color-border-border-subtle)] transition-colors duration-150 ease-out motion-reduce:transition-none',
        'last:shadow-none hover:bg-[var(--color-bg-neutral-bg-neutral-subtler)]',
        // Selected: same treatment as DataTable's rows (primary tint, lighter
        // tint on hover). Was neutral-subtler for both hover and selected, so
        // a selected row under the pointer looked exactly like an unselected
        // hovered one (2026-09-27).
        'data-[state=selected]:bg-[var(--color-bg-primary-bg-primary-subtle)] data-[state=selected]:hover:bg-[var(--color-bg-primary-bg-primary-subtler)]',
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-auto truncate border-b border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        'px-4 py-2.5 text-left align-middle font-heading text-heading-2xs uppercase tracking-[0.07em] text-[var(--color-text-text-subtler)]',
        'first:rounded-tl-[calc(var(--size-border-radius-border-radius-2xl)-1px)] last:rounded-tr-[calc(var(--size-border-radius-border-radius-2xl)-1px)]',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'px-4 py-3 align-middle text-[var(--color-text-text)]',
        'group-last/row:first:rounded-bl-[calc(var(--size-border-radius-border-radius-2xl)-1px)] group-last/row:last:rounded-br-[calc(var(--size-border-radius-border-radius-2xl)-1px)]',
        className,
      )}
      {...props}
    />
  );
}

export function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return <caption data-slot="table-caption" className={cn('mt-3 font-body text-body-s text-[var(--color-text-text-subtler)]', className)} {...props} />;
}
