'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Pause, Play } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';
import { Button } from './button';
import { useMediaQuery } from './use-media-query';
import { useScrollFrame } from './use-scroll-frame';

/**
 * Motion (landing pages): columns of cards drifting vertically,
 * neighbouring columns in opposite directions, so the wall feels deep (a
 * parallax "card wall", a Pinterest-like board).
 *
 * - `drive="time"` (default): the columns drift without end. Hover or focus
 *   inside pauses them; so does the Pause button (WCAG 2.2.2). Each column
 *   renders its items twice; the copy is aria-hidden and inert, so screen
 *   readers and Tab meet each card once.
 * - `drive="scroll"`: the columns slide through their own length as the
 *   page scrolls past (odd ones up, even ones down) — the reader sets the
 *   pace and scrolling back plays it backwards. Tab into it and it stops
 *   and opens to full height, so a focused card is never clipped. Below
 *   640px the columns stack into one, at full height.
 *
 * prefers-reduced-motion: nothing moves; the scroll-driven wall shows at
 * full height.
 */
export interface MarqueeColumnsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** One array of cards per column. */
  columns: ReactNode[][];
  /** What moves the columns: a timer (default) or the page scroll. */
  drive?: 'time' | 'scroll';
  /** drive="time": seconds for one full loop of the first column (default 40); the others run a little faster or slower. */
  duration?: number;
  /** Space between cards and between columns (CSS length, default 1rem). */
  gap?: string;
  /** drive="time": show the Pause / Play button (default true). */
  pauseButton?: boolean;
}

const SPEED = [1, 1.3, 0.85, 1.15, 0.95];

export function MarqueeColumns({ columns, drive = 'time', duration = 40, gap = '1rem', pauseButton = true, className, style, ...props }: MarqueeColumnsProps) {
  const { t } = useTheyaI18n();
  const [paused, setPaused] = useState(false);
  const inertRef = useCallback((el: HTMLDivElement | null) => el?.setAttribute('inert', ''), []);
  const copy = 'flex flex-col gap-[var(--mc-gap)] pb-[var(--mc-gap)]';

  // Scroll-driven wall.
  const scroll = drive === 'scroll';
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const wide = useMediaQuery('(min-width: 640px)');
  const [focused, setFocused] = useState(false);
  const drifting = scroll && !reduced && wide;
  const open = scroll && (!drifting || focused);
  const root = useRef<HTMLDivElement>(null);
  const win = useRef<HTMLDivElement>(null);
  const cols = useRef<(HTMLDivElement | null)[]>([]);
  useScrollFrame(
    root,
    (rect, vh) => {
      if (!win.current || focused) return;
      // 0 as the wall's top enters the bottom of the screen, 1 as its bottom leaves the top.
      const p = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
      const box = win.current.clientHeight;
      cols.current.forEach((el, c) => {
        if (!el) return;
        const over = Math.max(0, el.scrollHeight - box);
        // Even columns travel up through their overflow, odd ones down.
        el.style.transform = `translate3d(0, ${c % 2 === 0 ? -p * over : -(1 - p) * over}px, 0)`;
      });
    },
    drifting,
  );
  // Back to rest when focus opens the wall or the drift switches off.
  useEffect(() => {
    if (focused || !drifting) cols.current.forEach((el) => el && (el.style.transform = ''));
  }, [focused, drifting]);

  // Below 640px the scroll wall is one column: the cards dealt back in reading order (1, 2, 3, 1, 2, 3 …).
  const shown = scroll && !wide ? [Array.from({ length: Math.max(...columns.map((c) => c.length)) }, (_, r) => columns.map((c) => c[r])).flat().filter(Boolean)] : columns;

  return (
    <div
      ref={root}
      data-slot="marquee-columns"
      data-drive={drive}
      role={props['aria-label'] != null ? 'group' : undefined}
      data-paused={paused || undefined}
      className={cn('group/mc relative flex flex-col gap-2', className)}
      // An open scroll wall takes the height of its content, whatever height it was given.
      style={{ ...style, ...(open ? { height: 'auto' } : null), '--mc-gap': gap } as CSSProperties}
      onFocus={scroll ? () => drifting && setFocused(true) : undefined}
      onBlur={scroll ? (e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setFocused(false) : undefined}
      {...props}
    >
      <div
        ref={win}
        className={cn(
          'flex min-h-0 flex-1 gap-[var(--mc-gap)]',
          !open && 'overflow-hidden motion-safe:[mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]',
        )}
      >
        {shown.map((items, c) =>
          scroll ? (
            <div
              key={c}
              ref={(el) => {
                cols.current[c] = el;
              }}
              className={cn('flex min-w-0 flex-1 flex-col gap-[var(--mc-gap)]', drifting && !focused && 'will-change-transform')}
            >
              {items}
            </div>
          ) : (
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
          ),
        )}
      </div>
      {pauseButton && !scroll && (
        <Button
          appearance="ghost"
          tone="neutral"
          size="sm"
          iconOnly
          aria-label={paused ? t.marquee.play : t.marquee.pause}
          // No aria-pressed: the name already changes (Pause / Play); both would read as "Play, pressed".
          leftIcon={paused ? <Play /> : <Pause />}
          onClick={() => setPaused((p) => !p)}
          className="self-end motion-reduce:hidden"
        />
      )}
    </div>
  );
}
