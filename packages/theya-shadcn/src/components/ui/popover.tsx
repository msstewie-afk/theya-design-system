'use client';

import { createContext, forwardRef, useContext, useId, useRef } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '../../lib/utils';
import { Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from './drawer';
import { useMediaQuery } from './use-media-query';

/**
 * Floating panel anchored to a trigger, on @radix-ui/react-popover.
 * Radix's PopoverAnchor works standalone out of the box — the Base UI
 * reference needed a custom context to bridge anchor->content because
 * Base UI's Positioner takes an explicit anchor prop instead.
 */
/*
 * Radix renders the content as role="dialog" with no accessible name, so
 * every popover was announced as just "dialog" (axe aria-dialog-name).
 * By default the content is now labelled by its trigger ("Filters",
 * "Open panel"). Popovers opened from a bare PopoverAnchor (Combobox,
 * FilterField, PromptArea) have no trigger, so no reference is added
 * there — pass aria-label / aria-labelledby on the content instead.
 */
const PopoverLabelContext = createContext<{ triggerId: string; hasTrigger: React.MutableRefObject<boolean> } | null>(null);

/** True while a `sheet` Popover renders as a bottom Drawer (phone). */
const SheetContext = createContext(false);

export interface PopoverProps extends React.ComponentProps<typeof PopoverPrimitive.Root> {
  /**
   * Below 640px, open as a bottom sheet (Drawer) instead of a floating
   * panel. For panels with a list, a calendar or a form that don't fit
   * under a trigger on a phone. Not for popovers anchored to a text field
   * the user is typing in — the sheet would cover the field.
   */
  sheet?: boolean;
}

function Popover({ sheet = false, ...props }: PopoverProps) {
  const triggerId = useId();
  const hasTrigger = useRef(false);
  const isPhone = useMediaQuery('(max-width: 639.98px)');
  if (sheet && isPhone) {
    return (
      <PopoverLabelContext.Provider value={{ triggerId, hasTrigger }}>
        <SheetContext.Provider value={true}>
          <Drawer open={props.open} defaultOpen={props.defaultOpen} onOpenChange={props.onOpenChange} modal>
            {props.children}
          </Drawer>
        </SheetContext.Provider>
      </PopoverLabelContext.Provider>
    );
  }
  return (
    <PopoverLabelContext.Provider value={{ triggerId, hasTrigger }}>
      <PopoverPrimitive.Root {...props} />
    </PopoverLabelContext.Provider>
  );
}

function PopoverTrigger({ id, ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  const ctx = useContext(PopoverLabelContext);
  const sheet = useContext(SheetContext);
  if (ctx) ctx.hasTrigger.current = true;
  if (sheet) return <DrawerTrigger id={id ?? ctx?.triggerId} {...props} />;
  return <PopoverPrimitive.Trigger id={id ?? ctx?.triggerId} {...props} />;
}

// forwardRef: both were Radix forwardRef components before the sheet mode;
// keep refs reaching the DOM node for callers that pass one.
const PopoverAnchor = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Anchor>>(function PopoverAnchor(
  { asChild, children, ...props },
  ref,
) {
  const sheet = useContext(SheetContext);
  // A sheet has nothing to anchor to: render the anchored element as is.
  if (sheet) return asChild ? <>{children}</> : <div ref={ref} {...props}>{children}</div>;
  return (
    <PopoverPrimitive.Anchor ref={ref} asChild={asChild} {...props}>
      {children}
    </PopoverPrimitive.Anchor>
  );
});

const PopoverClose = forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Close>>(function PopoverClose(props, ref) {
  const sheet = useContext(SheetContext);
  return sheet ? <DrawerClose ref={ref} {...props} /> : <PopoverPrimitive.Close ref={ref} {...props} />;
});

export interface PopoverContentProps extends React.ComponentProps<typeof PopoverPrimitive.Content> {
  /** Sheet mode: visible title at the top of the sheet. Falls back to `aria-label` (screen readers only). */
  sheetTitle?: React.ReactNode;
  /** Sheet mode: classes for the scrolling body that holds the content (default padding px-6 pt-2 pb-5). */
  sheetClassName?: string;
}

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 6,
  collisionPadding = 8,
  sheetTitle,
  sheetClassName,
  ...props
}: PopoverContentProps) {
  const ctx = useContext(PopoverLabelContext);
  const sheet = useContext(SheetContext);
  if (sheet) {
    // Popper-only props have no meaning in a sheet; the rest (focus and
    // dismiss handlers, aria) carry over to the Drawer content.
    const { side: _side, alignOffset: _alignOffset, avoidCollisions: _avoid, sticky: _sticky, hideWhenDetached: _hide, arrowPadding: _arrow, updatePositionStrategy: _ups, children, 'aria-label': ariaLabel, ...rest } = props;
    // Same accessible name as the floating panel: an explicit aria-label,
    // else the trigger's name ("Status, 2 selected"), not the sheet title.
    const sheetLabelledBy = ariaLabel == null && rest['aria-labelledby'] == null && ctx?.hasTrigger.current ? ctx.triggerId : undefined;
    return (
      <DrawerContent
        aria-describedby={undefined}
        aria-label={ariaLabel}
        aria-labelledby={sheetLabelledBy}
        {...(rest as React.ComponentProps<typeof DrawerContent>)}
      >
        {sheetTitle != null ? (
          <DrawerHeader className="pe-14">
            <DrawerTitle>{sheetTitle}</DrawerTitle>
          </DrawerHeader>
        ) : (
          <DrawerTitle className="sr-only">{ariaLabel}</DrawerTitle>
        )}
        <DrawerBody className={cn(sheetTitle == null && 'pt-10', sheetClassName)}>{children}</DrawerBody>
      </DrawerContent>
    );
  }
  const named = props['aria-label'] != null || props['aria-labelledby'] != null;
  const labelledBy = !named && ctx?.hasTrigger.current ? ctx.triggerId : undefined;
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-bloom=""
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        aria-labelledby={labelledBy}
        className={cn(
          // A wider popover (w-[320px] and up) stays inside a phone screen.
          'z-popover w-72 max-w-[calc(100vw-1rem)] outline-none',
          'rounded-[var(--size-border-radius-border-radius-xl)] border border-solid',
          'border-[var(--color-border-border)] bg-[var(--color-bg-surface-bg-surface-overlay)]',
          'p-[var(--size-margin-margin-lg)] shadow-elevation-lg text-[var(--color-text-text)]',
          // Opening is the shared Bloom (data-bloom, motion.css); closing stays a quick fade.
          'data-[state=closed]:animate-out motion-reduce:animate-none!',
          'data-[state=closed]:fade-out-0',
          'data-[state=closed]:zoom-out-95',
          'origin-[var(--radix-popover-content-transform-origin)]',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverTrigger, PopoverAnchor, PopoverClose, PopoverContent, SheetContext as PopoverSheetContext };
