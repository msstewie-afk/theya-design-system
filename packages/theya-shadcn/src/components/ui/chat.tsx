'use client';

import { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';

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

export function ChatMessages({ className, tabIndex, 'aria-label': ariaLabel, ...props }: React.ComponentProps<'div'>) {
  const { t } = useTheyaI18n();
  if (ariaLabel === undefined) ariaLabel = t.chat.conversation;
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

/**
 * "Someone is typing" for ChatMessages: a received-message bubble with three dots
 * that bounce in turn (Kinetics' Typing Indicator, MIT). Put it last in the log while
 * the other side is writing, and remove it when their message arrives. A status
 * region: screen readers hear the label (default "Typing…") once. With reduced
 * motion the dots fade slowly instead of bouncing.
 */
export function ChatTyping({ label, avatar, className, ...props }: React.ComponentProps<'div'> & { label?: string; avatar?: React.ReactNode }) {
  const { t } = useTheyaI18n();
  return (
    <div data-slot="chat-typing" className={cn('flex w-full gap-2.5', className)} {...props}>
      {avatar}
      <span
        role="status"
        aria-label={label ?? t.chat.typing}
        className="inline-flex items-center gap-1 rounded-[var(--size-border-radius-border-radius-2xl)] rounded-ss-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] px-3.5 py-3 text-[var(--color-icon-icon-subtle)]"
      >
        {[0, 160, 320].map((delay) => (
          <i
            key={delay}
            aria-hidden="true"
            className="size-1.5 rounded-full bg-current animate-[theya-typing_1.2s_ease-in-out_infinite] motion-reduce:animate-[theya-breathe_2s_ease-in-out_infinite]"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
    </div>
  );
}
