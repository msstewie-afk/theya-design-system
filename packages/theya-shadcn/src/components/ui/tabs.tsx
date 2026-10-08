'use client';

import { forwardRef, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { Xmark } from 'iconoir-react';
import { cn } from '../../lib/utils';

/**
 * Underline-style tabs on @radix-ui/react-tabs. The active tab is marked
 * by two signals — the underline's border-color swap and a text-color
 * swap — no background fill by default, so a busy tablist (icons, badges,
 * a close button) doesn't compete with its own active-state fill.
 */
export const Tabs = TabsPrimitive.Root;

export interface TabsListProps extends React.ComponentProps<typeof TabsPrimitive.List> {
  /**
   * `underline` (default): tabs over a hairline, the active one underlined.
   * `chips`: segmented tabs on a soft track; a raised pill marks the active tab and
   * springs to the tab under the mouse (Kinetics' Snap Rail, MIT).
   */
  variant?: 'underline' | 'chips';
}

export function TabsList({ className, children, variant = 'underline', onPointerOver, onPointerLeave, ...props }: TabsListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState<{ left: number; width: number } | null>(null);
  const [hovered, setHovered] = useState<HTMLElement | null>(null);
  const chips = variant === 'chips';
  const measureRef = useRef<() => void>(() => {});

  // One marker that glides to the active tab and takes its width (Kinetics' Tab Pill
  // Glide, MIT): an underline, or for chips a pill. Measured after layout and again when
  // a tab becomes active or any tab changes size. Until it is measured (server render,
  // first paint) the active tab keeps its own marker, so tabs never render without one.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => measure());
    const measure = () => {
      // observe() is a no-op for elements already observed, so tabs added later are picked up too.
      list.querySelectorAll(':scope > [role="tab"]').forEach((tab) => resize?.observe(tab));
      const target = (hoveredRef.current?.isConnected ? hoveredRef.current : null) ?? list.querySelector<HTMLElement>(':scope > [role="tab"][data-state="active"]');
      const next = target ? { left: target.offsetLeft, width: target.offsetWidth } : null;
      setBar((prev) => (prev && next && prev.left === next.left && prev.width === next.width ? prev : next));
    };
    measureRef.current = measure;
    resize?.observe(list);
    measure();
    const mutations = new MutationObserver(measure);
    mutations.observe(list, { subtree: true, attributes: true, attributeFilter: ['data-state'], childList: true });
    return () => {
      mutations.disconnect();
      resize?.disconnect();
    };
  }, []);

  // Chips: the pill previews the tab under the mouse (not for touch or keyboard).
  const hoveredRef = useRef<HTMLElement | null>(null);
  hoveredRef.current = hovered;
  useLayoutEffect(() => measureRef.current(), [hovered]);

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-glide={bar ? '' : undefined}
      data-variant={variant}
      onPointerOver={(event) => {
        onPointerOver?.(event);
        if (!chips || event.pointerType !== 'mouse') return;
        const tab = (event.target as HTMLElement).closest<HTMLElement>('[role="tab"]:not([aria-disabled="true"])');
        if (tab && tab.parentElement === listRef.current) setHovered(tab);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        setHovered(null);
      }}
      className={cn(
        'relative flex overflow-x-auto overflow-y-hidden',
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        chips
          ? 'w-fit max-w-full rounded-full bg-[var(--color-bg-neutral-bg-neutral-subtle)] p-1'
          : 'gap-0.5 border-b border-solid border-[var(--color-border-border-subtler)]',
        className,
      )}
      {...props}
    >
      {bar && (
        <span
          aria-hidden="true"
          data-slot="tabs-indicator"
          className={cn(
            'pointer-events-none absolute motion-reduce:transition-none',
            chips
              ? 'top-1 bottom-1 rounded-full bg-[var(--color-bg-surface-bg-surface)] shadow-elevation-sm transition-[left,width] duration-slower ease-spring forced-colors:border forced-colors:border-solid forced-colors:border-[Highlight]'
              : 'bottom-0 h-0.5 rounded-full bg-[var(--color-border-border-primary)] transition-[left,width] duration-slow ease-glide forced-colors:bg-[Highlight]',
          )}
          // offsetLeft is physical in both directions, so `left` (not `inset-inline-start`).
          style={{ left: bar.left, width: bar.width }}
        />
      )}
      {children}
    </TabsPrimitive.List>
  );
}

/**
 * Radix's TabsPrimitive.Trigger hardcodes `type="button"` and the raw
 * `disabled` boolean attribute onto whatever it renders, assuming a real
 * <button>. We render onto a <div role="tab"> instead (a tab can't validly
 * nest another interactive control — see `onClose` below), so those two
 * attributes land on the div as invalid HTML — and on a disabled trigger,
 * gave axe's nested-interactive rule a div that reads as both a native
 * button-like element (type+disabled) AND an explicit role="tab" widget at
 * once (audit finding, 2026-09-27). This shim intercepts Radix's merged
 * props and drops both, expressing disabled the ARIA-correct way
 * (aria-disabled) instead — `data-disabled` (used for our own styling) and
 * everything else Radix sets pass through untouched.
 */
const TabsTriggerDiv = forwardRef<HTMLDivElement, React.ComponentProps<'div'> & { type?: string; disabled?: boolean }>(
  function TabsTriggerDiv({ type: _type, disabled, ...props }, ref) {
    return <div ref={ref} aria-disabled={disabled || undefined} {...props} />;
  },
);

