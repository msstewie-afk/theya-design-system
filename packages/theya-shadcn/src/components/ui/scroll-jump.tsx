'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { NavArrowDown, NavArrowUp } from 'iconoir-react';
import { Button } from './button';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';
import { useScrollPadding } from '../../lib/scroll-padding';

/**
 * Two small buttons in the bottom corner that jump to the top or the bottom
 * of a long page (or of one scroll container). Both stay on screen while the
 * page can scroll; the one pointing where you already are is disabled (at
 * the top, "Scroll to top" is off, and the other way round), so the pair
 * never shifts under the pointer.
 *
 * - Soft-disabled (aria-disabled, clicks ignored), not `disabled`: after a
 *   jump the pressed button keeps focus instead of dropping it to <body>.
 * - Smooth scroll; prefers-reduced-motion jumps instantly.
 * - Hidden when there is nothing to scroll.
 * - Reserves its height as scroll padding, so a Tab-focused element near
 *   the bottom isn't hidden behind it (WCAG 2.4.11), as Fab does.
 * - A named group (`label`, default "Page scroll") with named buttons.
 */
export interface ScrollJumpProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /** Scroll container to drive. Default: the page. */
  target?: RefObject<HTMLElement | null>;
  /** Corner it sits in. `none` leaves positioning to you (e.g. inside a container). */
  position?: 'bottom-end' | 'bottom-start' | 'none';
  label?: string;
  topLabel?: string;
  bottomLabel?: string;
}

const POSITION: Record<NonNullable<ScrollJumpProps['position']>, string> = {
  'bottom-end': 'fixed z-(--z-index-sticky) end-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:end-6 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]',
  'bottom-start': 'fixed z-(--z-index-sticky) start-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:start-6 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]',
  none: '',
};

// Opaque surface with a border, so the buttons read over any content
// (Theya separates floating surfaces with a border, not a shadow).
const SURFACE =
  'border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] not-aria-disabled:hover:bg-[var(--color-bg-neutral-bg-neutral-subtler)]';

export function ScrollJump({ target, position = 'bottom-end', label, topLabel, bottomLabel, className, ...props }: ScrollJumpProps) {
  const { t } = useTheyaI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ scrollable: false, atTop: true, atBottom: false });

  const scroller = useCallback(() => target?.current ?? (typeof document !== 'undefined' ? (document.scrollingElement as HTMLElement | null) : null), [target]);

  useEffect(() => {
    const el = scroller();
    if (!el) return;
    // The page scrolls on window; a container scrolls on itself.
    const source: HTMLElement | Window = target?.current ? el : window;
    const update = () => {
      const max = el.scrollHeight - el.clientHeight;
      // 1px slack: zoom and fractional scroll positions never land exactly.
      setState({ scrollable: max > 1, atTop: el.scrollTop <= 1, atBottom: el.scrollTop >= max - 1 });
    };
    update();
    source.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    window.addEventListener('resize', update);
    return () => {
      source.removeEventListener('scroll', update);
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [scroller, target]);

  useScrollPadding(ref, 'bottom', state.scrollable && position !== 'none');

  const jump = (to: 'top' | 'bottom') => {
    const el = scroller();
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ top: to === 'top' ? 0 : el.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
  };

  if (!state.scrollable) return null;

  return (
    <div
      ref={ref}
      role="group"
      aria-label={label ?? t.scrollJump.label}
      data-slot="scroll-jump"
      className={cn('flex flex-col gap-2', POSITION[position], className)}
      {...props}
    >
      <Button
        appearance="outlined"
        tone="neutral"
        size="md"
        iconOnly
        aria-label={topLabel ?? t.scrollJump.top}
        softDisabled={state.atTop}
        onClick={() => jump('top')}
        leftIcon={<NavArrowUp />}
        className={SURFACE}
      />
      <Button
        appearance="outlined"
        tone="neutral"
        size="md"
        iconOnly
        aria-label={bottomLabel ?? t.scrollJump.bottom}
        softDisabled={state.atBottom}
        onClick={() => jump('bottom')}
        leftIcon={<NavArrowDown />}
        className={SURFACE}
      />
    </div>
  );
}
