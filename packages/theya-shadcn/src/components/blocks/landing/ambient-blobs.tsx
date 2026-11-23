import type { ComponentProps, CSSProperties } from 'react';
import { cn } from '../../../lib/utils';

export interface AmbientBlob {
  /** Centre, % of the ground from the inline start. */
  x: number;
  /** Centre, % of the ground from the top. */
  y: number;
  /** Diameter, % of the ground's width. */
  size: number;
}

export interface AmbientBlobsProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** Default: two, top start behind the text and bottom end. */
  blobs?: AmbientBlob[];
  /**
   * The blobs' color. `light` (default): white at 14%, for a gradient or
   * colored ground, dark or bright (PlateCovery's persimmon: white 10–14%).
   * `primary`: the theme's primary at 16%, for a plain page.
   */
  tone?: 'light' | 'primary';
  /**
   * Stop the movement. Wire it to the page's own pause control: a ground
   * that moves for longer than 5 s needs one (WCAG 2.2.2). With reduced
   * motion the blobs are still anyway.
   */
  paused?: boolean;
}

const DEFAULT_BLOBS: AmbientBlob[] = [
  { x: 18, y: 30, size: 46 },
  { x: 92, y: 96, size: 52 },
];

/**
 * Soft shapes behind a landing ground that slowly change their outline and
 * breathe, out of step with each other (one loop is 16 s). Decoration only:
 * hidden from screen readers, never in front of content. Put it first inside
 * a positioned ground (SectionPanel, Hero's backdrop slot).
 */
export function AmbientBlobs({ blobs = DEFAULT_BLOBS, tone = 'light', paused = false, className, style, ...props }: AmbientBlobsProps) {
  return (
    <div
      aria-hidden
      data-slot="ambient-blobs"
      data-paused={paused || undefined}
      // -z-1: above a gradient canvas's paint (::after, z -2), level with its grain, under the content.
      className={cn('pointer-events-none absolute inset-0 -z-1 overflow-hidden', className)}
      style={
        {
          // raw-ok: white 14% is the light blob of PlateCovery's reference (white 10–14% on any ground); no token at this alpha.
          '--blob-color': tone === 'primary' ? 'color-mix(in oklab, var(--color-bg-primary-bg-primary) 16%, transparent)' : 'rgb(255 255 255 / 0.14)',
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      {blobs.map((b, i) => (
        <span
          key={i}
          className={cn(
            'absolute aspect-square -translate-x-1/2 -translate-y-1/2 bg-[var(--blob-color)] blur-2xl',
            'animate-[theya-blob_var(--transition-duration-ambient)_ease-in-out_infinite] motion-reduce:animate-none',
            '[[data-paused]_&]:[animation-play-state:paused]',
          )}
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `${b.size}%`,
            // Out of step: each blob starts at another point of the loop and every other one runs backwards.
            animationDelay: `${-i * 5.3}s`,
            animationDirection: i % 2 ? 'reverse' : 'normal',
          }}
        />
      ))}
    </div>
  );
}
