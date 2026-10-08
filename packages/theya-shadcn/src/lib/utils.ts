import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Standard `twMerge` doesn't know about Theya's custom composite
 * text-style scale (`text-body-s`, `text-heading-xl`, etc. — defined
 * in globals.css via `--text-*` in @theme). Because it's not part of
 * Tailwind's default config, twMerge misclassifies these into the
 * `text-color` group and silently drops them when they collide with
 * a `text-[var(--color-...)]` class on the same element.
 *
 * Fix: explicitly register these tokens under the `font-size`
 * classGroup so twMerge treats size and color as separate,
 * non-conflicting groups — matching how Tailwind itself compiles them.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // Theya's @utility focus rings (globals.css) set box-shadow, so they
      // belong to twMerge's `shadow` group: a later shadow-* on the same
      // variant (an invalid-state ring, a per-tone ring) replaces them,
      // exactly as it replaced the arbitrary shadow-[...] they stand for.
      shadow: [
        'focus-ring',
        'focus-ring-error',
        'focus-ring-success',
        'focus-ring-warning',
        'focus-ring-on-primary',
        'focus-ring-inset',
      ],
      'font-size': [
        {
          text: [
            'body-xs',
            'body-s',
            'body-m',
            'body-l',
            'body-xl',
            'heading-3xs',
            'heading-2xs',
            'heading-xs',
            'heading-s',
            'heading-m',
            'heading-l',
            'heading-xl',
            'heading-2xl',
            'heading-3xl',
          ],
        },
      ],
    },
  },
});

/**
 * Standard shadcn/ui helper — merges Tailwind classes safely (later
 * classes win over earlier conflicting ones) and drops falsy values.
 * Needed by every shadcn-pattern component going forward.
 *
 * Requires: npm i clsx tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
