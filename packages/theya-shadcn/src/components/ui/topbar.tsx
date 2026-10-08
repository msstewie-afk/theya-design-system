'use client';

import { forwardRef, createContext, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Menu, Search } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { useSidebar } from './sidebar';
import { Kbd } from './kbd';
import { textFieldVariants } from './text-field-variants';
import { Popover, PopoverAnchor, PopoverContent } from './popover';
import { useTheyaI18n } from '../../lib/i18n';

/**
 * The slim, sticky, blurred app header (56px), or a vertical 56px
 * icon rail when orientation="vertical".
 *
 *   <Topbar>
 *     <TopbarMenu />
 *     <Breadcrumb>…</Breadcrumb>
 *     <TopbarSearch value={q} onValueChange={setQ}>…results…</TopbarSearch>
 *     <TopbarSpacer />
 *     <ThemeToggle /> …
 *   </Topbar>
 */
export type TopbarOrientation = 'horizontal' | 'vertical';

const TopbarOrientationContext = createContext<TopbarOrientation>('horizontal');

export interface TopbarProps extends React.ComponentProps<'header'> {
  orientation?: TopbarOrientation;
}

export function Topbar({ className, orientation = 'horizontal', children, ...props }: TopbarProps) {
  return (
    <TopbarOrientationContext.Provider value={orientation}>
      <header
        data-orientation={orientation}
        className={cn(
          'sticky z-sticky flex items-center border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]/90 backdrop-blur-md',
          orientation === 'horizontal' && 'top-0 h-14 gap-3.5 border-b px-6 max-md:px-4',
          orientation === 'vertical' && 'start-0 top-0 h-svh w-14 flex-col gap-2 py-3',
          className,
        )}
        {...props}
      >
        {children}
      </header>
    </TopbarOrientationContext.Provider>
  );
}

/** Hamburger that opens the rail on mobile (hidden ≥ md). */
// forwardRef: a wrapper over a native control must pass refs through (focus
// by ref, Radix asChild triggers); a plain function drops them under React 18.
export const TopbarMenu = forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(function TopbarMenu({ className, ...props }, ref) {
  const { t } = useTheyaI18n();
  const { setMobileOpen } = useSidebar();
  return (
    <button
      ref={ref}
      type="button"
      aria-label={t.topbar.openMenu}
      onClick={() => setMobileOpen(true)}
      className={cn(
        'grid size-11 shrink-0 place-content-center rounded-[var(--size-border-radius-border-radius-md)] text-[var(--color-icon-icon-subtle)] md:hidden',
        'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] hover:text-[var(--color-icon-icon)]',
        'focus-visible:outline-none focus-visible:focus-ring',
        className,
      )}
      {...props}
    >
      <Menu className="size-5" />
    </button>
  );
});

/**
 * A live search field, not a dialog trigger: typing filters in place and
 * results drop into a Popover anchored directly under the field — the user
 * never leaves it (no centered-dialog teleport). Reuses TextField's own
 * `textFieldVariants` cva for the input's chrome, so hover/focus/border states
 * are pixel-identical to TextField, not a hand-copied approximation.
 *
 * `children` is the results dropdown's content (Command building blocks —
 * CommandList/CommandGroup/CommandItem — are the natural fit, though any
 * content works). The popover opens on focus or on the first keystroke and
 * closes on blur/Escape/outside click, matching a standard combobox.
 *
 * Controlled via `value`/`onValueChange` (the query) and, if the consumer
 * wants to drive it, `open`/`onOpenChange`; otherwise both are internal state.
 */
export interface TopbarSearchProps extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange' | 'defaultValue'> {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The results dropdown's content, anchored under the field. Omit (or pass nothing selectable) and the popover simply won't open. */
  children?: ReactNode;
}

