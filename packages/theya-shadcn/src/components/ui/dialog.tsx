import { forwardRef } from 'react';
import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { Xmark } from 'iconoir-react';
import { cn } from '@/lib/utils';

/**
 * A centered modal on @radix-ui/react-dialog. Distinct from Sheet
 * (a side slide-over): this scales/fades in place. Esc, focus-trap,
 * scroll-lock and return-focus come from Radix.
 *
 * `DialogContent size="full"` swaps the centered popup for a
 * viewport-filling surface (header / scrolling DialogBody / footer) so a
 * multi-step wizard can take the screen over without leaving Dialog's
 * modal semantics.
 */
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

// forwardRef: Radix's Portal hands each child a ref (asChild + Presence) to
// track its exit animation; as a plain function this dropped it under React 18.
export const DialogOverlay = forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(function DialogOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]',
        'data-[state=open]:animate-in data-[state=closed]:animate-out motion-reduce:animate-none!',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  );
});

const dialogContentVariants = cva(
  [
    // `[&>*]:min-w-0` pins the single grid column to the box: as a scroll
    // container the auto track would otherwise grow to the widest child's
    // max-content (a long description on one line, a rigid field row),
    // pushing content past `max-w-lg` and clipping it on the right.
    'fixed z-50 border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-0 text-[var(--color-text-text)] shadow-elevation-xl [&>*]:min-w-0',
    'data-[state=open]:animate-in data-[state=closed]:animate-out motion-reduce:animate-none!',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=open]:duration-moderate data-[state=open]:ease-enter data-[state=closed]:duration-standard data-[state=closed]:ease-exit',
  ],
  {
    variants: {
      size: {
        // Mobile: keep a 1rem side gutter and cap height with internal scroll
        // so the footer never gets pushed off a short viewport.
        md: [
          'left-1/2 top-1/2 grid w-[calc(100%-2rem)] max-w-lg max-h-[calc(100svh-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[var(--size-border-radius-border-radius-3xl)] border',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%]',
        ],
        // A page-like takeover for multi-step flows: no rounding, no border, no
        // host chrome visible. Column layout so a `DialogBody` between header
        // and footer takes the slack and scrolls on its own, keeping both
        // pinned. `top-0 h-svh` rather than `inset-0`: on phones the fixed
        // viewport is the LARGE one (browser chrome excluded), so `bottom-0`
        // would push the footer under the address bar. Header/footer pinned
        // (`shrink-0`), body allowed to shrink below content height
        // (`min-h-0`, since a column flex item defaults to `min-height: auto`).
        full: [
          'inset-x-0 top-0 flex h-svh w-full max-w-none flex-col overflow-hidden rounded-none border-0',
          '[&>[data-slot=dialog-header]]:shrink-0 [&>[data-slot=dialog-footer]]:shrink-0',
          '[&>[data-slot=dialog-body]]:min-h-0',
        ],
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export interface DialogContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {
  showCloseButton?: boolean;
  /** Spacing between the header, body, and footer sections. */
  gap?: 'default' | 'compact' | 'none';
}

export function DialogContent({ className, children, showCloseButton = true, size, gap = 'default', ...props }: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-size={size ?? 'md'}
        data-gap={gap}
        className={cn(
          dialogContentVariants({ size }),
          gap === 'default' && 'gap-4',
          gap === 'compact' && 'gap-2',
          gap === 'none' && 'gap-0',
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            className={cn(
              'absolute right-4 top-4 flex items-center justify-center size-7 rounded-[var(--size-border-radius-border-radius-md)]',
              'text-[var(--color-icon-icon-subtle)] hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
              'focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
            )}
          >
            <Xmark width={16} height={16} aria-hidden="true" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export interface DialogHeaderProps extends React.ComponentProps<'div'> {
  /** Show the separator line between the header and dialog content. */
  showDivider?: boolean;
}

export function DialogHeader({ className, showDivider = true, ...props }: DialogHeaderProps) {
  return (
    <div
      data-slot="dialog-header"
      data-divider={showDivider}
      className={cn(
        'relative flex flex-col gap-1 px-6 pt-6 pb-4 text-left',
        showDivider && "after:absolute after:inset-x-6 after:bottom-0 after:h-px after:bg-[var(--color-border-border-subtler)] after:content-['']",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The scrolling middle region. Required for `size="full"` (that variant
 * clips its own overflow, so the body owns the scroll and header + footer
 * stay pinned). The default centered variant scrolls as one box, so plain
 * padded content works there too. `showDivider` draws the same inset line
 * used elsewhere, for form dialogs where the body should be visually
 * separated from the footer.
 */
export function DialogBody({ className, showDivider, ...props }: React.ComponentProps<'div'> & { showDivider?: boolean }) {
  return (
    <div
      data-slot="dialog-body"
      className={cn(
        'relative flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5',
        showDivider && "after:absolute after:inset-x-6 after:bottom-0 after:h-px after:bg-[var(--color-border-border-subtler)] after:content-['']",
        className,
      )}
      {...props}
    />
  );
}

export interface DialogFooterProps extends React.ComponentProps<'div'> {
  /** Show the separator line between dialog content and the footer. */
  showDivider?: boolean;
}

export function DialogFooter({ className, showDivider = true, ...props }: DialogFooterProps) {
  return (
    <div
      data-slot="dialog-footer"
      data-divider={showDivider}
      className={cn(
        'relative flex flex-col-reverse gap-2 px-6 pt-5 pb-6 sm:flex-row sm:justify-end',
        showDivider && "before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-[var(--color-border-border-subtler)] before:content-['']",
        className,
      )}
      {...props}
    />
  );
}

export function DialogTitle({ className, size = 'md', ...props }: React.ComponentProps<typeof DialogPrimitive.Title> & { size?: 'md' | 'lg' }) {
  return (
    <DialogPrimitive.Title
      className={cn(
        'font-body font-medium leading-tight text-[var(--color-text-text)]',
        size === 'md' && 'text-heading-s',
        size === 'lg' && 'text-heading-m',
        className,
      )}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn('font-body text-body-s leading-relaxed text-[var(--color-text-text-subtler)]', className)} {...props} />;
}
