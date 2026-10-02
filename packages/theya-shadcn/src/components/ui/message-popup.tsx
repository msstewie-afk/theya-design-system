import type { ReactNode } from 'react';
import { Xmark } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from './popover';

/**
 * A floating chat/assistant panel anchored to a launcher button, on
 * our Popover. Use for a help or AI assistant living in a corner of
 * a screen: the trigger (a round icon button) opens a fixed-width
 * panel holding a transcript and a PromptArea.
 */
export const MessagePopup = Popover;

export function MessagePopupTrigger({ asChild = true, ...props }: React.ComponentProps<typeof PopoverTrigger>) {
  return <PopoverTrigger asChild={asChild} {...props} />;
}

export interface MessagePopupContentProps extends Omit<React.ComponentProps<typeof PopoverContent>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  showClose?: boolean;
}

export function MessagePopupContent({
  className,
  title,
  description,
  showClose = true,
  side = 'top',
  align = 'end',
  sideOffset = 12,
  children,
  ...props
}: MessagePopupContentProps) {
  return (
    <PopoverContent
      side={side}
      align={align}
      sideOffset={sideOffset}
      className={cn('flex h-[min(32rem,calc(100vh-6rem))] w-[22.5rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden p-0', className)}
      {...props}
    >
      {(title != null || description != null || showClose) && (
        <div className="flex items-start justify-between gap-2 border-b border-solid border-[var(--color-border-border-subtler)] px-4 py-3">
          <div className="min-w-0">
            {title != null && <p className="truncate font-body text-body-m font-medium text-[var(--color-text-text)]">{title}</p>}
            {description != null && <p className="truncate font-body text-body-xs text-[var(--color-text-text-subtler)]">{description}</p>}
          </div>
          {showClose && (
            <PopoverClose
              aria-label="Close"
              className={cn(
                'grid size-6 shrink-0 place-items-center rounded-[var(--size-border-radius-border-radius-md)] text-[var(--color-icon-icon-subtle)]',
                'transition-colors duration-standard ease-enter motion-reduce:transition-none',
                'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] hover:text-[var(--color-icon-icon)]',
                'focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
              )}
            >
              <Xmark width={16} height={16} aria-hidden="true" />
            </PopoverClose>
          )}
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </PopoverContent>
  );
}
