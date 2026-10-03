import { useCallback, useLayoutEffect, useRef, type FocusEvent, type ReactNode } from 'react';
import { Xmark } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

/**
 * Actions pinned to the bottom edge while the content scrolls under them:
 * Save/Discard at the end of a long form, bulk actions for a selection, the
 * one primary button of a mobile screen.
 *
 * - `variant="bar"` (default): full-width strip at the bottom of its scroll
 *   container (`position: sticky`, so it stays inside the content column and
 *   never covers a sidebar). `variant="floating"`: a centered card that hovers
 *   above the content — the bulk-selection pattern.
 * - `open` slides it in and out; while closed it isn't rendered, so it
 *   never traps focus or adds a tab stop.
 * - `message` is the status on the start side ("3 selected", "Unsaved
 *   changes") and is a polite live region, so a changing count is announced.
 * - Layout follows the bar's own width (container query), not the
 *   viewport: message and actions share one row whenever they fit; only
 *   below 28rem does the message move above and the actions share the
 *   full width. The iOS home-indicator inset is respected.
 * - The bar's top divider is inset to the content padding, like every
 *   Theya separator — it lines up with the text, not the container edge.
 * - `onClose` adds a close button (e.g. "Clear selection").
 */
export type StickyActionBarVariant = 'bar' | 'floating';

export interface StickyActionBarProps extends Omit<React.ComponentProps<'div'>, 'role'> {
  open?: boolean;
  variant?: StickyActionBarVariant;
  /** Status on the start side; announced politely when it changes. */
  message?: ReactNode;
  /** `sticky` (default) pins to the bottom of the nearest scroll container; `fixed` to the viewport. */
  position?: 'sticky' | 'fixed';
  onClose?: () => void;
  closeLabel?: string;
  /** Landmark name. Default "Actions". */
  'aria-label'?: string;
}

export function StickyActionBar({
  open = true,
  variant = 'bar',
  message,
  position = 'sticky',
  onClose,
  closeLabel = 'Close',
  className,
  children,
  'aria-label': ariaLabel = 'Actions',
  ...props
}: StickyActionBarProps) {
  // The bar usually closes because of an action inside it (Discard, Clear
  // selection, Save) — it unmounts with focus inside and focus fell to <body>.
  // Remember where focus came from and return it there.
  const cameFrom = useRef<HTMLElement | null>(null);
  const restore = useRef(false);
  // Ref callback: on unmount React detaches the ref while the node is still in
  // the document, so we can see whether focus was inside it.
  // Stable (useCallback) so React only calls it on mount/unmount, not every render.
  const lastBar = useRef<HTMLDivElement | null>(null);
  const barRef = useCallback((el: HTMLDivElement | null) => {
    if (!el && document.activeElement && lastBar.current?.contains(document.activeElement)) restore.current = true;
    lastBar.current = el;
  }, []);
  useLayoutEffect(() => {
    if (open || !restore.current) return;
    restore.current = false;
    const el = cameFrom.current;
    if (el?.isConnected) el.focus({ preventScroll: true });
  }, [open]);
  const onFocusIn = (e: FocusEvent<HTMLDivElement>) => {
    const from = e.relatedTarget as HTMLElement | null;
    if (from && !e.currentTarget.contains(from)) cameFrom.current = from;
  };

  if (!open) return null;
  const floating = variant === 'floating';

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      data-slot="sticky-action-bar"
      data-variant={variant}
      ref={barRef}
      onFocus={onFocusIn}
      className={cn(
        position === 'fixed' ? 'fixed inset-x-0' : 'sticky',
        'bottom-0 z-(--z-index-sticky)',
        'animate-in fade-in-0 slide-in-from-bottom-4 duration-200 ease-enter motion-reduce:animate-none',
        floating
          ? 'pointer-events-none flex justify-center px-4 pb-[calc(1rem_+_env(safe-area-inset-bottom))]'
          : [
              'bg-[var(--color-bg-surface-bg-surface)] pb-[env(safe-area-inset-bottom)]',
              // Divider inset to the content padding (px-4 / px-6 below).
              "before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-[var(--color-border-border-subtler)] before:content-[''] sm:before:inset-x-6",
            ],
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          '@container/bar flex flex-wrap items-center gap-x-4 gap-y-3',
          floating
            ? 'pointer-events-auto w-full max-w-[40rem] rounded-[var(--size-border-radius-border-radius-3xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface-overlay)] py-2 pr-2 pl-4 shadow-elevation-lg'
            : 'px-4 py-3 sm:px-6',
        )}
      >
        {message !== undefined && (
          <div aria-live="polite" className="min-w-0 flex-1 font-body text-body-m text-[var(--color-text-text)] @max-[28rem]/bar:basis-full">
            {message}
          </div>
        )}
        <div className={cn('ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2', '@max-[28rem]/bar:ml-0 @max-[28rem]/bar:w-full @max-[28rem]/bar:*:flex-1')}>{children}</div>
        {onClose && (
          <Button appearance="ghost" tone="neutral" size="lg" iconOnly aria-label={closeLabel} leftIcon={<Xmark />} onClick={onClose} className="shrink-0" />
        )}
      </div>
    </div>
  );
}
