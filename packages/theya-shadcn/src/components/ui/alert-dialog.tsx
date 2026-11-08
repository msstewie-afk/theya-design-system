'use client';

import { forwardRef, createContext, useContext } from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { Xmark } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';
import { Button, type ButtonProps } from './button';

/**
 * A modal that interrupts for a single deliberate choice (confirm a
 * destructive or non-reversible action), on @radix-ui/react-alert-dialog.
 * Esc, AlertDialogAction and AlertDialogCancel all close it. For a
 * high-stakes delete needing a typed-to-confirm gate, use ConfirmDialog
 * instead.
 *
 * A close button (×) sits in the top corner, as in Dialog (Maria,
 * 2026-11-07: every window has one); it closes like Esc. Focus opens on
 * the footer's Cancel (Radix's own handling). With no AlertDialogBody between them, a
 * header divider and a footer divider sit back to back; only one is drawn.
 */
interface AlertDialogLayoutProps {
  titleSize?: 'md' | 'lg';
  showHeaderDivider?: boolean;
  showFooterDivider?: boolean;
  contentGap?: 'md' | 'sm' | 'none';
}

const AlertDialogLayoutContext = createContext<Required<AlertDialogLayoutProps>>({
  titleSize: 'md',
  showHeaderDivider: false,
  showFooterDivider: false,
  contentGap: 'md',
});

export function AlertDialog({
  titleSize = 'md',
  showHeaderDivider = false,
  showFooterDivider = false,
  contentGap = 'md',
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root> & AlertDialogLayoutProps) {
  return (
    <AlertDialogLayoutContext.Provider value={{ titleSize, showHeaderDivider, showFooterDivider, contentGap }}>
      <AlertDialogPrimitive.Root {...props} />
    </AlertDialogLayoutContext.Provider>
  );
}

export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogPortal = AlertDialogPrimitive.Portal;

// forwardRef: Radix's Portal hands each child a ref (asChild + Presence) to
// track its exit animation; as a plain function this dropped it under React 18.
export const AlertDialogOverlay = forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>>(function AlertDialogOverlay({ className, ...props }, ref) {
  return (
    <AlertDialogPrimitive.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-overlay bg-[var(--color-bg-surface-bg-scrim)] backdrop-blur-[1px]',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none!',
        className,
      )}
      {...props}
    />
  );
});

export function AlertDialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content> & { showCloseButton?: boolean }) {
  const layout = useContext(AlertDialogLayoutContext);
  const { t } = useTheyaI18n();
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-close={showCloseButton ? '' : undefined}
        className={cn(
          'group/alert fixed left-1/2 top-1/2 z-modal grid w-[calc(100%-2rem)] max-w-md max-h-[calc(100svh-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto overflow-x-hidden',
          'rounded-[var(--size-border-radius-border-radius-3xl)] border border-solid border-[var(--color-border-border)]',
          'bg-[var(--color-bg-surface-bg-surface)] p-0 text-[var(--color-text-text)] shadow-elevation-md',
          layout.contentGap === 'md' && 'gap-4',
          layout.contentGap === 'sm' && 'gap-2',
          layout.contentGap === 'none' && 'gap-0',
          'data-[state=open]:animate-in data-[state=closed]:animate-out motion-reduce:animate-none!',
          'data-[state=open]:duration-moderate data-[state=open]:ease-enter data-[state=closed]:duration-standard data-[state=closed]:ease-exit',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%]',
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          // A plain button that closes like Esc, not a second AlertDialog.Cancel:
          // Radix focuses "the" Cancel on open (it keeps one ref), and a second
          // one stole that, so a custom focus step was needed — with it,
          // VoiceOver in Safari read neither the dialog nor the focused button
          // (Maria, 2026-11-08). Radix's own focus handling is untouched now.
          <button
            type="button"
            onClick={(e) => e.currentTarget.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))}
            className={cn(
              'absolute end-4 top-4 flex items-center justify-center size-7 rounded-[var(--size-border-radius-border-radius-md)] border-0 bg-transparent cursor-pointer',
              'text-[var(--color-icon-icon-subtle)] hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
              'focus-visible:outline-none focus-visible:focus-ring',
            )}
          >
            <Xmark width={16} height={16} aria-hidden="true" />
            <span className="sr-only">{t.common.close}</span>
          </button>
        )}
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  );
}

