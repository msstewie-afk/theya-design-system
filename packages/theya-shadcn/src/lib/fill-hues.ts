/**
 * Bright decorative fills for cards and panels (Maria, 3.11): a flat primitive hue at step 500
 * with white text, no photo, shadow, darkening or gradient. Every hue holds at least 4.7:1 with
 * white and is the same in both themes. Yellow is left out: white text fails on it.
 *
 * FILL_HUES is ordered so neighbours never blend: warm and cool alternate, and the two closest
 * hues (cyan, teal) sit apart. Cycle through it in order (fills[i % 8]); it also wraps cleanly,
 * so the last card in a ring sits next to the first without a clash.
 */
export const FILL_HUES = ['blue', 'orange', 'green', 'magenta', 'cyan', 'red', 'teal', 'purple'] as const;

export type FillHue = (typeof FILL_HUES)[number];

/** Background class per hue. */
export const FILL_HUE_BG: Record<FillHue, string> = {
  blue: 'bg-[var(--color-blue-blue-500)]',
  orange: 'bg-[var(--color-orange-orange-500)]',
  green: 'bg-[var(--color-green-green-500)]',
  magenta: 'bg-[var(--color-magenta-magenta-500)]',
  cyan: 'bg-[var(--color-cyan-cyan-500)]',
  red: 'bg-[var(--color-red-red-500)]',
  teal: 'bg-[var(--color-teal-teal-500)]',
  purple: 'bg-[var(--color-purple-purple-500)]',
};

/** Text on every fill: white at full strength (faded white fails contrast on some hues). */
export const FILL_HUE_INK = 'text-[var(--color-text-text-on-dark)]';

/** Background and text classes for the i-th card in a row or ring. */
export const fillHueAt = (i: number) => `${FILL_HUE_BG[FILL_HUES[i % FILL_HUES.length]]} ${FILL_HUE_INK}`;
