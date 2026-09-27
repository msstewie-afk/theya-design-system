import { forwardRef, type ReactNode } from 'react';
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

/**
 * Radix's TabsPrimitive.Trigger hardcodes `type="button"` and the raw
 * `disabled` boolean attribute onto whatever it renders, assuming a real
 * <button>. We render onto a <div role="tab"> instead (a tab can't validly
 * nest another interactive control — see `onClose` below), so those two
 * attributes land on the div as invalid HTML — and on a disabled trigger,
 * gave axe's nested-interactive rule a div that reads as both a native
 * button-like element (type+disabled) AND an explicit role="tab" widget at
 * once (audit finding, 2026-09-27). This shim intercepts Radix's merged
 * props and drops both, expressing disabled the ARIA-correct way
 * (aria-disabled) instead — `data-disabled` (used for our own styling) and
 * everything else Radix sets pass through untouched.
 */
const TabsTriggerDiv = forwardRef<HTMLDivElement, React.ComponentProps<'div'> & { type?: string; disabled?: boolean }>(
  function TabsTriggerDiv({ type: _type, disabled, ...props }, ref) {
    return <div ref={ref} aria-disabled={disabled || undefined} {...props} />;
  },
);

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
      <TabsTriggerDiv
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
          // Disabled: no opacity-based dimming on the whole element — the
          // parent's opacity would multiply straight through the text
          // color, and axe flagged the resulting blend as under AA's
          // 4.5:1 (color-contrast, 2026-09-27; role="tab" isn't a native
          // form control, so it never got axe's native-disabled exemption
          // either). Text goes to a dedicated, flatly-lighter-but-still-
          // compliant tone (4.66:1 on white) instead; only the icon (which
          // only needs 3:1) still dims via opacity.
          'data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:text-[#6f7199] data-[disabled]:[&_svg]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
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
      </TabsTriggerDiv>
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
