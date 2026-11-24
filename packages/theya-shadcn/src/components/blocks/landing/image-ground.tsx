'use client';

import { useEffect, useState, type CSSProperties } from 'react';
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
  /**
   * With `size="contain"`: what fills the ground around the picture.
   * `edge` draws the picture's outermost column of pixels out across
   * the free space (the one facing the text: the left column when the
   * picture sits right) — for an object shot on a plain field. Only for
   * pictures from the same site (the browser reads their pixels). `none`
   * (default) leaves the panel's fill.
   */
  fill?: 'none' | 'edge';
  /** With `size="contain"`: the picture's height as % of the ground (10–100), to leave room for the text. Default 100. */
  objectSize?: number;
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
 * Loads the picture once for a field: its aspect ratio (to size the feather
 * mask to the picture's own box) and, for `edge`, one edge column as 24
 * colors, each the average of a 4 px strip so noise and JPEG blocks do not
 * show as bands.
 */
function usePictureInfo(src: string, side: 'left' | 'right' | 'both' | null, enabled: boolean) {
  const [info, setInfo] = useState<{ aspect: number; colors?: string[] }>();
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (!live) return;
      const aspect = img.naturalWidth / img.naturalHeight;
      if (!side) {
        setInfo({ aspect });
        return;
      }
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const strip = (x: number) => ctx.getImageData(x, 0, 4, canvas.height).data;
        const cols = side === 'both' ? [strip(0), strip(canvas.width - 4)] : [strip(side === 'left' ? 0 : canvas.width - 4)];
        const rows = 24;
        const stops: string[] = [];
        for (let i = 0; i < rows; i++) {
          const y0 = Math.floor((i * canvas.height) / rows);
          const y1 = Math.floor(((i + 1) * canvas.height) / rows);
          const sum = [0, 0, 0];
          let n = 0;
          for (const data of cols)
            for (let y = y0; y < y1; y++)
              for (let x = 0; x < 4; x++) {
                const o = (y * 4 + x) * 4;
                sum[0] += data[o];
                sum[1] += data[o + 1];
                sum[2] += data[o + 2];
                n++;
              }
          // raw-ok: sampled pixel colors of the picture, not a design color
          stops.push(`rgb(${sum.map((v) => Math.round(v / n)).join(' ')})`);
        }
        setInfo({ aspect, colors: stops });
      } catch {
        // A picture from another site taints the canvas: no edge colors, the panel's fill shows.
        setInfo({ aspect });
      }
    };
    img.src = src;
    return () => {
      live = false;
    };
  }, [src, side, enabled]);
  return info;
}

// mask-position takes the <position> syntax, which has no three-value form
// ("right 8% center"): spell the vertical keyword as an offset.
const maskPositionOf = (p: string) => p.replace(/^(left|right) (\S+) center$/, '$1 $2 top 50%').replace(/^center (top|bottom) (\S+)$/, 'left 50% $1 $2');

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
  fill = 'none',
  objectSize = 100,
  position = 'center',
  className,
}: ImageGroundProps) {
  const sx = flip === 'x' || flip === 'both' ? -1 : 1;
  const sy = flip === 'y' || flip === 'both' ? -1 : 1;
  // Snap to the 10 % scale, whatever a caller passes.
  const tintAlpha = clamp(Math.round(tintOpacity / 10) * 10, 0, 90) / 100;
  const url = `url(${JSON.stringify(src)})`;
  const edgeSide = /\bright\b/.test(position) ? 'left' : /\bleft\b/.test(position) ? 'right' : 'both';
  const onField = size === 'contain' && fill !== 'none';
  const info = usePictureInfo(src, fill === 'edge' ? edgeSide : null, onField);
  const edgeColors = info?.colors;
  // The column's colors run over the picture's own height; above and below it
  // the first and last color carry on.
  const h = size === 'contain' ? clamp(objectSize, 10, 100) : 100;
  const top = /\btop\b/.test(position) ? 0 : /\bbottom\b/.test(position) ? 100 - h : (100 - h) / 2;
  const edge = edgeColors && `linear-gradient(to bottom, ${edgeColors.map((c, i) => `${c} ${top + ((i + 0.5) * h) / edgeColors.length}%`).join(', ')})`;
  // On the edge field the picture's edge facing it fades out, so no seam shows.
  const featherFor = (side: 'left' | 'right' | 'both') =>
    side === 'left'
      ? 'linear-gradient(to right, transparent, var(--color-black) 12%)'
      : side === 'right'
        ? 'linear-gradient(to left, transparent, var(--color-black) 12%)'
        : 'linear-gradient(to right, transparent, var(--color-black) 12%, var(--color-black) 88%, transparent)';
  // The picture's own box in container units, so the mask lies exactly on it.
  // Height-based: the picture keeps the ground's height (objectSize %), the field fills the side.
  const box = info && `${h * info.aspect}cqh ${h}cqh`;
  const frame = { opacity: clamp(opacity, 0, 100) / 100, '--ig-sx': sx, '--ig-sy': sy } as CSSProperties;
  const picture: CSSProperties = {
    backgroundImage: url,
    backgroundSize: size === 'contain' && objectSize < 100 ? `auto ${clamp(objectSize, 10, 100)}%` : size,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: position,
    ...(onField &&
      box && {
        backgroundSize: box,
        maskImage: featherFor(edgeSide),
        maskSize: box,
        maskPosition: maskPositionOf(position),
        maskRepeat: 'no-repeat',
      }),
  };
  return (
    <div
      data-slot="image-ground"
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit] [container-type:size]', className)}
    >
      <div
        className={cn('absolute inset-0 [transform:scale(calc(var(--ig-sx)*var(--ig-dir,1)),var(--ig-sy))]', mirrorInRtl && 'rtl:[--ig-dir:-1]')}
        style={frame}
      >
        {edge && <div data-slot="image-ground-fill" className="absolute inset-0" style={{ backgroundImage: edge }} />}
        <div data-slot="image-ground-picture" className="absolute inset-0" style={picture} />
      </div>
      {tint !== 'none' && <div data-slot="image-ground-tint" className="absolute inset-0" style={{ backgroundColor: TINT[tint], opacity: tintAlpha }} />}
    </div>
  );
}
