'use client';

import { forwardRef, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { cn } from '../../lib/utils';
import { buttonVariants } from './button';
import { useTheyaI18n } from '../../lib/i18n';

/**
 * Floating action button — the one primary action of a screen, pinned to a
 * corner above the content.
 *
 * Two forms from one component: pass `label` for the extended FAB (icon +
 * text), leave it out for the round icon-only one (then `aria-label` is
 * required). With `collapseOnScroll`, the extended FAB folds into the round
 * one while the page scrolls down and unfolds on scroll up — the label
 * stays in the DOM, so the accessible name never changes.
 *
 * Colors, hover/pressed states, focus ring and disabled look all come from
 * Button's own `buttonVariants`, so a FAB always matches the Button of the
 * same tone/appearance. FAB-specific: pill/circle shape, elevation, larger
 * sizes, and padding = (height − icon) / 2 so the collapsed form is an exact
 * circle and only the label animates.
 *
 * Positioning is built in (`position`, fixed to the viewport, sticky layer,
 * safe-area aware). Layouts with a bottom bar set `--fab-offset-bottom` on
 * an ancestor to lift it above the bar; `position="none"` keeps it in flow.
 */
export type FabSize = 'sm' | 'md' | 'lg';
export type FabTone = 'primary' | 'secondary' | 'neutral';
export type FabAppearance = 'filled' | 'tonal';
export type FabPosition = 'bottom-end' | 'bottom-start' | 'bottom-center' | 'none';

const SIZE_CLASS: Record<FabSize, string> = {
  // 40px, 24px icon -> 8px padding
  sm: 'h-[var(--size-size-control-size-control-2xl)] px-[calc((var(--size-size-control-size-control-2xl)_-_var(--size-icon-icon-md))_/_2)] [&_svg]:size-[var(--size-icon-icon-md)] [font-size:var(--typography-button-m-size)] [line-height:var(--typography-button-m-line-height)]',
  // 56px, 24px icon -> 16px padding
  md: 'h-[var(--size-size-control-size-control-5xl)] px-[calc((var(--size-size-control-size-control-5xl)_-_var(--size-icon-icon-md))_/_2)] [&_svg]:size-[var(--size-icon-icon-md)] [font-size:var(--typography-button-l-size)] [line-height:var(--typography-button-l-line-height)]',
  // 64px, 32px icon -> 16px padding
  lg: 'h-[var(--size-size-control-size-control-6xl)] px-[calc((var(--size-size-control-size-control-6xl)_-_var(--size-icon-icon-lg))_/_2)] [&_svg]:size-[var(--size-icon-icon-lg)] [font-size:var(--typography-button-l-size)] [line-height:var(--typography-button-l-line-height)]',
};

// Extended form only: icon-to-label gap and extra trailing space. Padding
// is (height - icon) / 2 on both sides so the folded form is a circle, but
// text needs more room on its trailing side than an icon does — with equal
// padding the label read as pushed against the right edge (Мария,
// 2026-10-03). Rule (Мария): the gap between icon and label is always
// SMALLER than the side padding — inner spacing never matches or exceeds
// outer. Gaps follow Button's own 6px step; sm can't go higher, its leading
// padding is only 8px. Animates to 0 together with the label when folded.
const LABEL_SPACE_CLASS: Record<FabSize, string> = {
  sm: 'ms-1.5 me-1', // gap 6 < padding 8, trailing 8 + 4 = 12px
  md: 'ms-2 me-1', // gap 8 < padding 16, trailing 16 + 4 = 20px
  lg: 'ms-2 me-2', // gap 8 < padding 16, trailing 16 + 8 = 24px
};

// 16px from the edges on phones, 24px from sm up; plus the iOS home-indicator
// inset and whatever a bottom bar reserves via --fab-offset-bottom.
const POSITION_CLASS: Record<FabPosition, string> = {
  'bottom-end': 'fixed z-(--z-index-sticky) end-4 sm:end-6',
  'bottom-start': 'fixed z-(--z-index-sticky) start-4 sm:start-6',
  'bottom-center': 'fixed z-(--z-index-sticky) left-1/2 -translate-x-1/2',
  none: '',
};
const BOTTOM_OFFSET =
  'bottom-[calc(var(--fab-offset-bottom,0px)_+_1rem_+_env(safe-area-inset-bottom))] sm:bottom-[calc(var(--fab-offset-bottom,0px)_+_1.5rem_+_env(safe-area-inset-bottom))]';

export interface FabProps extends Omit<React.ComponentProps<'button'>, 'children'> {
  /** The action's icon. Always shown. */
  icon: ReactNode;
  /** Text for the extended FAB. Without it the FAB is round and icon-only (pass `aria-label`). */
  label?: ReactNode;
  /** sm 40px, md 56px (default), lg 64px. */
  size?: FabSize;
  tone?: FabTone;
  appearance?: FabAppearance;
  /** Where it's pinned. `none` renders it in normal flow. */
  position?: FabPosition;
  /** Fold the extended FAB to the round one while scrolling down, unfold on scroll up. */
  collapseOnScroll?: boolean;
  /** Scroll container to watch for `collapseOnScroll`. Defaults to the window. */
  scrollContainer?: RefObject<HTMLElement | null>;
  /** Force the folded state (controlled), e.g. collapse while a sheet is open. */
  collapsed?: boolean;
}

// Below this the page is considered "at the top" and the FAB stays open;
// smaller moves than this are ignored so trackpad jitter doesn't flicker it.
const TOP_ZONE = 16;
const MIN_DELTA = 8;

function useCollapseOnScroll(enabled: boolean, container?: RefObject<HTMLElement | null>) {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    if (!enabled) {
      setCollapsed(false);
      return;
    }
    const el = container?.current ?? null;
    const target: HTMLElement | Window = el ?? window;
    const readY = () => (el ? el.scrollTop : window.scrollY);
    let last = 0;
    const onScroll = () => {
      const y = readY();
      if (y <= TOP_ZONE) {
        setCollapsed(false);
        last = y;
        return;
      }
      if (Math.abs(y - last) < MIN_DELTA) return;
      setCollapsed(y > last);
      last = y;
    };
    target.addEventListener('scroll', onScroll, { passive: true });
    // Start from where the container already is: mounted (or the listener
    // attached) mid-page, the FAB starts collapsed instead of waiting for
    // the next scroll event.
    onScroll();
    return () => target.removeEventListener('scroll', onScroll);
  }, [enabled, container]);
  return collapsed;
}

