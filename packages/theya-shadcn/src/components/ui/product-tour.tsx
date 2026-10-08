'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Xmark } from 'iconoir-react';
import { useDirection } from '@radix-ui/react-direction';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { useTheyaI18n } from '../../lib/i18n';

/**
 * ProductTour — a guided walkthrough of new UI: a spotlight cut out of a
 * dimmed page around one element at a time, with a card next to it
 * (title, text, optional media, Back / Next, step counter, Skip).
 *
 * - A step without a `target` (or whose target isn't on the page) shows the
 *   card centered — use it for a welcome or a closing step.
 * - The page under the dim is inert by default; `interactive` on a step lets
 *   the user click the highlighted element itself (e.g. "try this button").
 * - Esc or the close button skips; ←/→ move between steps while the card
 *   has focus. Focus moves into the card on every step.
 *
 * The tour doesn't remember itself: store "seen" in `onComplete`/`onSkip`.
 */

export type TourTarget = string | React.RefObject<HTMLElement | null> | (() => HTMLElement | null);

export interface TourStep {
  /** CSS selector, ref or getter of the element to highlight. Omit for a centered card. */
  target?: TourTarget;
  title: React.ReactNode;
  content?: React.ReactNode;
  /** Image/illustration on top of the card. */
  media?: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  /** Space between the element and the spotlight edge, px. */
  spotlightPadding?: number;
  /** Lets the user click the highlighted element. */
  interactive?: boolean;
}

export interface ProductTourLabels {
  next: string;
  back: string;
  done: string;
  skip: string;
  close: string;
  progress: (step: number, total: number) => string;
}


export interface ProductTourProps {
  steps: TourStep[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Controlled step index. */
  step?: number;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  /** Finished with Done on the last step. */
  onComplete?: () => void;
  /** Closed early (Skip, close button, Esc). Receives the step it was on. */
  onSkip?: (step: number) => void;
  labels?: Partial<ProductTourLabels>;
  /** Hides the Skip button (the close button stays). */
  hideSkip?: boolean;
}

function resolveTarget(target: TourTarget | undefined): HTMLElement | null {
  if (!target || typeof document === 'undefined') return null;
  if (typeof target === 'string') return document.querySelector<HTMLElement>(target);
  if (typeof target === 'function') return target();
  return target.current;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const sameRect = (a: Rect | null, b: Rect | null) =>
  a === b || (!!a && !!b && a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height);

/** Tracks an element's viewport rect every frame while mounted (catches scroll, resize and layout shifts alike). */
function useTrackedRect(el: HTMLElement | null, padding: number) {
  const [rect, setRect] = useState<Rect | null>(null);
  useLayoutEffect(() => {
    if (!el) {
      setRect(null);
      return;
    }
    let frame = 0;
    let last: Rect | null = null;
    const tick = () => {
      const r = el.getBoundingClientRect();
      const next = { top: r.top - padding, left: r.left - padding, width: r.width + padding * 2, height: r.height + padding * 2 };
      if (!sameRect(last, next)) {
        last = next;
        setRect(next);
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [el, padding]);
  return rect;
}

const CARD = cn(
  'z-popover flex w-80 max-w-[calc(100vw-2rem)] flex-col overflow-hidden outline-none',
  'rounded-[var(--size-border-radius-border-radius-xl)] border border-solid border-[var(--color-border-border)]',
  'bg-[var(--color-bg-surface-bg-surface-overlay)] text-[var(--color-text-text)] shadow-elevation-lg',
);

export function ProductTour({
  steps,
  open,
  onOpenChange,
  step: stepProp,
  defaultStep = 0,
  onStepChange,
  onComplete,
  onSkip,
  labels: labelsProp,
  hideSkip = false,
}: ProductTourProps) {
  const { t } = useTheyaI18n();
  const labels: ProductTourLabels = { ...t.productTour, ...labelsProp };
  const [stepState, setStepState] = useState(defaultStep);
  const index = Math.min(stepProp ?? stepState, steps.length - 1);
  const current = steps[index];
  const isFirst = index === 0;
  const isLast = index === steps.length - 1;
  const titleId = useId();
  const bodyId = useId();

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= steps.length) return;
      if (stepProp === undefined) setStepState(next);
      onStepChange?.(next);
    },
    [stepProp, steps.length, onStepChange],
  );

  // Return focus to whatever opened the tour (e.g. a "Take the tour" button)
  // when it closes — skip, Esc or Done. It used to stay on <body>.
  const returnFocusTo = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (open) {
      returnFocusTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      return;
    }
    const el = returnFocusTo.current;
    returnFocusTo.current = null;
    if (el?.isConnected) el.focus({ preventScroll: true });
  }, [open]);

  // Start from defaultStep each time an uncontrolled tour reopens.
  useEffect(() => {
    if (open && stepProp === undefined) setStepState(defaultStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const skip = () => {
    onSkip?.(index);
    onOpenChange(false);
  };
  const next = () => {
    if (isLast) {
      onComplete?.();
      onOpenChange(false);
    } else goTo(index + 1);
  };

  // Resolve the target after render (it may mount with the step).
  const [targetEl, setTargetEl] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (!open) return;
    const el = resolveTarget(current?.target);
    setTargetEl(el);
    if (el) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    }
  }, [open, current]);

  const rect = useTrackedRect(open ? targetEl : null, current?.spotlightPadding ?? 6);

