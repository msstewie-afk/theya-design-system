import { useEffect, useRef } from 'react';
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
  // Follows the newest message like a chat should: starts at the bottom and
  // keeps up with appends, but only while the reader is already at the
  // bottom — scrolling up to read history isn't yanked back (same rule as
  // Terminal).
  const ref = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    const onScroll = () => {
      pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    };
    const observer = new MutationObserver(() => {
      if (pinned.current) el.scrollTop = el.scrollHeight;
    });
    el.addEventListener('scroll', onScroll, { passive: true });
    observer.observe(el, { childList: true, subtree: true, characterData: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);
  // tabIndex=0: this region scrolls independently of the page (overflow-y-auto),
  // so keyboard users need to be able to focus it to scroll it without a mouse.
  return (
    <div
      ref={ref}
      role="log"
      aria-label={ariaLabel}
      tabIndex={tabIndex ?? 0}
      className={cn('flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4', className)}
      {...props}
    />
  );
}
