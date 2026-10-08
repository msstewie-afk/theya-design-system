const warned = new Set<string>();

/**
 * Dev-only, once per key: tell the app that something it uses is
 * deprecated and what to use instead. Part of the deprecation policy in
 * RELEASING.md — always paired with a JSDoc `@deprecated` tag on the prop
 * or export and a changeset entry.
 *
 *   if (type !== undefined) warnDeprecated('Button type', 'use `appearance` instead.');
 */
export function warnDeprecated(key: string, message: string) {
  if (process.env.NODE_ENV === 'production' || warned.has(key)) return;
  warned.add(key);
  console.warn(`[Theya] ${key} is deprecated: ${message}`);
}