export function TopbarSearch({
  className,
  placeholder,
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  children,
  ...props
}: TopbarSearchProps) {
  const { t } = useTheyaI18n();
  if (placeholder === undefined) placeholder = t.topbar.searchPlaceholder;
  const orientation = useContext(TopbarOrientationContext);
  const vertical = orientation === 'vertical';
  const inputRef = useRef<HTMLInputElement>(null);

  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const isValueControlled = value !== undefined;
  const actualValue = isValueControlled ? value : internalValue;

  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const isOpenControlled = open !== undefined;
  const actualOpen = isOpenControlled ? open : internalOpen;
  const setOpen = (next: boolean) => {
    if (!isOpenControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  // Vertical rail: no room for an inline field + dropdown, so this stays the
  // compact icon-button affordance — wire onClick to open a CommandDialog if
  // a full palette is wanted in that orientation.
  if (vertical) {
    return (
      <button
        type="button"
        aria-label={placeholder}
        aria-keyshortcuts="Meta+K Control+K"
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-[var(--size-border-radius-border-radius-md)] text-[var(--color-text-text-subtler)]',
          'transition-colors duration-standard ease-enter motion-reduce:transition-none',
          'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] hover:text-[var(--color-icon-icon)]',
          'focus-visible:outline-none focus-visible:focus-ring',
          className,
        )}
        {...(props as React.ComponentProps<'button'>)}
      >
        <Search className="size-4 shrink-0" />
      </button>
    );
  }

  return (
    <Popover open={actualOpen} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="relative w-[17.5rem] max-w-[32vw] max-md:w-28">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-icon-icon-subtle)]"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            // "search" in name keeps iCloud Passwords from offering credentials here;
            // it ignores autoComplete="off" and the data-*-ignore hints.
            name="topbar-search"
            autoComplete="off"
            data-1p-ignore="true"
            data-lpignore="true"
            data-bwignore="true"
            data-form-type="other"
            value={actualValue}
            onChange={(event) => {
              const next = event.target.value;
              if (!isValueControlled) setInternalValue(next);
              onValueChange?.(next);
              if (!actualOpen) setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            aria-keyshortcuts="Meta+K Control+K"
            className={cn(textFieldVariants({ heightSize: 'md' }), 'ps-9 pe-12 max-md:pe-3', className)}
            {...props}
          />
          <Kbd className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 max-md:hidden">⌘K</Kbd>
        </div>
      </PopoverAnchor>
      <PopoverContent
        // Anchor-opened (no Radix Trigger), so PopoverContent can't label
        // itself by one; without this the panel was an unnamed "dialog".
        aria-label={(props as { 'aria-label'?: string })['aria-label'] ?? placeholder ?? t.topbar.search}
        align="start"
        sideOffset={6}
        className="w-[var(--radix-popover-trigger-width)] max-h-[var(--available-height)] overflow-y-auto p-0"
        onOpenAutoFocus={(event) => event.preventDefault()}
        // Same open-then-instantly-closed flicker Autocomplete/Combobox had
        // (Мария reported it here too, 2026-09-26): this Popover opens via
        // `onFocus` on the input rather than a Radix `Trigger`, so Radix's
        // own "ignore the interaction that just opened me" exemption
        // (wired through `triggerRef`) never applies — the opening
        // pointerdown/focus gets immediately re-seen as landing OUTSIDE
        // the content and closes it on the same click. See autocomplete.tsx
        // for the full rationale; same guard, same inputRef check, here.
        onPointerDownOutside={(event) => {
          if (event.target === inputRef.current) event.preventDefault();
        }}
        onFocusOutside={(event) => {
          if (event.target === inputRef.current) event.preventDefault();
        }}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}

export function TopbarSpacer() {
  return <div className="flex-1" />;
}

/**
 * Round 34px icon action (notifications, help, …). Pass `badge` to
 * show the unread dot — folded into the accessible name as ", unread"
 * since the dot signals state by color alone.
 */
export interface TopbarActionProps extends React.ComponentProps<'button'> {
  badge?: boolean;
}

export function TopbarAction({ className, badge, 'aria-label': ariaLabel, ...props }: TopbarActionProps) {
  const { t } = useTheyaI18n();
  return (
    <button
      type="button"
      aria-label={badge && ariaLabel ? t.topbar.unread(ariaLabel) : ariaLabel}
      className={cn(
        'relative grid size-[2.125rem] place-content-center rounded-[var(--size-border-radius-border-radius-md)] text-[var(--color-icon-icon-subtle)]',
        'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] hover:text-[var(--color-icon-icon)]',
        'focus-visible:outline-none focus-visible:focus-ring',
        '[&>svg]:size-[1.125rem]',
        className,
      )}
      {...props}
    >
      {props.children}
      {badge && <span aria-hidden="true" className="absolute end-2 top-[0.4375rem] size-[0.4375rem] rounded-full border-[1.5px] border-[var(--color-bg-surface-bg-surface)] bg-[var(--color-bg-danger-bg-danger)]" />}
    </button>
  );
}
