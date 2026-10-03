'use client';

import { forwardRef, useState, useEffect } from 'react';
import { HalfMoon, SunLight } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { useTheme } from './use-theme';

/**
 * Flips light<->dark via `useTheme`. Icon only resolves after mount to
 * avoid an SSR/hydration flash showing the wrong icon before the real
 * data-theme attribute is read from the DOM.
 */
// forwardRef: a wrapper over a native control must pass refs through (focus
// by ref, Radix asChild triggers); a plain function drops them under React 18.
export const ThemeToggle = forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(function ThemeToggle({ className, ...props }, ref) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      ref={ref}
      type="button"
      // Names the action, so it also says the current state: "Switch to
      // dark theme" means light is on. Was a static "Toggle theme" that
      // never told screen-reader users which theme was active.
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
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
