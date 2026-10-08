'use client';

import { useCallback, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Pause, Play } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';
import { Button } from './button';

/**
 * Motion (landing pages): columns of cards drifting vertically without
 * end, neighbouring columns in opposite directions and at slightly
 * different speeds, so the wall feels deep (a parallax "card wall").
 *
 * Hover or focus inside pauses it; so does the Pause button (WCAG 2.2.2).
 * Each column renders its items twice; the copy is aria-hidden and inert,
 * so screen readers and Tab meet each card once. prefers-reduced-motion:
 * the columns stand still.
 */
export interface MarqueeColumnsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** One array of cards per column. */
  columns: ReactNode[][];
  /** Seconds for one full loop of the first column (default 40); the others run a little faster or slower. */
  duration?: number;
  /** Space between cards and between columns (CSS length, default 1rem). */
  gap?: string;
  /** Show the Pause / Play button (default true). */
  pauseButton?: boolean;
}

const SPEED = [1, 1.3, 0.85, 1.15, 0.95];

export function MarqueeColumns({ columns, duration = 40, gap = '1rem', pauseButton = true, className, style, ...props }: MarqueeColumnsProps) {
  const { t } = useTheyaI18n();
  const [paused, setPaused] = useState(false);
  const inertRef = useCallback((el: HTMLDivElement | null) => el?.setAttribute('inert', ''), []);
  const copy = 'flex flex-col gap-[var(--mc-gap)] pb-[var(--mc-gap)]';

  return (
    <div
      data-slot="marquee-columns"
      role={props['aria-label'] != null ? 'group' : undefined}
      data-paused={paused || undefined}
      className={cn('group/mc relative flex flex-col gap-2', className)}
      style={{ ...style, '--mc-gap': gap } as CSSProperties}
      {...props}
    >
      <div className="flex min-h-0 flex-1 gap-[var(--mc-gap)] overflow-hidden motion-safe:[mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]">
        {columns.map((items, c) => (
          <div key={c} className="min-w-0 flex-1">
            <div
              className={cn(
                'flex flex-col animate-[theya-marquee-y_var(--mc-duration)_linear_infinite]',
                c % 2 === 1 && '[animation-direction:reverse]',
                'group-hover/mc:[animation-play-state:paused] group-focus-within/mc:[animation-play-state:paused] group-data-[paused]/mc:[animation-play-state:paused]',
                'motion-reduce:animate-none',
              )}
              style={{ '--mc-duration': `${duration * SPEED[c % SPEED.length]}s` } as CSSProperties}
            >
              <div className={copy}>{items}</div>
              <div ref={inertRef} aria-hidden="true" className={cn(copy, 'motion-reduce:hidden')}>
                {items}
              </div>
            </div>
          </div>
        ))}
      </div>
      {pauseButton && (
        <Button
          appearance="ghost"
          tone="neutral"
          size="sm"
          iconOnly
          aria-label={paused ? t.marquee.play : t.marquee.pause}
          aria-pressed={paused}
          leftIcon={paused ? <Play /> : <Pause />}
          onClick={() => setPaused((p) => !p)}
          className="self-end motion-reduce:hidden"
        />
      )}
    </div>
  );
}
