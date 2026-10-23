import { version } from 'react';

/**
 * `inert` as a JSX prop, for React 18 and 19 alike.
 *
 * React 18 doesn't know `inert` and passes it through as a string attribute,
 * so it needs `''` (a boolean `true` is dropped with a warning). React 19
 * treats it as a boolean and drops `''` as falsy — the element silently
 * stays focusable and in the accessibility tree. Spread the result:
 * `<div {...inertProps(!current)} />`.
 */
const INERT_VALUE: unknown = Number.parseInt(version, 10) >= 19 ? true : '';

export function inertProps(on: boolean): Record<string, unknown> {
  return on ? { inert: INERT_VALUE } : {};
}
