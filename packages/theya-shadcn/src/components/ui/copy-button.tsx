import { forwardRef, useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Check, Copy } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from './button';

/**
 * Copies a string to the clipboard and confirms it via icon swap + a
 * polite aria-live announcement. Doesn't toast itself — wire `onCopied`/
 * `onCopyError` to `sonner`'s `toast` (see ./sonner) at the call site,
 * as SecretField does, so callers that don't want a toast aren't forced
 * into one.
 */
export interface CopyButtonProps
  extends Omit<ButtonProps, 'children' | 'loading' | 'leftIcon' | 'rightIcon'> {
  /** Text written to the clipboard. */
  value: string;
  /** Visible label beside the icon. Pass null for icon-only (then set aria-label). Default "Copy". */
  label?: ReactNode;
  /** Label shown for `resetDelay`ms after a successful copy. Default "Copied". */
  copiedLabel?: ReactNode;
  /** ms before the button reverts from the copied state. Default 1500. */
  resetDelay?: number;
  onCopied?: (value: string) => void;
  onCopyError?: (error: unknown) => void;
}

export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(function CopyButton(
  {
    value,
    label = 'Copy',
    copiedLabel = 'Copied',
    resetDelay = 1500,
    onCopied,
    onCopyError,
    onClick,
    appearance = 'tonal',
    tone = 'neutral',
    size = 'md',
    className,
    ...props
  },
  ref,
) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), resetDelay);
      onCopied?.(value);
    } catch (error) {
      onCopyError?.(error);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) void copy();
  };

  const displayLabel = label == null ? undefined : copied ? copiedLabel : label;
  const iconOnly = label == null;

  return (
    <>
      <Button
        ref={ref}
        appearance={appearance}
        // While copied, borrow the tone slot to flash tonal success
        // feedback — the caller's own tone (default: "neutral") comes
        // back once the reset timer flips `copied` back to false.
        tone={copied ? 'success' : tone}
        size={size}
        iconOnly={iconOnly}
        leftIcon={copied ? <Check /> : <Copy />}
        onClick={handleClick}
        className={cn(className)}
        {...props}
      >
        {displayLabel}
      </Button>
      <span aria-live="polite" className="sr-only">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </>
  );
});
