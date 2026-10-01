import { createContext, useContext } from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { NavArrowRight, Check, Circle } from 'iconoir-react';
import { cn } from '@/lib/utils';

/**
 * Ported from a Base UI reference implementation onto @radix-ui/react-dropdown-menu
 * (Theya is Radix-based throughout — Checkbox/Radio/Switch specificity fixes rely
 * on Radix's data-state convention). Sub(menu) support and a Trailing slot
 * mirror the equivalent pieces already built for ContextMenu.
 *
 * `size` (set once on DropdownMenuContent) scales item/sub-trigger text
 * to match whatever control opened the menu — a size="lg" Button next to
 * a fixed-small menu read visibly inconsistent. Default "md", not the old
 * hardcoded "sm" (a leftover from an earlier reference implementation
 * this was ported from, not a real Theya default).
 */
export type DropdownMenuSize = 'xs' | 'sm' | 'md' | 'lg';
const DropdownMenuSizeContext = createContext<DropdownMenuSize>('md');
const SIZE_TO_TEXT_CLASS: Record<DropdownMenuSize, string> = {
  xs: 'text-body-xs',
  sm: 'text-body-s',
  md: 'text-body-m',
  lg: 'text-body-l',
};

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

function DropdownMenuContent({
  className,
  sideOffset = 6,
  size = 'md',
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content> & { size?: DropdownMenuSize }) {
  return (
    <DropdownMenuSizeContext.Provider value={size}>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          sideOffset={sideOffset}
          className={cn(
            'z-50 min-w-[12rem] max-w-[calc(100vw-2rem)] overflow-x-hidden overflow-y-auto',
            'rounded-[var(--size-border-radius-border-radius-xl)] border border-solid',
            'border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface-overlay)]',
            'p-[var(--size-margin-margin-2xs)] shadow-elevation-lg',
            'text-[var(--color-text-text)]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out motion-reduce:animate-none!',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            className,
          )}
          {...props}
        />
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuSizeContext.Provider>
  );
}

function DropdownMenuItem({
  className,
  inset,
  tone = 'neutral',
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  tone?: 'neutral' | 'danger';
}) {
  const size = useContext(DropdownMenuSizeContext);
  return (
    <DropdownMenuPrimitive.Item
      data-tone={tone}
      className={cn(
        'relative flex cursor-default select-none items-center gap-2.5',
        'rounded-[var(--size-border-radius-border-radius-md)]',
        'px-[var(--size-margin-margin-s)] py-[var(--size-margin-margin-xs)]',
        SIZE_TO_TEXT_CLASS[size], 'text-[var(--color-text-text)] outline-none',
        'transition-colors duration-100 ease-out motion-reduce:transition-none',
        'data-[highlighted]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        inset && 'pl-8',
        'data-[tone=danger]:text-[var(--color-text-text-danger)]',
        'data-[tone=danger]:data-[highlighted]:bg-[var(--color-bg-danger-bg-danger-subtle)]',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
        '[&_svg]:text-[var(--color-icon-icon-subtle)] data-[tone=danger]:[&_svg]:text-current',
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  const size = useContext(DropdownMenuSizeContext);
  return (
    <DropdownMenuPrimitive.CheckboxItem
      checked={checked}
      className={cn(
        'relative flex cursor-default select-none items-center gap-2',
        'rounded-[var(--size-border-radius-border-radius-md)] py-2 pl-8 pr-2.5',
        SIZE_TO_TEXT_CLASS[size], 'text-[var(--color-text-text)] outline-none',
        'data-[highlighted]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="absolute left-2.5 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check width={14} height={14} className="text-[var(--color-icon-icon-primary)]" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  const size = useContext(DropdownMenuSizeContext);
  return (
    <DropdownMenuPrimitive.RadioItem
      className={cn(
        'relative flex cursor-default select-none items-center gap-2',
        'rounded-[var(--size-border-radius-border-radius-md)] py-2 pl-8 pr-2.5',
        SIZE_TO_TEXT_CLASS[size], 'text-[var(--color-text-text)] outline-none',
        'data-[highlighted]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="absolute left-2.5 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle width={8} height={8} className="fill-[var(--color-icon-icon-primary)] text-[var(--color-icon-icon-primary)]" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<'div'> & { inset?: boolean }) {
  return (
    <div
      className={cn(
        // Top and bottom padding both match the side padding, regardless of
        // position (first group header or a later one after a separator) -
        // a group header always needs the same breathing room around it.
        'px-[var(--size-margin-margin-s)] py-[var(--size-margin-margin-s)]',
        'font-heading text-heading-3xs uppercase tracking-[0.07em] text-[var(--color-text-text-subtler)]',
        inset && 'pl-8',
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn('-mx-1 my-1 h-px bg-[var(--color-border-border-subtle)]', className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn('ml-auto font-mono text-[11px] text-[var(--color-text-text-subtler)]', className)}
      {...props}
    />
  );
}

function DropdownMenuSub(props: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & { inset?: boolean }) {
  const size = useContext(DropdownMenuSizeContext);
  return (
    <DropdownMenuPrimitive.SubTrigger
      className={cn(
        'flex cursor-default select-none items-center rounded-[var(--size-border-radius-border-radius-md)]',
        'px-2.5 py-2 outline-none', SIZE_TO_TEXT_CLASS[size],
        'data-[highlighted]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        'data-[state=open]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        inset && 'pl-8',
        className,
      )}
      {...props}
    >
      {children}
      <NavArrowRight width={14} height={14} className="ml-auto text-[var(--color-icon-icon-subtle)]" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        className={cn(
          'z-50 min-w-[10rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[var(--size-border-radius-border-radius-xl)] border border-solid',
          'border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface-overlay)] p-1 shadow-elevation-lg',
          'text-[var(--color-text-text)]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out motion-reduce:animate-none!',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

/** Content pinned to a menu item's right edge (a count, a small button). Give it its own click handling with stopPropagation, or it also fires the item's onSelect. */
function DropdownMenuTrailing({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={cn('ml-auto flex shrink-0 items-center gap-2', className)} {...props} />;
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuTrailing,
};
