import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { NavArrowDown } from 'iconoir-react';
import { cn } from '@/lib/utils';

/**
 * Top-level site/product navigation with flyout panels, on
 * @radix-ui/react-navigation-menu — a direct equivalent of the Base
 * UI primitive the reference wrapped by hand. Distinct from the app
 * shell's Sidebar/Topbar (persistent chrome): this is a horizontal
 * nav bar with disclosure panels (marketing header, top-level section
 * switcher). Radix's Viewport sits in an explicit wrapper below the
 * list (rather than Base UI's single shared Portal/Positioner), and
 * direction animation keys off `data-motion` rather than
 * `data-activation-direction`.
 */
export function NavigationMenu({
  className,
  children,
  viewportClassName,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & { viewportClassName?: string }) {
  return (
    <NavigationMenuPrimitive.Root className={cn('relative z-10 flex max-w-max flex-1 items-center justify-center', className)} {...props}>
      {children}
      <div className={cn('absolute left-0 top-full flex justify-center')}>
        <NavigationMenuPrimitive.Viewport
          className={cn(
            'relative mt-2 h-[var(--radix-navigation-menu-viewport-height)] w-[var(--radix-navigation-menu-viewport-width)]',
            'origin-[top_center] overflow-hidden rounded-[var(--size-border-radius-border-radius-xl)] border border-solid',
            'border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface-overlay)] shadow-elevation-lg',
            'transition-[width,height] duration-200 ease-out motion-reduce:transition-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out motion-reduce:animate-none!',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            viewportClassName,
          )}
        />
      </div>
    </NavigationMenuPrimitive.Root>
  );
}

export function NavigationMenuList({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return <NavigationMenuPrimitive.List className={cn('flex flex-1 list-none items-center justify-center gap-1', className)} {...props} />;
}

export const NavigationMenuItem = NavigationMenuPrimitive.Item;

export function NavigationMenuTrigger({ className, children, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      className={cn(
        'group inline-flex h-9 w-max items-center justify-center gap-1',
        'rounded-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-surface-bg-surface)]',
        'px-3 py-2 font-body text-body-m font-medium text-[var(--color-text-text)] outline-none cursor-pointer',
        'transition-colors duration-150 ease-out motion-reduce:transition-none',
        'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        'data-[state=open]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        'focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
      <NavArrowDown
        className="relative top-px size-3.5 text-[var(--color-icon-icon-subtle)] transition-transform duration-200 ease-out motion-reduce:transition-none group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

export function NavigationMenuContent({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      className={cn(
        'w-[calc(100vw-2rem)] p-2 sm:w-max sm:min-w-[22rem]',
        'data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in motion-reduce:animate-none!',
        'data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52',
        'data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52',
        className,
      )}
      {...props}
    />
  );
}

export function NavigationMenuLink({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      className={cn(
        'flex flex-col gap-1 rounded-[var(--size-border-radius-border-radius-md)] p-2.5',
        'font-body text-body-m leading-tight text-[var(--color-text-text)] no-underline outline-none',
        'transition-colors duration-150 ease-out motion-reduce:transition-none',
        'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        'focus-visible:bg-[var(--color-bg-neutral-bg-neutral-subtle)] focus-visible:outline-none',
        'data-[active]:bg-[var(--color-bg-neutral-bg-neutral-subtle)] data-[active]:font-medium',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4 [&_svg]:text-[var(--color-icon-icon-subtle)]',
        className,
      )}
      {...props}
    />
  );
}
