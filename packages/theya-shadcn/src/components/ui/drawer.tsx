'use client';

import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import { useDirection } from '@radix-ui/react-direction';
import { Xmark } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';

/**
 * A bottom sheet you can swipe to dismiss, on vaul — a real gesture
 * surface (drag the handle or panel to dismiss, backdrop fades with
 * the drag), unlike Sheet (a Dialog-based side panel that just slides
 * in with no drag physics). Radix has no primitive for this; vaul is
 * the standard purpose-built library for it, same rationale as
 * react-day-picker for Calendar. Defaults to direction="bottom";
 * pass another to change the edge. `start` / `end` are the side edges in
 * reading order — in RTL (TheyaLocaleProvider `dir="rtl"`) `end` opens on
 * the left — resolved here because vaul only knows physical sides.
 */
export type DrawerDirection = 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end';

export function Drawer({ direction = 'bottom', autoFocus = true, onOpenChange, ...props }: Omit<React.ComponentProps<typeof DrawerPrimitive.Root>, 'direction'> & { direction?: DrawerDirection }) {
  const dir = useDirection();
  const physical = direction === 'start' ? (dir === 'rtl' ? 'right' : 'left') : direction === 'end' ? (dir === 'rtl' ? 'left' : 'right') : direction;
  // Closing must hand focus back to whatever opened the drawer (WCAG 2.4.3).
  // vaul keeps the panel mounted through its ~500ms exit animation and then
  // unmounts it with focus landing on <body> — Radix's usual restore (and an
  // onCloseAutoFocus on the content) never gets to run, trigger or not. So
  // the opener is captured here when the drawer opens, and once it has
  // closed, focus is handed back the moment it would otherwise sit on
  // <body> — a focus the consumer moved somewhere real is left alone.
  const openerRef = useRef<HTMLElement | null>(null);
  const restoreTimers = useRef<number[]>([]);
  useEffect(() => () => restoreTimers.current.forEach((t) => window.clearInterval(t)), []);
  const capture = () => {
    restoreTimers.current.forEach((t) => window.clearInterval(t));
    restoreTimers.current = [];
    const active = document.activeElement;
    // Not a node inside a drawer: by the time a controlled `open` lands here, focus may already have moved in.
    openerRef.current = active instanceof HTMLElement && active !== document.body && !active.closest('[data-vaul-drawer]') ? active : null;
  };
  // A controlled drawer opens by its `open` prop changing from outside — vaul only
  // reports changes it makes itself, so the opener is captured from the prop too.
  // A layout effect runs before vaul's own (passive) focus effect moves focus in.
  const openProp = props.open;
  useLayoutEffect(() => {
    if (openProp) capture();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openProp]);
  const handleOpenChange = (open: boolean) => {
    onOpenChange?.(open);
    if (open) {
      if (openProp === undefined) capture();
      return;
    }
    const opener = openerRef.current;
    if (!opener) return;
    const started = Date.now();
    const timer = window.setInterval(() => {
      const gone = !document.querySelector('[data-vaul-drawer]');
      const idle = document.activeElement === document.body || document.activeElement === null;
      if (gone && idle && opener.isConnected) opener.focus();
      if ((gone && idle) || Date.now() - started > 1500) {
        window.clearInterval(timer);
        restoreTimers.current = restoreTimers.current.filter((t) => t !== timer);
      }
    }, 50);
    restoreTimers.current.push(timer);
  };
  // vaul defaults autoFocus to false (to avoid popping the mobile keyboard),
  // which left focus on the trigger BEHIND the modal overlay — a hidden,
  // aria-hidden element — while the drawer was open. Default it on; pass
  // autoFocus={false} for a drawer that opens straight onto a text input
  // on touch devices if the keyboard pop is unwanted.
  return <DrawerPrimitive.Root {...(props as React.ComponentProps<typeof DrawerPrimitive.Root>)} onOpenChange={handleOpenChange} direction={physical} autoFocus={autoFocus} />;
}

export const DrawerTrigger = DrawerPrimitive.Trigger;
export const DrawerPortal = DrawerPrimitive.Portal;
export const DrawerClose = DrawerPrimitive.Close;

// forwardRef: Radix's Portal hands each child a ref (asChild + Presence) to
// track its exit animation; as a plain function this dropped it under React 18.
export const DrawerOverlay = forwardRef<React.ElementRef<typeof DrawerPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>>(function DrawerOverlay({ className, ...props }, ref) {
  return <DrawerPrimitive.Overlay ref={ref} className={cn('fixed inset-0 z-drawer bg-[var(--color-bg-surface-bg-scrim)]', className)} {...props} />;
});

export interface DrawerContentProps extends React.ComponentProps<typeof DrawerPrimitive.Content> {
  /** Bottom/top drawers only: 'full' spans edge-to-edge (default, current behavior). 'fixed' caps the sheet at a centered max width on larger screens (sm:max-w-xl). */
  width?: 'full' | 'fixed';
}

