import type { ComponentProps } from 'react';
import { cn } from '../../../lib/utils';

export type SectionPanelTone = 'default' | 'subtle' | 'inverse' | 'primary';

export interface SectionPanelProps extends ComponentProps<'section'> {
  /**
   * `default` the page surface, `subtle` the sunken neutral, `inverse` a dark
   * band in both themes (logo strips, a quote), `primary` the brand fill.
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
};

/**
 * A landing section on its own colored sheet with large rounded top corners.
 * Stack several and set `overlap` to lay each one over the previous section.
 * Content inside is in the display scale (data-scale="display").
 */
export function SectionPanel({ tone = 'default', overlap = false, padding = 'section', className, children, ...props }: SectionPanelProps) {
  return (
    <section
      data-slot="section-panel"
      data-scale="display"
      data-theme={tone === 'inverse' ? 'dark' : undefined}
      data-surface={tone === 'primary' ? 'primary' : undefined}
      className={cn(
        'relative rounded-t-[var(--size-border-radius-border-radius-5xl)]',
        padding === 'section' && 'section-display',
        overlap && '-mt-[var(--size-border-radius-border-radius-5xl)]',
        TONE[tone],
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}
