import type { ComponentProps, CSSProperties } from 'react';
import { cn } from '../../../lib/utils';
import { ImageGround, type ImageGroundProps } from './image-ground';

export type SectionPanelTone = 'default' | 'subtle' | 'inverse' | 'primary' | 'gradient';

export interface SectionPanelProps extends ComponentProps<'section'> {
  /**
   * `default` the page surface, `subtle` the sunken neutral, `inverse` a dark
   * band in both themes (logo strips, a quote), `primary` the brand fill,
   * `gradient` the theme's gradient canvas (data-canvas="gradient": white
   * text, glass buttons, white cards; see styles/gradient-canvas.css).
   */
  tone?: SectionPanelTone;
  /**
   * Pull the panel up over the end of the previous section by its corner
   * radius, so the rounded top reads as a sheet laid on top. The previous
   * section needs that much bottom padding to spare (section-display has it).
   */
  overlap?: boolean;
  /**
   * `section` — the display section padding (64 → 128 px).
   * `none` — when the content brings its own, e.g. a LogoStrip as a dark band.
   */
  padding?: 'section' | 'none';
  /**
   * `sheet` (default): rounded top corners, a sheet laid on the page.
   * `bleed`: square, edge to edge — a first screen whose ground fills the
   * window (place it outside any padded container).
   */
  shape?: 'sheet' | 'bleed';
  /**
   * A photo or texture as the ground, decorative (no alt): it covers the
   * panel. With tone="gradient" it replaces the theme's mesh, and the
   * canvas keeps its ink and buttons, so check the text against the photo.
   * Other tones paint it over their fill.
   */
  image?: string;
  /**
   * How the image sits on the panel (see ImageGround): a tint in the
   * theme's colors (`deep` darkens tone in tone for white text, `surface`
   * lightens for dark text), `opacity` to let the panel's fill show through,
   * `flip` to mirror it. Only with `image`.
   */
  imageGround?: Omit<ImageGroundProps, 'src' | 'className'>;
}

const TONE: Record<SectionPanelTone, string> = {
  default: 'bg-[var(--color-bg-surface-bg-surface)] text-[var(--color-text-text)]',
  subtle: 'bg-[var(--color-bg-surface-bg-surface-sunken)] text-[var(--color-text-text)]',
  // A nested dark theme: every token inside resolves to its dark value, so
  // components need no inverse variants. Sunken keeps the band darker than
  // the page in the dark theme too.
  inverse: 'bg-[var(--color-bg-surface-bg-surface-sunken)] text-[var(--color-text-text)] [color-scheme:dark]',
  // Same ink remap as Card's filled appearance; buttons pick up
  // data-surface="primary" on their own.
  primary: cn(
    'bg-[var(--color-bg-primary-bg-primary)] text-[var(--color-text-text-on-primary)]',
    '[--color-text-text:var(--color-text-text-on-primary)]',
    '[--color-text-text-subtle:var(--color-text-text-subtle-on-primary)]',
    '[--color-text-text-subtler:var(--color-text-text-subtle-on-primary)]',
    '[--color-icon-icon:var(--color-text-text-on-primary)]',
    '[--color-icon-icon-subtle:var(--color-icon-icon-on-primary)]',
    '[--color-border-border-subtle:var(--color-border-border-on-primary)]',
    '[--color-border-border-subtler:var(--color-border-border-subtler-on-primary)]',
  ),
  // Painted and remapped by styles/gradient-canvas.css.
  gradient: '',
};

/**
 * A landing section on its own colored sheet with large rounded top corners.
 * Stack several and set `overlap` to lay each one over the previous section.
 * Content inside is in the display scale (data-scale="display").
 */
export function SectionPanel({ tone = 'default', overlap = false, padding = 'section', shape = 'sheet', image, imageGround, className, style, children, ...props }: SectionPanelProps) {
  // The picture is its own layer (ImageGround) under the content; on the
  // gradient canvas it takes the mesh's place, and the grain stays on top.
  const ground: CSSProperties | undefined =
    image && tone === 'gradient' ? ({ '--gradient-canvas': 'none', '--gradient-canvas-blooms': 'none' } as CSSProperties) : undefined;
  return (
    <section
      data-slot="section-panel"
      data-scale="display"
      data-theme={tone === 'inverse' ? 'dark' : undefined}
      data-surface={tone === 'primary' ? 'primary' : undefined}
      data-canvas={tone === 'gradient' ? 'gradient' : undefined}
      // Light blooms where only cards lie (Dusk: the bottom left corner).
      data-canvas-blooms={tone === 'gradient' ? '' : undefined}
      data-shape={shape}
      className={cn(
        'relative',
        image && 'isolate',
        shape === 'sheet' && 'rounded-t-[var(--size-border-radius-border-radius-5xl)]',
        padding === 'section' && 'section-display',
        overlap && shape === 'sheet' && '-mt-[var(--size-border-radius-border-radius-5xl)]',
        TONE[tone],
        className,
      )}
      style={{ ...ground, ...style }}
      {...props}
    >
      {image && <ImageGround src={image} {...imageGround} className="-z-10" />}
      {children}
    </section>
  );
}