  // Move focus into the card on every step. Synchronously when the card is
  // already mounted: a step change re-renders the buttons, and focus used to
  // sit on <body> until the next frame — an arrow key pressed in that gap
  // (fast typists, slower machines, a narrow viewport where the target
  // scrolls first) went nowhere. The frame callback still covers the first
  // open, when the card mounts with the popover.
  const cardRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!open) return;
    cardRef.current?.focus({ preventScroll: true });
    const id = requestAnimationFrame(() => cardRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(id);
  }, [open, index, rect === null]);

  // Arrow keys follow the reading direction: in RTL, ← is the next step.
  const dir = useDirection();
  const forwardKey = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  const backKey = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';

  // A step change can remount the card (centered ↔ anchored), and for a
  // moment focus sits on <body>. Keys pressed then still drive the tour,
  // and focus goes back into the card.
  const stepKeys = useRef<(e: KeyboardEvent) => void>(() => {});
  stepKeys.current = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      skip();
    } else if (e.key === forwardKey || e.key === backKey) {
      e.preventDefault();
      cardRef.current?.focus({ preventScroll: true });
      if (e.key === forwardKey) next();
      else goTo(index - 1);
    }
  };
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || (e.target !== document.body && e.target !== document.documentElement)) return;
      stepKeys.current(e);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open || !current) return null;

  const onCardKeyDown = (e: React.KeyboardEvent) => {
    // Keep Tab inside the card: the page behind is dimmed and not part of the step.
    if (e.key === 'Tab' && cardRef.current) {
      const focusables = [...cardRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])')];
      if (focusables.length) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === cardRef.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      skip();
    }
    const typing = (e.target as HTMLElement).closest('input, textarea, [contenteditable="true"]');
    if (typing) return;
    if (e.key === forwardKey) {
      e.preventDefault();
      next();
    } else if (e.key === backKey) {
      e.preventDefault();
      goTo(index - 1);
    }
  };

  const card = (
    <>
      {current.media && <div className="shrink-0 [&_img]:block [&_img]:w-full">{current.media}</div>}
      <div className="relative flex flex-col gap-1.5 p-[var(--size-margin-margin-lg)]">
        <p className="text-body-s text-[var(--color-text-text-subtle)]">{labels.progress(index + 1, steps.length)}</p>
        <h2 id={titleId} className="pe-8 text-heading-xs text-[var(--color-text-text)]">
          {current.title}
        </h2>
        {current.content && (
          <div id={bodyId} className="text-body-m text-[var(--color-text-text-subtle)]">
            {current.content}
          </div>
        )}
        <button
          type="button"
          onClick={skip}
          aria-label={labels.close}
          className={cn(
            'absolute end-3 top-3 flex size-7 cursor-pointer items-center justify-center rounded-[var(--size-border-radius-border-radius-md)]',
            'text-[var(--color-icon-icon-subtle)] outline-none hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] focus-visible:focus-ring',
          )}
        >
          <Xmark width={16} height={16} aria-hidden="true" />
        </button>
      </div>
      <div className="flex items-center gap-2 px-[var(--size-margin-margin-lg)] pb-[var(--size-margin-margin-lg)]">
        {!hideSkip && !isLast && (
          <Button size="sm" appearance="ghost" tone="neutral" onClick={skip} className="-ms-2">
            {labels.skip}
          </Button>
        )}
        <div className="ms-auto flex items-center gap-2">
          {!isFirst && (
            <Button size="sm" appearance="outlined" tone="neutral" onClick={() => goTo(index - 1)}>
              {labels.back}
            </Button>
          )}
          <Button size="sm" onClick={next}>
            {isLast ? labels.done : labels.next}
          </Button>
        </div>
      </div>
    </>
  );

  const dialogProps = {
    ref: cardRef,
    role: 'dialog' as const,
    'aria-modal': true,
    'aria-labelledby': titleId,
    'aria-describedby': current.content ? bodyId : undefined,
    tabIndex: -1,
    onKeyDown: onCardKeyDown,
  };

  const transition = 'transition-[top,left,width,height] duration-standard ease-enter motion-reduce:transition-none';

  return (
    <>
      {rect ? (
        <>
          {/* Click blockers around the hole; the hole itself blocks too unless the step is interactive. */}
          <div aria-hidden className="fixed inset-0 z-overlay" style={{ clipPath: current.interactive ? holePath(rect) : undefined }} />
          <div
            aria-hidden
            className={cn('pointer-events-none fixed z-overlay rounded-[var(--size-border-radius-border-radius-lg)] shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]', transition)}
            style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
          />
          <PopoverPrimitive.Root open modal={false}>
            <PopoverPrimitive.Anchor asChild>
              <div aria-hidden className="pointer-events-none fixed" style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }} />
            </PopoverPrimitive.Anchor>
            <PopoverPrimitive.Portal>
              <PopoverPrimitive.Content
                {...dialogProps}
                side={current.side ?? 'bottom'}
                align={current.align ?? 'center'}
                sideOffset={12}
                collisionPadding={16}
                updatePositionStrategy="always"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => {
                  e.preventDefault();
                  skip();
                }}
                className={cn(CARD, 'data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none!')}
              >
                {card}
              </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
          </PopoverPrimitive.Root>
        </>
      ) : (
        <div className="fixed inset-0 z-overlay flex items-center justify-center bg-[rgba(0,0,0,0.5)] p-4">
          <div {...dialogProps} className={cn(CARD, 'w-96')}>
            {card}
          </div>
        </div>
      )}
    </>
  );
}

/** Full-viewport clip path with the spotlight rect cut out (evenodd). */
function holePath({ top, left, width, height }: Rect) {
  const W = '100vw';
  // vh on purpose: the overlay must cover the LARGE viewport too, so no
  // strip of the page shows when the browser toolbar collapses.
  const H = '100vh';
  return `polygon(evenodd, 0 0, ${W} 0, ${W} ${H}, 0 ${H}, 0 0, ${left}px ${top}px, ${left}px ${top + height}px, ${left + width}px ${top + height}px, ${left + width}px ${top}px, ${left}px ${top}px)`;
}