export interface AlertDialogHeaderProps extends React.ComponentProps<'div'> {
  showDivider?: boolean;
  gap?: 'md' | 'sm' | 'none';
}

export function AlertDialogHeader({ className, showDivider, gap = 'md', ...props }: AlertDialogHeaderProps) {
  const layout = useContext(AlertDialogLayoutContext);
  const resolved = showDivider ?? layout.showHeaderDivider;
  return (
    <div
      data-alert-header=""
      data-divider={resolved ? '' : undefined}
      className={cn(
        // pe-14 leaves room for the close button; without a divider the
        // header sits closer to what follows (buttons right under the text).
        'relative flex flex-col px-6 pt-6 text-start group-data-[close]/alert:pe-14',
        resolved ? 'pb-4' : 'pb-1',
        gap === 'md' && 'gap-1',
        gap === 'sm' && 'gap-0.5',
        gap === 'none' && 'gap-0',
        resolved && "after:absolute after:inset-x-6 after:bottom-0 after:h-px after:bg-[var(--color-border-border-subtler)] after:content-['']",
        className,
      )}
      {...props}
    />
  );
}

export interface AlertDialogFooterProps extends React.ComponentProps<'div'> {
  showDivider?: boolean;
  gap?: 'md' | 'sm' | 'none';
}

export function AlertDialogFooter({ className, showDivider, gap = 'md', ...props }: AlertDialogFooterProps) {
  const layout = useContext(AlertDialogLayoutContext);
  const resolved = showDivider ?? layout.showFooterDivider;
  return (
    <div
      className={cn(
        'relative flex flex-col-reverse px-6 pb-6 sm:flex-row sm:justify-end',
        // Right after a header that has its own divider: one line, not two.
        '[[data-alert-header][data-divider]+&]:before:hidden',
        resolved ? 'pt-5' : 'pt-3',
        gap === 'md' && 'gap-2',
        gap === 'sm' && 'gap-1',
        gap === 'none' && 'gap-0',
        resolved && "before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-[var(--color-border-border-subtler)] before:content-['']",
        className,
      )}
      {...props}
    />
  );
}

export function AlertDialogTitle({ className, size, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title> & { size?: 'md' | 'lg' }) {
  const layout = useContext(AlertDialogLayoutContext);
  const resolved = size ?? layout.titleSize;
  return (
    <AlertDialogPrimitive.Title
      className={cn(
        'font-body font-medium leading-tight text-[var(--color-text-text)]',
        resolved === 'md' && 'text-heading-s',
        resolved === 'lg' && 'text-heading-m',
        className,
      )}
      {...props}
    />
  );
}

export interface AlertDialogBodyProps extends React.ComponentProps<'div'> {
  /** Show the separator line between the body and the footer (dialogs with form/body content). */
  showDivider?: boolean;
}

export function AlertDialogBody({ className, showDivider, ...props }: AlertDialogBodyProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col gap-4 px-6 py-4',
        showDivider && "after:absolute after:inset-x-6 after:bottom-0 after:h-px after:bg-[var(--color-border-border-subtler)] after:content-['']",
        className,
      )}
      {...props}
    />
  );
}

export function AlertDialogDescription({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return <AlertDialogPrimitive.Description className={cn('font-body text-body-s leading-[var(--size-size20)] text-[var(--color-text-text-subtler)]', className)} {...props} />;
}

/** The confirming action. Defaults to a danger-tone Button and closes the dialog. */
export function AlertDialogAction({ appearance = 'filled', tone = 'danger', ...props }: ButtonProps) {
  return <AlertDialogPrimitive.Action asChild><Button appearance={appearance} tone={tone} {...props} /></AlertDialogPrimitive.Action>;
}

/** The dismissing action. Renders an outlined Button and closes the dialog. */
export function AlertDialogCancel({ appearance = 'outlined', tone = 'secondary', ...props }: ButtonProps) {
  return <AlertDialogPrimitive.Cancel asChild><Button appearance={appearance} tone={tone} {...props} /></AlertDialogPrimitive.Cancel>;
}
