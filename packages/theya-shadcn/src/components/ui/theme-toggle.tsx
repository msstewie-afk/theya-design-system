'use client';

import { useState, useEffect } from 'react';
import { HalfMoon, SunLight } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { useTheme } from './use-theme';

/**
 * Flips light<->dark via `useTheme`. Icon only resolves after mount to
 * avoid an SSR/hydration flash showing the wrong icon before the real
 * data-theme attribute is read from the DOM.
 */
export function ThemeToggle({ className, ...props }: React.ComponentProps<'button'>) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'relative grid place-content-center size-[34px]',
        'rounded-[var(--size-border-radius-border-radius-md)]',
        'text-[var(--color-icon-icon-subtle)] cursor-pointer',
        'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] hover:text-[var(--color-icon-icon)]',
        'transition-colors duration-150 ease-out motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
        '[&>svg]:size-[18px]',
        className,
      )}
      {...props}
    >
      {isDark ? <SunLight /> : <HalfMoon />}
    </button>
  );
}
