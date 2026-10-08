'use client';

import { forwardRef } from 'react';
import { HalfMoon, SunLight } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { useTheme } from './use-theme';
import { useTheyaI18n } from '../../lib/i18n';

/**
 * Flips light<->dark via `useTheme`, which reads <html data-theme> on the
 * first render in the browser (and reports light during SSR/hydration,
 * then updates). The old "mounted" gate on top of that made the label and
 * icon say "light" for a frame on a dark page, so a click in that frame
 * switched to the theme that was already on.
 */
// forwardRef: a wrapper over a native control must pass refs through (focus
// by ref, Radix asChild triggers); a plain function drops them under React 18.
export const ThemeToggle = forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(function ThemeToggle({ className, ...props }, ref) {
  const { t } = useTheyaI18n();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      ref={ref}
      type="button"
      // Names the action, so it also says the current state: "Switch to
      // dark theme" means light is on. Was a static "Toggle theme" that
      // never told screen-reader users which theme was active.
      aria-label={isDark ? t.themeToggle.toLight : t.themeToggle.toDark}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'relative grid place-content-center size-[34px]',
        'rounded-[var(--size-border-radius-border-radius-md)]',
        'text-[var(--color-icon-icon-subtle)] cursor-pointer',
        'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] hover:text-[var(--color-icon-icon)]',
        'transition-colors duration-standard ease-enter motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:focus-ring',
        '[&>svg]:size-[18px]',
        className,
      )}
      {...props}
    >
      {isDark ? <SunLight /> : <HalfMoon />}
    </button>
  );
});
