'use client';

import { forwardRef, createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { NavArrowLeft } from 'iconoir-react';
import { KebabIconHorizontal } from './kebab-icon';
import { cn } from '@/lib/utils';
import { useMediaQuery } from './use-media-query';
import { Drawer, DrawerContent, DrawerTitle } from './drawer';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from './dropdown-menu';
import type { StatusTone } from './status-dot';

/**
 * A collapsible rail (248px → 64px). Composition primitive: wrap your
 * app in SidebarProvider, render Sidebar + your main content.
 * Collapsed state persists in a cookie. On md+ it's a sticky rail;
 * below md it's a slide-over on our Drawer (vaul) — Esc,
 * focus-trap, scroll-lock, return-focus come from Radix.
 */
interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (v: boolean | ((p: boolean) => boolean)) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within <SidebarProvider>');
  return ctx;
}

export function SidebarProvider({ defaultCollapsed = false, children }: { defaultCollapsed?: boolean; children: ReactNode }) {
  const [collapsed, setCollapsedState] = useState(defaultCollapsed);
  const collapsedRef = useRef(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  const setCollapsed = useCallback((value: boolean | ((previous: boolean) => boolean)) => {
    const next = typeof value === 'function' ? value(collapsedRef.current) : value;
    collapsedRef.current = next;
    setCollapsedState(next);
    document.cookie = `theya-rail-collapsed=${next ? '1' : '0'}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  // The mobile slide-over's scroll-lock + scrim are gated on `open`, not
  // CSS — if the viewport widens to md+ while open, close it, or an
  // invisible scrim would lock scroll over the desktop UI.
  const isDesktop = useMediaQuery('(min-width: 768px)');
  useEffect(() => {
    if (isDesktop) setMobileOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    const stored = document.cookie
      .split('; ')
      .find((entry) => entry.startsWith('theya-rail-collapsed='))
      ?.split('=')[1];
    if (stored === '0' || stored === '1') {
      const next = stored === '1';
      collapsedRef.current = next;
      setCollapsedState(next);
    }
  }, []);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      <div
        data-collapsed={collapsed ? '' : undefined}
        style={{ '--rail-w': collapsed ? '64px' : 'var(--size-width-width-sidebar)' } as React.CSSProperties}
        className="contents"
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export interface SidebarProps extends React.ComponentProps<'aside'> {
  /**
   * Dark, inverse-color rail regardless of the page's own theme — sets
   * `data-theme="dark"` locally on the rail (and its mobile slide-over), so
   * it reuses the existing dark token set rather than a bespoke inverse
   * palette. Default false.
   */
  inverse?: boolean;
}

export function Sidebar({ inverse, className, children, ...props }: SidebarProps) {
  const ctx = useSidebar();
  const { mobileOpen, setMobileOpen } = ctx;
  return (
    <>
      <aside
        id="theya-sidebar-rail"
        data-theme={inverse ? 'dark' : undefined}
        className={cn(
          'sticky top-0 hidden h-svh w-[var(--rail-w)] flex-shrink-0 flex-col overflow-hidden md:flex',
          'border-r border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]',
          'transition-[width] duration-200 ease-out motion-reduce:transition-none',
          className,
        )}
        {...props}
      >
        {children}
      </aside>

      <Drawer direction="left" open={mobileOpen} onOpenChange={setMobileOpen}>
        <DrawerContent aria-describedby={undefined} className="data-[vaul-drawer-direction=left]:w-[15.5rem] data-[vaul-drawer-direction=left]:max-w-[88vw] md:hidden">
          <DrawerTitle className="sr-only">Navigation</DrawerTitle>
          <div data-theme={inverse ? 'dark' : undefined} className="flex h-full flex-col bg-[var(--color-bg-surface-bg-surface)]">
            <SidebarContext.Provider value={{ ...ctx, collapsed: false }}>{children}</SidebarContext.Provider>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  const { collapsed } = useSidebar();
  return <div className={cn('flex h-14 items-center gap-2.5 px-3.5', collapsed && 'justify-center px-0', className)} {...props} />;
}

/**
 * Collapse and Expand are two different buttons (the collapse chevron
 * unmounts, the brand mark becomes the expand button), so toggling
 * unmounted the focused control and focus fell to <body>. Hand focus to
 * the other toggle once the swap has rendered.
 */
function focusOtherToggle(from: HTMLElement) {
  const scope = from.closest<HTMLElement>('#theya-sidebar-rail') ?? from.ownerDocument;
  requestAnimationFrame(() => scope.querySelector<HTMLElement>('[data-sidebar-toggle]')?.focus());
}

export function SidebarBrand({ className, children, ...props }: React.ComponentProps<'div'>) {
  const { collapsed, setCollapsed } = useSidebar();
  const mark = (
    <span
      aria-hidden="true"
      className="grid size-[1.875rem] shrink-0 place-content-center rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-primary-bg-primary)] text-[var(--color-icon-icon-on-dark)] shadow-sm"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    </span>
  );

  // Collapsed: the 64px rail fits one header element, so the brand mark
  // doubles as "Expand sidebar" — always-reachable way out of the
  // collapsed state (WCAG 2.1.1), important since it's cookie-persisted.
  if (collapsed) {
    return (
      <button
        type="button"
        aria-label="Expand sidebar"
        aria-expanded={false}
        aria-controls="theya-sidebar-rail"
        title="Expand sidebar"
        data-sidebar-toggle
        onClick={(event) => {
          setCollapsed(false);
          focusOtherToggle(event.currentTarget);
        }}
        className={cn(
          'mx-auto rounded-[var(--size-border-radius-border-radius-lg)] outline-none',
          'hover:shadow-[0_0_0_2px_var(--color-border-border-default)]',
          'focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
          className,
        )}
      >
        {mark}
      </button>
    );
  }

  return (
    <div className={cn('flex min-w-0 items-center gap-2.5', className)} {...props}>
      {mark}
      <span className="truncate font-body text-body-m font-semibold text-[var(--color-text-text)]">{children}</span>
    </div>
  );
}

// forwardRef: a wrapper over a native control must pass refs through (focus
// by ref, Radix asChild triggers); a plain function drops them under React 18.
export const SidebarCollapse = forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(function SidebarCollapse({ className, ...props }, ref) {
  const { collapsed, setCollapsed } = useSidebar();
  if (collapsed) return null;
  return (
    <button
      ref={ref}
      type="button"
      aria-label="Collapse sidebar"
      aria-expanded
      aria-controls="theya-sidebar-rail"
      data-sidebar-toggle
      onClick={(event) => {
        setCollapsed(true);
        focusOtherToggle(event.currentTarget);
      }}
      className={cn(
        'ml-auto grid size-7 place-content-center rounded-[var(--size-border-radius-border-radius-md)] text-[var(--color-icon-icon-subtle)] max-md:hidden',
        'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] hover:text-[var(--color-icon-icon)]',
        'focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
        className,
      )}
      {...props}
    >
      <NavArrowLeft width={16} height={16} aria-hidden="true" />
    </button>
  );
});

export function SidebarNav({ className, 'aria-label': ariaLabel = 'Main', ...props }: React.ComponentProps<'nav'>) {
  return <nav aria-label={ariaLabel} className={cn('flex-1 overflow-y-auto px-3 py-1', className)} {...props} />;
}

export function SidebarSection({
  label,
  action,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & { label?: string; action?: ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <div className={className} {...props}>
      {label && !collapsed && (
        <div className="flex items-center gap-1 px-2 pb-1.5 pt-3.5">
          <span className="flex-1 truncate font-body text-body-s font-semibold uppercase tracking-[0.07em] text-[var(--color-text-text-subtler)]">
            {label}
          </span>
          {action}
        </div>
      )}
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

// Same tone vocabulary as Badge/StatusDot — a Sidebar item's own badge is a
// tiny status pill (notification/message count, etc.), so it takes the
// canonical StatusTone set rather than inventing a separate one.
// Dark theme: the -subtle pills are light alpha tints, and the mid-tone
// status text on them fell under 4.5:1 (success 3.59, warning 3.74 on
// bg-surface) — same fix as Button's tonal variants (2026-09-27): the
// palest ramp step, i.e. M3's "on-container" text.
const BADGE_TONE_CLASS: Record<StatusTone, string> = {
  neutral: 'bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-[var(--color-text-text-subtler)]',
  primary: 'bg-[var(--color-bg-primary-bg-primary-subtle)] text-[var(--color-text-text-link-on-tonal)] [[data-theme=dark]_&]:text-[var(--color-text-text-on-dark)]',
  success: 'bg-[var(--color-bg-success-bg-success-subtle)] text-[var(--color-text-text-success)] [[data-theme=dark]_&]:text-[var(--color-green-green-010)]',
  warning: 'bg-[var(--color-bg-warning-bg-warning-subtle)] text-[var(--color-text-text-warning)] [[data-theme=dark]_&]:text-[var(--color-orange-orange-005)]',
  danger: 'bg-[var(--color-bg-danger-bg-danger-subtle)] text-[var(--color-text-text-danger)] [[data-theme=dark]_&]:text-[var(--color-red-red-050)]',
  info: 'bg-[var(--color-bg-info-bg-info-subtle)] text-[var(--color-text-text-info)]',
};

export interface SidebarItemProps extends React.ComponentProps<'a'> {
  icon?: ReactNode;
  badge?: ReactNode;
  /** Tone for the badge pill (e.g. a notification count). Default 'neutral'. */
  badgeTone?: StatusTone;
  /** DropdownMenuItem(s) for a hover-revealed "more actions" trigger. Omit for no trigger. Hidden when the rail is collapsed. */
  actions?: ReactNode;
  active?: boolean;
}

export function SidebarItem({ icon, badge, badgeTone = 'neutral', actions, active, className, children, onClick, ...props }: SidebarItemProps) {
  const { collapsed, setMobileOpen } = useSidebar();
  // An <a> with no href isn't focusable and has no link role, so onClick-only
  // items were unreachable from the keyboard. Without href it's a button.
  const Comp = (props.href != null ? 'a' : 'button') as 'a';
  const link = (
    <Comp
      {...(props.href == null ? ({ type: 'button' } as Record<string, string>) : {})}
      aria-current={active ? 'page' : undefined}
      onClick={(e) => {
        setMobileOpen(false);
        onClick?.(e);
      }}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-[var(--size-border-radius-border-radius-md)] px-2.5 py-2 text-left',
        'font-body text-body-m font-medium text-[var(--color-text-text-subtler)] whitespace-nowrap cursor-pointer',
        'transition-colors duration-150 ease-out motion-reduce:transition-none',
        'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] hover:text-[var(--color-text-text)]',
        'focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
        active && 'bg-[var(--color-bg-primary-bg-primary-subtle)] text-[var(--color-text-text-link-on-tonal)]',
        '[&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:opacity-90',
        collapsed && 'mx-auto size-[1.875rem] justify-center p-0',
        className,
      )}
      {...props}
    >
      {icon}
      <span className={cn('flex-1', collapsed && 'sr-only')}>{children}</span>
      {!collapsed && badge != null && (
        <span
          className={cn(
            'ml-auto rounded-full px-1.5 py-px font-body text-body-xs font-semibold transition-opacity duration-150',
            BADGE_TONE_CLASS[badgeTone],
            // On the active row the pill's translucent tint stacked on the
            // row's own primary tint and sank to 2.92:1 in dark (axe
            // color-contrast, Sidebar/Inverse, 2026-09-28). An opaque
            // surface-colored "cut-out" pill keeps every tone >= its idle
            // contrast in both themes.
            active && 'bg-[var(--color-bg-surface-bg-surface)]',
            actions && 'group-hover/item:opacity-0 group-focus-within/item:opacity-0',
          )}
        >
          {badge}
        </span>
      )}
    </Comp>
  );

  // No actions (or collapsed, where there's no room for a trailing trigger):
  // just the plain link, same as before.
  if (collapsed || !actions) return link;

  // With actions: the trigger is a sibling <button>, never nested inside the
  // <a> — an anchor can't validly contain interactive content (the same
  // constraint FilterField's chips and Chip/ChipRemove work around). It's
  // absolutely positioned over the link's trailing edge, hidden until the row
  // is hovered/focused or the menu itself is open (data-[state=open]).
  return (
    <div className="group/item relative">
      {link}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="More actions"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'absolute right-1.5 top-1/2 -translate-y-1/2 grid size-6 place-content-center',
              'rounded-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-surface-bg-surface)]',
              'text-[var(--color-text-text)] opacity-0 outline-none',
              'group-hover/item:opacity-100 group-focus-within/item:opacity-100 data-[state=open]:opacity-100',
              'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
              'focus-visible:opacity-100 focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
            )}
          >
            <KebabIconHorizontal />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" size="sm">
          {actions}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('p-3', className)} {...props} />;
}
