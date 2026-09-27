import { useState, useId, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { TextField } from './text-field';
import { Label } from './label';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from './alert-dialog';

/**
 * A reusable confirmation modal composing AlertDialog + TextField +
 * Button (AlertDialog already implements the titleSize/showHeaderDivider/
 * showFooterDivider/contentGap layout context this needs, so this
 * builds on it rather than the plain Dialog). For irreversible
 * actions, pass `confirmValue` (e.g. the domain) to require the user
 * to type it exactly before the action button enables.
 *
 * Post-delete focus (WCAG 2.4.3): when the confirmed action removes
 * the row that held the trigger, focus would otherwise fall to
 * <body>. This captures the opener's nearest surviving ancestor on
 * open and, on close, redirects focus there if the opener is gone.
 */
const FOCUS_FALLBACK_SELECTOR = '[role="region"],[role="dialog"],section,main,form';

export interface ConfirmDialogProps {
  title: ReactNode;
  titleSize?: 'default' | 'large';
  description?: ReactNode;
  showHeaderDivider?: boolean;
  showFooterDivider?: boolean;
  contentGap?: 'default' | 'compact' | 'none';
  /** Require the user to type this string exactly to enable the action. */
  confirmValue?: string;
  /** Monospace the typed value (a domain, slug, id, etc). Set false for a non-identifier value like an email. Defaults to true. */
  confirmValueMono?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'neutral';
  confirmIcon?: ReactNode;
  onConfirm?: () => void;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

export function ConfirmDialog({
  title,
  titleSize = 'default',
  description,
  showHeaderDivider,
  showFooterDivider,
  contentGap = 'default',
  confirmValue,
  confirmValueMono = true,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  tone = 'danger',
  confirmIcon,
  onConfirm,
  trigger,
  open,
  onOpenChange,
  children,
}: ConfirmDialogProps) {
  const inputId = useId();
  const bodyId = useId();
  const [value, setValue] = useState('');
  const ready = !confirmValue || value.trim() === confirmValue;
  const hasBody = Boolean(children || confirmValue);
  // No explicit prop -> follow whether there's a body: dividers separate
  // header/footer from body content, but look wrong flanking nothing when
  // header and footer sit directly adjacent (no body between them).
  const resolvedShowHeaderDivider = showHeaderDivider ?? hasBody;
  const resolvedShowFooterDivider = showFooterDivider ?? hasBody;

  const fallbackRef = useRef<HTMLElement | null>(null);
  const prevOpenRef = useRef(false);

  const captureOpener = useCallback(() => {
    if (typeof document === 'undefined') return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== document.body) {
      fallbackRef.current = active.closest<HTMLElement>(FOCUS_FALLBACK_SELECTOR);
    }
  }, []);

  if (open && !prevOpenRef.current) captureOpener();
  prevOpenRef.current = Boolean(open);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      captureOpener();
    } else {
      setValue('');
      const fb = fallbackRef.current;
      requestAnimationFrame(() => {
        const ae = document.activeElement;
        const lost = !ae || ae === document.body || ae === document.documentElement;
        if (lost && fb?.isConnected) {
          if (!fb.hasAttribute('tabindex')) fb.setAttribute('tabindex', '-1');
          fb.focus();
        }
      });
    }
    onOpenChange?.(next);
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={handleOpenChange}
      titleSize={titleSize}
      showHeaderDivider={resolvedShowHeaderDivider}
      showFooterDivider={resolvedShowFooterDivider}
      contentGap={contentGap}
    >
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent {...(description ? {} : { 'aria-describedby': hasBody ? bodyId : undefined })}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>

        {hasBody && (
          <AlertDialogBody id={bodyId} showDivider className="flex-none pt-0 pb-5">
            {children}
            {confirmValue && (
              <div className="flex flex-col gap-2">
                <Label htmlFor={inputId}>
                  Type <span className={cn('text-[var(--color-text-text)]', confirmValueMono && 'font-mono')}>{confirmValue}</span> to confirm
                </Label>
                <TextField
                  id={inputId}
                  className={confirmValueMono ? 'font-mono' : undefined}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  placeholder={confirmValue}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  widthSize="full"
                />
              </div>
            )}
          </AlertDialogBody>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction type="filled" tone={tone === 'danger' ? 'danger' : 'primary'} disabled={!ready} onClick={onConfirm} leftIcon={confirmIcon}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
