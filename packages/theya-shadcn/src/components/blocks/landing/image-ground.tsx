import type { CSSProperties } from 'react';
import { cn } from '../../../lib/utils';

export type ImageGroundTint = 'none' | 'primary' | 'deep' | 'surface' | 'scrim';
export type ImageGroundFlip = 'none' | 'x' | 'y' | 'both';
/** Tint strength in steps of 10 %, the same scale as the alpha primitives (-a100 … -a900). */
export type ImageGroundStep = 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90;

export interface ImageGroundProps {
  /** The picture: a decorative ground, so it has no alt text. */
  src: string;
  /**
   * A layer of a theme color over the picture, to make text on it pass
   * contrast without editing the file:
   * - `deep`: the primary mixed with black, tone in tone (a dark violet over
   *   a violet picture) — for white text;
   * - `primary`: the theme's primary as is;
   * - `surface`: the page surface — lightens in the light theme, darkens in
   *   the dark one, for the regular text color;
   * - `scrim`: the neutral dark scrim, any picture under white text.
   * Every color comes from the theme, so it follows the brand and the mode.
   */
  tint?: ImageGroundTint;
  /** Strength of the tint, 0–90 % in steps of 10 (the alpha primitives' scale). Default 40. */
  tintOpacity?: ImageGroundStep;
  /**
   * Opacity of the picture itself, 0–100 (%). Below 100 the ground under it
   * shows through — the panel's fill, the page surface: a light veil for
   * dark text. Default 100.
   */
  opacity?: number;
  /** Mirror the picture for variety: one file, four compositions. */
  flip?: ImageGroundFlip;
  /**
   * Mirror horizontally in right-to-left languages too, so the calm side of
   * the picture stays where the text starts. Off by default: a photo of
   * people or of a product should not be mirrored.
   */
  mirrorInRtl?: boolean;
  /**
   * `cover` (default) fills the ground and crops; `contain` shows the whole
   * picture on the ground's own fill — for an object on a plain field.
   */
  size?: 'cover' | 'contain';
  /** CSS background-position of the picture. Default `center`. */
  position?: string;
  className?: string;
}

const TINT: Record<Exclude<ImageGroundTint, 'none'>, string> = {
  primary: 'var(--color-bg-primary-bg-primary)',
  deep: 'color-mix(in oklab, var(--color-bg-primary-bg-primary) 45%, var(--color-black))',
  surface: 'var(--color-bg-surface-bg-surface)',
  scrim: 'var(--color-bg-surface-bg-scrim-strong)',
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * A picture as a section's ground, with the controls a designer reaches for
 * when the text on it does not pass: a tint in the theme's colors, a veil
 * (the picture made translucent over the ground), and mirroring. Fills its
 * positioned parent behind the content: pass it as Hero `backdrop`;
 * SectionPanel renders it for its `image`.
 *
 * The contrast scan cannot read pixels: check the text on the final ground
 * by eye or with a screenshot, in light and dark.
 */
export function ImageGround({
  src,
  tint = 'none',
  tintOpacity = 40,
  opacity = 100,
  flip = 'none',
  mirrorInRtl = false,
  size = 'cover',
  position = 'center',
  className,
}: ImageGroundProps) {
  const sx = flip === 'x' || flip === 'both' ? -1 : 1;
  const sy = flip === 'y' || flip === 'both' ? -1 : 1;
  // Snap to the 10 % scale, whatever a caller passes.
  const tintAlpha = clamp(Math.round(tintOpacity / 10) * 10, 0, 90) / 100;
  const picture = {
    backgroundImage: `url(${JSON.stringify(src)})`,
    backgroundSize: size,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: position,
    opacity: clamp(opacity, 0, 100) / 100,
    '--ig-sx': sx,
    '--ig-sy': sy,
  } as CSSProperties;
  return (
    <div data-slot="image-ground" aria-hidden className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]', className)}>
      <div
        data-slot="image-ground-picture"
        className={cn('absolute inset-0 [transform:scale(calc(var(--ig-sx)*var(--ig-dir,1)),var(--ig-sy))]', mirrorInRtl && 'rtl:[--ig-dir:-1]')}
        style={picture}
      />
      {tint !== 'none' && <div data-slot="image-ground-tint" className="absolute inset-0" style={{ backgroundColor: TINT[tint], opacity: tintAlpha }} />}
    </div>
  );
}
