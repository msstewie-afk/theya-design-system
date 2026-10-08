'use client';

import { Children, useEffect, useState } from 'react';
import { Pause, Play } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';
import { Button } from './button';
import { useReducedMotion } from './use-in-view';

/**
 * Motion: a short list inside a card whose rows take turns — every few
 * seconds the top row slides out and the next one slides in at the
 * bottom (recent transactions, live activity on a landing bento).
 *
 * Shows `visible` rows at a time. Pauses on hover and focus and has a
 * Pause button (WCAG 2.2.2). The list is a plain list of the rows that
 * are showing; nothing is announced as it moves. prefers-reduced-motion:
 * it doesn't move, the first rows just stay.
 */
export interface TickerListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Rows on screen at once (default 3). */
  visible?: number;
  /** Time between moves, ms (default 2500). */
  interval?: number;
  /** Hide the Pause button — only when the page has another way to stop it. */
  hidePause?: boolean;
}

export function TickerList({ visible = 3, interval = 2500, hidePause = false, className, children, onPointerEnter, onPointerLeave, onFocus, onBlur, 'aria-label': ariaLabel, ...props }: TickerListProps) {
  const { t } = useTheyaI18n();
  const reduced = useReducedMotion();
  const rows = Children.toArray(children);
  const n = rows.length;
  const [start, setStart] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hold, setHold] = useState(false);
  const moves = n > visible;

  const running = moves && !reduced && !paused && !hold;
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setStart((s) => (s + 1) % n), interval);
    return () => window.clearInterval(id);
  }, [running, interval, n]);

  const shown = Array.from({ length: Math.min(visible, n) }, (_, i) => (start + i) % n);

  return (
    <div
      data-slot="ticker-list"
      className={cn('flex flex-col gap-2', className)}
      onPointerEnter={(e) => (onPointerEnter?.(e), setHold(true))}
      onPointerLeave={(e) => (onPointerLeave?.(e), setHold(false))}
      onFocus={(e) => (onFocus?.(e), setHold(true))}
      onBlur={(e) => {
        onBlur?.(e);
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHold(false);
      }}
      {...props}
    >
      <ul aria-label={ariaLabel} className="m-0 flex list-none flex-col gap-1 overflow-hidden p-0">
        {shown.map((idx, i) => (
          <li
            // Keyed by row, so the row that's new this turn mounts and plays its entrance.
            key={idx}
            data-slot="ticker-list-row"
            className={cn(i === shown.length - 1 && start > 0 && 'animate-[theya-ticker-in_var(--transition-duration-slow)_var(--ease-glide)] motion-reduce:animate-none')}
          >
            {rows[idx]}
          </li>
        ))}
      </ul>
      {moves && !hidePause && !reduced && (
        <Button
          appearance="ghost"
          tone="neutral"
          size="sm"
          iconOnly
          aria-label={paused ? t.cardDeck.play : t.cardDeck.pause}
          aria-pressed={paused}
          leftIcon={paused ? <Play /> : <Pause />}
          onClick={() => setPaused((p) => !p)}
          className="self-end"
        />
      )}
    </div>
  );
}
