'use client';

import { useCallback, useState, type CSSProperties, type ReactNode } from 'react';
import { Pause, Play } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';
import { Button } from './button';

/**
 * Motion preset (landing pages): an endless strip that scrolls on its
 * own — customer logos, testimonials, "trusted by". Ported from Kinetics'
 * Momentum Marquee (MIT, kinetics.colorion.co): the items are rendered
 * twice and the track moves by half its width, so the loop is seamless.
 *
 * - Pauses while hovered or while focus is inside, and has its own
 *   pause button (WCAG 2.2.2: moving content longer than 5 seconds needs
 *   a way to stop it). `pauseButton={false}` only for purely
 *   decorative strips.
 * - The second copy is hidden from assistive tech and from Tab.
 * - Follows the text direction; `reverse` runs it the other way.
 * - prefers-reduced-motion: no movement — the items wrap into rows.
 */
export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Seconds for one full loop; longer is calmer. */
  duration?: number;
  /** Run against the reading direction. */
  reverse?: boolean;
  /** Space between items (a CSS length, e.g. "2.5rem"). */
  gap?: string;
  /** Show the pause / play button (default). Turn off only for a purely decorative strip. */
  pauseButton?: boolean;
  /** Fade the strip out at both edges. */
  fade?: boolean;
  children: ReactNode;
}

export function Marquee({ duration = 30, reverse = false, gap = '2.5rem', pauseButton = true, fade = true, className, style, children, ...props }: MarqueeProps) {
  const { t } = useTheyaI18n();
  const [paused, setPaused] = useState(false);
  // React 18's types don't know `inert` yet; set it on the DOM node.
  const inertRef = useCallback((el: HTMLDivElement | null) => el?.setAttribute('inert', ''), []);

  const copy = 'flex shrink-0 items-center gap-[var(--marquee-gap)] pe-[var(--marquee-gap)] motion-reduce:w-full motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:pe-0';
  return (
    <div
      data-slot="marquee"
      data-paused={paused || undefined}
      className={cn('group/marquee flex items-center gap-2', className)}
      style={{ ...style, '--marquee-gap': gap, '--marquee-duration': `${duration}s` } as CSSProperties}
      {...props}
    >
      <div
        className={cn(
          'min-w-0 flex-1 overflow-hidden motion-reduce:overflow-visible',
          fade && 'motion-safe:[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]',
        )}
      >
        <div
          className={cn(
            'flex w-max animate-[theya-marquee_var(--marquee-duration)_linear_infinite] [--marquee-dir:-1] rtl:[--marquee-dir:1]',
            reverse && '[animation-direction:reverse]',
            // Hover or keyboard focus inside pauses the strip; so does the button.
            'group-hover/marquee:[animation-play-state:paused] group-focus-within/marquee:[animation-play-state:paused] group-data-[paused]/marquee:[animation-play-state:paused]',
            'motion-reduce:w-full motion-reduce:animate-none',
          )}
        >
          <div className={copy}>{children}</div>
          <div ref={inertRef} aria-hidden="true" className={cn(copy, 'motion-reduce:hidden')}>
            {children}
          </div>
        </div>
      </div>
      {pauseButton && (
        <Button
          appearance="ghost"
          tone="neutral"
          size="sm"
          iconOnly
          aria-label={paused ? t.marquee.play : t.marquee.pause}
          leftIcon={paused ? <Play /> : <Pause />}
          onClick={() => setPaused((p) => !p)}
          className="shrink-0 motion-reduce:hidden"
        />
      )}
    </div>
  );
}
