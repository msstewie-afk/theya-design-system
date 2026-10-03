import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '@/lib/utils';

/**
 * A styled, cross-browser scroll container on @radix-ui/react-scroll-area
 * with an overlay scrollbar: no track, a thin translucent thumb drawn over
 * the content (it never takes width from it), shown on hover/scroll and
 * thickening under the pointer. Native keyboard/wheel/touch scrolling is
 * preserved.
 *
 * Height: give the root a fixed height (`h-72`) or a cap (`max-h-60`) —
 * the viewport inherits the cap, so a list shorter than it doesn't scroll.
 *
 * `aria-label` / `aria-labelledby` name the scroll region: they go on the
 * focusable viewport together with role="region" (axe:
 * scrollable-region-focusable wants it focusable, and a focusable region
 * needs a name), not on the wrapper div where the attribute is invalid.
 *
 * `focusable` (default true) makes the viewport a tab stop so keyboard
 * users can scroll plain content. Turn it off inside widgets that already
 * own the keyboard (a combobox/command listbox driven by
 * aria-activedescendant): there the input moves the highlight and the
 * highlighted option scrolls itself into view.
 */
export interface ScrollAreaProps extends React.ComponentProps<typeof ScrollAreaPrimitive.Root> {
  focusable?: boolean;
  viewportRef?: React.Ref<HTMLDivElement>;
  viewportClassName?: string;
}

export function ScrollArea({
  className,
  children,
  type = 'hover',
  scrollHideDelay = 600,
  focusable = true,
  viewportRef,
  viewportClassName,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  ...props
}: ScrollAreaProps) {
  const named = Boolean(ariaLabel || ariaLabelledby);
  return (
    <ScrollAreaPrimitive.Root data-slot="scroll-area" type={type} scrollHideDelay={scrollHideDelay} className={cn('relative overflow-hidden', className)} {...props}>
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        tabIndex={focusable ? 0 : undefined}
        role={named ? 'region' : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        className={cn(
          // max-h-[inherit]: a max-h cap on the root (not a fixed height)
          // otherwise never reaches the scrolling element.
          'size-full max-h-[inherit] rounded-[inherit] outline-none transition-shadow',
          focusable && 'focus-visible:focus-ring',
          // Radix wraps content in a `display: table` div so wide content can
          // overflow horizontally; that also defeats `truncate` in list rows.
          // Block it for the (default) vertical-only case.
          '[&>div]:block!',
          viewportClassName,
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

/**
 * Overlay bar: transparent track, 4px thumb that grows to 6px under the
 * pointer. Thumb is translucent black in light theme, translucent white in
 * dark, so it reads on any surface (page, popover, tinted panels).
 */
export function ScrollBar({ className, orientation = 'vertical', ...props }: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        'group/scrollbar z-[1] flex touch-none select-none bg-transparent p-0.5',
        'transition-[width,height,opacity] duration-standard ease-enter motion-reduce:transition-none',
        'data-[state=visible]:animate-in data-[state=visible]:fade-in-0 data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0 motion-reduce:animate-none!',
        orientation === 'vertical' && 'h-full w-2 hover:w-2.5',
        orientation === 'horizontal' && 'h-2 flex-col hover:h-2.5',
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className={cn(
          'relative flex-1 rounded-full bg-[var(--black-a400)] [[data-theme=dark]_&]:bg-[var(--white-a400)]',
          // 24px minimum grab target around the thin thumb (WCAG 2.5.8).
          "before:absolute before:top-1/2 before:left-1/2 before:size-full before:min-h-6 before:min-w-6 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
        )}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}
