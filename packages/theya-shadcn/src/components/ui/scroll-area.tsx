import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '@/lib/utils';

/**
 * A styled, cross-browser scroll container on @radix-ui/react-scroll-area,
 * with a thin overlay scrollbar matching our tokens. Give the root a
 * fixed height (or max-h-*) so content can overflow; native keyboard/
 * wheel/touch scrolling is preserved. Use for tall popovers, command
 * lists and side panels.
 */
export function ScrollArea({ className, children, type = 'hover', scrollHideDelay = 600, ...props }: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root data-slot="scroll-area" type={type} scrollHideDelay={scrollHideDelay} className={cn('relative overflow-hidden', className)} {...props}>
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        tabIndex={0}
        className="size-full rounded-[inherit] outline-none transition-shadow focus-visible:focus-ring"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

export function ScrollBar({ className, orientation = 'vertical', ...props }: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        'flex touch-none select-none p-px transition-colors duration-standard ease-enter motion-reduce:transition-none',
        orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent',
        orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent',
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb data-slot="scroll-area-thumb" className="relative flex-1 rounded-full bg-[var(--color-border-border-default)]" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}
