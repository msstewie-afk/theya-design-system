'use client';

import { forwardRef, useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { CopyAnimated } from './animated-icon';
import { cn } from '../../lib/utils';
import { Button, type ButtonProps } from './button';
import { useTheyaI18n } from '../../lib/i18n';

/**
 * Copies a string to the clipboard and confirms it via icon swap + a
 * polite announcement (the "Copied" label, announced by Button, or
 * a dedicated live region when icon-only). Doesn't toast itself — wire `onCopied`/
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
  /** What gets copied ("API key"): names the button "Copy API key" for assistive tech, so several CopyButtons stay distinct (WCAG 2.4.6). The visible label stays short. */
  subject?: string;
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
    label,
    subject,
    copiedLabel,
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
  const { t } = useTheyaI18n();
  if (label === undefined) label = t.copyButton.copy;
  if (copiedLabel === undefined) copiedLabel = t.copyButton.copied;
  const [copied, setCopied] = useState(false);
  // Bumped on every successful copy. A second copy inside the reset window
  // left the live region text unchanged, so it wasn't announced again; the
  // trailing no-break space alternates to make each copy a new string.
  const [copyCount, setCopyCount] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setCopyCount((n) => n + 1);
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

  // Both labels share one grid cell, so the button keeps the width of the longer
  // one: no jump when "Copy" turns into "Copied", and VoiceOver's cursor frame
  // still matches the button. The other label is invisible and aria-hidden.
  const displayLabel =
    label == null ? undefined : (
      <span className="inline-grid justify-items-center">
        <span className="[grid-area:1/1]">{copied ? copiedLabel : label}</span>
        <span aria-hidden="true" className="invisible [grid-area:1/1]">
          {copied ? label : copiedLabel}
        </span>
      </span>
    );
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
        // The copy sheets give way to a drawn tick (AnimatedIcon, trigger="active");
        // with reduced motion the swap is instant.
        leftIcon={<CopyAnimated trigger="active" active={copied} />}
        onClick={handleClick}
        className={cn(className)}
        aria-label={subject && !props['aria-label'] && !copied ? t.copyButton.copyFor(subject) : undefined}
        {...props}
      >
        {displayLabel}
      </Button>
      {/* Icon-only only: with a visible label, Button already announces
          "Copy" -> "Copied" (through announce()), and this region made it
          two announcements in a row. */}
      {iconOnly && (
        <span aria-live="polite" className="sr-only">
          {copied ? `${t.copyButton.announced}${copyCount % 2 ? '' : '\u00a0'}` : ''}
        </span>
      )}
    </>
  );
});
