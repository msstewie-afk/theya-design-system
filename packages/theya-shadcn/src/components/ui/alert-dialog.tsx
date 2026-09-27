import { createContext, useContext } from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from './button';

/**
 * A modal that interrupts for a single deliberate choice (confirm a
 * destructive or non-reversible action), on @radix-ui/react-alert-dialog
 * — a direct equivalent of the Base UI Dialog-with-role="alertdialog"
 * the reference built by hand. Esc, AlertDialogAction and
 * AlertDialogCancel all close it. For a high-stakes delete needing a
 * typed-to-confirm gate, use ConfirmDialog instead.
 *
 * Simplified vs the reference: the CSS `:has()` cascade that collapses
 * a double divider when header+footer sit directly adjacent (no body)
 * isn't ported — a cosmetic edge case, not core behavior.
 */
interface AlertDialogLayoutProps {
  titleSize?: 'default' | 'large';
  showHeaderDivider?: boolean;
  showFooterDivider?: boolean;
  contentGap?: 'default' | 'compact' | 'none';
}

const AlertDialogLayoutContext = createContext<Required<AlertDialogLayoutProps>>({
  titleSize: 'default',
  showHeaderDivider: false,
  showFooterDivider: false,
  contentGap: 'default',
});

export function AlertDialog({
  titleSize = 'default',
  showHeaderDivider = false,
  showFooterDivider = false,
  contentGap = 'default',
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

export function AlertDialogOverlay({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  );
}

export function AlertDialogContent({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  const layout = useContext(AlertDialogLayoutContext);
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md max-h-[calc(100svh-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto',
          'rounded-[var(--size-border-radius-border-radius-3xl)] border border-solid border-[var(--color-border-border-subtle)]',
          'bg-[var(--color-bg-surface-bg-surface)] p-0 text-[var(--color-text-text)] shadow-xl',
          layout.contentGap === 'default' && 'gap-4',
          layout.contentGap === 'compact' && 'gap-2',
          layout.contentGap === 'none' && 'gap-0',
          'data-[state=open]:animate-in data-[state=closed]:animate-out motion-reduce:animate-none',
          'data-[state=open]:duration-200 data-[state=open]:ease-out data-[state=closed]:duration-150 data-[state=closed]:ease-in',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%]',
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

export interface AlertDialogHeaderProps extends React.ComponentProps<'div'> {
  showDivider?: boolean;
  gap?: 'default' | 'compact' | 'none';
}

export function AlertDialogHeader({ className, showDivider, gap = 'default', ...props }: AlertDialogHeaderProps) {
  const layout = useContext(AlertDialogLayoutContext);
  const resolved = showDivider ?? layout.showHeaderDivider;
  return (
    <div
      className={cn(
        'relative flex flex-col px-6 pt-6 pb-4 text-left',
        gap === 'default' && 'gap-1',
        gap === 'compact' && 'gap-0.5',
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
  gap?: 'default' | 'compact' | 'none';
}

export function AlertDialogFooter({ className, showDivider, gap = 'default', ...props }: AlertDialogFooterProps) {
  const layout = useContext(AlertDialogLayoutContext);
  const resolved = showDivider ?? layout.showFooterDivider;
  return (
    <div
      className={cn(
        'relative flex flex-col-reverse px-6 pt-5 pb-6 sm:flex-row sm:justify-end',
        gap === 'default' && 'gap-2',
        gap === 'compact' && 'gap-1',
        gap === 'none' && 'gap-0',
        resolved && "before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-[var(--color-border-border-subtler)] before:content-['']",
        className,
      )}
      {...props}
    />
  );
}

export function AlertDialogTitle({ className, size, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title> & { size?: 'default' | 'large' }) {
  const layout = useContext(AlertDialogLayoutContext);
  const resolved = size ?? layout.titleSize;
  return (
    <AlertDialogPrimitive.Title
      className={cn(
        'font-body font-medium leading-tight text-[var(--color-text-text)]',
        resolved === 'default' && 'text-heading-s',
        resolved === 'large' && 'text-heading-m',
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
  return <AlertDialogPrimitive.Description className={cn('font-body text-body-s leading-relaxed text-[var(--color-text-text-subtler)]', className)} {...props} />;
}

/** The confirming action. Defaults to a danger-intent Button and closes the dialog. */
export function AlertDialogAction({ type = 'filled', tone = 'danger', ...props }: ButtonProps) {
  return <AlertDialogPrimitive.Action asChild><Button type={type} tone={tone} {...props} /></AlertDialogPrimitive.Action>;
}

/** The dismissing action. Renders an outlined Button and closes the dialog. */
export function AlertDialogCancel({ type = 'outlined', tone = 'secondary', ...props }: ButtonProps) {
  return <AlertDialogPrimitive.Cancel asChild><Button type={type} tone={tone} {...props} /></AlertDialogPrimitive.Cancel>;
}
