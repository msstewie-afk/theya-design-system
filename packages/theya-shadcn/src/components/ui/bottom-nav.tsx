'use client';

import { Children, useRef, type ReactNode } from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils';
import { useScrollPadding } from '../../lib/scroll-padding';
import { useTheyaI18n } from '../../lib/i18n';
import { BadgeIndicator } from './badge-indicator';

/**
 * The tab bar at the bottom of a phone screen: 3–5 top-level destinations,
 * each an icon with a label.
 *
 * - Every item has a visible label: there is no icon-only variant (an icon
 *   alone is ambiguous at a glance and gives a weaker target).
 * - The current item gets `aria-current="page"` and is marked by more than
 *   color (WCAG 1.4.1): a semibold label and a tonal pill behind the icon.
 * - `badge` puts a count (or `true` for a dot) on the icon; the count is
 *   folded into the item's accessible name ("Inbox, 3 new").
 * - Pads itself by `env(safe-area-inset-bottom)` for the iPhone home
 *   indicator, and reserves its height as scroll padding so Tab-focused
 *   content never sits under it (WCAG 2.4.11).
 * - `position="fixed"` (default) pins it to the viewport; `sticky` keeps it
 *   at the bottom of its scroll container.
 */
export interface BottomNavProps extends React.ComponentProps<'nav'> {
  /** `fixed` (default) pins it to the viewport; `sticky` to the bottom of its scroll container. */
  position?: 'fixed' | 'sticky';
  /** Landmark name. Default "Main". */
  'aria-label'?: string;
}

export function BottomNav({ position = 'fixed', className, children, 'aria-label': ariaLabel, ...props }: BottomNavProps) {
  const { t } = useTheyaI18n();
  const ref = useRef<HTMLElement>(null);
  useScrollPadding(ref, 'bottom');
  if (process.env.NODE_ENV !== 'production') {
    const n = Children.toArray(children).length;
    if (n < 3 || n > 5) {
      console.warn(`BottomNav: ${n} items. A bottom bar holds 3–5 destinations; with 2 use Tabs, with more than 5 move the rest into a "More" item or a Sidebar.`);
    }
  }
  return (
    <nav
      ref={ref}
      aria-label={ariaLabel ?? t.bottomNav.label}
      data-slot="bottom-nav"
      className={cn(
        position === 'fixed' ? 'fixed inset-x-0' : 'sticky',
        'bottom-0 z-(--z-index-sticky)',
        'border-t border-solid border-[var(--color-border-border-subtler)] bg-[var(--color-bg-surface-bg-surface)] pb-[env(safe-area-inset-bottom)]',
        className,
      )}
      {...props}
    >
      <ul className="mx-auto flex w-full max-w-[40rem] items-stretch px-2">{children}</ul>
    </nav>
  );
}

export interface BottomNavItemProps extends Omit<React.ComponentProps<'a'>, 'children'> {
  /** The icon (24px). Decorative: the label names the item. */
  icon: ReactNode;
  /** Visible label, one or two short words. Required: there is no icon-only item. */
  label: ReactNode;
  /** The current destination: `aria-current="page"`, semibold label, tonal pill. */
  active?: boolean;
  /** A count on the icon (over 99 shows "99+"), or `true` for a dot. */
  badge?: number | boolean;
  /**
   * Render your router's link instead of an `<a>`: pass it as the only child
   * with no children of its own, e.g. `<BottomNavItem asChild …><Link to="/inbox" /></BottomNavItem>`.
   */
  asChild?: boolean;
  children?: ReactNode;
}

export function BottomNavItem({ icon, label, active = false, badge, asChild = false, className, children, ...props }: BottomNavItemProps) {
  const { t } = useTheyaI18n();
  // An <a> without href isn't focusable and has no link role: without href it's a button.
  const Comp = (asChild ? Slot : props.href != null ? 'a' : 'button') as 'a';
  const count = typeof badge === 'number' && badge > 0 ? badge : undefined;
  const dot = badge === true;

  return (
    <li className="flex min-w-0 flex-1">
      <Comp
        {...(!asChild && props.href == null ? ({ type: 'button' } as Record<string, string>) : {})}
        aria-current={active ? 'page' : undefined}
        data-active={active || undefined}
        className={cn(
          'group flex w-full min-w-0 cursor-pointer flex-col items-center gap-1 px-1 py-2',
          'rounded-[var(--size-border-radius-border-radius-md)] outline-none focus-visible:focus-ring-inset',
          'font-body text-body-xs leading-4 text-[var(--color-text-text-subtler)]',
          'transition-colors duration-standard ease-enter motion-reduce:transition-none',
          'hover:text-[var(--color-text-text)]',
          active && 'font-semibold text-[var(--color-text-text)]',
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          data-slot="bottom-nav-indicator"
          className={cn(
            'relative flex h-8 w-14 shrink-0 items-center justify-center rounded-full',
            'text-[var(--color-icon-icon-subtle)] transition-colors duration-standard ease-enter motion-reduce:transition-none',
            '[&_svg]:size-6 [&_svg]:shrink-0',
            active
              ? 'bg-[var(--color-bg-primary-bg-primary-subtle)] text-[var(--color-text-text-link-on-tonal)] forced-colors:forced-color-adjust-none forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]'
              : 'group-hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] group-hover:text-[var(--color-text-text)]',
          )}
        >
          {icon}
          {(count !== undefined || dot) && (
            // Cut out of whatever is behind it by a ring in the surface color. The badge stays on
            // the right of the icon in RTL too (Мария, 2026-10-31): it is not mirrored.
            <BadgeIndicator
              tone="danger"
              dot={dot}
              value={count !== undefined ? (count > 99 ? '99+' : String(count)) : undefined}
              className={cn(
                'absolute ring-2 ring-[var(--color-bg-surface-bg-surface)]',
                dot ? 'top-1 start-[calc(50%+6px)] rtl:start-auto rtl:end-[calc(50%+6px)]' : 'top-0 start-[calc(50%+4px)] rtl:start-auto rtl:end-[calc(50%+4px)]',
              )}
            />
          )}
        </span>
        {/* The badge text sits inside the label span, so the name reads "Inbox, 3 new" (Chrome puts a space before the comma; screen readers don't voice it). */}
        <span className="block max-w-full truncate">
          {label}
          {(count !== undefined || dot) && <span className="sr-only">, {count !== undefined ? t.bottomNav.count(count) : t.bottomNav.dot}</span>}
        </span>
        {asChild && <Slottable>{children}</Slottable>}
      </Comp>
    </li>
  );
}
