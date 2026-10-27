'use client';

import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import { useTheyaI18n } from '../../../lib/i18n';

export interface SiteHeaderProps extends ComponentProps<'header'> {
  /** The product mark, as a link to the home page. */
  logo: ReactNode;
  /** The site navigation, usually a MegaMenu (bar on wide screens, drawer below md). */
  nav?: ReactNode;
  /**
   * Buttons at the end: "Log in" and the main call to action. Hide the
   * secondary one on phones (`max-sm:hidden`) so the bar keeps one action.
   */
  actions?: ReactNode;
  /** Stays at the top while the page scrolls (default). */
  sticky?: boolean;
  /**
   * Id of the page's main content. Renders a "Skip to content" link as the
   * first stop in the Tab order, visible only when focused.
   */
  skipToId?: string;
}

/**
 * The top bar of a landing page: logo, navigation, actions. Over the hero it
 * is transparent; once the page scrolls it takes the surface color, a light
 * blur and a hairline, so the content passing under it stays out of the way.
 * On phones the navigation collapses to the MegaMenu's drawer button, moved
 * to the end of the bar.
 */
export function SiteHeader({ logo, nav, actions, sticky = true, skipToId, className, ...props }: SiteHeaderProps) {
  const { t } = useTheyaI18n();
  const sentinel = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  // A 1px sentinel above the bar: once it leaves the viewport, the page has
  // scrolled. No scroll listener, and it works inside any scroll container.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !sticky || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [sticky]);

  return (
    <>
      <div ref={sentinel} aria-hidden className="h-px" />
      <header
        data-slot="site-header"
        data-scrolled={scrolled || undefined}
        className={cn(
          'relative z-30 -mt-px border-b border-solid border-transparent',
          sticky && 'sticky top-0',
          'data-[scrolled]:border-[var(--color-border-border-subtler)] data-[scrolled]:bg-[color-mix(in_srgb,var(--color-bg-surface-bg-surface)_88%,transparent)] data-[scrolled]:backdrop-blur-md',
          'motion-safe:transition-[background-color,border-color] motion-safe:duration-200',
          className,
        )}
        {...props}
      >
        {skipToId && (
          <a
            href={`#${skipToId}`}
            // Parked above the viewport and slid in on focus (not sr-only, which
            // drops the padding and shrinks the target under 24px).
            className="absolute start-4 top-3 z-10 -translate-y-[calc(100%+1rem)] rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-surface-bg-surface)] px-4 py-2 font-body text-body-m font-medium text-[var(--color-text-text-link)] no-underline outline-none focus:translate-y-0 focus:shadow-elevation-md focus-visible:focus-ring"
          >
            {t.siteHeader.skipToContent}
          </a>
        )}
        <div className="container-display flex h-16 items-center gap-3 md:gap-6">
          <div data-slot="site-header-logo" className="flex shrink-0 items-center">
            {logo}
          </div>
          {/* Wide: the bar sits after the logo. Phone: only the drawer button is
              left, and it goes to the very end, after the actions. */}
          {nav && <div className="flex min-w-0 flex-1 items-center max-md:order-last max-md:flex-none">{nav}</div>}
          {actions && <div className="flex shrink-0 items-center gap-2 max-md:ms-auto">{actions}</div>}
        </div>
      </header>
    </>
  );
}
