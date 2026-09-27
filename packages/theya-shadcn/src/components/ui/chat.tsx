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

export function ChatMessages({ className, 'aria-label': ariaLabel = 'Conversation', ...props }: React.ComponentProps<'div'>) {
  return <div role="log" aria-label={ariaLabel} className={cn('flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4', className)} {...props} />;
}
