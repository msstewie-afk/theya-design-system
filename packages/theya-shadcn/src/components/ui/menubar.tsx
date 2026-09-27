import * as MenubarPrimitive from '@radix-ui/react-menubar';
import { Check, NavArrowRight, Circle } from 'iconoir-react';
import { cn } from '@/lib/utils';

/**
 * A persistent application menu bar (File / Edit / View…) on
 * @radix-ui/react-menubar — a direct Radix equivalent of the Base UI
 * Menubar + Menu combination the reference composed by hand, so this
 * ports much more directly than most other overlay components. One
 * tab stop lands on the bar; arrow keys move between top-level menus
 * (roving tabindex), matching a native menu bar. Styled the same as
 * DropdownMenu so items/submenus/checkbox/radio read the same way.
 */
export interface MenubarProps extends React.ComponentProps<typeof MenubarPrimitive.Root> {
  /** Border + shadow, like a floating toolbar. Set false for a bare bar that blends into a surrounding app toolbar (no card chrome). Default true. */
  bordered?: boolean;
}

export const Menubar = ({ className, bordered = true, ...props }: MenubarProps) => (
  <MenubarPrimitive.Root
    className={cn(
      'flex items-center gap-0.5 rounded-[var(--size-border-radius-border-radius-xl)] p-1',
      bordered && 'border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] shadow-sm',
      className,
    )}
    {...props}
  />
);

export const MenubarMenu = MenubarPrimitive.Menu;
export const MenubarGroup = MenubarPrimitive.Group;
export const MenubarRadioGroup = MenubarPrimitive.RadioGroup;
export const MenubarPortal = MenubarPrimitive.Portal;
export const MenubarSub = MenubarPrimitive.Sub;

export function MenubarTrigger({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      className={cn(
        'flex items-center rounded-[var(--size-border-radius-border-radius-md)]',
        'px-3 py-1.5 font-body text-body-m font-medium text-[var(--color-text-text)] outline-none cursor-pointer',
        'transition-colors duration-150 ease-out motion-reduce:transition-none',
        'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        'data-[state=open]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export function MenubarContent({
  className,
  align = 'start',
  alignOffset = -4,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-[12rem] overflow-hidden rounded-[var(--size-border-radius-border-radius-xl)] border border-solid',
          'border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface-overlay)] p-1 shadow-lg',
          'text-[var(--color-text-text)]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          className,
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  );
}

export interface MenubarItemProps extends React.ComponentProps<typeof MenubarPrimitive.Item> {
  inset?: boolean;
  variant?: 'default' | 'danger';
}

export function MenubarItem({ className, inset, variant = 'default', ...props }: MenubarItemProps) {
  return (
    <MenubarPrimitive.Item
      className={cn(
        'relative flex cursor-default select-none items-center gap-2.5',
        'rounded-[var(--size-border-radius-border-radius-md)]',
        'px-2.5 py-2 font-body text-body-m outline-none',
        'data-[highlighted]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        variant === 'danger' && 'text-[var(--color-text-text-danger)] data-[highlighted]:bg-[var(--color-bg-danger-bg-danger-subtle)]',
        inset && 'pl-8',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
        className,
      )}
      {...props}
    />
  );
}

export function MenubarCheckboxItem({ className, children, checked, ...props }: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>) {
  return (
    <MenubarPrimitive.CheckboxItem
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
        <MenubarPrimitive.ItemIndicator>
          <Check width={14} height={14} className="text-[var(--color-icon-icon-primary)]" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
}

export function MenubarRadioItem({ className, children, ...props }: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) {
  return (
    <MenubarPrimitive.RadioItem
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
        <MenubarPrimitive.ItemIndicator>
          <Circle width={8} height={8} className="fill-[var(--color-icon-icon-primary)] text-[var(--color-icon-icon-primary)]" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  );
}

export function MenubarLabel({ className, inset, ...props }: React.ComponentProps<typeof MenubarPrimitive.Label> & { inset?: boolean }) {
  return (
    <MenubarPrimitive.Label
      className={cn('px-2.5 pb-1 pt-1.5 font-body text-body-xs font-medium text-[var(--color-text-text-subtler)]', inset && 'pl-8', className)}
      {...props}
    />
  );
}

export function MenubarSeparator({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return <MenubarPrimitive.Separator className={cn('-mx-1 my-1 h-px bg-[var(--color-border-border-subtle)]', className)} {...props} />;
}

export function MenubarShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={cn('ml-auto font-mono text-[0.6875rem] text-[var(--color-text-text-subtler)]', className)} {...props} />;
}

export function MenubarSubTrigger({ className, inset, children, ...props }: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & { inset?: boolean }) {
  return (
    <MenubarPrimitive.SubTrigger
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
    </MenubarPrimitive.SubTrigger>
  );
}

export function MenubarSubContent({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.SubContent
        className={cn(
          'z-50 min-w-[10rem] overflow-hidden rounded-[var(--size-border-radius-border-radius-xl)] border border-solid',
          'border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface-overlay)] p-1 shadow-lg',
          'text-[var(--color-text-text)]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          className,
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  );
}
