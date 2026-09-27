import { cn } from '@/lib/utils';

/**
 * No library dependency — layout for a conversation surface: a flex
 * column holding a scrolling transcript (ChatMessages) and, below it,
 * a composer (usually a PromptArea). Give Chat a height (h-[...] or
 * h-full) so the transcript scrolls while the composer stays pinned.
 * ChatMessages is role="log" so assistive tech announces new
 * messages; keep the newest message last in the DOM.
 */
export function Chat({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex min-h-0 flex-col', className)} {...props} />;
}

export function ChatMessages({ className, tabIndex, 'aria-label': ariaLabel = 'Conversation', ...props }: React.ComponentProps<'div'>) {
  // tabIndex=0: this region scrolls independently of the page (overflow-y-auto),
  // so keyboard users need to be able to focus it to scroll it without a mouse.
  return (
    <div
      role="log"
      aria-label={ariaLabel}
      tabIndex={tabIndex ?? 0}
      className={cn('flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4', className)}
      {...props}
    />
  );
}
