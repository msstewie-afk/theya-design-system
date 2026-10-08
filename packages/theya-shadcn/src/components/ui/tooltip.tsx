'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../../lib/utils';

/** Short hint on hover/focus, on @radix-ui/react-tooltip. Wrap the app once in <TooltipProvider/>. */
export function TooltipProvider({ delayDuration = 200, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />;
}

export function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root {...props} />
    </TooltipProvider>
  );
}

export const TooltipTrigger = TooltipPrimitive.Trigger;

/**
 * `tone` is for a tooltip that reports the RESULT of an action, not just a
 * hint - e.g. "Copied" after a copy button fires, or "Failed to copy" on
 * error. `neutral` keeps the neutral dark surface; `success`/`danger` swap
 * to the same solid `--color-bg-{tone}-bg-{tone}` tone StatusDot uses (not
 * the `-subtle` variant) so the result reads as a status, not just more
 * hint text. Text color follows Badge's solid-variant precedent
 * (`--color-icon-icon-on-dark`), and the arrow fill switches with it so the
 * whole bubble reads as one tone.
 */
export type TooltipTone = 'neutral' | 'success' | 'danger';

const TONE_CLASS: Record<TooltipTone, { surface: string; arrow: string }> = {
  neutral: {
    surface: 'bg-[var(--color-bg-surface-bg-surface-overlay-dark)] text-[var(--color-text-text-on-dark)]',
    arrow: 'fill-[var(--color-bg-surface-bg-surface-overlay-dark)]',
  },
  success: {
    surface: 'bg-[var(--color-bg-success-bg-success)] text-[var(--color-icon-icon-on-dark)]',
    arrow: 'fill-[var(--color-bg-success-bg-success)]',
  },
  danger: {
    surface: 'bg-[var(--color-bg-danger-bg-danger)] text-[var(--color-icon-icon-on-dark)]',
    arrow: 'fill-[var(--color-bg-danger-bg-danger)]',
  },
};

export function TooltipContent({
  className,
  sideOffset = 6,
  collisionPadding = 8,
  showArrow = true,
  tone = 'neutral',
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & { showArrow?: boolean; tone?: TooltipTone }) {
  const toneClass = TONE_CLASS[tone];
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          // Never wider than the screen (a long hint on a phone ran off the edge).
          'z-tooltip w-fit max-w-[min(600px,calc(100vw-1rem))] break-words rounded-[var(--size-border-radius-border-radius-md)]',
          'px-2.5 py-1.5 font-body text-body-xs shadow-elevation-md',
          toneClass.surface,
          'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out motion-reduce:animate-none!',
          'data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95',
          className,
        )}
        {...props}
      >
        {children}
        {showArrow && <TooltipPrimitive.Arrow className={toneClass.arrow} />}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
