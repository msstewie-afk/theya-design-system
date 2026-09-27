import { createContext, useContext, useRef, useEffect, useId, useState } from 'react';
import { Slot } from '@radix-ui/react-slot';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { useMediaQuery } from './use-media-query';

/**
 * A non-modal, in-flow side panel that pushes page content aside
 * instead of covering it: no backdrop, no focus trap, no portal, and
 * the page underneath stays fully interactive while open. Distinct
 * from Sheet (built on our Dialog primitive, inherently modal — no
 * way to turn that off). Follows the same push-layout pattern Sidebar
 * uses (animatable width, no portal, no focus trap).
 *
 * Fully controlled — mount as a flex sibling of your page content and
 * toggle `open` from your own button. Below md, the same children
 * render inside a modal Radix Dialog overlay instead (Sidebar's
 * mobile slide-over gets the same treatment from Sheet).
 */
interface PushSheetContextValue {
  onOpenChange?: (open: boolean) => void;
  titleId: string;
  setHasTitle: (v: boolean) => void;
}

const PushSheetContext = createContext<PushSheetContextValue>({ titleId: '', setHasTitle: () => {} });

export interface PushSheetProps extends React.ComponentProps<'div'> {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: 'left' | 'right';
  width?: string;
}

export function PushSheet({ open, onOpenChange, side = 'right', width = '22.5rem', className, style, children, ...props }: PushSheetProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  // Tracked (not assumed) so `aria-labelledby` only ever points at an id
  // that actually exists in the DOM — PushSheetTitle is optional, and a
  // dangling aria-labelledby would just trade this violation for
  // aria-valid-attr-value. Same mount-tracking approach as Command's listId.
  const titleId = useId();
  const [hasTitle, setHasTitle] = useState(false);

  useEffect(() => {
    if (!open || !isDesktop || onOpenChange == null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, isDesktop, onOpenChange]);

  useEffect(() => {
    if (open) return;
    if (rootRef.current?.contains(document.activeElement)) {
      (document.activeElement as HTMLElement | null)?.blur();
    }
  }, [open]);

  if (!isDesktop) {
    return (
      <PushSheetContext.Provider value={{ onOpenChange, titleId, setHasTitle }}>
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay
              className={cn(
                'fixed inset-0 z-50 bg-black/40',
                'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              )}
            />
            <DialogPrimitive.Content
              aria-labelledby={hasTitle ? titleId : undefined}
              style={{ width, ...style }}
              className={cn(
                'fixed inset-y-0 z-50 flex h-full max-w-[92vw] flex-col bg-[var(--color-bg-surface-bg-surface)] text-[var(--color-text-text)] shadow-xl outline-none',
                'transition ease-out motion-reduce:transition-none',
                'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300',
                side === 'right'
                  ? 'right-0 border-l border-solid border-[var(--color-border-border-subtle)] data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right'
                  : 'left-0 border-r border-solid border-[var(--color-border-border-subtle)] data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
                className,
              )}
              {...props}
            >
              {children}
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </PushSheetContext.Provider>
    );
  }

  return (
    <PushSheetContext.Provider value={{ onOpenChange, titleId, setHasTitle }}>
      <div
        ref={rootRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby={hasTitle ? titleId : undefined}
        data-state={open ? 'open' : 'closed'}
        aria-hidden={!open}
        {...({ inert: open ? undefined : true } as Record<string, unknown>)}
        style={{ width: open ? width : '0px', ...style }}
        className={cn('h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-out motion-reduce:transition-none', className)}
        {...props}
      >
        <div
          style={{ width }}
          className={cn(
            'flex h-full flex-col bg-[var(--color-bg-surface-bg-surface)] text-[var(--color-text-text)]',
            side === 'right' ? 'border-l border-solid border-[var(--color-border-border-subtle)]' : 'border-r border-solid border-[var(--color-border-border-subtle)]',
          )}
        >
          {children}
        </div>
      </div>
    </PushSheetContext.Provider>
  );
}

export function PushSheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex items-center justify-between gap-2 border-b border-solid border-[var(--color-border-border-subtle)] px-[1.125rem] py-4 text-left', className)} {...props} />;
}

export function PushSheetBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-1 flex-col gap-4 overflow-y-auto px-[1.125rem] py-5', className)} {...props} />;
}

export function PushSheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mt-auto flex items-center justify-end gap-2 border-t border-solid border-[var(--color-border-border-subtle)] px-[1.125rem] py-3.5', className)} {...props} />;
}

export function PushSheetTitle({ id, className, ...props }: React.ComponentProps<'h2'>) {
  const { titleId, setHasTitle } = useContext(PushSheetContext);
  useEffect(() => {
    setHasTitle(true);
    return () => setHasTitle(false);
  }, [setHasTitle]);
  return <h2 id={id ?? titleId} className={cn('min-w-0 truncate font-body text-body-l font-semibold text-[var(--color-text-text)]', className)} {...props} />;
}

export function PushSheetDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('font-body text-body-s text-[var(--color-text-text-subtler)]', className)} {...props} />;
}

export function PushSheetClose({ asChild, onClick, children, ...props }: React.ComponentProps<'button'> & { asChild?: boolean }) {
  const { onOpenChange } = useContext(PushSheetContext);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) onOpenChange?.(false);
  };
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp onClick={handleClick} {...(asChild ? {} : { type: 'button' as const })} {...props}>
      {children}
    </Comp>
  );
}