export const Fab = forwardRef<HTMLButtonElement, FabProps>(function Fab(
  {
    icon,
    label,
    size = 'md',
    tone = 'primary',
    appearance = 'filled',
    position = 'bottom-end',
    collapseOnScroll = false,
    scrollContainer,
    collapsed: collapsedProp,
    className,
    type = 'button',
    ...props
  },
  ref,
) {
  const scrolledAway = useCollapseOnScroll(Boolean(label) && collapseOnScroll, scrollContainer);
  const folded = Boolean(label) && (collapsedProp ?? scrolledAway);

  if (process.env.NODE_ENV !== 'production' && !label && !props['aria-label'] && !props['aria-labelledby']) {
    console.warn('[Fab] An icon-only FAB needs an accessible name — pass aria-label (or a label).');
  }

  return (
    <button
      ref={ref}
      type={type}
      data-slot="fab"
      data-size={size}
      data-collapsed={label ? String(folded) : undefined}
      className={cn(
        buttonVariants({ appearance, tone, size: '2xl' }),
        SIZE_CLASS[size],
        // Circle when icon-only or folded, pill when extended.
        '[--btn-radius:var(--size-border-radius-border-radius-max)] [--btn-radius-pressed:var(--size-border-radius-border-radius-max)]',
        'gap-0 shadow-elevation-lg hover:not-disabled:shadow-elevation-xl',
        // Hover lift (Kinetics' Hover Lift, MIT): the FAB rises 4px as its shadow grows, on the
        // spring. Button's own transition list has no `translate`, so it's restated here.
        'hover:not-disabled:-translate-y-1 motion-reduce:hover:not-disabled:translate-y-0',
        '[transition:background-color_var(--transition-duration-standard)_var(--ease-enter),border-color_var(--transition-duration-standard)_var(--ease-enter),box-shadow_var(--transition-duration-slower)_var(--ease-spring),transform_220ms_var(--ease-spring),translate_var(--transition-duration-slower)_var(--ease-spring)]',
        position !== 'none' && POSITION_CLASS[position],
        position !== 'none' && BOTTOM_OFFSET,
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="inline-flex shrink-0">
        {icon}
      </span>
      {label && (
        <span
          className={cn(
            'overflow-hidden whitespace-nowrap',
            'transition-[max-width,opacity,margin] duration-200 ease-enter motion-reduce:transition-none',
            folded ? 'ms-0 me-0 max-w-0 opacity-0' : cn(LABEL_SPACE_CLASS[size], 'max-w-[16rem] opacity-100'),
          )}
        >
          {label}
        </span>
      )}
    </button>
  );
});

export interface FabSpeedDialAction {
  /** Accessible name (and the place to put a Tooltip if the icon isn't obvious). */
  label: string;
  icon: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
}

export interface FabSpeedDialProps {
  /** Two to five related actions. More than three stack in a column. */
  actions: FabSpeedDialAction[];
  /** The closed FAB's icon; it turns 45° into a close. Default: a plus. */
  icon?: ReactNode;
  /** Accessible names of the trigger. Default "Open actions" / "Close actions". */
  openLabel?: string;
  closeLabel?: string;
  size?: FabSize;
  tone?: FabTone;
  position?: FabPosition;
  className?: string;
}

const DIAL_RADIUS = 76;

/**
 * A FAB that opens a few related actions (Kinetics' Speed-Dial FAB, MIT): they fan out
 * on a staggered spring and the plus turns into a close. Up to three fan out in an arc
 * that leans away from the screen edge; more stack in a column above.
 *
 * Keyboard: the trigger is a button with aria-expanded; Tab moves through the actions;
 * Escape closes and returns focus to the trigger. Choosing an action, or pressing
 * outside, closes it. With reduced motion the actions simply appear.
 */
export function FabSpeedDial({ actions, icon, openLabel, closeLabel, size = 'md', tone = 'primary', position = 'bottom-end', className }: FabSpeedDialProps) {
  const { t } = useTheyaI18n();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Where each action sits relative to the trigger's centre (logical x: + is inline-end).
  const n = actions.length;
  const spot = (i: number) => {
    if (n > 3) return { x: 0, y: -(i + 1) * 56 };
    const [from, to] = position === 'bottom-end' ? [-90, 0] : position === 'bottom-start' ? [0, 90] : [-60, 60];
    const angle = n === 1 ? (from + to) / 2 : from + ((to - from) * i) / (n - 1);
    const rad = (angle * Math.PI) / 180;
    return { x: Math.round(Math.sin(rad) * DIAL_RADIUS), y: Math.round(-Math.cos(rad) * DIAL_RADIUS) };
  };

  return (
    <div
      ref={root}
      data-slot="fab-speed-dial"
      data-state={open ? 'open' : 'closed'}
      className={cn('relative inline-flex', position !== 'none' && POSITION_CLASS[position], position !== 'none' && BOTTOM_OFFSET, className)}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <Fab
        ref={trigger}
        position="none"
        size={size}
        tone={tone}
        aria-expanded={open}
        aria-controls={listId}
        aria-label={open ? (closeLabel ?? t.speedDial.close) : (openLabel ?? t.speedDial.open)}
        onClick={() => setOpen((v) => !v)}
        icon={<span className={cn('inline-flex transition-transform duration-slow ease-spring motion-reduce:transition-none', open && 'rotate-45')}>{icon ?? <PlusIcon />}</span>}
      />
      <div id={listId} role="group" className="contents">
        {actions.map((action, i) => {
          const { x, y } = spot(i);
          return (
            <span
              key={action.label}
              className={cn(
                'absolute top-[calc(50%-1.25rem)] left-[calc(50%-1.25rem)] transition-[translate,scale,opacity,visibility] duration-slower ease-spring motion-reduce:transition-none',
                'translate-x-(--dial-x) translate-y-(--dial-y) rtl:-translate-x-(--dial-x)',
                open ? 'visible opacity-100' : 'invisible scale-[.4] opacity-0',
              )}
              // Closed: no offset, so the actions shrink back into the trigger.
              style={{ '--dial-x': `${open ? x : 0}px`, '--dial-y': `${open ? y : 0}px`, transitionDelay: open ? `${i * 50}ms` : '0ms' } as CSSProperties}
            >
              <Fab
                position="none"
                size="sm"
                appearance="tonal"
                tone={tone}
                icon={action.icon}
                aria-label={action.label}
                disabled={action.disabled}
                tabIndex={open ? undefined : -1}
                onClick={() => {
                  action.onSelect?.();
                  setOpen(false);
                  trigger.current?.focus();
                }}
              />
            </span>
          );
        })}
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="1.5em" height="1.5em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
      <path d="M6 12h12M12 6v12" />
    </svg>
  );
}
