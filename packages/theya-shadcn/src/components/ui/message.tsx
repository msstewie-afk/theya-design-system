import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * One chat/assistant message bubble. variant="received" is a left,
 * muted bubble; variant="sent" is a right, primary bubble. Pass an
 * avatar, author label and timestamp; the body is children. Group
 * messages inside a Chat transcript.
 */
export type MessageVariant = 'received' | 'sent';

/**
 * Only affects `variant="sent"` — `received` is always the muted
 * neutral-subtle bubble. `filled` (default) is the solid primary bubble;
 * `tonal` is the lighter primary-subtle bubble (mirrors Button's own
 * filled/tonal split) — softer for a long transcript, and it also means
 * nested content (an Attachment's own hardcoded ink-on-surface text/icon
 * colors) reads correctly without needing an -on-primary override.
 */
export type MessageAppearance = 'filled' | 'tonal';

export interface MessageProps extends React.ComponentProps<'div'> {
  variant?: MessageVariant;
  appearance?: MessageAppearance;
  /** Leading Avatar (usually shown on received messages). */
  avatar?: ReactNode;
  author?: ReactNode;
  timestamp?: ReactNode;
}

export function Message({ className, variant = 'received', appearance = 'filled', avatar, author, timestamp, children, ...props }: MessageProps) {
  return (
    <div data-slot="message" data-variant={variant} className={cn('flex w-full gap-2.5', variant === 'sent' ? 'flex-row-reverse' : 'flex-row', className)} {...props}>
      {avatar != null && <div data-slot="message-avatar" className="shrink-0 pt-0.5">{avatar}</div>}
      {/* The width cap lives on this column, not the bubble: a % max-width on
          the bubble resolved against a shrink-to-fit parent, and with
          overflow-wrap:anywhere a short message collapsed to one character
          per line. */}
      <div className={cn('flex min-w-0 max-w-[85%] flex-col gap-1 sm:max-w-[75%]', variant === 'sent' && 'items-end')}>
        {(author != null || timestamp != null) && (
          <div className="flex items-center gap-2 px-1 font-body text-body-xs text-[var(--color-text-text-subtler)]">
            {author != null && <span className="font-medium text-[var(--color-text-text)]">{author}</span>}
            {timestamp != null && <span>{timestamp}</span>}
          </div>
        )}
        <div
          data-slot="message-bubble"
          data-appearance={variant === 'sent' ? appearance : undefined}
          className={cn(
            // text-body-m (was text-body-s): the bubble text is the actual
            // message content, not secondary meta — default-font rule.
            'min-w-0 max-w-full rounded-[var(--size-border-radius-border-radius-2xl)] px-3.5 py-2 font-body text-body-m leading-relaxed [overflow-wrap:anywhere]',
            variant === 'sent'
              ? cn(
                  'rounded-tr-[var(--size-border-radius-border-radius-md)]',
                  appearance === 'tonal'
                    ? 'bg-[var(--color-bg-primary-bg-primary-subtle)] text-[var(--color-text-text-link-on-tonal)]'
                    : 'bg-[var(--color-bg-primary-bg-primary)] text-[var(--color-text-text-on-primary)]',
                )
              : 'rounded-tl-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-[var(--color-text-text)]',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
