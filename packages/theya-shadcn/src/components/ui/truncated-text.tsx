'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Slot } from '@radix-ui/react-slot';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../../lib/utils';
import { TooltipContent, TooltipProvider } from './tooltip';

/**
 * One line (or two, `lines={2}`) of text that ends in an ellipsis when it doesn't fit, and shows
 * the whole text in a tooltip — only while it is actually cut.
 *
 * For long user data that can't wrap without breaking a layout: file names,
 * domains, descriptions in list rows, a chosen value in a trigger. Short
 * interface labels (column headers, nav labels, buttons) wrap instead, so
 * they never need this (WCAG 1.4.4 / 1.4.12: text enlarged to 200% or with
 * wider spacing must not lose content).
 *
 * The tooltip opens on hover over the text and on keyboard focus of the
 * control that contains it (a row link, a select trigger). Cut text with no
 * focusable control around it becomes a tab stop itself, so keyboard users
 * can reach it too. Screen readers already get the whole text from the DOM.
 */
export interface TruncatedTextProps extends React.ComponentProps<'span'> {
  /** Render onto your own element (e.g. a heading) instead of a `<span>`. */
  asChild?: boolean;
  /** Where the tooltip opens (default top). Two cut lines in one row: the first on top, the second at the bottom, so they don't cover each other. */
  side?: 'top' | 'bottom';
  /** Lines before the ellipsis (default 1). 2 for a description under a title. */
  lines?: 1 | 2;
}

const FOCUSABLE = 'a[href],button,input,select,textarea,summary,[tabindex]:not([tabindex="-1"]),[role=option],[role=row],[role=gridcell],[role=menuitem],[role=tab],[role=treeitem]';

export function TruncatedText({ className, asChild = false, side = 'top', lines = 1, children, ...props }: TruncatedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [cut, setCut] = useState(false);
  const [open, setOpen] = useState(false);
  const [ownFocus, setOwnFocus] = useState(false);

  const measure = useCallback(() => {
    const el = ref.current;
    if (el) setCut(el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(el);
    // Text changes don't resize the box; a font that loads late does change the width.
    const text = new MutationObserver(measure);
    text.observe(el, { childList: true, characterData: true, subtree: true });
    document.fonts?.ready.then(measure).catch(() => {});
    // The control that takes focus for this text: an ancestor, or — when the
    // control sits beside the text (a stretched link or an overlay button in
    // a card) — the one marked data-truncate-owner in the nearest
    // data-truncate-scope.
    const owner =
      el.parentElement?.closest<HTMLElement>(FOCUSABLE) ??
      el.closest('[data-truncate-scope]')?.querySelector<HTMLElement>('[data-truncate-owner]') ??
      null;
    setOwnFocus(!owner);
    if (!owner) return () => { resize.disconnect(); text.disconnect(); };
    // The control around the text has the keyboard focus, so it opens the tooltip.
    const show = () => owner.matches(':focus-visible') && setOpen(true);
    const hide = () => setOpen(false);
    owner.addEventListener('focus', show);
    owner.addEventListener('blur', hide);
    return () => {
      resize.disconnect();
      text.disconnect();
      owner.removeEventListener('focus', show);
      owner.removeEventListener('blur', hide);
    };
  }, [measure]);

  const Comp = asChild ? Slot : 'span';
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root open={cut && open} onOpenChange={setOpen}>
        <TooltipPrimitive.Trigger asChild>
          <Comp
            ref={ref}
            data-slot="truncated-text"
            data-truncated={cut || undefined}
            // A tab stop only when cut and nothing around it can take focus.
            tabIndex={cut && ownFocus ? 0 : undefined}
            className={cn('block min-w-0', lines === 2 ? 'line-clamp-2 break-words' : 'truncate', cut && ownFocus && 'rounded-[var(--size-border-radius-border-radius-sm)] outline-none focus-visible:focus-ring', className)}
            {...props}
          >
            {children}
          </Comp>
        </TooltipPrimitive.Trigger>
        {/* The full text is already in the DOM for screen readers; the bubble is visual only. */}
        <TooltipContent aria-hidden side={side} className="break-all">
          {children}
        </TooltipContent>
      </TooltipPrimitive.Root>
    </TooltipProvider>
  );
}
