import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import { Marquee } from '../../ui/marquee';

export interface LogoStripProps extends Omit<ComponentProps<'section'>, 'children'> {
  /** A quiet line above the logos: "Trusted by teams at", "Readers at 2,000+ companies". */
  label?: ReactNode;
  /**
   * `marquee` — an endless strip, for eight logos or more; it pauses on
   * hover, on focus and with its own button (WCAG 2.2.2).
   * `static` — one centred row that wraps, for up to six or so.
   */
  motion?: 'marquee' | 'static';
  /** Seconds for one loop of the marquee; longer is calmer. */
  duration?: number;
  /** The logos: images with alt text, or inline SVG / wordmarks with a visible or accessible name. */
  children: ReactNode;
}

/**
 * Social proof under the hero: a caption and a row of customer logos.
 * Logos take the text color at reduced emphasis, so the strip stays quiet
 * on the page and in a dark band (put it in SectionPanel tone="inverse").
 */
export function LogoStrip({ label, motion = 'marquee', duration = 40, className, children, 'aria-label': ariaLabel, ...props }: LogoStripProps) {
  const labelId = useId();
  const named = label != null && ariaLabel == null;

  const logos = 'text-[var(--color-text-text-subtle)] [&_img]:h-8 [&_img]:w-auto [&_svg]:shrink-0';
  return (
    <section
      data-slot="logo-strip"
      data-scale="display"
      aria-labelledby={named ? labelId : undefined}
      aria-label={ariaLabel}
      className={cn('py-12 lg:py-16', className)}
      {...props}
    >
      <div className="container-display flex flex-col items-center gap-8">
        {label != null && (
          <p id={labelId} data-slot="logo-strip-label" className="m-0 text-center font-body text-body-m text-[var(--color-text-text-subtle)]">
            {label}
          </p>
        )}
        {motion === 'marquee' ? (
          <Marquee duration={duration} gap="4rem" className={cn('w-full', logos)}>
            {children}
          </Marquee>
        ) : (
          <div data-slot="logo-strip-row" className={cn('flex flex-wrap items-center justify-center gap-x-16 gap-y-8', logos)}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