export function DrawerContent({ className, children, width = 'full', ...props }: DrawerContentProps) {
  const { t } = useTheyaI18n();
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        className={cn(
          'fixed z-drawer flex flex-col bg-[var(--color-bg-surface-bg-surface)] text-[var(--color-text-text)] shadow-elevation-xl outline-none',
          'group/drawer-content',
          'data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0',
          'data-[vaul-drawer-direction=bottom]:max-h-[92svh] data-[vaul-drawer-direction=bottom]:rounded-t-[var(--size-border-radius-border-radius-3xl)]',
          // Pinned to the bottom edge: the shadow falls up onto the page, not past the screen edge.
          'data-[vaul-drawer-direction=bottom]:shadow-elevation-edge-up',
          // Safe area: 0 unless the page sets viewport-fit=cover; then the last
          // row (usually the footer) stays above the home indicator.
          'data-[vaul-drawer-direction=bottom]:pb-[env(safe-area-inset-bottom)] data-[vaul-drawer-direction=top]:pt-[env(safe-area-inset-top)]',
          'data-[vaul-drawer-direction=bottom]:border-t data-[vaul-drawer-direction=bottom]:border-solid data-[vaul-drawer-direction=bottom]:border-[var(--color-border-border)]',
          'data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0',
          'data-[vaul-drawer-direction=top]:max-h-[92svh] data-[vaul-drawer-direction=top]:rounded-b-[var(--size-border-radius-border-radius-3xl)]',
          'data-[vaul-drawer-direction=top]:border-b data-[vaul-drawer-direction=top]:border-solid data-[vaul-drawer-direction=top]:border-[var(--color-border-border)]',
          'data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-full',
          'data-[vaul-drawer-direction=right]:max-w-[560px] data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:border-solid data-[vaul-drawer-direction=right]:border-[var(--color-border-border)]',
          'data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-full',
          'data-[vaul-drawer-direction=left]:max-w-[560px] data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:border-solid data-[vaul-drawer-direction=left]:border-[var(--color-border-border)]',
          // 'fixed' width: instead of a transform-based centering trick (which
          // would collide with vaul's own [transform:translateY(...)] drag
          // offset above), rely on left:0/right:0 + max-width + auto margins -
          // browsers clamp and center the box within that space with no
          // transform involved.
          width === 'fixed' && 'data-[vaul-drawer-direction=bottom]:sm:max-w-xl data-[vaul-drawer-direction=bottom]:sm:mx-auto',
          width === 'fixed' && 'data-[vaul-drawer-direction=top]:sm:max-w-xl data-[vaul-drawer-direction=top]:sm:mx-auto',
          className,
        )}
        {...props}
      >
        {/* Drag affordance for the top/bottom directions; the whole panel is swipeable, so this is decorative. */}
        <div
          aria-hidden="true"
          className="mx-auto mt-2.5 hidden h-1.5 w-10 shrink-0 rounded-full bg-[var(--color-border-border)] group-data-[vaul-drawer-direction=bottom]/drawer-content:block group-data-[vaul-drawer-direction=top]/drawer-content:block"
        />
        {children}
        <DrawerPrimitive.Close
          className={cn(
            'absolute right-4 top-4 flex items-center justify-center size-7 rounded-[var(--size-border-radius-border-radius-md)]',
            'text-[var(--color-icon-icon-subtle)] hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
            'focus-visible:outline-none focus-visible:focus-ring',
          )}
        >
          <Xmark width={16} height={16} aria-hidden="true" />
          <span className="sr-only">{t.common.close}</span>
        </DrawerPrimitive.Close>
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

export function DrawerHeader({ className, onPointerDown, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-vaul-no-drag
      onPointerDown={(e) => {
        // vaul calls setPointerCapture on every pointerdown that bubbles to the
        // drawer content root, which breaks native text selection across
        // sibling elements even where data-vaul-no-drag stops the drag itself.
        // Stopping propagation here keeps that handler from ever seeing the event.
        e.stopPropagation();
        onPointerDown?.(e);
      }}
      className={cn('flex flex-col gap-1 px-6 pb-4 pt-3 text-left select-text', className)} {...props} />
  );
}

export function DrawerBody({ className, onPointerDown, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-vaul-no-drag
      onPointerDown={(e) => {
        e.stopPropagation();
        onPointerDown?.(e);
      }}
      className={cn('flex flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-6 pt-2 pb-5 select-text', className)} {...props} />
  );
}

export function DrawerFooter({ className, onPointerDown, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-vaul-no-drag
      onPointerDown={(e) => {
        e.stopPropagation();
        onPointerDown?.(e);
      }}
      className={cn(
        "relative mt-auto flex items-center justify-end gap-2 px-6 pt-5 pb-6",
        "before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-[var(--color-border-border-subtler)] before:content-['']",
        className
      )} {...props} />
  );
}

export function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return <DrawerPrimitive.Title className={cn('font-body text-heading-s font-medium text-[var(--color-text-text)]', className)} {...props} />;
}

export function DrawerDescription({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return <DrawerPrimitive.Description className={cn('font-body text-body-s text-[var(--color-text-text-subtler)]', className)} {...props} />;
}
