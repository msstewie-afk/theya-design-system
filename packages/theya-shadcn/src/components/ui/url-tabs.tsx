'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs } from './tabs';

/**
 * URL-aware tabs — keeps a Tabs value in a URL query param so a tab is
 * deep-linkable, shareable and survives reload/back. Framework-
 * agnostic: reads/writes via the History API by default; pass a
 * `navigate` adapter for full router integration.
 *
 * Writes use replaceState, not pushState: Radix Tabs activate on arrow
 * keys, so pushState would add a history entry per keypress. Pass `values`
 * (the valid tab values) so a stale or mistyped `?tab=` falls back to
 * `defaultValue` instead of selecting nothing and showing no panel.
 */
export type UrlTabsNavigate = (url: string) => void;

function readParam(param: string, defaultValue?: string, values?: readonly string[]): string {
  if (typeof window === 'undefined') return defaultValue ?? '';
  const raw = new URLSearchParams(window.location.search).get(param);
  if (raw == null || (values && !values.includes(raw))) return defaultValue ?? '';
  return raw;
}

export function useUrlTabs(param = 'tab', defaultValue?: string, navigate?: UrlTabsNavigate, values?: readonly string[]) {
  const [value, setValue] = useState(defaultValue ?? '');
  // Joined so an inline array literal doesn't re-run the effect each render.
  const valuesKey = values?.join('\u0000');

  useEffect(() => {
    const sync = () => setValue(readParam(param, defaultValue, values));
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param, defaultValue, valuesKey]);

  const onValueChange = useCallback(
    (next: string) => {
      setValue(next || defaultValue || '');
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      if (!next || next === defaultValue) params.delete(param);
      else params.set(param, next);
      const qs = params.toString();
      // Keep the #fragment: it used to be dropped on every tab change.
      const url = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
      if (navigate) navigate(url);
      else window.history.replaceState(null, '', url);
    },
    [param, defaultValue, navigate],
  );

  return { value, onValueChange };
}

export function UrlTabs({
  param = 'tab',
  defaultValue,
  navigate,
  values,
  ...props
}: Omit<React.ComponentProps<typeof Tabs>, 'value' | 'onValueChange'> & {
  param?: string;
  navigate?: UrlTabsNavigate;
  /** Valid tab values. An unknown `?tab=` then falls back to defaultValue. */
  values?: readonly string[];
}) {
  const { value, onValueChange } = useUrlTabs(param, defaultValue, navigate, values);
  return <Tabs {...props} value={value} onValueChange={onValueChange} />;
}
