'use client';

import type { ReactNode } from 'react';
import { Xmark } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { useContext } from 'react';
import { Popover, PopoverClose, PopoverContent, PopoverSheetContext, PopoverTrigger, type PopoverProps } from './popover';
import { useTheyaI18n } from '../../lib/i18n';

/**
 * A floating chat/assistant panel anchored to a launcher button, on
 * our Popover. Use for a help or AI assistant living in a corner of
 * a screen: the trigger (a round icon button) opens a fixed-width
 * panel holding a transcript and a PromptArea.
 */
/** Opens as a bottom sheet below 640px (Popover `sheet`). */
export function MessagePopup(props: PopoverProps) {
  return <Popover sheet {...props} />;
}

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
  const { t } = useTheyaI18n();
  // In the phone sheet the Drawer header shows the title and its own close
  // button; only the description stays above the content.
  const sheet = useContext(PopoverSheetContext);
  return (
    <PopoverContent
      side={side}
      align={align}
      sideOffset={sideOffset}
      className={cn('flex h-[min(32rem,calc(100svh-6rem))] w-[22.5rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden p-0', className)}
      sheetTitle={title}
      sheetClassName="gap-0 px-0 pt-0 pb-0"
      {...props}
    >
      {sheet && description != null && <p className="px-6 pb-3 font-body text-body-xs text-[var(--color-text-text-subtler)]">{description}</p>}
      {!sheet && (title != null || description != null || showClose) && (
        <div className="flex items-start justify-between gap-2 border-b border-solid border-[var(--color-border-border-subtler)] px-4 py-3">
          <div className="min-w-0">
            {title != null && <p className="truncate font-body text-body-m font-medium text-[var(--color-text-text)]">{title}</p>}
            {description != null && <p className="truncate font-body text-body-xs text-[var(--color-text-text-subtler)]">{description}</p>}
          </div>
          {showClose && (
            <PopoverClose
              aria-label={t.common.close}
              className={cn(
                'grid size-6 shrink-0 place-items-center rounded-[var(--size-border-radius-border-radius-md)] text-[var(--color-icon-icon-subtle)]',
                'transition-colors duration-standard ease-enter motion-reduce:transition-none',
                'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] hover:text-[var(--color-icon-icon)]',
                'focus-visible:outline-none focus-visible:focus-ring',
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
