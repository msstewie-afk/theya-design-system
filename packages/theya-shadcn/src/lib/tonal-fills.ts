/**
 * Tonal fills: the soft tints of the semantic colors (bg-*-subtle) with full-strength text, as on
 * tonal LandingCards and the Flip example (Maria, 3.11: the calmest card look; no photos, shadows,
 * darkening or gradients under text). Contrast holds in both themes: body text takes the full ink
 * and links and icons the hue's own on-tonal color.
 *
 * In the dark theme the tints are translucent, so each is laid over an opaque surface: cards stacked
 * or flying over each other would otherwise turn to mush.
 */
export type TonalHue = 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'neutral';

/**
 * The order for a row or ring of cards, so neighbours never blend: the two blue-ish tints (primary,
 * info) and the two grey-lilac ones (secondary, neutral) never touch, and each hue comes once. Six long, so a ring of six or
 * more wraps without the last card matching the first.
 */
export const TONAL_ORDER: readonly TonalHue[] = ['primary', 'warning', 'info', 'secondary', 'success', 'neutral'];

// Literal class strings (Tailwind only sees classes written out in full).
export const TONAL_BG: Record<TonalHue, string> = {
  primary: '[background:linear-gradient(var(--color-bg-primary-bg-primary-subtle),var(--color-bg-primary-bg-primary-subtle)),var(--color-bg-surface-bg-surface)]',
  secondary: '[background:linear-gradient(var(--color-bg-secondary-bg-secondary-subtle),var(--color-bg-secondary-bg-secondary-subtle)),var(--color-bg-surface-bg-surface)]',
  success: '[background:linear-gradient(var(--color-bg-success-bg-success-subtle),var(--color-bg-success-bg-success-subtle)),var(--color-bg-surface-bg-surface)]',
  warning: '[background:linear-gradient(var(--color-bg-warning-bg-warning-subtle),var(--color-bg-warning-bg-warning-subtle)),var(--color-bg-surface-bg-surface)]',
  info: '[background:linear-gradient(var(--color-bg-info-bg-info-subtle),var(--color-bg-info-bg-info-subtle)),var(--color-bg-surface-bg-surface)]',
  neutral: '[background:linear-gradient(var(--color-bg-neutral-bg-neutral-subtle),var(--color-bg-neutral-bg-neutral-subtle)),var(--color-bg-surface-bg-surface)]',
};

/**
 * On a tint the icons and links take the card's own hue (a blue icon on a green card reads as a
 * mistake). The on-tonal text tokens are AA on their fills, so they serve links and icons alike.
 */
export const TONAL_ACCENT: Record<TonalHue, string> = {
  primary: '[--color-icon-icon-primary:var(--color-text-text-link-on-tonal)] [--color-text-text-link:var(--color-text-text-link-on-tonal)]',
  // No on-tonal secondary ink: the lavender mixed toward the theme's text color (dark in light, light in dark).
  secondary: '[--color-icon-icon-primary:color-mix(in_oklab,var(--color-bg-secondary-bg-secondary-strong)_45%,var(--color-text-text))] [--color-text-text-link:color-mix(in_oklab,var(--color-bg-secondary-bg-secondary-strong)_45%,var(--color-text-text))]',
  success: '[--color-icon-icon-primary:var(--color-text-text-success-on-tonal)] [--color-text-text-link:var(--color-text-text-success-on-tonal)]',
  warning: '[--color-icon-icon-primary:var(--color-text-text-warning-on-tonal)] [--color-text-text-link:var(--color-text-text-warning-on-tonal)]',
  info: '[--color-icon-icon-primary:var(--color-text-text-info-on-tonal)] [--color-text-text-link:var(--color-text-text-info-on-tonal)]',
  neutral: '[--color-icon-icon-primary:var(--color-text-text)] [--color-text-text-link:var(--color-text-text)]',
};

/**
 * A translucent border in the fill's own hue (Maria, 3.11): it keeps cards apart where they touch
 * or overlap, instead of a shadow. One pixel, the hue's border color at about a third.
 */
export const TONAL_BORDER: Record<TonalHue, string> = {
  primary: 'border border-solid border-[color-mix(in_srgb,var(--color-border-border-primary)_35%,transparent)]',
  secondary: 'border border-solid border-[color-mix(in_srgb,var(--color-border-border-secondary)_35%,transparent)]',
  success: 'border border-solid border-[color-mix(in_srgb,var(--color-border-border-success)_35%,transparent)]',
  warning: 'border border-solid border-[color-mix(in_srgb,var(--color-border-border-warning)_45%,transparent)]',
  info: 'border border-solid border-[color-mix(in_srgb,var(--color-border-border-info)_35%,transparent)]',
  neutral: 'border border-solid border-[color-mix(in_srgb,var(--color-border-border-neutral)_35%,transparent)]',
};

/** On a tint the subtle ink drops under 4.5:1 on some hues, so body text uses the full ink. */
export const ON_TONAL = '[--color-text-text-subtle:var(--color-text-text)] text-[var(--color-text-text)]';

/** All classes for a tonal fill, with its border in tone. */
export const tonalFill = (hue: TonalHue) => `${TONAL_BG[hue]} ${TONAL_BORDER[hue]} ${TONAL_ACCENT[hue]} ${ON_TONAL}`;

/** The tonal fill for the i-th card in a row or ring. */
export const tonalFillAt = (i: number) => tonalFill(TONAL_ORDER[i % TONAL_ORDER.length]);
