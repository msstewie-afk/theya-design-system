import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { Check, NavArrowRight, Circle } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Kbd } from './kbd';

/**
 * Right-click action menu for a target region, on
 * @radix-ui/react-context-menu — a direct equivalent of the Base UI
 * primitive the reference wrapped by hand, so no composeSelectHandler
 * shim is needed (Radix's onSelect already works natively — that shim
 * was purely a Base UI compatibility layer). Mirrors DropdownMenu/
 * Menubar: Item supports tone="danger" and inset, plus
 * Checkbox/Radio items, Sub menus, Label, Separator and Shortcut.
 */
export const ContextMenu = ContextMenuPrimitive.Root;
/**
 * The right-click / long-press region. Deliberately NOT focusable: a
 * trigger is usually a big area (a row, a card, a canvas), and making
 * each one a Tab stop would flood keyboard navigation — while still not
 * helping on macOS, which has no context-menu key.
 *
 * Rule (WCAG 2.1.1): a context menu is an accelerator, never the only
 * path. Every action in it must also be reachable from a visible control
 * — a "…" menu button, a toolbar, an inline button. DataTable's
 * `rowMenu.contextual` follows this (the kebab column stays). See the
 * WithVisibleAlternative story for the pattern.
 *
 * When a focusable element inside the region has focus, Shift+F10 / the
 * Menu key (Windows) and VoiceOver's VO+Shift+M still open this menu: the
 * browser fires `contextmenu` on the focused element and it bubbles here.
 */
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
export const ContextMenuGroup = ContextMenuPrimitive.Group;
export const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;
export const ContextMenuSub = ContextMenuPrimitive.Sub;

export function ContextMenuContent({ className, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        className={cn(
          'z-popover min-w-[12rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[var(--size-border-radius-border-radius-xl)] border border-solid',
          'border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface-overlay)] p-1 shadow-elevation-lg',
          'text-[var(--color-text-text)]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out motion-reduce:animate-none!',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

export interface ContextMenuItemProps extends React.ComponentProps<typeof ContextMenuPrimitive.Item> {
  inset?: boolean;
  tone?: 'neutral' | 'danger';
}

export function ContextMenuItem({ className, inset, tone = 'neutral', ...props }: ContextMenuItemProps) {
  return (
    <ContextMenuPrimitive.Item
      className={cn(
        'relative flex min-h-9 cursor-default select-none items-center gap-2.5',
        'rounded-[var(--size-border-radius-border-radius-md)] px-2.5 py-2',
        'font-body text-body-m text-[var(--color-text-text)] outline-none',
        'data-[highlighted]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        tone === 'danger' && 'text-[var(--color-text-text-danger)] data-[highlighted]:bg-[var(--color-bg-danger-bg-danger-subtle)]',
        inset && 'pl-8',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
        className,
      )}
      {...props}
    />
  );
}

export function ContextMenuCheckboxItem({ className, children, checked, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      checked={checked}
      className={cn(
        'relative flex cursor-default select-none items-center gap-2',
        'rounded-[var(--size-border-radius-border-radius-md)] py-2 pl-8 pr-2.5',
        'font-body text-body-m outline-none',
        'data-[highlighted]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="absolute left-2.5 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <Check width={14} height={14} className="text-[var(--color-icon-icon-primary)]" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

export function ContextMenuRadioItem({ className, children, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      className={cn(
        'relative flex cursor-default select-none items-center gap-2',
        'rounded-[var(--size-border-radius-border-radius-md)] py-2 pl-8 pr-2.5',
        'font-body text-body-m outline-none',
        'data-[highlighted]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="absolute left-2.5 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <Circle width={8} height={8} className="fill-[var(--color-icon-icon-primary)] text-[var(--color-icon-icon-primary)]" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

export function ContextMenuLabel({ className, inset, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Label> & { inset?: boolean }) {
  return <ContextMenuPrimitive.Label className={cn('px-2.5 pb-1 pt-1.5 font-body text-body-xs font-medium text-[var(--color-text-text-subtler)]', inset && 'pl-8', className)} {...props} />;
}

export function ContextMenuSeparator({ className, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return <ContextMenuPrimitive.Separator className={cn('-mx-1 my-1 h-px bg-[var(--color-border-border-subtle)]', className)} {...props} />;
}

export function ContextMenuShortcut({ className, ...props }: React.ComponentProps<'kbd'>) {
  return <Kbd className={cn('ml-auto', className)} {...props} />;
}

export function ContextMenuTrailing({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={cn('ml-auto flex shrink-0 items-center gap-2', className)} {...props} />;
}

export function ContextMenuSubTrigger({ className, inset, children, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & { inset?: boolean }) {
  return (
    <ContextMenuPrimitive.SubTrigger
      className={cn(
        'flex cursor-default select-none items-center rounded-[var(--size-border-radius-border-radius-md)]',
        'px-2.5 py-2 font-body text-body-m outline-none',
        'data-[highlighted]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        'data-[state=open]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        inset && 'pl-8',
        className,
      )}
      {...props}
    >
      {children}
      <NavArrowRight width={14} height={14} className="ml-auto text-[var(--color-icon-icon-subtle)]" />
    </ContextMenuPrimitive.SubTrigger>
  );
}

export function ContextMenuSubContent({ className, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.SubContent
        className={cn(
          'z-popover min-w-[10rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[var(--size-border-radius-border-radius-xl)] border border-solid',
          'border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface-overlay)] p-1 shadow-elevation-lg',
          'text-[var(--color-text-text)]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out motion-reduce:animate-none!',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}