export interface TabsTriggerProps extends React.ComponentProps<typeof TabsPrimitive.Trigger> {
  /** Icon shown before the label. */
  icon?: ReactNode;
  /**
   * Makes the tab closable, following the WAI-ARIA APG "deletable tabs"
   * pattern: a pointer-only "×" after the trigger's content, and the
   * Delete / Backspace key on the focused tab for keyboard users
   * (announced via aria-keyshortcuts).
   *
   * The "×" is deliberately NOT a focusable button: role="tab" has
   * presentational children, so any focusable control inside it is
   * invisible to screen readers and fails axe's nested-interactive
   * (it did, until 2026-09-27). It can't sit next to the tab either —
   * role="tablist" may only own tabs. After a keyboard close, focus moves
   * to the neighbouring tab so it isn't dropped on <body>.
   */
  onClose?: (event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void;
  /** Tooltip for the pointer "×" (e.g. "Close Draft 1"). Screen readers get the Delete shortcut instead. */
  closeLabel?: string;
}

export function TabsTrigger({ className, icon, onClose, closeLabel, children, onKeyDown, ...props }: TabsTriggerProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (!onClose || event.defaultPrevented) return;
    if (event.key !== 'Delete' && event.key !== 'Backspace') return;
    event.preventDefault();
    const current = event.currentTarget as HTMLElement;
    const tabs = Array.from(
      current.closest('[role="tablist"]')?.querySelectorAll<HTMLElement>('[role="tab"]:not([aria-disabled="true"])') ?? [],
    );
    const index = tabs.indexOf(current);
    const neighbour = tabs[index + 1] ?? tabs[index - 1];
    onClose(event);
    requestAnimationFrame(() => neighbour?.isConnected && neighbour.focus());
  };

  return (
    <TabsPrimitive.Trigger
      asChild
      aria-keyshortcuts={onClose ? 'Delete Backspace' : undefined}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <TabsTriggerDiv
        className={cn(
          '-mb-px inline-flex shrink-0 items-center gap-1.5 cursor-pointer',
          'rounded-t-[var(--size-border-radius-border-radius-md)] border-b-2 border-solid border-transparent',
          'px-3 py-2.5 font-body text-body-m font-medium text-[var(--color-text-text-subtler)]',
          'transition-[background-color,color,border-color] duration-standard ease-enter motion-reduce:transition-none',
          'data-[state=inactive]:hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] data-[state=inactive]:hover:text-[var(--color-text-text)]',
          // text-link is now blue-200 (the same saturated primary used by
          // Button/Ghost's own text color) — text-link-on-tonal (blue-100)
          // is the dedicated lighter tone for text on a tonal/tinted bg.
          'data-[state=active]:border-[var(--color-border-border-primary)] data-[state=active]:text-[var(--color-text-text-link)]',
          // Once the list's gliding underline is measured it marks the active tab instead.
          '[[data-glide]>&]:data-[state=active]:border-transparent',
          // Chips variant: a pill-shaped tab above the list's gliding pill (drawn before the tabs).
          '[[data-variant=chips]>&]:relative [[data-variant=chips]>&]:mb-0 [[data-variant=chips]>&]:rounded-full [[data-variant=chips]>&]:border-b-0 [[data-variant=chips]>&]:px-3 [[data-variant=chips]>&]:py-1.5',
          '[[data-variant=chips]>&]:data-[state=inactive]:hover:bg-transparent [[data-variant=chips]>&]:data-[state=active]:text-[var(--color-text-text)]',
          // Until the pill is measured, the active chip carries its own.
          '[[data-variant=chips]:not([data-glide])>&]:data-[state=active]:bg-[var(--color-bg-surface-bg-surface)] [[data-variant=chips]:not([data-glide])>&]:data-[state=active]:shadow-elevation-sm',
          'focus-visible:outline-none focus-visible:focus-ring',
          // Disabled: no opacity-based dimming on the whole element — the
          // parent's opacity would multiply straight through the text
          // color, and axe flagged the resulting blend as under AA's
          // 4.5:1 (color-contrast, 2026-09-27; role="tab" isn't a native
          // form control, so it never got axe's native-disabled exemption
          // either). Text goes to a dedicated, flatly-lighter-but-still-
          // compliant tone (4.66:1 on white) instead; only the icon (which
          // only needs 3:1) still dims via opacity.
          'data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:text-[var(--color-text-text-disabled)] data-[disabled]:[&_svg]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
          className,
        )}
      >
        {icon}
        {children}
        {onClose && (
          <span
            aria-hidden="true"
            title={closeLabel}
            // Keep the click from also activating the tab underneath.
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onClose(event);
            }}
            className={cn(
              'grid size-4 shrink-0 cursor-pointer place-content-center rounded-[var(--size-border-radius-border-radius-sm)]',
              'text-[var(--color-icon-icon-subtle)]',
              'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] hover:text-[var(--color-icon-icon)]',
            )}
          >
            <Xmark width={12} height={12} aria-hidden="true" />
          </span>
        )}
      </TabsTriggerDiv>
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(
        'outline-none focus-visible:focus-ring rounded-[var(--size-border-radius-border-radius-md)]',
        className,
      )}
      {...props}
    />
  );
}
