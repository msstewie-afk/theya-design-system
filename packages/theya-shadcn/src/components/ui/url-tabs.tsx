'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs } from './tabs';

/**
 * URL-aware tabs — keeps a Tabs value in a URL query param so a tab is
 * deep-linkable, shareable and survives reload/back. Framework-
 * agnostic: reads/writes via the History API by default; pass a
 * `navigate` adapter for full router integration.
 */
export type UrlTabsNavigate = (url: string) => void;

function readParam(param: string, defaultValue?: string): string {
  if (typeof window === 'undefined') return defaultValue ?? '';
  return new URLSearchParams(window.location.search).get(param) ?? defaultValue ?? '';
}

export function useUrlTabs(param = 'tab', defaultValue?: string, navigate?: UrlTabsNavigate) {
  const [value, setValue] = useState(defaultValue ?? '');

  useEffect(() => {
    const sync = () => setValue(readParam(param, defaultValue));
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, [param, defaultValue]);

  const onValueChange = useCallback(
    (next: string) => {
      setValue(next || defaultValue || '');
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      if (!next || next === defaultValue) params.delete(param);
      else params.set(param, next);
      const qs = params.toString();
      const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
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
  ...props
}: Omit<React.ComponentProps<typeof Tabs>, 'value' | 'onValueChange'> & {
  param?: string;
  navigate?: UrlTabsNavigate;
}) {
  const { value, onValueChange } = useUrlTabs(param, defaultValue, navigate);
  return <Tabs {...props} value={value} onValueChange={onValueChange} />;
}
