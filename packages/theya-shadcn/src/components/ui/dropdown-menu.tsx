'use client';

import { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { NavArrowLeft, NavArrowRight, Check, Circle } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { useMediaQuery } from './use-media-query';

/**
 * Built on @radix-ui/react-dropdown-menu (Theya is Radix-based
 * throughout — Checkbox/Radio/Switch specificity fixes rely on Radix's
 * data-state convention). Sub(menu) support and a Trailing slot match
 * the same pieces in ContextMenu.
 *
 * `size` (set once on DropdownMenuContent) scales item/sub-trigger text
 * to match whatever control opened the menu — a size="lg" Button next to
 * a fixed-small menu reads visibly inconsistent. Defaults to "md".
 */
export type DropdownMenuSize = 'xs' | 'sm' | 'md' | 'lg';
const DropdownMenuSizeContext = createContext<DropdownMenuSize>('md');
const SIZE_TO_TEXT_CLASS: Record<DropdownMenuSize, string> = {
  xs: 'text-body-xs',
  sm: 'text-body-s',
  md: 'text-body-m',
  lg: 'text-body-l',
};

/*
 * Phones (below 640px): a submenu drills down instead of flying out. It
 * replaces the menu's items in place, with a back row ("‹ Copy") on top, so
 * long labels (German) wrap inside the screen instead of running off its
 * edge. ArrowLeft (ArrowRight in RTL) or the back row returns. `stack`
 * holds the open submenus, deepest last; only the deepest one shows.
 */
type Drill = { phone: boolean; stack: string[]; push: (id: string) => void; pop: () => void };
const DrillContext = createContext<Drill>({ phone: false, stack: [], push: () => {}, pop: () => {} });
const SubContext = createContext<string | null>(null);

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

function DropdownMenuContent({
  className,
  align = 'start',
  sideOffset = 6,
  collisionPadding = 16,
  size = 'md',
  onKeyDown,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content> & { size?: DropdownMenuSize }) {
  const phone = useMediaQuery('(max-width: 639.98px)');
  const [stack, setStack] = useState<string[]>([]);
  const drill = useMemo<Drill>(
    () => ({ phone, stack, push: (id) => setStack((s) => [...s, id]), pop: () => setStack((s) => s.slice(0, -1)) }),
    [phone, stack],
  );
  return (
    <DropdownMenuSizeContext.Provider value={size}>
     <DrillContext.Provider value={drill}>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          data-bloom=""
          data-drill={stack.length ? 'on' : undefined}
          align={align}
          sideOffset={sideOffset}
          // Keeps the page gutter on phones instead of touching the screen edge.
          collisionPadding={collisionPadding}
          onKeyDown={(e) => {
            onKeyDown?.(e);
            const back = getComputedStyle(e.currentTarget).direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
            if (stack.length && e.key === back) {
              e.preventDefault();
              drill.pop();
            }
          }}
          className={cn(
            // Drilled into a submenu: hide every row outside the deepest open one.
            '[&[data-drill=on]_:is([role^=menuitem],[role=separator],[data-slot=dropdown-menu-label]):not([data-drill-active]_*)]:hidden',
            'z-popover min-w-[12rem] max-w-[calc(100vw-2rem)] overflow-x-hidden overflow-y-auto scrollbar-thin',
            'rounded-[var(--size-border-radius-border-radius-xl)] border border-solid',
            'border-[var(--color-border-border)] bg-[var(--color-bg-surface-bg-surface-overlay)]',
            'p-[var(--size-margin-margin-2xs)] shadow-elevation-md',
            'text-[var(--color-text-text)]',
            // Opening is the shared Bloom (data-bloom, motion.css); closing stays a quick fade.
          'data-[state=closed]:animate-out motion-reduce:animate-none!',
            'data-[state=closed]:fade-out-0',
            'data-[state=closed]:zoom-out-95',
            className,
          )}
          {...props}
        />
      </DropdownMenuPrimitive.Portal>
     </DrillContext.Provider>
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
        'relative flex cursor-default select-none items-center gap-2',
        'rounded-[var(--size-border-radius-border-radius-md)]',
        'px-3 py-[var(--size-density-density-item-py)]',
        SIZE_TO_TEXT_CLASS[size], 'text-[var(--color-text-text)] outline-none',
        'transition-colors duration-fast ease-enter motion-reduce:transition-none',
        'data-[highlighted]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        inset && 'ps-8',
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
        'rounded-[var(--size-border-radius-border-radius-md)] py-[var(--size-density-density-item-py)] ps-8 pe-3',
        SIZE_TO_TEXT_CLASS[size], 'text-[var(--color-text-text)] outline-none',
        'data-[highlighted]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="absolute start-2.5 flex size-3.5 items-center justify-center">
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
        'rounded-[var(--size-border-radius-border-radius-md)] py-[var(--size-density-density-item-py)] ps-8 pe-3',
        SIZE_TO_TEXT_CLASS[size], 'text-[var(--color-text-text)] outline-none',
        'data-[highlighted]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="absolute start-2.5 flex size-3.5 items-center justify-center">
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
      data-slot="dropdown-menu-label"
      className={cn(
        // Top and bottom padding both match the side padding, regardless of
        // position (first group header or a later one after a separator) -
        // a group header always needs the same breathing room around it.
        'px-3 py-3',
        'font-heading text-heading-3xs uppercase tracking-[0.07em] text-[var(--color-text-text-subtler)]',
        inset && 'ps-8',
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
      className={cn('-mx-1 my-1 h-px bg-[var(--color-border-border-subtler)]', className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn('ms-auto font-mono text-body-xs leading-none text-[var(--color-text-text-subtler)]', className)}
      {...props}
    />
  );
}

function DropdownMenuSub({ children, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  const drill = useContext(DrillContext);
  const id = useId();
  if (!drill.phone) return <DropdownMenuPrimitive.Sub {...props}>{children}</DropdownMenuPrimitive.Sub>;
  return (
    <SubContext.Provider value={id}>
      <div role="none" data-drill-id={id} data-drill-active={drill.stack[drill.stack.length - 1] === id ? '' : undefined} className="contents">
        {children}
      </div>
    </SubContext.Provider>
  );
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & { inset?: boolean }) {
  const size = useContext(DropdownMenuSizeContext);
  const drill = useContext(DrillContext);
  const id = useContext(SubContext);
  const ref = useRef<HTMLDivElement>(null);
  const open = id != null && drill.stack.includes(id);
  const wasOpen = useRef(false);
  // Back from a drilled submenu: focus returns to the row that opened it.
  useEffect(() => {
    const back = wasOpen.current && !open;
    wasOpen.current = open;
    if (!back) return;
    const raf = requestAnimationFrame(() => ref.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [open]);
  if (drill.phone && id != null) {
    const rowClass = cn(
      'flex cursor-default select-none items-center gap-2 rounded-[var(--size-border-radius-border-radius-md)]',
      'px-3 py-[var(--size-density-density-item-py)] outline-none', SIZE_TO_TEXT_CLASS[size],
      'data-[highlighted]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
      inset && !open && 'ps-8',
      className,
    );
    return open ? (
      // The back row: "‹ Copy", a little heavier, a divider under it.
      <>
        <DropdownMenuPrimitive.Item
          className={cn(rowClass, 'font-medium')}
          onSelect={(e) => {
            e.preventDefault();
            drill.pop();
          }}
        >
          <NavArrowLeft width={14} height={14} aria-hidden="true" className="text-[var(--color-icon-icon-subtle)] rtl:-scale-x-100" />
          {children}
        </DropdownMenuPrimitive.Item>
        <DropdownMenuPrimitive.Separator className="-mx-1 my-1 h-px bg-[var(--color-border-border-subtler)]" />
      </>
    ) : (
      <DropdownMenuPrimitive.Item
        ref={ref}
        aria-haspopup="menu"
        className={rowClass}
        onSelect={(e) => {
          e.preventDefault();
          drill.push(id);
        }}
        onKeyDown={(e) => {
          const fwd = getComputedStyle(e.currentTarget).direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
          if (e.key === fwd) {
            e.preventDefault();
            drill.push(id);
          }
        }}
      >
        {children}
        <NavArrowRight width={14} height={14} aria-hidden="true" className="ms-auto text-[var(--color-icon-icon-subtle)] rtl:-scale-x-100" />
      </DropdownMenuPrimitive.Item>
    );
  }
  return (
    <DropdownMenuPrimitive.SubTrigger
      className={cn(
        'flex cursor-default select-none items-center rounded-[var(--size-border-radius-border-radius-md)]',
        'px-3 py-[var(--size-density-density-item-py)] outline-none', SIZE_TO_TEXT_CLASS[size],
        'data-[highlighted]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        'data-[state=open]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        inset && 'ps-8',
        className,
      )}
      {...props}
    >
      {children}
      <NavArrowRight width={14} height={14} className="ms-auto text-[var(--color-icon-icon-subtle)] rtl:-scale-x-100" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  collisionPadding = 16,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  const drill = useContext(DrillContext);
  const id = useContext(SubContext);
  const open = id != null && drill.stack[drill.stack.length - 1] === id;
  const body = useRef<HTMLDivElement>(null);
  // Drilled in: focus the first row of the submenu (after the back row).
  useEffect(() => {
    if (!open) return;
    // Next frame: Radix moves focus back to the content after the select.
    const raf = requestAnimationFrame(() => {
      const items = body.current?.closest('[data-drill-id]')?.querySelectorAll<HTMLElement>('[role^=menuitem]');
      items?.[1]?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [open]);
  if (drill.phone && id != null) {
    // Only the open submenu renders its rows, inside the main menu.
    if (!drill.stack.includes(id)) return null;
    return (
      <div ref={body} role="group" className="contents">
        {props.children}
      </div>
    );
  }
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        collisionPadding={collisionPadding}
        data-bloom=""
        className={cn(
          'z-popover min-w-[10rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[var(--size-border-radius-border-radius-xl)] border border-solid',
          'border-[var(--color-border-border)] bg-[var(--color-bg-surface-bg-surface-overlay)] p-1 shadow-elevation-md',
          'text-[var(--color-text-text)]',
          // Opening is the shared Bloom (data-bloom, motion.css); closing stays a quick fade.
          'data-[state=closed]:animate-out motion-reduce:animate-none!',
          'data-[state=closed]:fade-out-0',
          'data-[state=closed]:zoom-out-95',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

/** Content pinned to a menu item's right edge (a count, a small button). Give it its own click handling with stopPropagation, or it also fires the item's onSelect. */
function DropdownMenuTrailing({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={cn('ms-auto flex shrink-0 items-center gap-2', className)} {...props} />;
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
