import type { ReactNode } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { Xmark } from 'iconoir-react';
import { cn } from '@/lib/utils';

/**
 * Underline-style tabs on @radix-ui/react-tabs. The active tab is marked
 * by two signals — the underline's border-color swap and a text-color
 * swap — no background fill by default, so a busy tablist (icons, badges,
 * a close button) doesn't compete with its own active-state fill.
 */
export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        'flex gap-0.5 overflow-x-auto overflow-y-hidden border-b border-solid border-[var(--color-border-border-subtle)]',
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      {...props}
    />
  );
}

export interface TabsTriggerProps extends React.ComponentProps<typeof TabsPrimitive.Trigger> {
  /** Icon shown before the label. */
  icon?: ReactNode;
  /**
   * Renders a close "×" control after the trigger's own content (label,
   * a Badge composed in as a child, etc). Omit for no close control.
   * Rendered as a real sibling button, never nested inside the trigger's
   * own interactive element — the trigger itself can't validly contain
   * another interactive element (the same constraint Chip/ChipRemove and
   * SidebarItem's actions trigger work around), which is also why this
   * component renders via `asChild` onto a plain `<div role="tab">`
   * rather than Radix's own default `<button>`.
   */
  onClose?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Accessible name for the close button. Required when `onClose` is set — it can't be derived from arbitrary children. */
  closeLabel?: string;
}

export function TabsTrigger({ className, icon, onClose, closeLabel, children, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger asChild {...props}>
      <div
        className={cn(
          '-mb-px inline-flex shrink-0 items-center gap-1.5 cursor-pointer',
          'rounded-t-[var(--size-border-radius-border-radius-md)] border-b-2 border-solid border-transparent',
          'px-3 py-2.5 font-body text-body-m font-medium text-[var(--color-text-text-subtler)]',
          'transition-[background-color,color,border-color] duration-150 ease-out motion-reduce:transition-none',
          'data-[state=inactive]:hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] data-[state=inactive]:hover:text-[var(--color-text-text)]',
          // text-link is now blue-200 (the same saturated primary used by
          // Button/Ghost's own text color) — text-link-subtle (blue-100)
          // is the dedicated lighter tone for text on a tonal/tinted bg.
          'data-[state=active]:border-[var(--color-border-border-primary)] data-[state=active]:text-[var(--color-text-text-link)]',
          'focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
          className,
        )}
      >
        {icon}
        {children}
        {onClose && (
          <button
            type="button"
            aria-label={closeLabel}
            onClick={(event) => {
              event.stopPropagation();
              onClose(event);
            }}
            className={cn(
              'grid size-4 shrink-0 place-content-center rounded-[var(--size-border-radius-border-radius-sm)]',
              'text-[var(--color-icon-icon-subtle)] outline-none',
              'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] hover:text-[var(--color-icon-icon)]',
              'focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
            )}
          >
            <Xmark width={12} height={12} aria-hidden="true" />
          </button>
        )}
      </div>
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(
        'outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)] rounded-[var(--size-border-radius-border-radius-md)]',
        className,
      )}
      {...props}
    />
  );
}
