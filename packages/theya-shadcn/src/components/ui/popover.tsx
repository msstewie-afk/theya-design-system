import { createContext, useContext, useId, useRef } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

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

function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  const triggerId = useId();
  const hasTrigger = useRef(false);
  return (
    <PopoverLabelContext.Provider value={{ triggerId, hasTrigger }}>
      <PopoverPrimitive.Root {...props} />
    </PopoverLabelContext.Provider>
  );
}

function PopoverTrigger({ id, ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  const ctx = useContext(PopoverLabelContext);
  if (ctx) ctx.hasTrigger.current = true;
  return <PopoverPrimitive.Trigger id={id ?? ctx?.triggerId} {...props} />;
}

const PopoverAnchor = PopoverPrimitive.Anchor;
const PopoverClose = PopoverPrimitive.Close;

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  const ctx = useContext(PopoverLabelContext);
  const named = props['aria-label'] != null || props['aria-labelledby'] != null;
  const labelledBy = !named && ctx?.hasTrigger.current ? ctx.triggerId : undefined;
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        aria-labelledby={labelledBy}
        className={cn(
          'z-50 w-72 outline-none',
          'rounded-[var(--size-border-radius-border-radius-xl)] border border-solid',
          'border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface-overlay)]',
          'p-[var(--size-margin-margin-lg)] shadow-lg text-[var(--color-text-text)]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out motion-reduce:animate-none!',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1',
          'data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1',
          'origin-[var(--radix-popover-content-transform-origin)]',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverTrigger, PopoverAnchor, PopoverClose, PopoverContent };
