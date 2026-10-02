import { useLayoutEffect, useRef } from 'react';
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
 *
 * The flyout is `position: fixed`, placed under the bar from the Root's
 * bounding box (re-measured on scroll/resize), so an `overflow: hidden`
 * ancestor no longer clips it. Not a Portal on purpose: the panel's links
 * stay inside the `<nav>` landmark in the DOM. Placement self-corrects for
 * a transformed ancestor (which would otherwise become the fixed
 * containing block).
 */
export function NavigationMenu({
  className,
  children,
  viewportClassName,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & { viewportClassName?: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = rootRef.current;
    const anchor = anchorRef.current;
    if (!root || !anchor) return;
    let frame = 0;
    const place = () => {
      const target = root.getBoundingClientRect();
      // Measure from 0,0 first: under a transformed ancestor "fixed" is
      // relative to that ancestor, not the viewport, and this delta absorbs it.
      anchor.style.left = '0px';
      anchor.style.top = '0px';
      const origin = anchor.getBoundingClientRect();
      anchor.style.left = `${target.left - origin.left}px`;
      anchor.style.top = `${target.bottom - origin.top}px`;
    };
    // Scroll can fire many times per frame: coalesce it. Observers already
    // batch, so they place directly (rAF doesn't run in a hidden tab).
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    place();
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    // Re-place when the bar resizes, when the page around it reflows (the
    // bar can move without resizing), and whenever a panel opens.
    const observer = new ResizeObserver(place);
    observer.observe(root);
    observer.observe(document.body);
    const opened = new MutationObserver(place);
    opened.observe(anchor, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
      opened.disconnect();
    };
  }, []);
  return (
    <NavigationMenuPrimitive.Root ref={rootRef} className={cn('relative z-10 flex max-w-max flex-1 items-center justify-center', className)} {...props}>
      {children}
      <div ref={anchorRef} data-slot="navigation-menu-anchor" className="fixed z-popover flex justify-center">
        <NavigationMenuPrimitive.Viewport
          className={cn(
            'relative mt-2 h-[var(--radix-navigation-menu-viewport-height)] w-[var(--radix-navigation-menu-viewport-width)]',
            'origin-[top_center] overflow-hidden rounded-[var(--size-border-radius-border-radius-xl)] border border-solid',
            'border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface-overlay)] shadow-elevation-lg',
            'transition-[width,height] duration-moderate ease-enter motion-reduce:transition-none',
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
        'transition-colors duration-standard ease-enter motion-reduce:transition-none',
        'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        'data-[state=open]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        'focus-visible:outline-none focus-visible:focus-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
      <NavArrowDown
        className="relative top-px size-3.5 text-[var(--color-icon-icon-subtle)] transition-transform duration-moderate ease-enter motion-reduce:transition-none group-data-[state=open]:rotate-180"
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
        'transition-colors duration-standard ease-enter motion-reduce:transition-none',
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
