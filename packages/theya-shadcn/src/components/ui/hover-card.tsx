import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import { cn } from '@/lib/utils';

/**
 * A preview card shown when a trigger is hovered or focused, on
 * @radix-ui/react-hover-card. Progressive enhancement: the trigger
 * must be a real interactive element whose primary action works
 * without the card — hover doesn't fire on touch. For information
 * that must be reachable by tap, use Popover or Tooltip instead.
 */
export const HoverCard = HoverCardPrimitive.Root;
export const HoverCardTrigger = HoverCardPrimitive.Trigger;

export function HoverCardContent({ className, align = 'center', sideOffset = 8, ...props }: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-80 max-w-[calc(100vw-2rem)] origin-[var(--radix-hover-card-content-transform-origin)] rounded-[var(--size-border-radius-border-radius-xl)] border border-solid border-[var(--color-border-border-subtle)]',
          'bg-[var(--color-bg-surface-bg-surface-overlay)] p-4 shadow-lg outline-none',
          'text-[var(--color-text-text)]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out motion-reduce:animate-none!',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}
